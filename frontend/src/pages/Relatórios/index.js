import React, { useState, useEffect, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Paper,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Table,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Tooltip,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
  Container,
} from "@mui/material";
import { makeStyles } from "../../styles/makeStyles";
import * as XLSX from "xlsx";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";

import { UsersFilter } from "../../components/UsersFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";
import QueueSelectCustom from "../../components/QueueSelectCustom";
import moment from "moment";
import Autocomplete from "@mui/material/Autocomplete";
import { AuthContext } from "../../context/Auth/AuthContext";
import { isArray } from "lodash";

// Icons
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CallIcon from "@mui/icons-material/Call";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import TuneIcon from "@mui/icons-material/Tune";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    minHeight: "100%",
  },
  headerBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  kpiCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "#ffffff",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.25)"
        : "0 4px 20px rgba(0, 0, 0, 0.03)",
    transition: "all 0.25s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: "#10b981",
    },
  },
  kpiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filterCard: {
    padding: theme.spacing(2.5),
    borderRadius: 16,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "#ffffff",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.25)"
        : "0 4px 20px rgba(0, 0, 0, 0.03)",
    marginBottom: theme.spacing(3),
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontSize: "0.82rem",
    },
  },
  tableCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "#ffffff",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.25)"
        : "0 4px 20px rgba(0, 0, 0, 0.03)",
  },
  tableWrapper: {
    maxHeight: "60vh",
    overflow: "auto",
    ...theme.scrollbarStylesSoftBig,
  },
  tableHeaderCell: {
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(30, 41, 59, 0.9)"
        : "#f8fafc",
    borderBottom:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
    padding: "12px 16px",
    whiteSpace: "nowrap",
  },
  tableRow: {
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.03)"
          : "rgba(16, 185, 129, 0.04)",
    },
    "& td": {
      padding: "12px 16px",
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
      fontSize: "0.82rem",
    },
  },
  paginationFooter: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    borderTop:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
  },
}));

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  let bg = "rgba(100, 116, 139, 0.12)";
  let color = "#64748b";
  let border = "rgba(100, 116, 139, 0.25)";
  let label = status || "Desconhecido";

  if (s === "open" || s === "aberto") {
    bg = "rgba(16, 185, 129, 0.12)";
    color = "#10b981";
    border = "rgba(16, 185, 129, 0.25)";
    label = "Aberto";
  } else if (s === "closed" || s === "fechado") {
    bg = "rgba(244, 63, 94, 0.12)";
    color = "#f43f5e";
    border = "rgba(244, 63, 94, 0.25)";
    label = "Fechado";
  } else if (s === "pending" || s === "pendente") {
    bg = "rgba(245, 158, 11, 0.12)";
    color = "#f59e0b";
    border = "rgba(245, 158, 11, 0.25)";
    label = "Pendente";
  } else if (s === "group") {
    bg = "rgba(139, 92, 246, 0.12)";
    color = "#8b5cf6";
    border = "rgba(139, 92, 246, 0.25)";
    label = "Grupo";
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1.2,
        py: 0.35,
        borderRadius: "20px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      {label}
    </Box>
  );
};

const QueueBadge = ({ ticket }) => {
  const queueName = ticket?.queueName || "Sem Fila";
  const queueColor = ticket?.queueColor || "#64748b";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1.1,
        py: 0.35,
        borderRadius: "8px",
        backgroundColor: `${queueColor}15`,
        border: `1px solid ${queueColor}35`,
        color: queueColor,
        fontSize: "0.74rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: queueColor,
        }}
      />
      {queueName}
    </Box>
  );
};

