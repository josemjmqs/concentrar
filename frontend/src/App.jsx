import Estadisticas from "./components/Estadisticas";
import Historial from "./components/Historial";
import Temporizador from "./components/Temporizador";
import Login from "./components/Login";
import Registro from "./components/Registro";
import Menu from "./components/Menu";
import ConfiguracionPomodoro from "./components/ConfiguracionPomodoro";
import ConfiguracionSonido from "./components/ConfiguracionSonido";
import { useState } from "react";
import "./App.css";

function App() {
  const [actualizar, setActualizar] = useState(0);

  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("token") !== null,
  );

  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  const [mostrarConfiguracionSonido, setMostrarConfiguracionSonido] =
    useState(false);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const actualizarDatos = () => {
    setActualizar((anterior) => anterior + 1);
  };

  function manejarLogin() {
    setAutenticado(true);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setAutenticado(false);
  }

  if (!autenticado) {
    if (mostrarRegistro) {
      return <Registro volverAlLogin={() => setMostrarRegistro(false)} />;
    }

    return (
      <Login
        onLogin={manejarLogin}
        crearCuenta={() => setMostrarRegistro(true)}
      />
    );
  }

  if (mostrarConfiguracion) {
    return (
      <ConfiguracionPomodoro
        volver={() => {
          setMostrarConfiguracion(false);
          actualizarDatos();
        }}
      />
    );
  }

  if (mostrarConfiguracionSonido) {
    return (
      <ConfiguracionSonido
        volver={() => setMostrarConfiguracionSonido(false)}
      />
    );
  }

  if (mostrarHistorial) {
    return (
      <div className="pagina-historial">
        <div className="encabezado">
          <h1>Concentrar</h1>
        </div>

        <Historial
          actualizar={actualizar}
          cambiarActualizacion={actualizarDatos}
          volver={() => setMostrarHistorial(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="encabezado">
        <h1>Concentrar</h1>

        <Menu
          mostrarHistorial={() => setMostrarHistorial(true)}
          mostrarConfiguracion={() => setMostrarConfiguracion(true)}
          mostrarSonidoAlarma={() => setMostrarConfiguracionSonido(true)}
          cerrarSesion={cerrarSesion}
        />
      </div>

      <div className="seccion-temporizador">
        <Temporizador key={actualizar} actualizarDatos={actualizarDatos} />
      </div>

      <div className="seccion-estadisticas">
        <Estadisticas actualizar={actualizar} />
      </div>
    </>
  );
}

export default App;
