import pool from "../config/database.js";

export const obtenerSesiones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `SELECT *
       FROM sesiones
       WHERE usuario_id = $1
       ORDER BY inicio DESC`,
      [usuarioId],
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      mensaje: "Error al obtener sesiones",
    });
  }
};

export const crearSesion = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { duracionObjetivo, inicio } = req.body;

  if (
    !Number.isInteger(duracionObjetivo) ||
    duracionObjetivo < 1 ||
    duracionObjetivo > 10800
  ) {
    return res.status(400).json({
      mensaje: "La duración debe estar entre 1 segundo y 180 minutos",
    });
  }

  const fechaInicio = new Date(inicio);

  if (Number.isNaN(fechaInicio.getTime())) {
    return res.status(400).json({
      mensaje: "La fecha de inicio no es válida",
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT *
       FROM sesiones
       WHERE usuario_id = $1
       AND estado = $2`,
      [usuarioId, "en_progreso"],
    );

    if (resultado.rows.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una sesión en progreso",
      });
    }

    const estado = "en_progreso";

    const nuevaSesion = await pool.query(
      `INSERT INTO sesiones (
        usuario_id,
        inicio,
        estado,
        duracion_objetivo
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [usuarioId, fechaInicio, estado, duracionObjetivo],
    );

    res.status(201).json(nuevaSesion.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        mensaje: "Ya existe una sesión en progreso",
      });
    }

    console.error(error.message);

    res.status(500).json({
      mensaje: "Error al crear la sesión",
    });
  }
};

export const finalizarSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { duracion, fin } = req.body;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la sesión no es válido",
      });
    }

    if (!Number.isInteger(duracion) || duracion < 0) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número entero mayor o igual a 0",
      });
    }

    const fechaFin = new Date(fin);

    if (Number.isNaN(fechaFin.getTime())) {
      return res.status(400).json({
        mensaje: "La fecha de finalización no es válida",
      });
    }

    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `SELECT *
      FROM sesiones
      WHERE id = $1
      AND usuario_id = $2`,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "La sesión no existe",
      });
    }

    const sesion = resultado.rows[0];

    if (sesion.estado !== "en_progreso") {
      return res.status(409).json({
        mensaje: "La sesión no está en progreso",
      });
    }

    const resultadoActualizado = await pool.query(
      `UPDATE sesiones
      SET fin = $1,
          duracion = $2,
          estado = $3
      WHERE id = $4
      AND usuario_id = $5
      RETURNING *`,
      [fechaFin, duracion, "completada", id, usuarioId],
    );

    res.json(resultadoActualizado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al finalizar la sesión",
    });
  }
};

export const editarDuracion = async (req, res) => {
  try {
    const { id } = req.params;
    const { duracion } = req.body;
    const usuarioId = req.usuario.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la sesión no es válido",
      });
    }

    if (!Number.isInteger(duracion) || duracion < 0) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número entero mayor o igual a 0",
      });
    }

    const resultado = await pool.query(
      `SELECT *
       FROM sesiones
       WHERE id = $1
       AND usuario_id = $2`,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "La sesión no existe",
      });
    }

    const sesion = resultado.rows[0];

    if (sesion.estado !== "completada") {
      return res.status(409).json({
        mensaje: "Solo se pueden editar sesiones completadas",
      });
    }

    const resultadoActualizado = await pool.query(
      `UPDATE sesiones
       SET duracion = $1
       WHERE id = $2
       AND usuario_id = $3
       RETURNING *`,
      [duracion, id, usuarioId],
    );

    res.json(resultadoActualizado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al editar la duración de la sesión",
    });
  }
};

export const cancelarSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la sesión no es válido",
      });
    }

    const resultado = await pool.query(
      `SELECT *
       FROM sesiones
       WHERE id = $1
       AND usuario_id = $2`,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "La sesión no existe",
      });
    }

    const sesion = resultado.rows[0];

    if (sesion.estado === "cancelada") {
      return res.status(409).json({
        mensaje: "La sesión ya está cancelada",
      });
    }

    if (sesion.estado !== "completada") {
      return res.status(409).json({
        mensaje: "Solo se pueden cancelar sesiones completadas",
      });
    }

    const resultadoActualizado = await pool.query(
      `UPDATE sesiones
       SET estado = $1
       WHERE id = $2
       AND usuario_id = $3
       RETURNING *`,
      ["cancelada", id, usuarioId],
    );

    res.json(resultadoActualizado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al cancelar la sesión",
    });
  }
};

export const cancelarSesionEnProgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la sesión no es válido",
      });
    }

    const resultado = await pool.query(
      `
      SELECT *
      FROM sesiones
      WHERE id = $1
      AND usuario_id = $2
      `,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "La sesión no existe",
      });
    }

    const sesion = resultado.rows[0];

    if (sesion.estado === "cancelada") {
      return res.status(409).json({
        mensaje: "La sesión ya está cancelada",
      });
    }

    if (sesion.estado !== "en_progreso") {
      return res.status(409).json({
        mensaje: "Solo se pueden cancelar sesiones en progreso",
      });
    }

    const resultadoActualizado = await pool.query(
      `
      UPDATE sesiones
      SET estado = 'cancelada'
      WHERE id = $1
      AND usuario_id = $2
      RETURNING *
      `,
      [id, usuarioId],
    );

    res.json(resultadoActualizado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al cancelar la sesión",
    });
  }
};

export const restaurarSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la sesión no es válido",
      });
    }

    const resultado = await pool.query(
      `SELECT *
       FROM sesiones
       WHERE id = $1
       AND usuario_id = $2`,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "La sesión no existe",
      });
    }

    const sesion = resultado.rows[0];

    if (sesion.estado !== "cancelada") {
      return res.status(409).json({
        mensaje: "Solo se pueden restaurar sesiones canceladas",
      });
    }

    const resultadoActualizado = await pool.query(
      `UPDATE sesiones
       SET estado = $1
       WHERE id = $2
       AND usuario_id = $3
       RETURNING *`,
      ["completada", id, usuarioId],
    );

    res.json(resultadoActualizado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al restaurar la sesión",
    });
  }
};

export const obtenerSesionEnProgreso = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `
      SELECT *
      FROM sesiones
      WHERE usuario_id = $1
      AND estado = $2
      `,
      [usuarioId, "en_progreso"],
    );

    if (resultado.rows.length === 0) {
      return res.json(null);
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener sesión en progreso",
    });
  }
};
