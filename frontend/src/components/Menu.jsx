import { useState, useEffect, useRef } from "react";
import "./Menu.css";

function Menu({
  mostrarHistorial,
  mostrarConfiguracion,
  mostrarSonidoAlarma,
  cerrarSesion,
}) {
  const [abierto, setAbierto] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function manejarClickFuera(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);

    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  function manejarSonidoAlarma() {
    mostrarSonidoAlarma();
    setAbierto(false);
  }

  function manejarHistorial() {
    mostrarHistorial();
    setAbierto(false);
  }

  function manejarCerrarSesion() {
    cerrarSesion();
    setAbierto(false);
  }

  return (
    <div className="menu" ref={menuRef}>
      <button
        className="boton-menu"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {abierto && (
        <div className="menu-desplegable">
          <button onClick={manejarHistorial}>Historial</button>
          <button onClick={mostrarConfiguracion}>Configuración Pomodoro</button>
          <button onClick={manejarSonidoAlarma}>Sonido de alarma</button>
          <button onClick={manejarCerrarSesion}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}

export default Menu;
