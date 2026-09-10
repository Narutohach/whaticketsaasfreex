import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Slide,
  Button,
  IconButton,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { isNativeApp } from "../../native/nativeApp";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // If running in native Android app, never show PWA install prompt
    if (isNativeApp) {
      return;
    }

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (24 hours)
    const dismissedAt = localStorage.getItem("hacto_pwa_dismissed");
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        return;
      }
    }

    // Check if iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|crmo/.test(userAgent);

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
      // Show prompt after 4 seconds on iOS
      const timer = setTimeout(() => {
        setOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Android / Chromium / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds before displaying prompt so the user settles in
      setTimeout(() => {
        setOpen(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowIosTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("[PWA] Usuário aceitou instalar o app");
    } else {
      console.log("[PWA] Usuário recusou a instalação");
    }
    setDeferredPrompt(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hacto_pwa_dismissed", Date.now().toString());
  };

  if (!open) return null;

  return (
    <Snackbar
      open={open}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        bottom: { xs: 16, sm: 28 },
        zIndex: 9999,
        maxWidth: 460,
        width: "92%",
        margin: "0 auto",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          p: { xs: 2, sm: 2.5 },
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 12, 20, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 24px -4px rgba(16, 185, 129, 0.25)",
          color: "#f8fafc",
        }}
      >
        {/* Ambient Gradient Glow */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Pinned Top-Right Close Button */}
        <IconButton
          size="small"
          onClick={handleClose}
          aria-label="Fechar"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            color: "#94a3b8",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            p: 0.6,
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>

        {/* Header content */}
        <Box display="flex" alignItems="flex-start" gap={2} pr={4}>
          <Box
            sx={{
              position: "relative",
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: "14px",
              p: "2px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.7) 0%, rgba(14, 165, 233, 0.4) 100%)",
              boxShadow: "0 8px 18px -4px rgba(16, 185, 129, 0.35)",
            }}
          >
            <Box
              component="img"
              src="/android-chrome-192x192.png?v=hacto-desk-3"
              alt="HACTO Desk Logo"
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box display="flex" alignItems="center" gap={0.8} mb={0.4}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#34d399",
                }}
              >
                Aplicativo Oficial
              </Typography>
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                mb: 0.4,
              }}
            >
              Instalar HACTO Desk
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontSize: "0.8rem",
                lineHeight: 1.35,
              }}
            >
              Acesso rápido com notificações nativas e experiência fluida em tela cheia.
            </Typography>
          </Box>
        </Box>

        {showIosTip ? (
          <Box
            sx={{
              mt: 2,
              p: 1.8,
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1px dashed rgba(16, 185, 129, 0.35)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                fontSize: "0.8rem",
              }}
            >
              1. Toque no ícone Compartilhar{" "}
              <IosShareIcon fontSize="small" sx={{ color: "#38bdf8" }} /> na barra do Safari
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.8rem",
              }}
            >
              2. Role e selecione{" "}
              <AddBoxOutlinedIcon fontSize="small" sx={{ color: "#34d399" }} />{" "}
              <b>Adicionar à Tela de Início</b>
            </Typography>
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={1.2}
            mt={2}
            pt={1.5}
            sx={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Button
              size="small"
              onClick={handleClose}
              sx={{
                color: "#94a3b8",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 1.8,
                py: 0.7,
                borderRadius: "10px",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#f1f5f9",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                },
              }}
            >
              Agora não
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<GetAppIcon sx={{ fontSize: 18 }} />}
              onClick={handleInstall}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.84rem",
                textTransform: "none",
                borderRadius: "10px",
                px: 2.2,
                py: 0.8,
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.6)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              Instalar App
            </Button>
          </Box>
        )}
      </Paper>
    </Snackbar>
  );
};

export default PwaInstallPrompt;
