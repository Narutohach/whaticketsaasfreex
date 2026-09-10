import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import BoltIcon from "@mui/icons-material/Bolt";

import { makeStyles } from "../../styles/makeStyles";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useContext } from "react";

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    mainPaper: {
      flex: 1,
      padding: theme.spacing(3),
      overflowY: "auto",
      ...theme.scrollbarStyles
    },
    searchBar: {
      marginBottom: theme.spacing(3),
      maxWidth: 360
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: theme.spacing(2.5)
    },
    createCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(1),
      minHeight: 190,
      borderRadius: 18,
      border: `2px dashed ${isDark ? "rgba(52, 211, 153, 0.35)" : "rgba(16, 185, 129, 0.4)"}`,
      cursor: "pointer",
      color: isDark ? "#34d399" : "#059669",
      transition: "all 0.2s ease",
      background: isDark ? "rgba(16, 185, 129, 0.04)" : "rgba(16, 185, 129, 0.03)",
      "&:hover": {
        borderColor: isDark ? "#34d399" : "#059669",
        background: isDark ? "rgba(16, 185, 129, 0.09)" : "rgba(16, 185, 129, 0.06)",
        transform: "translateY(-2px)"
      }
    },
    card: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minHeight: 190,
      borderRadius: 18,
      padding: theme.spacing(2.5),
      background: isDark
        ? "linear-gradient(150deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)"
        : "linear-gradient(150deg, #ffffff 0%, #f8fafc 100%)",
      border: isDark ? "1px solid rgba(148, 163, 184, 0.14)" : "1px solid rgba(15, 23, 42, 0.08)",
      boxShadow: isDark ? "0 12px 30px rgba(0,0,0,0.35)" : "0 8px 24px rgba(15, 23, 42, 0.06)",
      cursor: "pointer",
      transition: "transform 0.18s ease, border-color 0.18s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        borderColor: isDark ? "rgba(52, 211, 153, 0.4)" : "rgba(16, 185, 129, 0.35)"
      }
    },
    cardTop: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: theme.spacing(1.5)
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isDark ? "rgba(16, 185, 129, 0.14)" : "rgba(16, 185, 129, 0.1)",
      color: isDark ? "#34d399" : "#059669"
    },
    cardName: {
      fontWeight: 800,
      fontSize: "1.02rem",
      marginBottom: 4,
      color: isDark ? "#f8fafc" : "#0f172a",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 1,
      WebkitBoxOrient: "vertical"
    },
    cardDescription: {
      fontSize: "0.82rem",
      color: isDark ? "#94a3b8" : "#64748b",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      minHeight: 34
    },
    cardFooter: {
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: theme.spacing(1.5),
      borderTop: isDark ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(15, 23, 42, 0.06)"
    },
    statusChip: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: "0.72rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.03em"
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(8),
      color: isDark ? "#64748b" : "#94a3b8",
      gap: theme.spacing(1)
    }
  };
});

const Flows = () => {
  const classes = useStyles();
  const history = useHistory();
  const socketManager = useContext(SocketContext);

  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flows", { params: { searchParam } });
      setFlows(data.flows);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [searchParam]);

  useEffect(() => {
    const delay = setTimeout(fetchFlows, 350);
    return () => clearTimeout(delay);
  }, [fetchFlows]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-flow`, (data) => {
      if (data.action === "delete") {
        setFlows((prev) => prev.filter((f) => f.id !== data.flowId));
      }
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      const { data } = await api.post("/flows", {
        name: `Novo fluxo ${flows.length + 1}`
      });
      history.push(`/flows/${data.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicate = async (flow) => {
    try {
      const full = await api.get(`/flows/${flow.id}`);
      const { data } = await api.post("/flows", {
        name: `${flow.name} (cópia)`,
        description: full.data.description,
        nodes: full.data.nodes,
        edges: full.data.edges
      });
      toast.success("Fluxo duplicado!");
      history.push(`/flows/${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setMenuAnchor(null);
    }
  };

  const handleToggleActive = async (flow, event) => {
    event.stopPropagation();
    try {
      await api.put(`/flows/${flow.id}`, { isActive: !flow.isActive });
      setFlows((prev) =>
        prev.map((f) => (f.id === flow.id ? { ...f, isActive: !f.isActive } : f))
      );
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/flows/${selectedFlow.id}`);
      setFlows((prev) => prev.filter((f) => f.id !== selectedFlow.id));
      toast.success("Fluxo excluído!");
    } catch (err) {
      toastError(err);
    } finally {
      setConfirmOpen(false);
      setSelectedFlow(null);
    }
  };

  const openMenu = (event, flow) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedFlow(flow);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={selectedFlow && `Excluir o fluxo "${selectedFlow.name}"?`}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      >
        Essa ação não pode ser desfeita. Se este fluxo estiver atrelado a uma
        fila, remova a associação antes de excluir.
      </ConfirmationModal>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            history.push(`/flows/${selectedFlow.id}`);
            setMenuAnchor(null);
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate(selectedFlow)}>
          <ContentCopyOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Duplicar
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmOpen(true);
            setMenuAnchor(null);
          }}
          style={{ color: "#ef4444" }}
        >
          <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
          Excluir
        </MenuItem>
      </Menu>

      <MainHeader>
        <Title>Fluxos</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo fluxo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Box className={classes.mainPaper}>
        <TextField
          className={classes.searchBar}
          size="small"
          fullWidth
          placeholder="Buscar fluxo..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <div className={classes.grid}>
            <div className={classes.createCard} onClick={handleCreate}>
              <AddIcon fontSize="large" />
              <Typography style={{ fontWeight: 700 }}>Criar novo fluxo</Typography>
            </div>

            {flows.map((flow) => (
              <div key={flow.id} className={classes.card} onClick={() => history.push(`/flows/${flow.id}`)}>
                <div className={classes.cardTop}>
                  <div className={classes.iconBadge}>
                    <AccountTreeRoundedIcon />
                  </div>
                  <IconButton size="small" onClick={(e) => openMenu(e, flow)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </div>

                <Tooltip title={flow.name}>
                  <Typography className={classes.cardName}>{flow.name}</Typography>
                </Tooltip>
                <Typography className={classes.cardDescription}>
                  {flow.description || "Sem descrição."}
                </Typography>

                <div className={classes.cardFooter}>
                  <span
                    className={classes.statusChip}
                    style={{ color: flow.isActive ? "#10b981" : "#94a3b8" }}
                  >
                    <BoltIcon style={{ fontSize: 15 }} />
                    {flow.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <Switch
                    size="small"
                    checked={flow.isActive}
                    onClick={(e) => handleToggleActive(flow, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && flows.length === 0 && (
          <div className={classes.emptyState}>
            <AccountTreeRoundedIcon style={{ fontSize: 48, opacity: 0.4 }} />
            <Typography>Nenhum fluxo criado ainda.</Typography>
          </div>
        )}
      </Box>
    </MainContainer>
  );
};

export default Flows;
