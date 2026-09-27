import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let datos = {
    titulo: "FocusFlow",
    mensaje: "Terminó tu temporizador.",
  };

  if (event.data) {
    try {
      datos = event.data.json();
    } catch {
      datos.mensaje = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.mensaje,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.tipo !== "obtener-client-id") {
    return;
  }

  event.ports[0]?.postMessage({
    tipo: "client-id",
    clientId: event.source.id,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const accion = event.action;
  const clientId = event.notification.data?.clientId;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(async (clientes) => {
        const cliente = clientes.find((cliente) => cliente.id === clientId);

        if (!cliente) {
          return;
        }

        await cliente.focus();

        cliente.postMessage({
          tipo: "accion-notificacion",
          accion,
        });
      }),
  );
});
