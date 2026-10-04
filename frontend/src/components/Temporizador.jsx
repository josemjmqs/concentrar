import { useEffect, useRef, useState } from "react";
import {
  crearSesion,
  finalizarSesion,
  obtenerSesionEnProgreso,
} from "../services/api";
import "./Temporizador.css";
import { formatearDuracion } from "../utils/formatearDuracion";

function Temporizador({ actualizarDatos }) {
  // Temporizador
  const [tiempoRestante, setTiempoRestante] = useState(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return 25 * 60;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const idUsuario = payload.id;

      const duracionTrabajo = Number(
        localStorage.getItem(`duracionTrabajo_${idUsuario}`),
      );

      return duracionTrabajo || 25 * 60;
    } catch {
      return 25 * 60;
    }
  });
  const [inicioTiempoExtra, setInicioTiempoExtra] = useState(null);
  const activoRef = useRef(false);
  const idSesionRef = useRef(null);
  const inicioTemporizadorRef = useRef(null);
  const contextoAudio = useRef(null);
  const oscilador = useRef(null);
  const ganancia = useRef(null);
  const intervaloAlarma = useRef(null);

  // Estado
  const [modo, setModo] = useState("trabajo");
  const [activo, setActivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [tiempoTerminado, setTiempoTerminado] = useState(false);
  const [alarmaActiva, setAlarmaActiva] = useState(false);
  const [error, setError] = useState("");
  const iniciarDescansoRef = useRef(null);
  const iniciarTemporizadorRef = useRef(null);
  const seguirTrabajandoRef = useRef(null);
  const seguirDescansandoRef = useRef(null);
  const clientIdRef = useRef(null);

  // Sesión
  const [inicioSesion, setInicioSesion] = useState(null);
  const [inicioTemporizador, setInicioTemporizador] = useState(null);
  const [duracionActual, setDuracionActual] = useState(0);
  const [tiempoAcumulado, setTiempoAcumulado] = useState(0);
  const [tiempoExtraAcumulado, setTiempoExtraAcumulado] = useState(0);
  const [idSesion, setIdSesion] = useState(null);
  const [iniciando, setIniciando] = useState(false);
  const [iniciandoDescanso, setIniciandoDescanso] = useState(false);
  const [terminando, setTerminando] = useState(false);
  const [sesionesCompletadasCiclo, setSesionesCompletadasCiclo] = useState(
    () => {
      const guardadas = localStorage.getItem("sesionesCompletadasCiclo");

      return guardadas ? Number(guardadas) : 0;
    },
  );

  // Funciones auxiliares
  function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
  }

  async function probarNotificacion() {
    await mostrarNotificacion("FocusFlow", "Prueba de notificación", "trabajo");
  }

  async function mostrarNotificacion(titulo, mensaje, modoNotificacion) {
    if (Notification.permission !== "granted") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registro = await navigator.serviceWorker.ready;

      const acciones =
        modoNotificacion === "trabajo"
          ? [
              {
                action: "iniciar-descanso",
                title: "🧘 Iniciar descanso",
              },
            ]
          : [
              {
                action: "iniciar-trabajo",
                title: "🧑‍💻 Iniciar concentración",
              },
            ];

      await registro.showNotification(titulo, {
        body: mensaje,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `focusflow-${Date.now()}`,
        requireInteraction: true,
        silent: true,
        actions: acciones,
        data: {
          clientId: clientIdRef.current,
        },
      });
    } catch (error) {
      console.error("❌ ERROR MOSTRANDO NOTIFICACIÓN:", error);
    }
  }

  async function eliminarNotificaciones() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registro = await navigator.serviceWorker.ready;

      const notificaciones = await registro.getNotifications();

      notificaciones.forEach((notificacion) => {
        if (notificacion.tag.startsWith("focusflow-")) {
          notificacion.close();
        }
      });
    } catch (error) {
      console.error("❌ Error eliminando notificaciones:", error);
    }
  }

  async function mostrarNotificacionSistema(titulo, mensaje) {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registro = await navigator.serviceWorker.ready;

    await registro.showNotification(titulo, {
      body: mensaje,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "focusflow-temporizador",
    });
  }

  function obtenerConfiguracionPomodoro() {
    const token = localStorage.getItem("token");

    let idUsuario = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        idUsuario = payload.id;
      } catch {
        idUsuario = null;
      }
    }

    if (!idUsuario) {
      return {
        duracionTrabajo: 25 * 60,
        duracionDescansoCorto: 5 * 60,
        duracionDescansoLargo: 15 * 60,
        sesionesAntesDescansoLargo: 4,
      };
    }

    return {
      duracionTrabajo:
        Number(localStorage.getItem(`duracionTrabajo_${idUsuario}`)) || 25 * 60,

      duracionDescansoCorto:
        Number(localStorage.getItem(`duracionDescansoCorto_${idUsuario}`)) ||
        5 * 60,

      duracionDescansoLargo:
        Number(localStorage.getItem(`duracionDescansoLargo_${idUsuario}`)) ||
        15 * 60,

      sesionesAntesDescansoLargo:
        Number(
          localStorage.getItem(`sesionesAntesDescansoLargo_${idUsuario}`),
        ) || 4,
    };
  }

  function guardarEstadoDescanso({
    inicioTemporizadorActual = inicioTemporizador,
    duracionActualActual = duracionActual,
    tiempoAcumuladoActual = tiempoAcumulado,
    activoActual = activo,
    pausadoActual = pausado,
    tiempoTerminadoActual = tiempoTerminado,
    inicioTiempoExtraActual = inicioTiempoExtra,
    tiempoExtraAcumuladoActual = tiempoExtraAcumulado,
  } = {}) {
    let fechaFinalizacion = null;

    if (
      activoActual &&
      !pausadoActual &&
      !tiempoTerminadoActual &&
      inicioTemporizadorActual
    ) {
      const tiempoRestante = duracionActualActual - tiempoAcumuladoActual;

      fechaFinalizacion = new Date(Date.now() + tiempoRestante * 1000);
    }

    localStorage.setItem(
      "estadoDescanso",
      JSON.stringify({
        inicioTemporizador: inicioTemporizadorActual
          ? inicioTemporizadorActual.toISOString()
          : null,

        fechaFinalizacion: fechaFinalizacion
          ? fechaFinalizacion.toISOString()
          : null,

        duracionActual: duracionActualActual,
        tiempoAcumulado: tiempoAcumuladoActual,
        activo: activoActual,
        pausado: pausadoActual,
        tiempoTerminado: tiempoTerminadoActual,

        inicioTiempoExtra: inicioTiempoExtraActual
          ? inicioTiempoExtraActual.toISOString()
          : null,

        tiempoExtraAcumulado: tiempoExtraAcumuladoActual,
      }),
    );
  }

  function borrarEstadoDescanso() {
    localStorage.removeItem("estadoDescanso");
  }

  function calcularSegundosTranscurridos(inicio = inicioTemporizador) {
    if (!inicio) {
      return tiempoAcumulado;
    }

    return tiempoAcumulado + Math.floor((Date.now() - inicio.getTime()) / 1000);
  }

  function calcularSegundosExtraTranscurridos() {
    if (!inicioTiempoExtra) {
      return tiempoExtraAcumulado;
    }

    return (
      tiempoExtraAcumulado +
      Math.floor((Date.now() - inicioTiempoExtra.getTime()) / 1000)
    );
  }

  function terminarTemporizador(momentoFinalizacion) {
    setTiempoRestante(0);
    setTiempoTerminado(true);
    setAlarmaActiva(true);
    reproducirAlarma();
    setInicioTiempoExtra(momentoFinalizacion);

    if (modo === "descanso") {
      localStorage.setItem(
        "estadoDescanso",
        JSON.stringify({
          inicioTemporizador: inicioTemporizador
            ? inicioTemporizador.toISOString()
            : null,
          duracionActual,
          tiempoAcumulado,
          activo: true,
          pausado: false,
          tiempoTerminado: true,
          inicioTiempoExtra: momentoFinalizacion.toISOString(),
          tiempoExtraAcumulado: 0,
        }),
      );
    }

    if (document.hidden) {
      mostrarNotificacion(
        "FocusFlow",
        modo === "trabajo"
          ? "Terminó tu tiempo de concentración 🧑‍💻"
          : "Terminó tu descanso 🧘",
        modo,
      );
    }
  }

  function reiniciarEstadoTemporizador() {
    setTiempoTerminado(false);
    setTiempoExtraAcumulado(0);
    setInicioTiempoExtra(null);
    setAlarmaActiva(false);
  }

  function reproducirAlarma() {
    if (contextoAudio.current) {
      return;
    }

    const token = localStorage.getItem("token");

    let idUsuario = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        idUsuario = payload.id;
      } catch {
        idUsuario = null;
      }
    }

    const sonidoSeleccionado = idUsuario
      ? localStorage.getItem(`sonidoAlarma_${idUsuario}`) || "clasico"
      : "clasico";

    if (sonidoSeleccionado === "silencioso") {
      return;
    }

    contextoAudio.current = new AudioContext();

    function reproducirTono(frecuencia, inicio, duracion, tipo = "sine") {
      const osciladorTono = contextoAudio.current.createOscillator();
      const gananciaTono = contextoAudio.current.createGain();

      osciladorTono.connect(gananciaTono);
      gananciaTono.connect(contextoAudio.current.destination);

      osciladorTono.frequency.value = frecuencia;
      osciladorTono.type = tipo;

      const tiempoInicio = contextoAudio.current.currentTime + inicio;

      gananciaTono.gain.setValueAtTime(0.3, tiempoInicio);

      gananciaTono.gain.exponentialRampToValueAtTime(
        0.01,
        tiempoInicio + duracion,
      );

      osciladorTono.start(tiempoInicio);
      osciladorTono.stop(tiempoInicio + duracion);
    }

    function reproducirSecuencia() {
      if (!contextoAudio.current) {
        return;
      }

      switch (sonidoSeleccionado) {
        case "suave":
          reproducirTono(500, 0, 0.6);
          reproducirTono(650, 0.7, 0.6);
          break;

        case "digital":
          reproducirTono(1000, 0, 0.15, "square");
          reproducirTono(1000, 0.2, 0.15, "square");
          reproducirTono(1200, 0.4, 0.15, "square");
          reproducirTono(1000, 0.6, 0.15, "square");
          break;

        case "campana":
          reproducirTono(1200, 0, 1, "triangle");
          reproducirTono(800, 0.1, 1.2, "triangle");
          break;

        case "clasico":
        default:
          reproducirTono(800, 0, 0.4);
          reproducirTono(800, 0.5, 0.4);
          reproducirTono(1000, 1, 0.6);
          break;
      }
    }

    reproducirSecuencia();

    intervaloAlarma.current = setInterval(() => {
      reproducirSecuencia();
    }, 2500);
  }

  function detenerAlarma() {
    if (intervaloAlarma.current) {
      clearInterval(intervaloAlarma.current);
      intervaloAlarma.current = null;
    }

    if (!contextoAudio.current) {
      return;
    }

    contextoAudio.current.close();

    contextoAudio.current = null;
    oscilador.current = null;
    ganancia.current = null;
  }

  // Funciones relacionadas con sesiones
  async function iniciarTrabajo() {
    const configuracion = obtenerConfiguracionPomodoro();

    const duracion = configuracion.duracionTrabajo;

    const fechaInicio = new Date();

    const sesion = await crearSesion(duracion, fechaInicio);

    borrarEstadoDescanso();
    localStorage.removeItem("modoTemporizador");

    setIdSesion(sesion.id);
    idSesionRef.current = sesion.id;

    setInicioSesion(fechaInicio);
    setInicioTemporizador(fechaInicio);
    inicioTemporizadorRef.current = fechaInicio;
    setTiempoAcumulado(0);
    setDuracionActual(duracion);

    setModo("trabajo");
    setTiempoRestante(duracion);

    reiniciarEstadoTemporizador();

    setActivo(true);
    activoRef.current = true;
    setPausado(false);
  }

  async function terminarTrabajo() {
    eliminarNotificaciones();
    detenerAlarma();
    setAlarmaActiva(false);

    const id = idSesionRef.current;
    const inicio = inicioTemporizadorRef.current;

    if (!id || !inicio) {
      return;
    }

    const duracion = calcularSegundosTranscurridos(inicio);

    const fin = new Date();

    await finalizarSesion(id, duracion, fin);
    setInicioSesion(null);
    setInicioTemporizador(null);
    setTiempoAcumulado(0);
    setDuracionActual(0);
    setIdSesion(null);
    idSesionRef.current = null;
    inicioTemporizadorRef.current = null;

    actualizarDatos();
  }

  async function terminarSesionManual() {
    setTerminando(true);

    try {
      setError("");
      setAlarmaActiva(false);

      await terminarTrabajo();

      setActivo(false);
      activoRef.current = false;
      reiniciarEstadoTemporizador();
    } catch (error) {
      setError(error.message);
    } finally {
      setTerminando(false);
    }
  }

  async function terminarDescansoManual() {
    setTerminando(true);

    try {
      setError("");
      setAlarmaActiva(false);
      detenerAlarma();
      await eliminarNotificaciones();

      // Detener el descanso
      setActivo(false);
      activoRef.current = false;

      // Limpiar estado del descanso
      borrarEstadoDescanso();
      localStorage.removeItem("modoTemporizador");

      setModo("trabajo");
      setPausado(false);
      setTiempoTerminado(false);

      setInicioTemporizador(null);
      setInicioTiempoExtra(null);

      setTiempoAcumulado(0);
      setTiempoExtraAcumulado(0);

      setDuracionActual(0);

      // Preparar el próximo trabajo
      const configuracion = obtenerConfiguracionPomodoro();
      const duracionTrabajo = configuracion.duracionTrabajo;

      setTiempoRestante(duracionTrabajo);

      actualizarDatos();
    } catch (error) {
      setError(error.message);
    } finally {
      setTerminando(false);
    }
  }

  // Manejo del temporizador
  async function iniciarTemporizador() {
    setIniciando(true);

    try {
      setError("");

      await iniciarTrabajo();
    } catch (error) {
      if (error.message === "Ya existe una sesión en progreso") {
        try {
          const sesion = await obtenerSesionEnProgreso();

          if (!sesion) {
            setError("No se encontró la sesión en progreso.");
            return;
          }

          const inicio = new Date(sesion.inicio);
          const duracion = sesion.duracion_objetivo;

          setIdSesion(sesion.id);
          idSesionRef.current = sesion.id;
          setInicioSesion(inicio);
          setInicioTemporizador(inicio);
          inicioTemporizadorRef.current = inicio;
          setTiempoAcumulado(0);
          setDuracionActual(duracion);
          setModo("trabajo");
          setPausado(false);
          setActivo(true);
          activoRef.current = true;

          const transcurrido = Math.floor(
            (Date.now() - inicio.getTime()) / 1000,
          );

          const restante = duracion - transcurrido;

          if (restante <= 0) {
            const momentoFinalizacion = new Date(
              inicio.getTime() + duracion * 1000,
            );

            terminarTemporizador(momentoFinalizacion);
          } else {
            setTiempoRestante(restante);
          }
        } catch (error) {
          setError(error.message);
        }

        return;
      }

      setError(error.message);
    } finally {
      setIniciando(false);
    }
  }

  function pausarTemporizador() {
    activoRef.current = false;

    if (tiempoTerminado) {
      const transcurrido = calcularSegundosExtraTranscurridos();

      setTiempoExtraAcumulado(transcurrido);
      setInicioTiempoExtra(null);

      if (modo === "descanso") {
        guardarEstadoDescanso({
          inicioTemporizadorActual: null,
          activoActual: false,
          pausadoActual: true,
          tiempoTerminadoActual: true,
          inicioTiempoExtraActual: null,
          tiempoExtraAcumuladoActual: transcurrido,
        });
      }
    } else {
      const transcurrido = calcularSegundosTranscurridos();

      setTiempoAcumulado(transcurrido);
      setInicioTemporizador(null);
      inicioTemporizadorRef.current = null;

      if (modo === "trabajo") {
        localStorage.setItem(
          "estadoTrabajo",
          JSON.stringify({
            duracionActual,
            tiempoAcumulado: transcurrido,
            pausado: true,
          }),
        );
      }

      if (modo === "descanso") {
        guardarEstadoDescanso({
          inicioTemporizadorActual: null,
          tiempoAcumuladoActual: transcurrido,
          activoActual: false,
          pausadoActual: true,
          tiempoTerminadoActual: false,
          inicioTiempoExtraActual: null,
          tiempoExtraAcumuladoActual: 0,
        });
      }
    }

    setActivo(false);
    setPausado(true);
    setAlarmaActiva(false);
  }

  function reanudarTemporizador() {
    const ahora = new Date();

    if (tiempoTerminado) {
      setInicioTiempoExtra(ahora);

      if (modo === "descanso") {
        localStorage.setItem(
          "estadoDescanso",
          JSON.stringify({
            inicioTemporizador: null,
            duracionActual,
            tiempoAcumulado,
            activo: true,
            pausado: false,
            tiempoTerminado: true,
            inicioTiempoExtra: ahora.toISOString(),
            tiempoExtraAcumulado,
          }),
        );
      }
    } else {
      setInicioTemporizador(ahora);
      inicioTemporizadorRef.current = ahora;

      if (modo === "trabajo") {
        localStorage.removeItem("estadoTrabajo");
      }

      if (modo === "descanso") {
        const tiempoRestanteActual = duracionActual - tiempoAcumulado;

        const fechaFinalizacion = new Date(
          ahora.getTime() + tiempoRestanteActual * 1000,
        );

        localStorage.setItem(
          "estadoDescanso",
          JSON.stringify({
            inicioTemporizador: ahora.toISOString(),
            fechaFinalizacion: fechaFinalizacion.toISOString(),
            duracionActual,
            tiempoAcumulado,
            activo: true,
            pausado: false,
            tiempoTerminado: false,
            inicioTiempoExtra: null,
            tiempoExtraAcumulado: 0,
          }),
        );
      }
    }

    activoRef.current = true;
    setActivo(true);
    setPausado(false);
  }

  // Decisiones del usuario
  function seguirTrabajando() {
    setAlarmaActiva(false);
  }

  function seguirDescansando() {
    setAlarmaActiva(false);
  }

  async function iniciarDescanso() {
    eliminarNotificaciones();

    setIniciandoDescanso(true);
    setError("");
    setAlarmaActiva(false);

    try {
      const duracion = calcularSegundosTranscurridos(
        inicioTemporizadorRef.current,
      );

      const fin = new Date();

      await finalizarSesion(idSesionRef.current, duracion, fin);

      actualizarDatos();

      // Limpiar sesión anterior
      setInicioSesion(null);
      setInicioTemporizador(null);
      setTiempoAcumulado(0);
      setDuracionActual(0);
      setIdSesion(null);
      idSesionRef.current = null;
      inicioTemporizadorRef.current = null;

      // Calcular qué descanso corresponde
      const configuracion = obtenerConfiguracionPomodoro();

      const nuevasSesionesCompletadas = sesionesCompletadasCiclo + 1;

      const esDescansoLargo =
        nuevasSesionesCompletadas >= configuracion.sesionesAntesDescansoLargo;

      if (esDescansoLargo) {
        setSesionesCompletadasCiclo(0);

        localStorage.setItem("sesionesCompletadasCiclo", "0");
      } else {
        setSesionesCompletadasCiclo(nuevasSesionesCompletadas);

        localStorage.setItem(
          "sesionesCompletadasCiclo",
          String(nuevasSesionesCompletadas),
        );
      }

      // Calcular duración del descanso
      const duracionDescanso = esDescansoLargo
        ? configuracion.duracionDescansoLargo
        : configuracion.duracionDescansoCorto;

      const ahora = new Date();

      // Nueva fecha absoluta de finalización
      const fechaFinalizacion = new Date(
        ahora.getTime() + duracionDescanso * 1000,
      );

      // Configurar temporizador
      setModo("descanso");
      setTiempoTerminado(false);
      setTiempoExtraAcumulado(0);
      setInicioTiempoExtra(null);
      setAlarmaActiva(false);

      setInicioTemporizador(ahora);
      setTiempoAcumulado(0);
      setDuracionActual(duracionDescanso);
      setTiempoRestante(duracionDescanso);

      setPausado(false);
      setActivo(true);
      activoRef.current = true;

      // Guardar estado del descanso
      localStorage.setItem(
        "estadoDescanso",
        JSON.stringify({
          inicioTemporizador: ahora.toISOString(),
          fechaFinalizacion: fechaFinalizacion.toISOString(),
          duracionActual: duracionDescanso,
          tiempoAcumulado: 0,
          activo: true,
          pausado: false,
          tiempoTerminado: false,
          inicioTiempoExtra: null,
          tiempoExtraAcumulado: 0,
        }),
      );

      localStorage.setItem("modoTemporizador", "descanso");
    } catch (error) {
      console.error("Error iniciando descanso:", error);

      setError(error.message);
    } finally {
      setIniciandoDescanso(false);
    }
  }

  iniciarDescansoRef.current = iniciarDescanso;
  iniciarTemporizadorRef.current = iniciarTemporizador;
  seguirTrabajandoRef.current = seguirTrabajando;
  seguirDescansandoRef.current = seguirDescansando;

  // Effects
  useEffect(() => {
    if (!activo || tiempoTerminado || !inicioTemporizador) {
      return;
    }

    const intervalo = setInterval(() => {
      if (!activoRef.current) {
        return;
      }
      const transcurrido = calcularSegundosTranscurridos();
      const restante = duracionActual - transcurrido;

      if (restante <= 0) {
        const exceso = transcurrido - duracionActual;

        const momentoFinalizacion = new Date(Date.now() - exceso * 1000);

        terminarTemporizador(momentoFinalizacion);
        return;
      }

      setTiempoRestante(restante);
    }, 1000);

    return () => {
      clearInterval(intervalo);
    };
  }, [activo, tiempoTerminado, inicioTemporizador, duracionActual]);

  useEffect(() => {
    if (!activo || !tiempoTerminado || !inicioTiempoExtra) {
      return;
    }

    const actualizarTiempoExtra = () => {
      setTiempoExtraAcumulado(calcularSegundosExtraTranscurridos());
    };

    actualizarTiempoExtra();

    const intervalo = setInterval(actualizarTiempoExtra, 1000);

    return () => clearInterval(intervalo);
  }, [activo, tiempoTerminado, inicioTiempoExtra]);

  useEffect(() => {
    async function recuperarSesion() {
      try {
        // --------------------------------------------------
        // 1. RECUPERAR DESCANSO
        // --------------------------------------------------

        const estadoDescansoGuardado = localStorage.getItem("estadoDescanso");

        if (estadoDescansoGuardado) {
          const estado = JSON.parse(estadoDescansoGuardado);

          const inicio = estado.inicioTemporizador
            ? new Date(estado.inicioTemporizador)
            : null;

          const inicioExtra = estado.inicioTiempoExtra
            ? new Date(estado.inicioTiempoExtra)
            : null;

          const fechaFinalizacion = estado.fechaFinalizacion
            ? new Date(estado.fechaFinalizacion)
            : null;

          setModo("descanso");
          setDuracionActual(estado.duracionActual);
          setTiempoAcumulado(estado.tiempoAcumulado || 0);
          setTiempoExtraAcumulado(estado.tiempoExtraAcumulado || 0);
          setPausado(estado.pausado);
          setActivo(estado.activo);
          setTiempoTerminado(estado.tiempoTerminado);
          setInicioTemporizador(inicio);
          setInicioTiempoExtra(inicioExtra);
          setAlarmaActiva(false);

          activoRef.current = estado.activo;

          // --------------------------------------------------
          // DESCANSO PAUSADO
          // --------------------------------------------------

          if (estado.pausado) {
            if (estado.tiempoTerminado) {
              setTiempoRestante(0);
            } else {
              setTiempoRestante(
                Math.max(
                  estado.duracionActual - (estado.tiempoAcumulado || 0),
                  0,
                ),
              );
            }

            return;
          }

          // --------------------------------------------------
          // DESCANSO TERMINADO, CON TIEMPO EXTRA
          // --------------------------------------------------

          if (estado.tiempoTerminado && inicioExtra) {
            const tiempoExtra =
              (estado.tiempoExtraAcumulado || 0) +
              Math.floor((Date.now() - inicioExtra.getTime()) / 1000);

            setTiempoExtraAcumulado(tiempoExtra);

            if (estado.activo) {
              setAlarmaActiva(true);
            }

            return;
          }

          // --------------------------------------------------
          // DESCANSO ACTIVO
          // --------------------------------------------------

          if (estado.activo && inicio) {
            let restante;

            if (fechaFinalizacion) {
              // Usamos la hora absoluta de finalización.
              restante = Math.ceil(
                (fechaFinalizacion.getTime() - Date.now()) / 1000,
              );
            } else {
              // Compatibilidad con estados antiguos que no
              // tenían fechaFinalizacion.
              const transcurrido =
                (estado.tiempoAcumulado || 0) +
                Math.floor((Date.now() - inicio.getTime()) / 1000);

              restante = estado.duracionActual - transcurrido;
            }

            // El descanso terminó mientras la página estaba
            // cerrada o suspendida.
            if (restante <= 0) {
              const momentoFinalizacion = fechaFinalizacion
                ? fechaFinalizacion
                : new Date(
                    inicio.getTime() +
                      (estado.duracionActual - (estado.tiempoAcumulado || 0)) *
                        1000,
                  );

              setTiempoRestante(0);
              setTiempoTerminado(true);
              setAlarmaActiva(true);
              setInicioTiempoExtra(momentoFinalizacion);

              localStorage.setItem(
                "estadoDescanso",
                JSON.stringify({
                  ...estado,
                  activo: true,
                  pausado: false,
                  tiempoTerminado: true,
                  inicioTiempoExtra: momentoFinalizacion.toISOString(),
                  tiempoExtraAcumulado: 0,
                }),
              );

              return;
            }

            setTiempoRestante(restante);
          }

          return;
        }

        // --------------------------------------------------
        // 2. RECUPERAR TRABAJO PAUSADO
        // --------------------------------------------------

        const estadoTrabajoGuardado = localStorage.getItem("estadoTrabajo");

        if (estadoTrabajoGuardado) {
          const estadoTrabajo = JSON.parse(estadoTrabajoGuardado);

          const sesion = await obtenerSesionEnProgreso();

          if (!sesion) {
            localStorage.removeItem("estadoTrabajo");
            return;
          }

          setIdSesion(sesion.id);
          idSesionRef.current = sesion.id;
          setInicioSesion(new Date(sesion.inicio));
          setInicioTemporizador(null);
          setTiempoAcumulado(estadoTrabajo.tiempoAcumulado || 0);
          setDuracionActual(estadoTrabajo.duracionActual);
          setModo("trabajo");
          setTiempoTerminado(false);
          setTiempoExtraAcumulado(0);
          setAlarmaActiva(false);
          setPausado(true);
          setActivo(false);

          activoRef.current = false;

          setTiempoRestante(
            Math.max(
              estadoTrabajo.duracionActual -
                (estadoTrabajo.tiempoAcumulado || 0),
              0,
            ),
          );

          return;
        }

        // --------------------------------------------------
        // 3. RECUPERAR TRABAJO ACTIVO DESDE LA BD
        // --------------------------------------------------

        const sesion = await obtenerSesionEnProgreso();

        if (!sesion) {
          return;
        }

        const inicio = new Date(sesion.inicio);
        const duracion = sesion.duracion_objetivo;

        setIdSesion(sesion.id);
        idSesionRef.current = sesion.id;

        setInicioSesion(inicio);
        setInicioTemporizador(inicio);
        inicioTemporizadorRef.current = inicio;

        setTiempoAcumulado(0);
        setDuracionActual(duracion);
        setModo("trabajo");
        setTiempoTerminado(false);
        setTiempoExtraAcumulado(0);
        setAlarmaActiva(false);
        setPausado(false);
        setActivo(true);

        activoRef.current = true;

        const transcurrido = Math.floor((Date.now() - inicio.getTime()) / 1000);

        const restante = duracion - transcurrido;

        if (restante <= 0) {
          const momentoFinalizacion = new Date(
            inicio.getTime() + duracion * 1000,
          );

          setTiempoRestante(0);
          setTiempoTerminado(true);
          setAlarmaActiva(true);
          setInicioTiempoExtra(momentoFinalizacion);

          return;
        }

        setTiempoRestante(restante);
      } catch (error) {
        setError(error.message);
      }
    }

    recuperarSesion();
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Alarma
  useEffect(() => {
    if (alarmaActiva) {
      reproducirAlarma();
    } else {
      detenerAlarma();
    }
  }, [alarmaActiva]);

  useEffect(() => {
    function actualizarAlVolver() {
      if (!activo) {
        return;
      }

      if (tiempoTerminado && inicioTiempoExtra) {
        setTiempoExtraAcumulado(calcularSegundosExtraTranscurridos());
        return;
      }

      if (!inicioTemporizador || tiempoTerminado) {
        return;
      }

      const transcurrido = calcularSegundosTranscurridos();
      const restante = duracionActual - transcurrido;

      if (restante <= 0) {
        terminarTemporizador();
        return;
      }

      setTiempoRestante(restante);
    }

    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, [
    activo,
    inicioTemporizador,
    inicioTiempoExtra,
    tiempoTerminado,
    duracionActual,
  ]);

  useEffect(() => {
    function manejarMensaje(event) {
      if (event.data?.tipo !== "accion-notificacion") {
        return;
      }

      if (event.data.accion === "iniciar-descanso") {
        iniciarDescansoRef.current?.();
      }

      if (event.data.accion === "iniciar-trabajo") {
        iniciarTemporizadorRef.current?.();
      }
    }

    navigator.serviceWorker?.addEventListener("message", manejarMensaje);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", manejarMensaje);
    };
  }, []);

  useEffect(() => {
    if (!navigator.serviceWorker?.controller) {
      return;
    }

    const canal = new MessageChannel();

    canal.port1.onmessage = (event) => {
      if (event.data?.tipo === "client-id") {
        clientIdRef.current = event.data.clientId;
      }
    };

    navigator.serviceWorker.controller.postMessage(
      {
        tipo: "obtener-client-id",
      },
      [canal.port2],
    );
  }, []);

  const esTrabajo = modo === "trabajo";

  const textoBotonPrincipal = esTrabajo
    ? "🧘 Iniciar descanso"
    : "🧑‍💻 Iniciar concentración";

  const accionBotonPrincipal = esTrabajo
    ? iniciarDescanso
    : iniciarTemporizador;

  const textoBotonSecundario = esTrabajo
    ? "🧑‍💻 Seguir concentrado"
    : "🧘 Seguir descansando";

  const accionBotonSecundario = esTrabajo
    ? seguirTrabajando
    : seguirDescansando;

  return (
    <div>
      <div className="temporizador-modo">
        <h2>{esTrabajo ? "🧑‍💻 Concentracion" : "🧘 Descanso"}</h2>
      </div>
      <div className="temporizador-tiempo">
        {tiempoTerminado ? (
          <div className="tiempo-extra">
            <span>Tiempo extra</span>
            <h1>+{formatearDuracion(tiempoExtraAcumulado)}</h1>
          </div>
        ) : (
          <h1>{formatearTiempo(tiempoRestante)}</h1>
        )}
      </div>

      <div className="acciones-temporizador">
        {!activo && !pausado && (
          <button onClick={iniciarTemporizador} disabled={iniciando}>
            {iniciando ? "Iniciando..." : "Iniciar"}
          </button>
        )}

        {activo && !tiempoTerminado && (
          <button onClick={pausarTemporizador}>⏸ Pausar</button>
        )}

        {!activo && pausado && !tiempoTerminado && (
          <button onClick={reanudarTemporizador}>▶ Reanudar</button>
        )}
      </div>

      {error && <p className="temporizador-error">{error}</p>}

      {tiempoTerminado && (
        <div className="acciones-tiempo-terminado">
          <button
            onClick={accionBotonPrincipal}
            disabled={iniciando || iniciandoDescanso}
          >
            {iniciandoDescanso
              ? "Iniciando descanso..."
              : iniciando
                ? "Iniciando concentración..."
                : textoBotonPrincipal}
          </button>

          {alarmaActiva && (
            <button onClick={accionBotonSecundario}>
              {textoBotonSecundario}
            </button>
          )}
        </div>
      )}

      {(idSesion || modo === "descanso") && (
        <div className="accion-terminar-sesion">
          <button
            onClick={
              modo === "descanso"
                ? terminarDescansoManual
                : terminarSesionManual
            }
            disabled={terminando}
          >
            {terminando ? "Terminando..." : "Terminar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Temporizador;
