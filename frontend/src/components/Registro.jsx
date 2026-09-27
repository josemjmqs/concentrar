import { useState } from "react";
import { register } from "../services/api";
import "./Registro.css";

function Registro({ volverAlLogin }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function crearCuenta() {
    try {
      await register(nombre, email, password);

      alert("Cuenta creada correctamente.");

      volverAlLogin();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="registro">
      <div className="registro-contenedor">
        <div className="registro-encabezado">
          <h1>Concentra</h1>
          <h2>Crear cuenta</h2>
          <p>Crea tu cuenta y comienza a organizar tu tiempo.</p>
        </div>

        <div className="registro-formulario">
          <div className="registro-campo">
            <label htmlFor="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="registro-campo">
            <label htmlFor="email">Correo</label>

            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="registro-campo">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="registro-boton-principal" onClick={crearCuenta}>
            Crear cuenta
          </button>
        </div>

        <div className="registro-login">
          <p>¿Ya tienes cuenta?</p>

          <button className="registro-boton-secundario" onClick={volverAlLogin}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registro;
