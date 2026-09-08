import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import { makeStyles } from "../../styles/makeStyles";
import {
  ArrowForward,
  AutoAwesome,
  CheckCircleOutlineOutlined,
  Close,
  Code,
  HelpOutlineOutlined,
  MessageRounded,
  PlayCircleOutlineOutlined,
  Security,
  Speed,
  SupportAgent,
  WhatsApp,
  TrendingUp,
  AccessTime,
  People,
  Bolt,
  Shield,
  SmartToy,
  Hub,
  Check,
  ContentCopy,
  Done,
  ViewKanban,
  Campaign,
  Psychology,
  ElectricBolt,
  Layers,
} from "@mui/icons-material";
import HactoLogo from "../../components/Logo";
import n8nImg from "../../assets/n8n.png";
import typebotImg from "../../assets/typebot.jpg";
import webhookImg from "../../assets/webhook.png";

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    color: "#f8fafc",
    background: "#050811",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflowX: "hidden",
    position: "relative",
    scrollBehavior: "smooth",
  },
  glowOrb1: {
    position: "absolute",
    top: "-160px",
    left: "5%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb2: {
    position: "absolute",
    top: "35%",
    right: "-100px",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0) 70%)",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb3: {
    position: "absolute",
    bottom: "10%",
    left: "15%",
    width: "650px",
    height: "650px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.05) 40%, transparent 70%)",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  gridBackground: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "44px 44px",
    maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 10%, rgba(0,0,0,0.1) 90%)",
    WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 10%, rgba(0,0,0,0.1) 90%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* Header */
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(5, 8, 17, 0.8)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    transition: "all 0.3s ease",
  },
  headerInner: {
    maxWidth: 1440,
    margin: "0 auto",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    "@media (max-width: 1100px)": { padding: "14px 22px", gap: 16 },
    "@media (max-width: 680px)": { padding: "12px 16px" },
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 22,
    flexShrink: 0,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 13px",
    borderRadius: 999,
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    fontSize: 11,
    fontWeight: 700,
    color: "#6ee7b7",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    lineHeight: 1.15,
    "@media (max-width: 960px)": {
      display: "none",
    },
  },
  statusPulse: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 10px #34d399",
  },
  statusSub: {
    color: "#a7f3d0",
    fontWeight: 600,
    opacity: .78,
    paddingLeft: 4,
    borderLeft: "1px solid rgba(110,231,183,.28)",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    flex: 1,
    "@media (max-width: 1180px)": { gap: 14 },
    "@media (max-width: 900px)": {
      display: "none",
    },
  },
  navLink: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    transition: "color 0.2s ease, transform 0.2s ease",
    "&:hover": {
      color: "#f8fafc",
      transform: "translateY(-1px)",
    },
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
    "@media (max-width: 680px)": { gap: 4 },
  },
  btnGhost: {
    color: "#cbd5e1 !important",
    textTransform: "none !important",
    fontWeight: "700 !important",
    fontSize: "14px !important",
    borderRadius: "10px !important",
    padding: "9px 14px !important",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease !important",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.06) !important",
      color: "#fff !important",
    },
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%) !important",
    color: "#04110c !important",
    textTransform: "none !important",
    fontWeight: "800 !important",
    fontSize: "14px !important",
    borderRadius: "10px !important",
    padding: "10px 18px !important",
    whiteSpace: "nowrap",
    "@media (max-width: 680px)": { padding: "9px 12px !important", fontSize: "12px !important" },
    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3) !important",
    transition: "all 0.25s ease !important",
    border: "1px solid rgba(52, 211, 153, 0.4) !important",
    "&:hover": {
      background: "linear-gradient(135deg, #34d399 0%, #10b981 100%) !important",
      transform: "translateY(-2px)",
      boxShadow: "0 12px 32px rgba(16, 185, 129, 0.45) !important",
    },
  },

  /* Hero */
  heroSection: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1280,
    margin: "0 auto",
    padding: "72px 24px 80px",
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: 52,
    alignItems: "center",
    "@media (max-width: 960px)": {
      gridTemplateColumns: "1fr",
      paddingTop: 48,
      gap: 40,
    },
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
  },
  eyebrowBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.35)",
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  heroTitle: {
    margin: "0 0 20px 0",
    fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)",
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: "-0.05em",
    color: "#f8fafc",
  },
  heroGradientText: {
    background: "linear-gradient(135deg, #34d399 10%, #38bdf8 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
    lineHeight: 1.65,
    color: "#94a3b8",
    margin: "0 0 32px 0",
    maxWidth: 620,
  },
  heroCtas: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 36,
  },
  btnSecondary: {
    background: "rgba(15, 23, 42, 0.7) !important",
    border: "1px solid rgba(148, 163, 184, 0.25) !important",
    color: "#e2e8f0 !important",
    textTransform: "none !important",
    fontWeight: "750 !important",
    fontSize: "14px !important",
    borderRadius: "10px !important",
    padding: "10px 20px !important",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease !important",
    "&:hover": {
      background: "rgba(30, 41, 59, 0.85) !important",
      borderColor: "rgba(52, 211, 153, 0.5) !important",
      color: "#34d399 !important",
      transform: "translateY(-2px)",
    },
  },
  heroTrustBadges: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    paddingTop: 16,
    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
  },
  trustItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    fontWeight: 650,
    color: "#cbd5e1",
  },

  /* Interactive Command Center Mock */
  showcaseWrapper: {
    position: "relative",
    zIndex: 2,
    borderRadius: 22,
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(7, 12, 22, 0.98))",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 30px 90px rgba(0, 0, 0, 0.75), 0 0 40px rgba(16, 185, 129, 0.12)",
    overflow: "hidden",
  },
  showcaseHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    background: "rgba(3, 7, 18, 0.75)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
  },
  windowDots: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dotRed: { width: 10, height: 10, borderRadius: "50%", background: "#ef4444" },
  dotYellow: { width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" },
  dotGreen: { width: 10, height: 10, borderRadius: "50%", background: "#10b981" },
  windowAddress: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    padding: "4px 12px",
    borderRadius: 6,
    background: "rgba(255, 255, 255, 0.04)",
  },
  showcaseTabs: {
    display: "flex",
    background: "rgba(7, 12, 22, 0.9)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    padding: "6px 12px 0",
    gap: 6,
    overflowX: "auto",
  },
  showcaseTab: {
    padding: "9px 15px",
    fontSize: 12,
    fontWeight: 750,
    cursor: "pointer",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    border: "1px solid transparent",
    borderBottom: "none",
    color: "#94a3b8",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#f8fafc",
      background: "rgba(255, 255, 255, 0.04)",
    },
  },
  showcaseTabActive: {
    color: "#34d399 !important",
    background: "rgba(16, 185, 129, 0.08) !important",
    borderColor: "rgba(52, 211, 153, 0.3) !important",
    borderBottom: "2px solid #34d399 !important",
  },
  showcaseBody: {
    padding: "20px",
    minHeight: 390,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  /* Queue simulation */
  ticketQueueList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  simTicket: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "rgba(52, 211, 153, 0.4)",
      background: "rgba(30, 41, 59, 0.9)",
    },
  },
  ticketInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatarPill: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    color: "#fff",
  },
  ticketMeta: {
    display: "flex",
    flexDirection: "column",
  },
  ticketName: {
    fontSize: 13,
    fontWeight: 750,
    color: "#f8fafc",
  },
  ticketPreview: {
    fontSize: 11.5,
    color: "#94a3b8",
    maxWidth: 240,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ticketBadge: {
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 10.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },

  /* AI Simulation */
  aiChatBox: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  chatBubbleUser: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: "14px 14px 14px 4px",
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    color: "#e2e8f0",
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  chatBubbleAi: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    padding: "14px 16px",
    borderRadius: "14px 14px 4px 14px",
    background: "linear-gradient(145deg, rgba(6, 78, 59, 0.4), rgba(4, 47, 46, 0.5))",
    border: "1px solid rgba(52, 211, 153, 0.35)",
    color: "#f8fafc",
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  aiHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#34d399",
    fontWeight: 800,
    fontSize: 11,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  /* Kanban Simulation */
  kanbanColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    height: "100%",
  },
  kanbanCol: {
    padding: "10px",
    borderRadius: 10,
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  kanbanColTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    display: "flex",
    justifyContent: "space-between",
  },
  kanbanCard: {
    padding: "10px",
    borderRadius: 8,
    background: "rgba(30, 41, 59, 0.85)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    fontSize: 11.5,
  },
  kanbanValue: {
    color: "#34d399",
    fontWeight: 800,
    fontSize: 12,
    marginTop: 4,
  },

  /* Showcase bottom summary bar */
  showcaseFooter: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 11.5,
    color: "#94a3b8",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#34d399",
    fontWeight: 750,
  },

  /* Stats Bar Section */
  statsSection: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1280,
    margin: "0 auto 80px",
    padding: "0 24px",
  },
  statsCard: {
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(8, 14, 26, 0.85) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    padding: "36px 32px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 28,
    backdropFilter: "blur(12px)",
    "@media (max-width: 860px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 24,
    },
    "@media (max-width: 480px)": {
      gridTemplateColumns: "1fr",
      textAlign: "center",
    },
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
  },
  statNumber: {
    fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color: "#f8fafc",
    lineHeight: 1,
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  statAccent: {
    color: "#34d399",
  },
  statLabel: {
    marginTop: 8,
    fontSize: 13.5,
    fontWeight: 650,
    color: "#94a3b8",
    lineHeight: 1.4,
  },

  /* Section Title Block */
  sectionWrapper: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px 100px",
  },
  sectionHeader: {
    textAlign: "center",
    maxWidth: 760,
    margin: "0 auto 52px",
  },
  sectionEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
    background: "rgba(14, 165, 233, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
    fontWeight: 850,
    letterSpacing: "-0.04em",
    margin: "0 0 16px 0",
    color: "#f8fafc",
  },
  sectionDescription: {
    fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
    lineHeight: 1.6,
    color: "#94a3b8",
    margin: 0,
  },

  /* Bento Grid */
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 20,
  },
  bentoCardLarge: {
    gridColumn: "span 6",
    padding: 34,
    borderRadius: 20,
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(9, 15, 28, 0.9))",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    transition: "all 0.25s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    "&:hover": {
      borderColor: "rgba(52, 211, 153, 0.4)",
      transform: "translateY(-4px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
    },
    "@media (max-width: 880px)": {
      gridColumn: "span 12",
    },
  },
  bentoCardSmall: {
    gridColumn: "span 3",
    padding: 26,
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    transition: "all 0.25s ease",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      borderColor: "rgba(52, 211, 153, 0.35)",
      transform: "translateY(-3px)",
    },
    "@media (max-width: 980px)": {
      gridColumn: "span 6",
    },
    "@media (max-width: 580px)": {
      gridColumn: "span 12",
    },
  },
  bentoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    color: "#34d399",
    marginBottom: 20,
  },
  bentoTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: "0 0 10px 0",
    color: "#f8fafc",
  },
  bentoText: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: "#94a3b8",
    margin: 0,
  },
  bentoFeaturesList: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderTop: "1px solid rgba(148, 163, 184, 0.1)",
    paddingTop: 16,
  },
  bentoFeatureRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12.5,
    fontWeight: 650,
    color: "#cbd5e1",
  },

  /* Interactive ROI Calculator */
  calculatorCard: {
    borderRadius: 22,
    background: "linear-gradient(145deg, rgba(14, 22, 38, 0.85), rgba(7, 12, 24, 0.95))",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.08)",
    padding: "44px 40px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 48,
    alignItems: "center",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
      padding: "30px 24px",
      gap: 36,
    },
  },
  calcControlGroup: {
    marginBottom: 28,
  },
  calcLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calcLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
  },
  calcValueBadge: {
    padding: "4px 12px",
    borderRadius: 8,
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(52, 211, 153, 0.3)",
    color: "#34d399",
    fontWeight: 850,
    fontSize: 14,
  },
  calcSlider: {
    color: "#10b981 !important",
    "& .MuiSlider-thumb": {
      width: 22,
      height: 22,
      backgroundColor: "#34d399",
      boxShadow: "0 0 12px rgba(52, 211, 153, 0.7)",
      "&:hover, &.Mui-focusVisible": {
        boxShadow: "0 0 16px rgba(52, 211, 153, 0.9)",
      },
    },
    "& .MuiSlider-track": {
      height: 6,
      border: "none",
    },
    "& .MuiSlider-rail": {
      height: 6,
      backgroundColor: "rgba(148, 163, 184, 0.2)",
    },
  },
  calcResultBox: {
    borderRadius: 18,
    background: "rgba(4, 11, 20, 0.75)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  calcMetricRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
  },
  calcMetricLabel: {
    fontSize: 13.5,
    color: "#94a3b8",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  calcMetricValue: {
    fontSize: 22,
    fontWeight: 900,
    color: "#34d399",
  },

  /* Comparison Section */
  comparisonTable: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
  },
  comparisonHeader: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr",
    padding: "18px 24px",
    background: "rgba(7, 12, 24, 0.9)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
    fontWeight: 800,
    fontSize: 14,
    "@media (max-width: 680px)": {
      gridTemplateColumns: "1.1fr 1fr 1fr",
      padding: "14px 16px",
      fontSize: 12,
    },
  },
  comparisonRow: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
    fontSize: 13.5,
    alignItems: "center",
    "&:last-child": {
      borderBottom: "none",
    },
    "&:hover": {
      background: "rgba(255, 255, 255, 0.02)",
    },
    "@media (max-width: 680px)": {
      gridTemplateColumns: "1.1fr 1fr 1fr",
      padding: "12px 16px",
      fontSize: 12,
    },
  },
  compNegative: {
    color: "#f87171",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 650,
  },
  compPositive: {
    color: "#34d399",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 750,
  },

  /* Integrations Hub */
  integrationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 28,
    alignItems: "stretch",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  integrationLogosCard: {
    borderRadius: 20,
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(7, 12, 24, 0.9))",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  partnerLogos: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    margin: "24px 0",
    "@media (max-width: 500px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  partnerTile: {
    borderRadius: 14,
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    textAlign: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "rgba(52, 211, 153, 0.4)",
      background: "rgba(30, 41, 59, 0.9)",
      transform: "translateY(-2px)",
    },
  },
  partnerImg: {
    width: 38,
    height: 38,
    objectFit: "contain",
    borderRadius: 8,
  },
  partnerLabel: {
    fontSize: 12,
    fontWeight: 750,
    color: "#cbd5e1",
  },
  codeSnippetCard: {
    borderRadius: 20,
    background: "rgba(3, 7, 16, 0.95)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "rgba(15, 23, 42, 0.6)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
  },
  codeTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#cbd5e1",
  },
  codeBody: {
    padding: "20px",
    margin: 0,
    fontFamily: "'Fira Code', 'Roboto Mono', monospace",
    fontSize: 12.5,
    lineHeight: 1.6,
    color: "#38bdf8",
    overflowX: "auto",
  },

  /* Security & Enterprise */
  securityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    "@media (max-width: 860px)": {
      gridTemplateColumns: "1fr",
    },
  },
  securityCard: {
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  /* FAQ */
  faqList: {
    maxWidth: 880,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  faqItem: {
    borderRadius: 14,
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  faqButton: {
    width: "100%",
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 750,
    textAlign: "left",
    cursor: "pointer",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#34d399",
    },
  },
  faqAnswer: {
    padding: "0 22px 20px",
    margin: 0,
    fontSize: 14,
    lineHeight: 1.65,
    color: "#94a3b8",
  },

  /* Final CTA Banner */
  finalCtaBanner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1280,
    margin: "0 auto 100px",
    padding: "0 24px",
  },
  finalCtaCard: {
    borderRadius: 24,
    background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.95) 75%)",
    border: "1px solid rgba(52, 211, 153, 0.4)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(16, 185, 129, 0.15)",
    padding: "64px 32px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  finalTitle: {
    fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    margin: "0 0 16px 0",
    color: "#f8fafc",
  },
  finalSub: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "#94a3b8",
    maxWidth: 640,
    margin: "0 0 36px 0",
    lineHeight: 1.6,
  },

  /* Footer */
  footer: {
    position: "relative",
    zIndex: 1,
    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
    background: "rgba(3, 6, 14, 0.95)",
    padding: "48px 24px 32px",
  },
  footerInner: {
    maxWidth: 1280,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 36,
  },
  footerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 24,
  },
  footerLinks: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 24,
  },
  footerBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 24,
    borderTop: "1px solid rgba(148, 163, 184, 0.08)",
    fontSize: 12.5,
    color: "#64748b",
  },

  /* Modal */
  modalContent: {
    background: "linear-gradient(145deg, #0b1322, #050913) !important",
    color: "#f8fafc !important",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "20px !important",
    padding: "24px 28px !important",
    maxWidth: "520px !important",
  },
}));

