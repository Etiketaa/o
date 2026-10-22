/**
 * Service worker de la PWA de Turnero Gym (OZ Entrenamiento).
 *
 * Generado con vite-plugin-pwa en modo `injectManifest`. El archivo fuente
 * vive aca (`src/sw.ts`) y el build deja el SW listo en `dist/sw.js`, con el
 * manifiesto de precache inyectado en `self.__WB_MANIFEST`.
 *
 * - Precacha los assets del build (HTML, JS, CSS, PNG, SVG, fuentes).
 * - Cache-first para estaticos.
 * - Network-first para la API de Supabase.
 * - Escucha `notificationclick` para focuse la ventana de la app cuando el
 *   usuario toca una alerta de turno (la app crea las notificaciones con la
 *   Notification API directa; el SW solo reacciona al click).
 */

import { clientsClaim, skipWaiting } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Toma el control de las pestañas abiertas y activa el SW nuevo al instante,
// sin esperar a que se recargue la pagina.
clientsClaim();
skipWaiting();

// `self.__WB_MANIFEST` es inyectado por vite-plugin-pwa al momento del build.
// Contiene la lista de archivos a precachear (según globPatterns).
const manifest = (self as unknown as { __WB_MANIFEST?: unknown[] }).__WB_MANIFEST ?? [];
precacheAndRoute(manifest as any);

// ---------------------------------------------------------------------------
// Estrategias de cache
// ---------------------------------------------------------------------------

// Estaticos: cache-first. Se sirven del cache aunque haya red disponible.
registerRoute(
  ({ request }) => {
    const destino = request.destination;
    return (
      destino === "style" ||
      destino === "script" ||
      destino === "image" ||
      destino === "font"
    );
  },
  new CacheFirst({
    cacheName: "estaticos-v1",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  }),
);

// API de Supabase: network-first con cache de respaldo.
registerRoute(
  ({ url }) => url.hostname.endsWith("supabase.co"),
  new NetworkFirst({
    cacheName: "api-supabase-v1",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 horas
      }),
    ],
  }),
);

// ---------------------------------------------------------------------------
// Notificaciones de turno
// ---------------------------------------------------------------------------

// La app crea las notificaciones con `new Notification()` directamente. El SW
// solo necesita reaccionar cuando el usuario toca una (`notificationclick`)
// para focuse (o abrir) la ventana de la app.

self.addEventListener("push", () => {
  // No hacemos nada: la app muestra la notificacion directamente.
  // Este listener existe para que el navegador no despierte el SW en vano.
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const clientes = await (self as any).clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const origen = self.location.origin;
      for (const cliente of clientes) {
        if (cliente.url.startsWith(origen)) {
          await cliente.focus();
          return;
        }
      }

      // No hay pestaña abierta de la app: la abrimos.
      await (self as any).clients.openWindow("/");
    })(),
  );
});
