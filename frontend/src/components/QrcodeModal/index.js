import React, { useEffect, useState, useContext } from "react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { makeStyles } from "../../styles/makeStyles";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.mode === "dark" || theme.mode === "dark";

  return {
    dialogPaper: {
      backgroundColor: isDark ? "#0f172a !important" : "#ffffff !important",
      backdropFilter: "blur(24px)",
      borderRadius: "28px !important",
      border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
      boxShadow: isDark
        ? "0 30px 60px -12px rgba(0, 0, 0, 0.85)"
        : "0 30px 60px -12px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
      maxWidth: "800px !important",
      width: "100%",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "22px 28px 18px 28px",
      borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
    },
    headerTitleContainer: {
      display: "flex",
      alignItems: "center",
      gap: 14,
    },
    headerTitle: {
      fontWeight: "800 !important",
      fontSize: "1.25rem !important",
      lineHeight: 1.2,
      color: isDark ? "#f8fafc !important" : "#0f172a !important",
    },
    headerSubtitle: {
      color: isDark ? "#94a3b8 !important" : "#64748b !important",
      fontSize: "0.82rem !important",
    },
    waIconBadge: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: "rgba(37, 211, 102, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#25D366",
      boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)",
      flexShrink: 0,
    },
    contentWrapper: {
      display: "flex",
      flexWrap: "wrap",
      padding: "28px",
      gap: "32px",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepsColumn: {
      flex: "1 1 320px",
      minWidth: 280,
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    sectionTitle: {
      fontWeight: "700 !important",
      fontSize: "0.95rem !important",
      color: isDark ? "#f8fafc !important" : "#0f172a !important",
    },
    stepCard: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "12px 16px",
      borderRadius: 14,
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.65)" : "rgba(241, 245, 249, 0.85)",
      border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.04)",
      transition: "transform 0.15s ease, background-color 0.15s ease",
      "&:hover": {
        transform: "translateX(3px)",
        backgroundColor: isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(241, 245, 249, 1)",
      },
    },
    stepNumberBadge: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      backgroundColor: "#10b981",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: "0.8rem",
      flexShrink: 0,
      marginTop: 1,
      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.45)",
    },
    stepText: {
      fontSize: "0.88rem !important",
      lineHeight: "1.45 !important",
      color: isDark ? "#e2e8f0 !important" : "#1e293b !important",
    },
    qrColumn: {
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      gap: 14,
    },
    qrFrameContainer: {
      position: "relative",
      padding: 16,
      borderRadius: 22,
      backgroundColor: "#ffffff",
      boxShadow: isDark
        ? "0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.2)"
        : "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    laserLine: {
      position: "absolute",
      left: 10,
      right: 10,
      height: 3,
      background: "linear-gradient(90deg, transparent, #25D366, transparent)",
      boxShadow: "0 0 12px #25D366",
      zIndex: 10,
      animation: "$laserScan 2.5s ease-in-out infinite",
    },
    cornerBracketTopLeft: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 20,
      height: 20,
      borderTop: "3px solid #10b981",
      borderLeft: "3px solid #10b981",
      borderTopLeftRadius: 8,
    },
    cornerBracketTopRight: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderTop: "3px solid #10b981",
      borderRight: "3px solid #10b981",
      borderTopRightRadius: 8,
    },
    cornerBracketBottomLeft: {
      position: "absolute",
      bottom: 8,
      left: 8,
      width: 20,
      height: 20,
      borderBottom: "3px solid #10b981",
      borderLeft: "3px solid #10b981",
      borderBottomLeftRadius: 8,
    },
    cornerBracketBottomRight: {
      position: "absolute",
      bottom: 8,
      right: 8,
      width: 20,
      height: 20,
      borderBottom: "3px solid #10b981",
      borderRight: "3px solid #10b981",
      borderBottomRightRadius: 8,
    },
    statusBadge: {
      fontWeight: 600,
      fontSize: "0.78rem",
      backgroundColor: "rgba(37, 211, 102, 0.15)",
      color: "#25D366",
      border: "1px solid rgba(37, 211, 102, 0.35)",
      borderRadius: 20,
      padding: "2px 6px",
    },
    footerSecurity: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "14px 28px",
      backgroundColor: isDark ? "rgba(8, 12, 20, 0.6)" : "rgba(0, 0, 0, 0.03)",
      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.05)",
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: "0.78rem",
    },
    closeButton: {
      color: isDark ? "#94a3b8 !important" : "#64748b !important",
      "&:hover": {
        color: isDark ? "#f8fafc !important" : "#0f172a !important",
      },
    },
    "@keyframes laserScan": {
      "0%": {
        top: "10px",
        opacity: 0.2,
      },
      "50%": {
        top: "calc(100% - 15px)",
        opacity: 1,
      },
      "100%": {
        top: "10px",
        opacity: 0.2,
      },
    },
  };
});

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;
      setLoading(true);

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose, socketManager]);

  const handleRefreshQr = async () => {
    if (!whatsAppId) return;
    setLoading(true);
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
      const { data } = await api.get(`/whatsapp/${whatsAppId}`);
      setQrCode(data.qrcode);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      scroll="paper"
    >
      {/* Cabeçalho */}
      <div className={classes.modalHeader}>
        <div className={classes.headerTitleContainer}>
          <div className={classes.waIconBadge}>
            <WhatsAppIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <Typography className={classes.headerTitle}>
              Conectar WhatsApp Web
            </Typography>
            <Typography className={classes.headerSubtitle}>
              Sincronização em tempo real via QR Code seguro
            </Typography>
          </div>
        </div>

        <IconButton size="small" onClick={onClose} className={classes.closeButton}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <DialogContent style={{ padding: 0 }}>
        <div className={classes.contentWrapper}>
          {/* Coluna 1: Passos com Cards Interativos */}
          <div className={classes.stepsColumn}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography className={classes.sectionTitle}>
                Como conectar no seu celular:
              </Typography>
              <Chip
                label="Aguardando Leitura"
                size="small"
                className={classes.statusBadge}
              />
            </Box>

            <div className={classes.stepCard}>
              <div className={classes.stepNumberBadge}>1</div>
              <Typography className={classes.stepText}>
                Abra o <b>WhatsApp</b> no seu smartphone.
              </Typography>
            </div>

            <div className={classes.stepCard}>
              <div className={classes.stepNumberBadge}>2</div>
              <Typography className={classes.stepText}>
                Toque em <b>Mais opções</b> <MoreVertIcon style={{ fontSize: 16, verticalAlign: "middle" }} /> no Android ou em <b>Configurações</b> <SettingsIcon style={{ fontSize: 16, verticalAlign: "middle" }} /> no iPhone.
              </Typography>
            </div>

            <div className={classes.stepCard}>
              <div className={classes.stepNumberBadge}>3</div>
              <Typography className={classes.stepText}>
                Selecione <b>Aparelhos conectados</b> e depois toque no botão <b>Conectar um aparelho</b>.
              </Typography>
            </div>

            <div className={classes.stepCard}>
              <div className={classes.stepNumberBadge}>4</div>
              <Typography className={classes.stepText}>
                Aponte a câmera do seu celular para este código para finalizar a conexão.
              </Typography>
            </div>
          </div>

          {/* Coluna 2: QR Code com Moldura Laser e Scanner */}
          <div className={classes.qrColumn}>
            <div className={classes.qrFrameContainer}>
              <div className={classes.cornerBracketTopLeft} />
              <div className={classes.cornerBracketTopRight} />
              <div className={classes.cornerBracketBottomLeft} />
              <div className={classes.cornerBracketBottomRight} />

              {qrCode && <div className={classes.laserLine} />}

              {qrCode ? (
                <QRCode
                  value={qrCode}
                  size={230}
                  level="H"
                />
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  width={230}
                  height={230}
                  gap={2}
                >
                  <CircularProgress size={36} color="success" />
                  <Typography variant="caption" style={{ color: "#64748b", textAlign: "center", maxWidth: 180 }}>
                    Gerando sessão segura com o WhatsApp...
                  </Typography>
                </Box>
              )}
            </div>

            <Button
              size="small"
              variant="text"
              startIcon={<RefreshIcon style={{ fontSize: 16 }} />}
              onClick={handleRefreshQr}
              disabled={loading}
              style={{ textTransform: "none", color: "#10b981", fontWeight: 700, fontSize: "0.82rem" }}
            >
              {loading ? "Atualizando..." : "Recarregar QR Code"}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Rodapé de Segurança */}
      <div className={classes.footerSecurity}>
        <LockOutlinedIcon style={{ fontSize: 16, color: "#10b981" }} />
        <span>Conexão direta ponta a ponta criptografada. Suas mensagens permanecem protegidas.</span>
      </div>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