const faqs = [
  {
    q: "Quantos atendentes podem responder no mesmo número de WhatsApp?",
    a: "Não há limite técnico de atendentes. Toda a sua equipe comercial, suporte e financeiro pode atender simultaneamente com o mesmo número oficial de WhatsApp, sem desconexões ou sobreposições de chamados.",
  },
  {
    q: "Como funciona a triagem e o roteamento com Inteligência Artificial?",
    a: "Você pode configurar instruções personalizadas (Prompts de IA) integrados à OpenAI/ChatGPT. O assistente recebe o cliente instantaneamente, identifica a intenção, responde dúvidas frequentes com base no seu catálogo e transfere o ticket para a fila certa quando necessário.",
  },
  {
    q: "É possível integrar com o n8n, Typebot ou com o meu CRM/ERP?",
    a: "Sim! O HACTO Desk possui suporte nativo a Webhooks, integração direta com Typebot e n8n, além de uma API REST completa para enviar mensagens, receber eventos em tempo real e disparar automações a partir de qualquer sistema externo.",
  },
  {
    q: "Como conectar o WhatsApp na plataforma?",
    a: "É muito simples: dentro do painel em 'Conexões', basta clicar em 'Adicionar WhatsApp' e escanear o QR Code gerado na tela com o seu celular. Em poucos segundos a conexão fica ativa e pronta para operar.",
  },
  {
    q: "Minhas conversas e dados dos clientes estão seguros?",
    a: "Totalmente. A plataforma adota criptografia de dados, armazenamento isolado por empresa (multi-tenant), controle rigoroso de permissões de operadores e total alinhamento às diretrizes da LGPD.",
  },
];

