import React from "react";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import { makeStyles } from "../../styles/makeStyles";
import HactoLogo from "../Logo";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 99,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(8, 12, 20, 0.88)" : "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoBox: {
    animation: "$pulse 2s ease-in-out infinite",
    filter: "drop-shadow(0 8px 24px rgba(16, 185, 129, 0.35))",
  },
  loaderTrack: {
    width: 160,
    height: 4,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    borderRadius: 99,
    overflow: "hidden",
    position: "relative",
  },
  loaderBar: {
    position: "absolute",
    height: "100%",
    width: "40%",
    background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
    borderRadius: 99,
    animation: "$slide 1.4s ease-in-out infinite",
    boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
  },
  loadingText: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    letterSpacing: "0.4px",
  },
  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.04)",
    },
  },
  "@keyframes slide": {
    "0%": {
      left: "-40%",
    },
    "100%": {
      left: "100%",
    },
  },
}));

const BackdropLoading = ({ message = "Carregando ambiente..." }) => {
  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open={true}>
      <div className={classes.logoBox}>
        <HactoLogo size="medium" />
      </div>
      <div className={classes.loaderTrack}>
        <div className={classes.loaderBar} />
      </div>
      <Typography className={classes.loadingText}>{message}</Typography>
    </Backdrop>
  );
};

export default BackdropLoading;
