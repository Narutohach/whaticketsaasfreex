import React from "react";
import { makeStyles } from "../../styles/makeStyles";

const useStyles = makeStyles(() => ({
  logoWrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    userSelect: "none",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    lineHeight: 1,
  },
  brandName: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 900,
    fontSize: (props) => (props.size === "large" ? "28px" : props.size === "small" ? "18px" : "22px"),
    letterSpacing: "-0.5px",
    color: "#f8fafc",
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },
  brandHighlight: {
    background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #38bdf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 800,
  },
  brandSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: (props) => (props.size === "large" ? "10px" : props.size === "small" ? "7px" : "8.5px"),
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#64748b",
    marginTop: "4px",
  },
}));

export const HactoLogo = ({ size = "medium", light = false, showTagline = true, className }) => {
  const classes = useStyles({ size });

  const iconSizes = {
    small: { width: 32, height: 32 },
    medium: { width: 44, height: 44 },
    large: { width: 56, height: 56 },
  };

  const { width, height } = iconSizes[size] || iconSizes.medium;

  return (
    <div className={`${classes.logoWrapper} ${className || ""}`}>
      {/* SVG Icon Monogram */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(16, 185, 129, 0.35))" }}
      >
        <defs>
          <linearGradient id="hactoGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1677FF" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="hactoGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="hactoGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B1F2A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* Base Grid Pillars with Rounded Geometry */}
        <rect x="8" y="10" width="36" height="36" rx="10" fill="url(#hactoGradDark)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="56" y="10" width="36" height="36" rx="10" fill="url(#hactoGradBlue)" />
        <rect x="8" y="54" width="36" height="36" rx="10" fill="url(#hactoGradGreen)" />
        <rect x="56" y="54" width="36" height="36" rx="10" fill="url(#hactoGradBlue)" />

        {/* Fluent Intersecting Bridge Wave (Omnichannel Flow) */}
        {/* Soft outline so the wave stays visible over both light and dark backgrounds */}
        <path
          d="M26 48 C 38 48, 48 38, 54 26 C 62 42, 72 48, 82 48"
          stroke="rgba(15, 23, 42, 0.35)"
          strokeWidth="9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 48 C 38 48, 48 38, 54 26 C 62 42, 72 48, 82 48"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsing AI Energy Dot */}
        <circle cx="54" cy="26" r="4.5" fill="#34D399" />
      </svg>

      {/* Typography */}
      <div className={classes.textContainer}>
        <div className={classes.brandName} style={{ color: light ? "#0f172a" : "#f8fafc" }}>
          HACTO <span className={classes.brandHighlight}>DESK</span>
        </div>
        {showTagline && (
          <div className={classes.brandSub}>
            GRUPO HACTO TECNOLOGIA
          </div>
        )}
      </div>
    </div>
  );
};

export default HactoLogo;