const Portal = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState("queues");
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

  // ROI Calculator states
  const [operators, setOperators] = useState(6);
  const [dailyMessages, setDailyMessages] = useState(650);

  // Dynamic ROI calculation
  const hoursSavedPerMonth = useMemo(() => {
    return Math.round(operators * 1.8 * 22);
  }, [operators]);

  const slaResponseSpeed = useMemo(() => {
    return dailyMessages > 1000 ? "18 segundos" : "32 segundos";
  }, [dailyMessages]);

  const leadConversionBoost = useMemo(() => {
    return operators >= 10 ? "+42%" : "+34%";
  }, [operators]);

  const sampleApiCode = `// Disparo rápido de mensagem via REST API HACTO Desk
await fetch('https://whats.hacto.com.br/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_DESK_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '5511999998888',
    body: 'Olá Daniel! Seu chamado #1042 foi atendido com sucesso pela nossa equipe 🚀',
    queueId: 1
  })
});`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(sampleApiCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className={classes.page}>
      {/* Glow Orbs and Subtle Cyber Grid */}
      <div className={classes.glowOrb1} />
      <div className={classes.glowOrb2} />
      <div className={classes.glowOrb3} />
      <div className={classes.gridBackground} />

      {/* Sticky Header */}
      <header className={classes.header}>
        <div className={classes.headerInner}>
          <div className={classes.headerLeft}>
            <Link to="/" style={{ textDecoration: "none" }} aria-label="HACTO Desk">
              <HactoLogo size="small" showTagline={false} />
            </Link>
            <div className={classes.statusPill}>
              <span className={classes.statusPulse} />
              <span>SLA 99.9%</span><span className={classes.statusSub}>Operacional</span>
            </div>
          </div>

          <nav className={classes.navLinks} aria-label="Navegação">
            <a href="#recursos" className={classes.navLink}>Recursos</a>
            <a href="#simulador" className={classes.navLink}>Demonstração</a>
            <a href="#calculadora" className={classes.navLink}>Calculadora ROI</a>
            <a href="#comparativo" className={classes.navLink}>Comparativo</a>
            <a href="#integracoes" className={classes.navLink}>Integrações</a>
            <a href="#faq" className={classes.navLink}>FAQ</a>
          </nav>

          <div className={classes.headerActions}>
            <Button component={Link} to="/login" className={classes.btnGhost}>
              Entrar
            </Button>
            <Button
              component={Link}
              to="/login"
              className={classes.btnPrimary}
              endIcon={<ArrowForward fontSize="small" />}
            >
              Acessar Desk
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className={classes.heroSection}>
          <div className={classes.heroLeft}>
            <div className={classes.eyebrowBadge}>
              <AutoAwesome fontSize="small" /> Atendimento Omnichannel & IA
            </div>

            <h1 className={classes.heroTitle}>
              Centralize seu WhatsApp. <br />
              <span className={classes.heroGradientText}>Escale seu atendimento com IA.</span>
            </h1>

            <p className={classes.heroSubtitle}>
              O <strong>HACTO Desk</strong> transforma sua operação de atendimento: múltiplos operadores no mesmo número de WhatsApp, triagem automatizada com inteligência artificial, CRM Kanban e relatórios em tempo real.
            </p>

            <div className={classes.heroCtas}>
              <Button
                component={Link}
                to="/login"
                className={classes.btnPrimary}
                style={{ padding: "14px 28px", fontSize: "15px" }}
                endIcon={<ArrowForward />}
              >
                Entrar no Sistema
              </Button>
              <Button
                onClick={() => setDemoModalOpen(true)}
                className={classes.btnSecondary}
                style={{ padding: "14px 24px", fontSize: "15px" }}
                startIcon={<PlayCircleOutlineOutlined />}
              >
                Ver Demonstração
              </Button>
            </div>

            <div className={classes.heroTrustBadges}>
              <span className={classes.trustItem}>
                <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18 }} />
                Múltiplos atendentes em 1 WhatsApp
              </span>
              <span className={classes.trustItem}>
                <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18 }} />
                Agente IA integrado 24/7
              </span>
              <span className={classes.trustItem}>
                <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18 }} />
                Sem perda de histórico
              </span>
            </div>
          </div>

          {/* Interactive Live Command Center Preview */}
          <div id="simulador" className={classes.showcaseWrapper} aria-label="Prévia Interativa do HACTO Desk">
            <div className={classes.showcaseHeader}>
              <div className={classes.windowDots}>
                <span className={classes.dotRed} />
                <span className={classes.dotYellow} />
                <span className={classes.dotGreen} />
              </div>
              <div className={classes.windowAddress}>whats.hacto.com.br/dashboard</div>
              <div className={classes.liveIndicator}>
                <span className={classes.statusPulse} />
                ONLINE
              </div>
            </div>

            {/* Interactive Showcase Tabs */}
            <div className={classes.showcaseTabs}>
              <button
                type="button"
                className={`${classes.showcaseTab} ${activeTab === "queues" ? classes.showcaseTabActive : ""}`}
                onClick={() => setActiveTab("queues")}
              >
                <MessageRounded fontSize="small" /> Fila & Chamados
              </button>
              <button
                type="button"
                className={`${classes.showcaseTab} ${activeTab === "ai" ? classes.showcaseTabActive : ""}`}
                onClick={() => setActiveTab("ai")}
              >
                <SmartToy fontSize="small" /> Copilot IA
              </button>
              <button
                type="button"
                className={`${classes.showcaseTab} ${activeTab === "kanban" ? classes.showcaseTabActive : ""}`}
                onClick={() => setActiveTab("kanban")}
              >
                <ViewKanban fontSize="small" /> CRM Kanban
              </button>
            </div>

            {/* Showcase Dynamic Content */}
            <div className={classes.showcaseBody}>
              {activeTab === "queues" && (
                <div className={classes.ticketQueueList}>
                  <div className={classes.simTicket}>
                    <div className={classes.ticketInfo}>
                      <div className={classes.avatarPill} style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        JD
                      </div>
                      <div className={classes.ticketMeta}>
                        <span className={classes.ticketName}>Juliana Duarte (Empresa Nexus)</span>
                        <span className={classes.ticketPreview}>Gostaria de fechar o plano corporativo para 20 operadores!</span>
                      </div>
                    </div>
                    <span className={classes.ticketBadge} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                      Comercial · Atendendo
                    </span>
                  </div>

                  <div className={classes.simTicket}>
                    <div className={classes.ticketInfo}>
                      <div className={classes.avatarPill} style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                        RC
                      </div>
                      <div className={classes.ticketMeta}>
                        <span className={classes.ticketName}>Rafael Costa</span>
                        <span className={classes.ticketPreview}>Como configuro o Webhook no n8n?</span>
                      </div>
                    </div>
                    <span className={classes.ticketBadge} style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" }}>
                      Suporte · Fila de Espera
                    </span>
                  </div>

                  <div className={classes.simTicket}>
                    <div className={classes.ticketInfo}>
                      <div className={classes.avatarPill} style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                        MS
                      </div>
                      <div className={classes.ticketMeta}>
                        <span className={classes.ticketName}>Marina Silveira</span>
                        <span className={classes.ticketPreview}>Boleto da assinatura pago com sucesso, obrigado!</span>
                      </div>
                    </div>
                    <span className={classes.ticketBadge} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
                      Financeiro · Resolvido
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className={classes.aiChatBox}>
                  <div className={classes.chatBubbleUser}>
                    <strong>Cliente:</strong> "Boa tarde! Preciso de ajuda para automatizar meu suporte de pós-venda no WhatsApp."
                  </div>
                  <div className={classes.chatBubbleAi}>
                    <div className={classes.aiHeader}>
                      <AutoAwesome style={{ fontSize: 14 }} /> HACTO AI Assistant · Resposta em 0.8s
                    </div>
                    "Olá! Com o HACTO Desk você ativa fluxos inteligentes com IA que entendem o pedido do cliente, consultam seus manuais e respondem 24h por dia. Posso te encaminhar agora para nossa equipe de ativação?"
                  </div>
                </div>
              )}

              {activeTab === "kanban" && (
                <div className={classes.kanbanColumns}>
                  <div className={classes.kanbanCol}>
                    <div className={classes.kanbanColTitle}>
                      <span>Novos Leads</span>
                      <span>(3)</span>
                    </div>
                    <div className={classes.kanbanCard}>
                      <div>Agência Veloce</div>
                      <div className={classes.kanbanValue}>R$ 1.850,00</div>
                    </div>
                  </div>
                  <div className={classes.kanbanCol}>
                    <div className={classes.kanbanColTitle}>
                      <span>Em Negociação</span>
                      <span>(2)</span>
                    </div>
                    <div className={classes.kanbanCard}>
                      <div>Clínica Bem Estar</div>
                      <div className={classes.kanbanValue}>R$ 3.400,00</div>
                    </div>
                  </div>
                  <div className={classes.kanbanCol}>
                    <div className={classes.kanbanColTitle}>
                      <span>Fechados 🎉</span>
                      <span>(5)</span>
                    </div>
                    <div className={classes.kanbanCard}>
                      <div>Distribuidora Alfa</div>
                      <div className={classes.kanbanValue}>R$ 4.900,00</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={classes.showcaseFooter}>
                <span>32 atendentes conectados · 184 tickets resolvidos hoje</span>
                <span style={{ color: "#34d399", fontWeight: 750 }}>Tempo Médio: 42s</span>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Stats Strip */}
        <section className={classes.statsSection}>
          <div className={classes.statsCard}>
            <div className={classes.statItem}>
              <div className={classes.statNumber}>
                +2.4M <span className={classes.statAccent}>+</span>
              </div>
              <div className={classes.statLabel}>Mensagens transacionadas mensalmente</div>
            </div>
            <div className={classes.statItem}>
              <div className={classes.statNumber}>
                99.98<span className={classes.statAccent}>%</span>
              </div>
              <div className={classes.statLabel}>Uptime & estabilidade de conexões</div>
            </div>
            <div className={classes.statItem}>
              <div className={classes.statNumber}>
                -75<span className={classes.statAccent}>%</span>
              </div>
              <div className={classes.statLabel}>Redução no tempo de espera do cliente</div>
            </div>
            <div className={classes.statItem}>
              <div className={classes.statNumber}>
                4.9<span className={classes.statAccent}>/5</span>
              </div>
              <div className={classes.statLabel}>Satisfação avaliada por operadores e gestores</div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Recursos Essenciais */}
        <section id="recursos" className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <Layers fontSize="small" /> Recursos de Alta Performance
            </div>
            <h2 className={classes.sectionTitle}>Tudo o que sua operação precisa para decolar</h2>
            <p className={classes.sectionDescription}>
              Uma suíte completa de comunicação corporativa, automação inteligente e gestão de relacionamento para transformar o WhatsApp no seu maior canal de receita.
            </p>
          </div>

          <div className={classes.bentoGrid}>
            {/* Card 1: Multi-Atendimento */}
            <div className={classes.bentoCardLarge}>
              <div>
                <div className={classes.bentoIconWrap}>
                  <People fontSize="medium" />
                </div>
                <h3 className={classes.bentoTitle}>Central Unificada WhatsApp com Múltiplos Atendentes</h3>
                <p className={classes.bentoText}>
                  Adeus celular passando de mão em mão. Com o HACTO Desk, dezenas de colaboradores atendem pelo mesmo número ou conectam múltiplos números por filial ou departamento de forma organizada e simultânea.
                </p>
              </div>
              <div className={classes.bentoFeaturesList}>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#34d399", fontSize: 16 }} /> Transferência de tickets entre operadores com histórico completo
                </div>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#34d399", fontSize: 16 }} /> Notas internas que apenas sua equipe visualiza
                </div>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#34d399", fontSize: 16 }} /> Filas temáticas com distribuição inteligente de chamados
                </div>
              </div>
            </div>

            {/* Card 2: IA & ChatGPT */}
            <div className={classes.bentoCardLarge}>
              <div>
                <div className={classes.bentoIconWrap} style={{ background: "rgba(14, 165, 233, 0.12)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
                  <Psychology fontSize="medium" />
                </div>
                <h3 className={classes.bentoTitle}>Inteligência Artificial & Agentes Autônomos 24/7</h3>
                <p className={classes.bentoText}>
                  Integração nativa com ChatGPT e modelos avançados de IA para responder clientes imediatamente, qualificar leads, tirar dúvidas técnicas e só repassar para humanos os casos que exigem atenção especializada.
                </p>
              </div>
              <div className={classes.bentoFeaturesList}>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#38bdf8", fontSize: 16 }} /> Prompts personalizados para o tom de voz e regras da sua marca
                </div>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#38bdf8", fontSize: 16 }} /> Triagem automatizada com categorização em tempo real
                </div>
                <div className={classes.bentoFeatureRow}>
                  <Check style={{ color: "#38bdf8", fontSize: 16 }} /> Disponibilidade ininterrupta em feriados e finais de semana
                </div>
              </div>
            </div>

            {/* Card 3: CRM Kanban */}
            <div className={classes.bentoCardSmall}>
              <div className={classes.bentoIconWrap}>
                <ViewKanban fontSize="medium" />
              </div>
              <h4 className={classes.bentoTitle}>Funil CRM Kanban</h4>
              <p className={classes.bentoText}>
                Visualize oportunidades em colunas de negociação e mova leads com facilidade sem sair da tela do chat.
              </p>
            </div>

            {/* Card 4: Disparo em Massa & Campanhas */}
            <div className={classes.bentoCardSmall}>
              <div className={classes.bentoIconWrap} style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
                <Campaign fontSize="medium" />
              </div>
              <h4 className={classes.bentoTitle}>Campanhas em Massa</h4>
              <p className={classes.bentoText}>
                Dispare comunicados e promoções para listas segmentadas com controle de delay anti-bloqueio seguro.
              </p>
            </div>

            {/* Card 5: Respostas Rápidas */}
            <div className={classes.bentoCardSmall}>
              <div className={classes.bentoIconWrap} style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.12)", borderColor: "rgba(168, 85, 247, 0.3)" }}>
                <ElectricBolt fontSize="medium" />
              </div>
              <h4 className={classes.bentoTitle}>Respostas Rápidas</h4>
              <p className={classes.bentoText}>
                Crie atalhos (/pix, /horario, /catalogo) e envie áudios ou textos formatados com 1 toque.
              </p>
            </div>

            {/* Card 6: Métricas & SLA */}
            <div className={classes.bentoCardSmall}>
              <div className={classes.bentoIconWrap} style={{ color: "#10b981" }}>
                <Speed fontSize="medium" />
              </div>
              <h4 className={classes.bentoTitle}>Painel de SLA & Gestão</h4>
              <p className={classes.bentoText}>
                Métricas completas de tempo de espera, tempo de atendimento, satisfação (CSAT) e volume por atendente.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator */}
        <section id="calculadora" className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <TrendingUp fontSize="small" /> Simulador de Impacto
            </div>
            <h2 className={classes.sectionTitle}>Calcule a economia e o ganho de produtividade</h2>
            <p className={classes.sectionDescription}>
              Arraste os seletores abaixo com o tamanho da sua equipe e volume de conversas para estimar o impacto imediato do HACTO Desk na sua operação.
            </p>
          </div>

          <div className={classes.calculatorCard}>
            <div>
              <div className={classes.calcControlGroup}>
                <div className={classes.calcLabelRow}>
                  <span className={classes.calcLabel}>Atendentes na Equipe:</span>
                  <span className={classes.calcValueBadge}>{operators} {operators === 1 ? "operador" : "operadores"}</span>
                </div>
                <Slider
                  value={operators}
                  min={1}
                  max={35}
                  step={1}
                  onChange={(e, val) => setOperators(val)}
                  className={classes.calcSlider}
                  aria-label="Número de atendentes"
                />
              </div>

              <div className={classes.calcControlGroup}>
                <div className={classes.calcLabelRow}>
                  <span className={classes.calcLabel}>Volume de Mensagens / Dia:</span>
                  <span className={classes.calcValueBadge}>{dailyMessages.toLocaleString()} msgs/dia</span>
                </div>
                <Slider
                  value={dailyMessages}
                  min={100}
                  max={3000}
                  step={50}
                  onChange={(e, val) => setDailyMessages(val)}
                  className={classes.calcSlider}
                  aria-label="Mensagens diárias"
                />
              </div>

              <p style={{ fontSize: 13, color: "#64748b", margin: "16px 0 0" }}>
                *Cálculos baseados em benchmarks operacionais com automação de triagem e respostas salvas do HACTO Desk.
              </p>
            </div>

            <div className={classes.calcResultBox}>
              <div className={classes.calcMetricRow}>
                <span className={classes.calcMetricLabel}>
                  <AccessTime fontSize="small" style={{ color: "#34d399" }} /> Horas Poupadas por Mês:
                </span>
                <span className={classes.calcMetricValue}>~{hoursSavedPerMonth}h</span>
              </div>
              <div className={classes.calcMetricRow}>
                <span className={classes.calcMetricLabel}>
                  <Bolt fontSize="small" style={{ color: "#38bdf8" }} /> Tempo Médio de 1º Contato:
                </span>
                <span className={classes.calcMetricValue} style={{ color: "#38bdf8" }}>
                  {slaResponseSpeed}
                </span>
              </div>
              <div className={classes.calcMetricRow} style={{ borderBottom: "none", paddingBottom: 0 }}>
                <span className={classes.calcMetricLabel}>
                  <TrendingUp fontSize="small" style={{ color: "#a855f7" }} /> Aumento Estimado em Conversão:
                </span>
                <span className={classes.calcMetricValue} style={{ color: "#a855f7" }}>
                  {leadConversionBoost}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table: Before vs After */}
        <section id="comparativo" className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <Shield fontSize="small" /> Evolução Operacional
            </div>
            <h2 className={classes.sectionTitle}>WhatsApp Web Comum vs. HACTO Desk</h2>
            <p className={classes.sectionDescription}>
              Veja por que empresas em crescimento abandonam o WhatsApp convencional e centralizam suas operações em uma plataforma profissional.
            </p>
          </div>

          <div className={classes.comparisonTable}>
            <div className={classes.comparisonHeader}>
              <span>Funcionalidade & Segurança</span>
              <span style={{ color: "#94a3b8" }}>WhatsApp Comum / Celular</span>
              <span style={{ color: "#34d399" }}>HACTO Desk</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Número de Atendentes Simultâneos</strong>
              <span className={classes.compNegative}>Apenas 1 por vez</span>
              <span className={classes.compPositive}><Check fontSize="small" /> Ilimitados no mesmo número</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Triagem Inteligente com IA 24h</strong>
              <span className={classes.compNegative}>Inexistente / Sem IA</span>
              <span className={classes.compPositive}><Check fontSize="small" /> Assistente IA ChatGPT nativo</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Histórico e Auditoria de Conversas</strong>
              <span className={classes.compNegative}>Fica no celular do atendente</span>
              <span className={classes.compPositive}><Check fontSize="small" /> 100% em nuvem segura e auditável</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Filas por Departamento (Setores)</strong>
              <span className={classes.compNegative}>Tudo misturado no mesmo chat</span>
              <span className={classes.compPositive}><Check fontSize="small" /> Comercial, Suporte, Financeiro</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Relatórios de Desempenho e SLA</strong>
              <span className={classes.compNegative}>Sem métricas de equipe</span>
              <span className={classes.compPositive}><Check fontSize="small" /> Painel com TMA, TME e NPS</span>
            </div>

            <div className={classes.comparisonRow}>
              <strong>Automações & API Externa (n8n, ERP)</strong>
              <span className={classes.compNegative}>Sem API oficial aberta</span>
              <span className={classes.compPositive}><Check fontSize="small" /> Webhooks e API REST completa</span>
            </div>
          </div>
        </section>

        {/* Integrations & Developer Hub */}
        <section id="integracoes" className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <Hub fontSize="small" /> Ecossistema Aberto
            </div>
            <h2 className={classes.sectionTitle}>Conecte-se com as ferramentas que você já usa</h2>
            <p className={classes.sectionDescription}>
              O HACTO Desk é construído para conversar perfeitamente com seu stack de automação, CRMs e ERPs através de Webhooks e API REST amigável.
            </p>
          </div>

          <div className={classes.integrationGrid}>
            <div className={classes.integrationLogosCard}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px 0", color: "#f8fafc" }}>
                  Integrações Nativas Prontas
                </h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                  Conecte fluxos complexos no <strong>n8n</strong>, crie árvores de conversa interativas com o <strong>Typebot</strong> ou processe gatilhos via <strong>Webhooks</strong> em segundos.
                </p>
              </div>

              <div className={classes.partnerLogos}>
                <div className={classes.partnerTile}>
                  <img src={n8nImg} alt="n8n" className={classes.partnerImg} />
                  <span className={classes.partnerLabel}>n8n Automation</span>
                </div>
                <div className={classes.partnerTile}>
                  <img src={typebotImg} alt="Typebot" className={classes.partnerImg} />
                  <span className={classes.partnerLabel}>Typebot Flows</span>
                </div>
                <div className={classes.partnerTile}>
                  <img src={webhookImg} alt="Webhooks" className={classes.partnerImg} />
                  <span className={classes.partnerLabel}>Webhooks HTTP</span>
                </div>
                <div className={classes.partnerTile}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#10a37f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <AutoAwesome />
                  </div>
                  <span className={classes.partnerLabel}>OpenAI / ChatGPT</span>
                </div>
                <div className={classes.partnerTile}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#04110c" }}>
                    <WhatsApp />
                  </div>
                  <span className={classes.partnerLabel}>WhatsApp Cloud</span>
                </div>
                <div className={classes.partnerTile}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Code />
                  </div>
                  <span className={classes.partnerLabel}>REST API</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Button component={Link} to="/messages-api" className={classes.btnSecondary} startIcon={<Code />}>
                  Ver Documentação da API
                </Button>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className={classes.codeSnippetCard}>
              <div className={classes.codeHeader}>
                <span className={classes.codeTitle}>
                  <Code fontSize="small" style={{ color: "#34d399" }} /> Exemplo de Disparo de Mensagem (Node / cURL)
                </span>
                <IconButton onClick={handleCopyCode} size="small" style={{ color: "#94a3b8" }} title="Copiar código">
                  {copiedCode ? <Done fontSize="small" style={{ color: "#34d399" }} /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </div>
              <pre className={classes.codeBody}>{sampleApiCode}</pre>
            </div>
          </div>
        </section>

        {/* Security & Enterprise Ready */}
        <section className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <Security fontSize="small" /> Segurança & Confiabilidade
            </div>
            <h2 className={classes.sectionTitle}>Padrão corporativo para proteção dos seus dados</h2>
            <p className={classes.sectionDescription}>
              Tranquilidade operacional para empresas que lidam com dados sensíveis e precisam de estabilidade comprovada.
            </p>
          </div>

          <div className={classes.securityGrid}>
            <div className={classes.securityCard}>
              <Security style={{ color: "#34d399", fontSize: 28 }} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Criptografia e Isolamento</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Arquitetura multi-tenant com banco de dados seguro, chaves criptografadas e auditoria de cada ação de usuário.
              </p>
            </div>

            <div className={classes.securityCard}>
              <Shield style={{ color: "#38bdf8", fontSize: 28 }} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Conformidade com a LGPD</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Total controle sobre os dados dos seus contatos, políticas de retenção claras e facilidade para exportação.
              </p>
            </div>

            <div className={classes.securityCard}>
              <Speed style={{ color: "#f59e0b", fontSize: 28 }} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Alta Disponibilidade 99.9%</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Infraestrutura em nuvem de baixa latência, monitoramento de saúde de conexões e reconexão automática.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionEyebrow}>
              <HelpOutlineOutlined fontSize="small" /> Dúvidas Comuns
            </div>
            <h2 className={classes.sectionTitle}>Perguntas Frequentes</h2>
            <p className={classes.sectionDescription}>
              Tudo o que você precisa saber para começar a usar o HACTO Desk na sua empresa.
            </p>
          </div>

          <div className={classes.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div key={faq.q} className={classes.faqItem}>
                  <button
                    type="button"
                    className={classes.faqButton}
                    onClick={() => setFaqOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: 20, color: "#34d399", fontWeight: 700 }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && <p className={classes.faqAnswer}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final High-Converting CTA Banner */}
        <section className={classes.finalCtaBanner}>
          <div className={classes.finalCtaCard}>
            <h2 className={classes.finalTitle}>
              Pronto para revolucionar o atendimento da sua empresa?
            </h2>
            <p className={classes.finalSub}>
              Centralize conversas, elimine o tempo de espera com inteligência artificial e tenha controle total sobre sua equipe de vendas e suporte.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Button
                component={Link}
                to="/login"
                className={classes.btnPrimary}
                style={{ padding: "14px 32px", fontSize: "16px" }}
                endIcon={<ArrowForward />}
              >
                Acessar HACTO Desk Agora
              </Button>
              <Button
                component={Link}
                to="/helps"
                className={classes.btnSecondary}
                style={{ padding: "14px 26px", fontSize: "16px" }}
                startIcon={<SupportAgent />}
              >
                Ver Central de Guias
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={classes.footer}>
        <div className={classes.footerInner}>
          <div className={classes.footerTop}>
            <HactoLogo size="medium" showTagline={true} />
            <div className={classes.footerLinks}>
              <a href="#recursos" className={classes.navLink}>Recursos</a>
              <a href="#simulador" className={classes.navLink}>Demonstração</a>
              <a href="#calculadora" className={classes.navLink}>Calculadora</a>
              <Link to="/helps" className={classes.navLink}>Ajuda & Guias</Link>
              <Link to="/messages-api" className={classes.navLink}>API REST</Link>
              <Link to="/login" className={classes.navLink}>Área do Cliente</Link>
            </div>
          </div>

          <div className={classes.footerBottom}>
            <div>
              © {new Date().getFullYear()} <strong>HACTO Desk</strong> · Tecnologia Omnichannel & Inteligência Artificial. Todos os direitos reservados.
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span>Desenvolvido para máxima performance</span>
              <span>·</span>
              <span style={{ color: "#34d399" }}>Status: 100% Operacional</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Platform Demo Modal */}
      <Dialog
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        PaperProps={{ className: classes.modalContent }}
      >
        <DialogContent style={{ padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 850 }}>Conheça o HACTO Desk</h3>
            <IconButton onClick={() => setDemoModalOpen(false)} size="small" style={{ color: "#94a3b8" }}>
              <Close />
            </IconButton>
          </div>

          <p style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 20px" }}>
            O HACTO Desk é a plataforma definitiva para empresas que utilizam o WhatsApp como canal estratégico. Veja o que você poderá fazer assim que acessar:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                <strong>Multi-atendimento imediato:</strong> Conecte seu WhatsApp escaneando o QR Code e adicione toda sua equipe em minutos.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                <strong>Copilot de IA Inteligente:</strong> Configure agentes autônomos treinados para responder suas dúvidas frequentes 24/7.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircleOutlineOutlined style={{ color: "#34d399", fontSize: 18, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                <strong>CRM & Funil de Vendas:</strong> Acompanhe leads desde o primeiro contato até o fechamento com Kanban integrado.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button onClick={() => setDemoModalOpen(false)} className={classes.btnGhost}>
              Fechar
            </Button>
            <Button
              component={Link}
              to="/login"
              onClick={() => setDemoModalOpen(false)}
              className={classes.btnPrimary}
              endIcon={<ArrowForward />}
            >
              Acessar Agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Portal;
