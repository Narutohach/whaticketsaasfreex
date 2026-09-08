import createCache from "@emotion/cache";

/**
 * Single Emotion cache shared by MUI's own styled-components (via
 * <CacheProvider> in App.js) and by the local makeStyles() shim.
 *
 * Both must write into the SAME cache so their generated <style> rules
 * land in one stylesheet in real DOM/render order — otherwise custom
 * overrides and MUI's own component defaults race unpredictably for
 * cascade priority (this is what caused the app-wide layout glitches).
 */
export const emotionCache = createCache({ key: "css" });

export default emotionCache;
