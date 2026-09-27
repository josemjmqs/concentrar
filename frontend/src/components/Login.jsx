import { useState } from "react";
import { login } from "../services/api";
import "./Login.css";

function Login({ onLogin, crearCuenta }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function iniciarSesion() {
    try {
      const respuesta = await login(email, password);

      localStorage.setItem("token", respuesta.token);

      onLogin();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="login">
      <div className="login-contenedor">
        <div className="login-encabezado">
          <h1>Concentra</h1>
          <h2>Iniciar sesión</h2>
          <p>Organiza tu tiempo y mejora tu concentración.</p>
        </div>

        <div className="login-formulario">
          <div className="login-campo">
            <label htmlFor="email">Correo</label>

            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-campo">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-boton-principal" onClick={iniciarSesion}>
            Iniciar sesión
          </button>
        </div>

        <div className="login-registro">
          <p>¿No tienes cuenta?</p>

          <button
            className="login-boton-secundario"
            onClick={() => {
              crearCuenta();
            }}
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
