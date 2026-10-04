import { useEffect, useState } from "react";
import {
  obtenerSesiones,
  cancelarSesion,
  restaurarSesion,
  editarDuracion,
} from "../services/api";
import { formatearDuracion } from "../utils/formatearDuracion";
import "./Historial.css";

function Historial({ actualizar, cambiarActualizacion }) {
  const [sesiones, setSesiones] = useState([]);
  const [sesionEditando, setSesionEditando] = useState(null);
  const [nuevaDuracion, setNuevaDuracion] = useState("");

  useEffect(() => {
    obtenerSesiones().then((resultado) => {
      setSesiones(resultado);
    });
  }, [actualizar]);

  async function handleCancelar(id) {
    await cancelarSesion(id);

    cambiarActualizacion();

    const resultado = await obtenerSesiones();

    setSesiones(resultado);
  }

  async function handleRestaurar(id) {
    await restaurarSesion(id);

    cambiarActualizacion();

    const resultado = await obtenerSesiones();

    setSesiones(resultado);
  }

  function iniciarEdicion(sesion) {
    setSesionEditando(sesion.id);
    setNuevaDuracion(Math.floor(sesion.duracion / 60));
  }

  async function handleEditarDuracion(id) {
    const minutos = Number(nuevaDuracion);

    if (!Number.isInteger(minutos) || minutos < 0) {
      return;
    }

    const duracion = minutos * 60;

    await editarDuracion(id, duracion);

    cambiarActualizacion();

    const resultado = await obtenerSesiones();

    setSesiones(resultado);

    setSesionEditando(null);
    setNuevaDuracion("");
  }

  function cancelarEdicion() {
    setSesionEditando(null);
    setNuevaDuracion("");
  }

  function formatearFechaHora(fecha) {
    const fechaLocal = new Date(fecha);

    return fechaLocal.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <div className="historial">
      <div className="historial-lista">
        {sesiones.map((sesion) => (
          <div className="historial-sesion" key={sesion.id}>
            <div className="historial-datos">
              <p>
                <strong>Inicio:</strong> {formatearFechaHora(sesion.inicio)}
              </p>

              <p>
                <strong>Fin:</strong> {formatearFechaHora(sesion.fin)}
              </p>

              {sesionEditando === sesion.id ? (
                <p>
                  <strong>Duración:</strong>{" "}
                  <input
                    type="number"
                    min="0"
                    value={nuevaDuracion}
                    onChange={(e) => setNuevaDuracion(e.target.value)}
                  />{" "}
                  minutos
                </p>
              ) : (
                <p>
                  <strong>Duración:</strong>{" "}
                  {formatearDuracion(sesion.duracion)}
                </p>
              )}

              <p>
                <strong>Estado:</strong>{" "}
                <span className={`estado-${sesion.estado}`}>
                  {sesion.estado}
                </span>
              </p>
            </div>

            <div className="historial-acciones">
              {sesion.estado === "completada" &&
                sesionEditando !== sesion.id && (
                  <>
                    <button
                      className="boton-editar"
                      onClick={() => iniciarEdicion(sesion)}
                    >
                      Editar
                    </button>

                    <button
                      className="boton-cancelar"
                      onClick={() => handleCancelar(sesion.id)}
                    >
                      Cancelar
                    </button>
                  </>
                )}

              {sesion.estado === "completada" &&
                sesionEditando === sesion.id && (
                  <>
                    <button
                      className="boton-guardar"
                      onClick={() => handleEditarDuracion(sesion.id)}
                    >
                      Guardar
                    </button>

                    <button onClick={cancelarEdicion}>Cancelar</button>
                  </>
                )}

              {sesion.estado === "cancelada" && (
                <button
                  className="boton-restaurar"
                  onClick={() => handleRestaurar(sesion.id)}
                >
                  Restaurar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Historial;
