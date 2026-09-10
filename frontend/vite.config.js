import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O pipeline de deploy (fora deste repo) injeta um .env de build usando o
// prefixo REACT_APP_ (herdado do Create React App) — manter esse prefixo
// aceito evita ter que coordenar uma renomeação de variável fora do repo.
// `frontend/add-env-vars.sh` também depende dos nomes REACT_APP_* atuais,
// já que ele faz busca-e-substituição de strings literais no bundle já
// compilado, em runtime dentro do container.
export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_"],
  // Mantém a porta do CRA: o backend (FRONTEND_URL em backend/.env, usado no
  // CORS) já espera http://localhost:3000.
  server: {
    port: 3000
  },
  // CRA (file-loader) importava qualquer extensão desconhecida como URL de
  // asset estático; o Vite só faz isso pras extensões que já conhece.
  assetsInclude: ["**/*.xlsx"],
  resolve: {
    alias: [
      // Ver src/vendor/howler-shim.js: o esbuild não detecta os named
      // exports do UMD do howler, quebrando `use-sound` ("HowlConstructor
      // is not a constructor"). Regex ancorada pra não capturar o próprio
      // `import "howler/dist/howler.js"` de dentro do shim (um alias de
      // string simples faz match por prefixo e criaria um loop).
      {
        find: /^howler$/,
        replacement: fileURLToPath(new URL("./src/vendor/howler-shim.js", import.meta.url))
      }
    ]
  },
  build: {
    // Mantém "build/" (padrão do CRA) em vez do "dist/" padrão do Vite:
    // frontend/Dockerfile faz `COPY build ./build` e o capacitor.config.json
    // aponta "webDir": "build".
    outDir: "build",
    sourcemap: false
  },
  esbuild: {
    loader: "jsx",
    include: /src[\\/].*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  }
});