const Relatorios = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const history = useHistory();

  const initialContact = {
    id: "",
    name: "",
  };

  const [currentContact, setCurrentContact] = useState(initialContact);
  const { getReport } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const { user } = useContext(AuthContext);

  const [queueIds, setQueueIds] = useState([]);
  const [ticketId, setTicketId] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment().startOf("month").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [contacts, setContacts] = useState([initialContact]);
  const [searchParam] = useState("");

  useEffect(() => {
    const { companyId } = user;
    if (companyId) {
      (async () => {
        try {
          const { data: contactList } = await api.get("/contacts/list", {
            params: { companyId },
          });
          let customList = contactList.map((c) => ({ id: c.id, name: c.name }));
          if (isArray(customList)) {
            setContacts([{ id: "", name: "" }, ...customList]);
          }
        } catch (err) {
          toastError(err);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (user?.profile === "user") {
      setUserIds([user.id]);
    }
  }, [user]);

  // Carrega automaticamente os relatórios na primeira abertura
  useEffect(() => {
    handleFilter(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = async (page = 1) => {
    setLoading(true);

    let activeUsers = userIds;
    if (user.profile === "user") {
      activeUsers = [user.id];
      setUserIds([user.id]);
    }

    try {
      const data = await getReport({
        searchParam,
        ticketId,
        contactId: currentContact?.id,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(activeUsers),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page,
        pageSize,
      });

      setTotalTickets(data.totalTickets?.total || 0);
      setTickets(data.tickets || []);
      setPageNumber(page);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCurrentContact(initialContact);
    setSelectedWhatsapp([]);
    setSelectedStatus([]);
    if (user.profile !== "user") {
      setUserIds([]);
    }
    setQueueIds([]);
    setTicketId("");
    setDateFrom(moment().startOf("month").format("YYYY-MM-DD"));
    setDateTo(moment().format("YYYY-MM-DD"));
    setTimeout(() => {
      handleFilter(1);
    }, 50);
  };

  const exportarGridParaExcel = async () => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        ticketId,
        currentContact,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: 1,
        pageSize: 9999999,
      });

      const ws = XLSX.utils.json_to_sheet(data.tickets || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RelatorioDeAtendimentos");
      XLSX.writeFile(wb, `relatorio-atendimentos-${moment().format("YYYYMMDD")}.xlsx`);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedUsers = (selecteds) => {
    const userVerify = selecteds.every((t) => t.id === user.id);
    try {
      if (user.profile === "admin" || user.profile === "supervisor") {
        const users = selecteds.map((t) => t.id);
        setUserIds(users);
      } else if (!userVerify) {
        toastError("Você não tem permissão para filtrar tickets de outros usuários");
        setUserIds([]);
      } else if (userVerify && user.profile === "user") {
        setUserIds([user.id]);
      }
    } catch (error) {
      // Ignored
    }
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);
    setSelectedStatus(statusFilter);
  };

  // Métricas rápidas calculadas
  const kpis = useMemo(() => {
    let open = 0;
    let closed = 0;
    let pending = 0;
    tickets.forEach((t) => {
      const s = (t.status || "").toLowerCase();
      if (s === "open" || s === "aberto") open++;
      else if (s === "closed" || s === "fechado") closed++;
      else if (s === "pending" || s === "pendente") pending++;
    });
    return {
      total: totalTickets,
      open,
      closed,
      pending,
    };
  }, [tickets, totalTickets]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentContact?.id) count++;
    if (selectedWhatsapp.length > 0) count++;
    if (selectedStatus.length > 0) count++;
    if (userIds.length > 0 && user.profile !== "user") count++;
    if (queueIds.length > 0) count++;
    if (ticketId) count++;
    return count;
  }, [currentContact, selectedWhatsapp, selectedStatus, userIds, queueIds, ticketId, user.profile]);

  return (
    <Container maxWidth="xl" className={classes.root}>
      {/* CABEÇALHO DA PÁGINA */}
      <Box className={classes.headerBanner}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <AssessmentOutlinedIcon sx={{ color: "#10b981", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: "1.45rem",
                letterSpacing: "-0.02em",
                color: isDark ? "#f8fafc" : "#0f172a",
              }}
            >
              Relatórios de Atendimentos
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: "0.82rem",
                display: "block",
              }}
            >
              Histórico detalhado, métricas de produtividade e exportação de atendimentos
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={exportarGridParaExcel}
            disabled={loading}
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{
              borderRadius: "10px",
              height: 38,
              px: 2,
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "none",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#10b981",
              "&:hover": {
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
              },
            }}
          >
            Exportar Excel
          </Button>

          <Button
            variant="contained"
            onClick={() => handleFilter(1)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FilterListIcon />}
            sx={{
              borderRadius: "10px",
              height: 38,
              px: 2.5,
              fontWeight: 700,
              fontSize: "0.82rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
            }}
          >
            {loading ? "Carregando..." : "Aplicar Filtros"}
          </Button>
        </Box>
      </Box>

      {/* KPI SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className={classes.kpiCard} elevation={0}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.72rem" }}>
                Total de Tickets
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? "#f8fafc" : "#0f172a" }}>
                {kpis.total}
              </Typography>
            </Box>
            <Box className={classes.kpiIconContainer} sx={{ backgroundColor: "rgba(6, 182, 212, 0.12)" }}>
              <ConfirmationNumberOutlinedIcon sx={{ color: "#06b6d4", fontSize: 24 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className={classes.kpiCard} elevation={0}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.72rem" }}>
                Em Conversa (Nesta Página)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#10b981" }}>
                {kpis.open}
              </Typography>
            </Box>
            <Box className={classes.kpiIconContainer} sx={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}>
              <CallIcon sx={{ color: "#10b981", fontSize: 24 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className={classes.kpiCard} elevation={0}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.72rem" }}>
                Aguardando (Nesta Página)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#f59e0b" }}>
                {kpis.pending}
              </Typography>
            </Box>
            <Box className={classes.kpiIconContainer} sx={{ backgroundColor: "rgba(245, 158, 11, 0.12)" }}>
              <HourglassEmptyIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className={classes.kpiCard} elevation={0}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.72rem" }}>
                Finalizados (Nesta Página)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#f43f5e" }}>
                {kpis.closed}
              </Typography>
            </Box>
            <Box className={classes.kpiIconContainer} sx={{ backgroundColor: "rgba(244, 63, 94, 0.12)" }}>
              <CheckCircleIcon sx={{ color: "#f43f5e", fontSize: 24 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* PAINEL DE FILTROS AVANÇADOS */}
      <Paper className={classes.filterCard} elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TuneIcon sx={{ fontSize: 20, color: "#10b981" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Filtros de Atendimentos
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} ativo${activeFiltersCount > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              />
            )}
          </Box>

          <Button
            size="small"
            onClick={handleClearFilters}
            startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "none",
              color: "text.secondary",
              "&:hover": { color: "#f43f5e" },
            }}
          >
            Limpar Filtros
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* CONTATO */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <Autocomplete
                size="small"
                value={currentContact}
                options={contacts}
                onChange={(e, contact) => {
                  setCurrentContact(contact || initialContact);
                }}
                getOptionLabel={(option) => option.name || ""}
                isOptionEqualToValue={(option, value) => value.id === option.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Selecione o Contato"
                    label="Contato"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* WHATSAPPS / CONEXÕES */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ "& .MuiBox-root": { padding: 0 } }}>
            <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
          </Grid>

          {/* STATUS */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ "& .MuiBox-root": { padding: 0 } }}>
            <StatusFilter onFiltered={handleSelectedStatus} />
          </Grid>

          {/* ATENDENTES */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ "& .MuiBox-root": { padding: 0 } }}>
            <UsersFilter onFiltered={handleSelectedUsers} />
          </Grid>

          {/* FILAS */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ "& > div": { marginTop: 0 }, "& .MuiFormControl-root": { margin: 0 } }}>
            <QueueSelectCustom
              selectedQueueIds={queueIds}
              onChange={(values) => setQueueIds(values)}
            />
          </Grid>

          {/* TICKET ID */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Ticket ID"
              placeholder="Ex: 1042"
              type="text"
              value={ticketId}
              fullWidth
              size="small"
              onChange={(e) => setTicketId(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* DATA INICIAL */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              fullWidth
              size="small"
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* DATA FINAL */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              fullWidth
              size="small"
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* TABELA DE ATENDIMENTOS */}
      <Paper className={classes.tableCard} elevation={0}>
        <Box className={classes.tableWrapper}>
          <Table size="small" stickyHeader id="grid-attendants">
            <TableHead>
              <TableRow>
                <TableCell align="center" className={classes.tableHeaderCell}>Ticket</TableCell>
                <TableCell align="left" className={classes.tableHeaderCell}>Conexão</TableCell>
                <TableCell align="left" className={classes.tableHeaderCell}>Cliente</TableCell>
                <TableCell align="left" className={classes.tableHeaderCell}>Atendente</TableCell>
                <TableCell align="left" className={classes.tableHeaderCell}>Fila</TableCell>
                <TableCell align="center" className={classes.tableHeaderCell}>Status</TableCell>
                <TableCell align="left" className={classes.tableHeaderCell}>Últ. Mensagem</TableCell>
                <TableCell align="center" className={classes.tableHeaderCell}>Data Abertura</TableCell>
                <TableCell align="center" className={classes.tableHeaderCell}>Data Fechamento</TableCell>
                <TableCell align="center" className={classes.tableHeaderCell}>Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRowSkeleton avatar columns={10} />
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const contactInitials = (ticket?.contactName || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const userInitials = (ticket?.userName || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow key={ticket.id} className={classes.tableRow}>
                      {/* ID */}
                      <TableCell align="center">
                        <Chip
                          label={`#${ticket.id}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            borderRadius: "6px",
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
                            color: isDark ? "#e2e8f0" : "#1e293b",
                          }}
                        />
                      </TableCell>

                      {/* CONEXÃO */}
                      <TableCell align="left">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                          <WhatsAppIcon sx={{ fontSize: 16, color: "#10b981" }} />
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            {ticket?.whatsappName || "WhatsApp"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* CLIENTE */}
                      <TableCell align="left">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                              color: "#ffffff",
                            }}
                          >
                            {contactInitials}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, maxWidth: 160 }} noWrap>
                            {ticket?.contactName || "Sem Nome"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* ATENDENTE */}
                      <TableCell align="left">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 26,
                              height: 26,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(100, 116, 139, 0.15)",
                              color: isDark ? "#cbd5e1" : "#475569",
                            }}
                          >
                            {userInitials}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, maxWidth: 140 }} noWrap>
                            {ticket?.userName || "Não Atribuído"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* FILA */}
                      <TableCell align="left">
                        <QueueBadge ticket={ticket} />
                      </TableCell>

                      {/* STATUS */}
                      <TableCell align="center">
                        <StatusBadge status={ticket?.status} />
                      </TableCell>

                      {/* ÚLTIMA MENSAGEM */}
                      <TableCell align="left">
                        <Tooltip title={ticket?.lastMessage || "Sem mensagem"} arrow>
                          <Typography
                            sx={{
                              fontSize: "0.78rem",
                              color: "text.secondary",
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ticket?.lastMessage || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* DATA ABERTURA */}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                          {ticket?.createdAt ? moment(ticket.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                        </Typography>
                      </TableCell>

                      {/* DATA FECHAMENTO */}
                      <TableCell align="center">
                        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                          {ticket?.closedAt ? moment(ticket.closedAt).format("DD/MM/YYYY HH:mm") : "—"}
                        </Typography>
                      </TableCell>

                      {/* AÇÕES */}
                      <TableCell align="center">
                        <Tooltip title="Abrir Conversa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                            sx={{
                              color: "#10b981",
                              backgroundColor: "rgba(16, 185, 129, 0.08)",
                              "&:hover": {
                                backgroundColor: "rgba(16, 185, 129, 0.2)",
                              },
                            }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : null}
            </TableBody>
          </Table>

          {/* EMPTY STATE */}
          {!loading && tickets.length === 0 && (
            <Box
              sx={{
                py: 8,
                px: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <SearchOffIcon sx={{ fontSize: 36, color: "#10b981" }} />
              </Box>
              <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, mb: 0.5 }}>
                Nenhum atendimento encontrado
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, mb: 2.5, fontSize: "0.82rem" }}>
                Não foram encontrados tickets para os critérios informados. Experimente alterar o período ou limpar filtros.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                startIcon={<RestartAltIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#10b981",
                  color: "#10b981",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                  },
                }}
              >
                Resetar Filtros e Recarregar
              </Button>
            </Box>
          )}
        </Box>

        {/* BARRA DE PAGINAÇÃO */}
        <Box className={classes.paginationFooter}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {totalTickets > 0
              ? `Mostrando ${tickets.length} de ${totalTickets} atendimento${totalTickets > 1 ? "s" : ""}`
              : "0 atendimentos"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
            <Pagination
              count={Math.max(1, Math.ceil(totalTickets / pageSize))}
              page={pageNumber}
              onChange={(event, value) => handleFilter(value)}
              shape="rounded"
              color="primary"
              size="small"
              sx={{
                "& .Mui-selected": {
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%) !important",
                  color: "#ffffff !important",
                  fontWeight: 700,
                },
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Linhas por página:
              </Typography>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setTimeout(() => handleFilter(1), 50);
                }}
                size="small"
                sx={{
                  height: 32,
                  fontSize: "0.78rem",
                  borderRadius: "8px",
                  "& .MuiSelect-select": { py: 0.5, px: 1 },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Relatorios;
