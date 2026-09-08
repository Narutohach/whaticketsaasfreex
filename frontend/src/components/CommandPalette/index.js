import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "../../styles/makeStyles";
import {
  Dialog,
  DialogContent,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ViewKanbanIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import WifiIcon from "@mui/icons-material/Wifi";
import TodayIcon from "@mui/icons-material/Today";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";

import ColorModeContext from "../../layout/themeContext";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    backgroundColor: theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: 16,
    width: "100%",
    maxWidth: 580,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: "1.05rem",
    fontWeight: 500,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
  },
  list: {
    padding: "8px",
    maxHeight: 380,
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  categoryHeader: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    padding: "8px 12px 4px 12px",
  },
  item: {
    borderRadius: 10,
    padding: "10px 14px",
    margin: "2px 0",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
    },
    "&.selected": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.15)",
    },
  },
  shortcutBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: 6,
    height: 20,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)",
    borderTop: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
  },
  footerText: {
    fontSize: "0.75rem",
    color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8",
  },
}));

const CommandPalette = () => {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { colorMode } = useContext(ColorModeContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K ou Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = [
    {
      id: "nav-tickets",
      title: "Ir para Atendimentos / Inbox",
      category: "Navegação",
      icon: <ChatIcon color="primary" />,
      action: () => history.push("/tickets"),
      shortcut: "G T",
    },
    {
      id: "nav-dashboard",
      title: "Ir para Dashboard de Métricas",
      category: "Navegação",
      icon: <DashboardIcon color="primary" />,
      action: () => history.push("/"),
      shortcut: "G D",
    },
    {
      id: "nav-kanban",
      title: "Ir para Kanban de Negócios",
      category: "Navegação",
      icon: <ViewKanbanIcon color="primary" />,
      action: () => history.push("/kanban"),
      shortcut: "G K",
    },
    {
      id: "nav-contacts",
      title: "Ir para Contatos / Leads",
      category: "Navegação",
      icon: <PeopleIcon color="primary" />,
      action: () => history.push("/contacts"),
      shortcut: "G C",
    },
    {
      id: "nav-connections",
      title: "Gerenciar Conexões WhatsApp",
      category: "Navegação",
      icon: <WifiIcon color="primary" />,
      action: () => history.push("/connections"),
    },
    {
      id: "nav-schedules",
      title: "Ver Mensagens Agendadas",
      category: "Navegação",
      icon: <TodayIcon color="primary" />,
      action: () => history.push("/schedules"),
    },
    {
      id: "nav-settings",
      title: "Configurações do Sistema",
      category: "Navegação",
      icon: <SettingsIcon color="primary" />,
      action: () => history.push("/settings"),
    },
    {
      id: "action-theme",
      title: "Alternar Modo Escuro / Claro",
      category: "Ações",
      icon: <Brightness4Icon style={{ color: "#fbbf24" }} />,
      action: () => colorMode.toggleColorMode(),
      shortcut: "Theme",
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (command) => {
    setOpen(false);
    setSearch("");
    command.action();
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      classes={{ paper: classes.dialogPaper }}
    >
      <div className={classes.searchBox}>
        <SearchIcon color="action" />
        <InputBase
          autoFocus
          placeholder="Digite um comando ou página... (ou pressione Esc)"
          className={classes.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Chip label="ESC" size="small" className={classes.shortcutBadge} />
      </div>

      <DialogContent style={{ padding: 0 }}>
        <List className={classes.list}>
          {filteredCommands.length === 0 ? (
            <Typography
              variant="body2"
              style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}
            >
              Nenhum comando encontrado para "{search}".
            </Typography>
          ) : (
            filteredCommands.map((item) => (
              <ListItem
                key={item.id}
                button
                className={classes.item}
                onClick={() => handleSelect(item)}
              >
                <ListItemIcon style={{ minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    style: { fontSize: "0.9rem", fontWeight: 600 },
                  }}
                  secondary={item.category}
                  secondaryTypographyProps={{ style: { fontSize: "0.75rem" } }}
                />
                {item.shortcut && (
                  <Chip
                    label={item.shortcut}
                    size="small"
                    className={classes.shortcutBadge}
                  />
                )}
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>

      <div className={classes.footer}>
        <Typography className={classes.footerText}>
          Dica: Pressione <b>Ctrl + K</b> em qualquer tela para abrir a busca rápida.
        </Typography>
        <Chip label="Pro Tip" size="small" style={{ fontSize: "0.7rem", height: 20 }} />
      </div>
    </Dialog>
  );
};

export default CommandPalette;
