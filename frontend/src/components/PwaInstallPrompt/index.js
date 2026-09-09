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

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
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
        bottom: { xs: 16, sm: 24 },
        zIndex: 9999,
        maxWidth: 440,
        width: "92%",
        margin: "0 auto",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          p: 2,
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(8, 12, 20, 0.98) 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(16, 185, 129, 0.2)",
          color: "#f8fafc",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              component="img"
              src="/android-chrome-192x192.png"
              alt="HACTO Desk Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#ffffff", lineHeight: 1.2 }}>
                Instalar HACTO Desk
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                Acesso rápido em tela cheia
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: "#64748b", "&:hover": { color: "#fff" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {showIosTip ? (
          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px dashed rgba(16, 185, 129, 0.4)" }}>
            <Typography variant="caption" sx={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              1. Toque no ícone Compartilhar <IosShareIcon fontSize="small" sx={{ color: "#38bdf8" }} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 1 }}>
              2. Selecione <AddBoxOutlinedIcon fontSize="small" sx={{ color: "#34d399" }} /> <b>Adicionar à Tela de Início</b>
            </Typography>
          </Box>
        ) : (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1.5}>
            <Button
              size="small"
              onClick={handleClose}
              sx={{
                color: "#94a3b8",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": { color: "#fff" },
              }}
            >
              Agora não
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<GetAppIcon fontSize="small" />}
              onClick={handleInstall}
              sx={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                px: 2,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                "&:hover": {
                  backgroundColor: "#059669",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.5)",
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
