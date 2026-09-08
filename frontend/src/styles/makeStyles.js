import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { serializeStyles } from "@emotion/serialize";
import { insertStyles } from "@emotion/utils";
import { emotionCache } from "./emotionCache";

const resolveStyles = (value, props) => {
  if (typeof value === "function") return resolveStyles(value(props), props);
  if (Array.isArray(value)) return value.map((item) => resolveStyles(item, props));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, resolveStyles(item, props)])
  );
};

// Mirrors @emotion/css's own css(), but inserts into the cache shared with
// MUI (see emotionCache.js) instead of a disconnected standalone registry.
const css = (style) => {
  const serialized = serializeStyles([style], emotionCache.registered, undefined);
  insertStyles(emotionCache, serialized, false);
  return `${emotionCache.key}-${serialized.name}`;
};

/**
 * Local Emotion-based style hook for the MUI 9 styling engine.
 * It keeps the existing class API while using the same styling engine as MUI 9.
 */
export const makeStyles = (styles) => (props = {}) => {
  const theme = useTheme();

  return useMemo(() => {
    const rules = resolveStyles(
      typeof styles === "function" ? styles(theme) : styles,
      props
    );

    return Object.fromEntries(
      Object.entries(rules).map(([name, rule]) => [name, css(rule)])
    );
  }, [props, theme]);
};

export default makeStyles;
