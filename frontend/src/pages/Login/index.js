import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { makeStyles } from "../../styles/makeStyles";
import {
  MailOutlineOutlined as MailOutline,
  LockOutlined,
  Visibility,
  VisibilityOff,
  FlashOn,
  Security,
  Speed,
  ArrowForward
} from "@mui/icons-material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import HactoLogo from "../../components/Logo";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    minHeight: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#080c14",
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      overflowY: "auto",
    },
  },
  // Ambient Mesh Background Glows
  ambientGlowTopLeft: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "650px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.05) 50%, rgba(8, 12, 20, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  ambientGlowBottomRight: {
    position: "absolute",
    bottom: "-15%",
    right: "-10%",
    width: "650px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(30, 27, 75, 0.05) 50%, rgba(8, 12, 20, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  ambientGlowCenter: {
    position: "absolute",
    top: "35%",
    left: "40%",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(8, 12, 20, 0) 70%)",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
    backgroundSize: "32px 32px",
    opacity: 0.5,
    pointerEvents: "none",
    zIndex: 1,
  },
  /* LEFT SHOWCASE / HERO */
  leftSide: {
    flex: 1.15,
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6, 7),
    borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(5, 2.5),
      borderRight: "none",
      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    },
  },
  heroContainer: {
    maxWidth: "560px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3.5),
  },
  brandPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "9999px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.4px",
    alignSelf: "flex-start",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 10px #10b981",
    animation: "$pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)" },
    "70%": { transform: "scale(1.15)", boxShadow: "0 0 0 8px rgba(16, 185, 129, 0)" },
    "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)" },
  },
  heroTitle: {
    color: "#f8fafc",
    fontWeight: 800,
    fontSize: "2.6rem",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    "& span": {
      background: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #38bdf8 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "2rem",
    },
  },
  heroDesc: {
    color: "#94a3b8",
    fontSize: "1.05rem",
    lineHeight: 1.6,
  },
  /* INTERACTIVE CHAT PREVIEW CARD */
  chatCard: {
    position: "relative",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.08)",
    padding: theme.spacing(2.5),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: theme.spacing(1.5),
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  chatAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  chatHeaderTitle: {
    color: "#f8fafc",
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  chatHeaderSub: {
    color: "#34d399",
    fontSize: "0.78rem",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  bubbleClient: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    background: "rgba(30, 41, 59, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px 16px 4px 16px",
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: "0.88rem",
    lineHeight: 1.45,
  },
  bubbleBot: {
    alignSelf: "flex-start",
    maxWidth: "88%",
    background: "linear-gradient(135deg, rgba(6, 78, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    borderRadius: "16px 16px 16px 4px",
    padding: "10px 14px",
    color: "#f8fafc",
    fontSize: "0.88rem",
    lineHeight: 1.45,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
  },
  badgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
  },
  featurePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: 500,
  },

  /* RIGHT AUTH CARD */
  rightSide: {
    flex: 0.85,
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6, 4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(5, 2.5),
    },
  },
  authCard: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "24px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    padding: theme.spacing(5, 4),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 2.5),
    },
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(1),
  },
  logoImg: {
    maxHeight: "70px",
    maxWidth: "100%",
    objectFit: "contain",
  },
  authHeader: {
    textAlign: "center",
  },
  authTitle: {
    color: "#f8fafc",
    fontWeight: 800,
    fontSize: "1.65rem",
    letterSpacing: "-0.5px",
  },
  authSub: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: theme.spacing(0.5),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.2),
  },
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "rgba(30, 41, 59, 0.6)",
      color: "#f8fafc",
      transition: "all 0.25s ease",
      "&:hover": {
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#10b981",
          borderWidth: "1px",
        },
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    "& .MuiOutlinedInput-input": {
      padding: "15px 14px",
      fontSize: "0.95rem",
      color: "#f8fafc",
      "&::placeholder": {
        color: "#64748b",
        opacity: 1,
      },
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px rgba(30, 41, 59, 0.95) inset",
        WebkitTextFillColor: "#f8fafc",
        caretColor: "#f8fafc",
        borderRadius: "14px",
        transition: "background-color 5000s ease-in-out 0s",
      },
      "&:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
        WebkitBoxShadow: "0 0 0 1000px rgba(15, 23, 42, 0.95) inset",
        WebkitTextFillColor: "#f8fafc",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#94a3b8",
      transform: "translate(14px, 16px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
      color: "#34d399",
      fontWeight: 600,
      backgroundColor: "transparent",
    },
  },
  forgotLink: {
    color: "#34d399",
    fontWeight: 600,
    fontSize: "0.85rem",
    textDecoration: "none",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#10b981",
      textDecoration: "underline",
    },
  },
  loginBtn: {
    padding: "14px 0",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    textTransform: "none",
    letterSpacing: "0.4px",
    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    "&:hover": {
      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 15px 30px -5px rgba(16, 185, 129, 0.6)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  signupWrapper: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.88rem",
  },
  signupLink: {
    color: "#34d399",
    fontWeight: 700,
    marginLeft: theme.spacing(0.6),
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  securityBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "0.78rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    paddingTop: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const [viewregister, setviewregister] = useState("disabled");

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchviewregister();
  }, []);

  const fetchviewregister = async () => {
    try {
      const responsev = await api.get("/settings/public/viewregister");
      const viewregisterX = responsev?.data?.value;
      setviewregister(viewregisterX);
    } catch (error) {
      console.error("Error retrieving viewregister", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />

      {/* Dynamic Ambient Background Glows */}
      <div className={classes.ambientGlowTopLeft} />
      <div className={classes.ambientGlowBottomRight} />
      <div className={classes.ambientGlowCenter} />
      <div className={classes.gridPattern} />

      {/* LEFT HERO / VALUE PROPOSITION */}
      <div className={classes.leftSide}>
        <div className={classes.heroContainer}>
          <div className={classes.brandPill}>
            <span className={classes.pulseDot} />
            Plataforma Omnichannel & IA • v5.5
          </div>

          <Typography className={classes.heroTitle} component="h1">
            Conecte seus canais e <span>automatize com IA</span>
          </Typography>

          <Typography className={classes.heroDesc}>
            Centralize WhatsApp Web e WhatsApp Cloud API Oficial da Meta com agentes inteligentes OpenAI e Google Gemini.
          </Typography>

          {/* Real-time Interactive Chat Mockup */}
          <div className={classes.chatCard}>
            <div className={classes.chatHeader}>
              <div className={classes.chatHeaderLeft}>
                <div className={classes.chatAvatar}>
                  <SmartToyIcon fontSize="small" />
                </div>
                <div>
                  <Typography className={classes.chatHeaderTitle}>
                    Assistente Virtual Inteligente
                  </Typography>
                  <Typography className={classes.chatHeaderSub}>
                    <FlashOn style={{ fontSize: "0.85rem" }} /> Atendimento instantâneo
                  </Typography>
                </div>
              </div>
              <div className={classes.featurePill}>
                <WhatsAppIcon style={{ color: "#25D366", fontSize: "1rem" }} /> WhatsApp Oficial
              </div>
            </div>

            <div className={classes.bubbleClient}>
              Olá! Gostaria de saber como a IA pode atender meus clientes 24/7.
            </div>

            <div className={classes.bubbleBot}>
              Olá! Com o Whaticket SaaS, seus clientes recebem atendimento imediato com GPT-4o e Gemini, triagem em filas e fechamento automático de tickets! 🚀
            </div>
          </div>

          {/* Highlights */}
          <div className={classes.badgesRow}>
            <div className={classes.featurePill}>
              <Security style={{ color: "#10b981", fontSize: "1rem" }} /> Criptografia AES-256-GCM
            </div>
            <div className={classes.featurePill}>
              <Speed style={{ color: "#38bdf8", fontSize: "1rem" }} /> Resposta em Tempo Real
            </div>
            <div className={classes.featurePill}>
              <SmartToyIcon style={{ color: "#a855f7", fontSize: "1rem" }} /> Multi-Provider OpenAI + Gemini
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH FORM */}
      <div className={classes.rightSide}>
        <Paper elevation={0} className={classes.authCard}>
          <div className={classes.logoContainer}>
            <HactoLogo size="large" />
          </div>

          <div className={classes.authHeader}>
            <Typography className={classes.authTitle} component="h2">
              Acesse sua conta
            </Typography>
            <Typography className={classes.authSub}>
              Insira suas credenciais para entrar na plataforma
            </Typography>
          </div>

          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label={i18n.t("login.form.email") || "E-mail"}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
              className={classes.input}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password") || "Senha"}
              type={showPassword ? "text" : "password"}
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
              className={classes.input}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="alternar visibilidade da senha"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        style={{ color: "#64748b" }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Grid container sx={{ justifyContent: "flex-end" }}>
              <Grid>
                <Link
                  component={RouterLink}
                  to="/forgetpsw"
                  className={classes.forgotLink}
                >
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={classes.loginBtn}
            >
              Entrar na plataforma <ArrowForward style={{ fontSize: "1.1rem" }} />
            </Button>

            {viewregister === "enabled" && (
              <Typography className={classes.signupWrapper}>
                Não possui uma conta?
                <Link
                  component={RouterLink}
                  to="/signup"
                  className={classes.signupLink}
                >
                  Cadastre-se grátis
                </Link>
              </Typography>
            )}

            <div className={classes.securityBadge}>
              <Security style={{ fontSize: "0.9rem", color: "#10b981" }} />
              Isolamento Multiempresa & Proteção Ativa
            </div>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default Login;
