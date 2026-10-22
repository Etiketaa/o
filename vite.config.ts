import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "Turnero Gym",
        short_name: "TurneroGym",
        description: "Reservá tus turnos en el gym de forma fácil y rápida",
        theme_color: "#101215",
        background_color: "#101215",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      // Inyecta el manifiesto de precache en src/sw.ts y genera dist/sw.js.
      // El runtime caching (cache-first estaticos, network-first Supabase) y el
      // manejo de notificaciones viven en src/sw.ts.
      strategies: "injectManifest",
      // resolveSwPaths del plugin resuelve <srcDir>/<filename> como fuente del
      // SW y emite <outDir>/<filename sin extension>.js -> dist/sw.js.
      srcDir: path.resolve(__dirname, "src"),
      filename: "sw.ts",
      injectManifest: {
        swSrc: path.resolve(__dirname, "src/sw.ts"),
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
