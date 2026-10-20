export function formatearDuracion(segundos = 0) {
  if (segundos === 0) {
    return "0";
  }

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;

  let texto = "";

  if (horas > 0) {
    texto += `${horas} h `;
  }

  if (minutos > 0) {
    texto += `${minutos} min `;
  }

  // Los segundos se muestran solo cuando no hay horas
  if (horas === 0 && segundosRestantes > 0) {
    texto += `${segundosRestantes} s`;
  }

  return texto.trim();
}

export function formatearTiempoTemporizador(segundos = 0) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;

  const tiempo = [
    ...(horas > 0 ? [String(horas).padStart(2, "0")] : []),
    String(minutos).padStart(2, "0"),
    String(segundosRestantes).padStart(2, "0"),
  ];

  return tiempo.join(":");
}
