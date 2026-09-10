// O esbuild não detecta os named exports (`Howl`, `Howler`) do UMD do
// pacote `howler` — o pré-bundle do Vite vira só um `export default`, e
// qualquer `import { Howl } from "howler"` (usado por `use-sound`) recebe
// `undefined`. Este shim importa o pacote real por caminho direto (default
// export, que sempre funciona) e reexporta os named exports manualmente.
// Aliasado no lugar de "howler" em vite.config.js.
import HowlerModule from "howler/dist/howler.js";

export const Howl = HowlerModule.Howl;
export const Howler = HowlerModule.Howler;
export default HowlerModule;
