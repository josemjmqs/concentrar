const API_URL = import.meta.env.VITE_API_URL;

const obtenerToken = () => {
  return localStorage.getItem("token");
};

const manejarRespuesta = async (respuesta, requiereAutenticacion) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    if (respuesta.status === 401 && requiereAutenticacion) {
      localStorage.removeItem("token");
      window.location.reload();
      return;
    }

    throw new Error(datos.mensaje || "Error en la petición");
  }

  return datos;
};

async function realizarPeticion(url, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(url, opciones);
  } catch {
    throw new Error("No fue posible conectarse con el servidor.");
  }

  const requiereAutenticacion = Boolean(opciones.headers?.Authorization);

  return manejarRespuesta(respuesta, requiereAutenticacion);
}

export const obtenerEstadisticas = async () => {
  return realizarPeticion(`${API_URL}/estadisticas`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};

export const obtenerSesiones = async () => {
  return realizarPeticion(`${API_URL}/sesiones`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};

export async function crearSesion(duracionObjetivo, inicio) {
  return realizarPeticion(`${API_URL}/sesiones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({
      duracionObjetivo,
      inicio,
    }),
  });
}

export async function finalizarSesion(id, duracion, fin) {
  return realizarPeticion(`${API_URL}/sesiones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({
      duracion,
      fin,
    }),
  });
}

export async function editarDuracion(id, duracion) {
  return realizarPeticion(`${API_URL}/sesiones/${id}/duracion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({
      duracion,
    }),
  });
}

export const cancelarSesion = async (id) => {
  return realizarPeticion(`${API_URL}/sesiones/${id}/cancelar`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};

export const cancelarSesionEnProgreso = async (id) => {
  return realizarPeticion(`${API_URL}/sesiones/${id}/cancelar-en-progreso`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};

export const restaurarSesion = async (id) => {
  return realizarPeticion(`${API_URL}/sesiones/${id}/restaurar`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};

export const login = async (email, password) => {
  return realizarPeticion(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const register = async (nombre, email, password) => {
  return realizarPeticion(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      email,
      password,
    }),
  });
};

export const obtenerSesionEnProgreso = async () => {
  return realizarPeticion(`${API_URL}/sesiones/en-progreso`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });
};
