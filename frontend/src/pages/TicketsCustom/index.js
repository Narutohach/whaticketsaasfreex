import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { makeStyles } from "../../styles/makeStyles";
import { useTheme } from "@mui/material/styles";

import TicketsManager from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import HactoLogo from "../../components/Logo";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    padding: 0,
    height: "calc(100% - 48px)",
    overflowY: "hidden",
    backgroundColor: theme.palette.background.default,
  },

  chatPaper: {
    display: "flex",
    height: "100%",
  },

  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    borderRight: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
  },

  messagesWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
  },

  welcomeMsg: {
    backgroundColor: theme.palette.mode === "dark" ? "#0b1220" : "#f8fafc",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    border: "none",
    gap: 16,
  },

  welcomeTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
    marginTop: 8,
  },

  welcomeSubtitle: {
    fontSize: "0.9rem",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    maxWidth: 380,
  },

  shortcutPill: {
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
    color: theme.palette.mode === "dark" ? "#cbd5e1" : "#475569",
    fontWeight: 600,
    fontSize: "0.8rem",
    marginTop: 8,
  },
}));

const TicketsCustom = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPaper}>
        <Grid container spacing={0} style={{ height: "100%", width: "100%" }}>
          {/* Coluna 1: Lista de Conversas e Filtros */}
          <Grid
            className={classes.contactsWrapper}
            size={{
              xs: 12,
              sm: 4,
              md: 3.5,
              lg: 3
            }}>
            <TicketsManager />
          </Grid>

          {/* Coluna 2 e 3: Área de Mensagens + Painel CRM */}
          <Grid
            className={classes.messagesWrapper}
            size={{
              xs: 12,
              sm: 8,
              md: 8.5,
              lg: 9
            }}>
            {ticketId ? (
              <Ticket />
            ) : (
              <Paper square variant="outlined" className={classes.welcomeMsg}>
                <HactoLogo size="large" light={theme.palette.mode === "light"} />
                <Typography className={classes.welcomeTitle}>
                  Inbox de Atendimento Omnichannel
                </Typography>
                <Typography className={classes.welcomeSubtitle}>
                  Selecione um cliente na lista lateral para visualizar a conversa e o histórico de atendimento.
                </Typography>
                <Chip
                  label="Pressione Ctrl + K para busca rápida universal"
                  className={classes.shortcutPill}
                  size="small"
                />
              </Paper>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default TicketsCustom;
