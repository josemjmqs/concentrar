import { useEffect, useState } from "react";

import { obtenerEstadisticas } from "../services/api";
import { formatearDuracion } from "../utils/formatearDuracion";

import "./Estadisticas.css";

function Estadisticas({ actualizar }) {
  const [datos, setDatos] = useState(null);
  const [vista, setVista] = useState("semanal");

  useEffect(() => {
    const cargarEstadisticas = () => {
      obtenerEstadisticas()
        .then((resultado) => {
          setDatos(resultado);
        })
        .catch((error) => {
          console.error("Error obteniendo estadísticas:", error);
        });
    };

    let temporizador;

    const programarProximaMedianoche = () => {
      const ahora = new Date();

      const proximaMedianoche = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate() + 1,
        0,
        0,
        1,
      );

      const tiempoHastaMedianoche =
        proximaMedianoche.getTime() - ahora.getTime();

      temporizador = setTimeout(() => {
        cargarEstadisticas();
        programarProximaMedianoche();
      }, tiempoHastaMedianoche);
    };

    cargarEstadisticas();
    programarProximaMedianoche();

    return () => {
      clearTimeout(temporizador);
    };
  }, [actualizar]);

  if (!datos) {
    return <p>Cargando...</p>;
  }

  function obtenerNumeroDia(fecha) {
    return Number(fecha.split("-")[2]);
  }

  function obtenerNombreDia(fecha) {
    const [año, mes, dia] = fecha.split("-");

    const fechaLocal = new Date(año, mes - 1, dia);

    return fechaLocal.toLocaleDateString("es-CL", {
      weekday: "short",
    });
  }

  const datosGrafico =
    vista === "semanal" ? datos.tiempoPorDia : datos.tiempoPorDiaMes;

  const tiempoMaximo = Math.max(...datosGrafico.map((dia) => dia.tiempo), 1);

  return (
    <div className="estadisticas">
      <div className="estadistica-hoy">
        <h3>Hoy</h3>

        <div className="estadistica-hoy-datos">
          <div>
            <span className="estadistica-hoy-valor">
              {formatearDuracion(datos.tiempoHoy)}
            </span>

            <span>Tiempo de concentración</span>
          </div>

          <div>
            <span className="estadistica-hoy-valor">{datos.sesionesHoy}</span>

            <span>Sesiones</span>
          </div>
        </div>
      </div>

      <section className="estadisticas-grafico">
        <div className="estadisticas-grafico-encabezado">
          <h3>
            {vista === "semanal"
              ? "Concentración esta semana"
              : "Concentración este mes"}
          </h3>

          <div className="selector-vista">
            <button
              className={vista === "semanal" ? "activo" : ""}
              onClick={() => setVista("semanal")}
            >
              Semanal
            </button>

            <button
              className={vista === "mensual" ? "activo" : ""}
              onClick={() => setVista("mensual")}
            >
              Mensual
            </button>
          </div>
        </div>

        <div className={`grafico ${vista}`}>
          {datosGrafico.map((dia) => {
            const altura = (dia.tiempo / tiempoMaximo) * 200;

            return (
              <div className="barra-contenedor" key={dia.dia}>
                <span className="barra-valor">
                  {formatearDuracion(dia.tiempo)}
                </span>

                <div className="barra" style={{ height: `${altura}px` }} />

                <span className="barra-dia">
                  {vista === "semanal"
                    ? obtenerNombreDia(dia.dia)
                    : obtenerNumeroDia(dia.dia)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Estadisticas;
