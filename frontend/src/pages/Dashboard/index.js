import React, { useContext, useState, useEffect, useRef } from "react";

import { useReactToPrint } from "react-to-print";

import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";

import SpeedIcon from "@mui/icons-material/Speed";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import StoreIcon from '@mui/icons-material/Store';
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ForumIcon from "@mui/icons-material/Forum";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from "@mui/icons-material/Message";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import TimerIcon from "@mui/icons-material/Timer";

import { makeStyles } from "../../styles/makeStyles";
import { grey, blue } from "@mui/material/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import ChartsAppointmentsAtendent from "./ChartsAppointmentsAtendent";
import ChartsRushHour from "./ChartsRushHour";
import ChartsDepartamentRatings from "./ChartsDepartamentRatings";

const useStyles = makeStyles((theme) => ({
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  card: {
    padding: theme.spacing(2.5),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 125,
    borderRadius: 16,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.3)"
        : "0 4px 20px rgba(0, 0, 0, 0.04)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 10px 25px rgba(0, 0, 0, 0.45)"
          : "0 10px 25px rgba(0, 0, 0, 0.08)",
      borderColor: "#10b981",
    },
  },
  cardIcon: {
    fontSize: 28,
    color: "#10b981",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(16, 185, 129, 0.14)"
        : "rgba(16, 185, 129, 0.1)",
    marginLeft: "auto",
  },
  cardTitle: {
    fontSize: "0.82rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
  },
  cardSubtitle: {
    fontSize: "1.85rem",
    fontWeight: 800,
    marginTop: 4,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
    fontFamily: "'Inter', sans-serif",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2.5),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 260,
    borderRadius: 16,
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2.5),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 130,
    borderRadius: 16,
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2.5),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: 16,
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.06)",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2.5),
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    height: "100%",
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
  filterPaper: {
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
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const pageToPrint = useRef(null);

  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [visibleButtonsWithPrint, setVisibleButtonsWithPrint] = useState(true);

  const { find } = useDashboard();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${
    date < 10 ? `0${date}` : `${date}`
  }`;

  const [showFilter, setShowFilter] = useState(false);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const handlePrint = useReactToPrint({
    documentTitle: "Impressão do Dashboard",
    copyStyles: true,
    onBeforePrint: () => {
      // console.log("before printing...");
      // setVisibleButtonsWithPrint(false);
    },
    onAfterPrint: () => {
      console.log("after printing...");
      setVisibleButtonsWithPrint(true);
    },
    removeAfterPrint: true,
  });

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach((user) => {
      if (user.online === true) {
        userOnline = userOnline + 1;
      }
    });
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid
            size={{
              xs: 12,
              sm: 4,
              md: 3
            }}>
            <TextField
              size="small"
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ "& .MuiInputBase-root": { borderRadius: "10px" } }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4,
              md: 3
            }}>
            <TextField
              size="small"
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ "& .MuiInputBase-root": { borderRadius: "10px" } }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid
          size={{
            xs: 12,
            sm: 8,
            md: 6
          }}>
          <FormControl fullWidth size="small">
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              label="Período"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <div>
      <Container ref={pageToPrint} maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} sx={{ justifyContent: "flex-end" }}>
		
{/* CONEXÕES */}
{user.super && (
  <Grid
    size={{
      xs: 12,
      sm: 6,
      md: 3
    }}>
    <Paper className={classes.card} elevation={1}>
      <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid size={8}>
          <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
            Conexões Ativas
          </Typography>
          <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
            {counters.totalWhatsappSessions}
          </Typography>
        </Grid>
        <Grid size={4}>
          <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}>
            <MobileFriendlyIcon className={classes.cardIcon} style={{ color: "#10b981" }} />
          </div>
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

{/* EMPRESAS */}
{user.super && (
  <Grid
    size={{
      xs: 12,
      sm: 6,
      md: 3
    }}>
    <Paper className={classes.card} elevation={1}>
      <Grid container spacing={1} sx={{ alignItems: "center" }}>
        <Grid size={8}>
          <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
            Empresas
          </Typography>
          <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
            {counters.totalCompanies}
          </Typography>
        </Grid>
        <Grid size={4}>
          <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(236, 72, 153, 0.12)" }}>
            <StoreIcon className={classes.cardIcon} style={{ color: "#ec4899" }} />
          </div>
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

{/* EM ATENDIMENTO */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper className={classes.card} elevation={1}>
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Em Conversa
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportHappening}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(22, 119, 255, 0.12)" }}>
          <CallIcon className={classes.cardIcon} style={{ color: "#1677ff" }} />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* AGUARDANDO */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper className={classes.card} elevation={1}>
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Aguardando
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportPending}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(245, 158, 11, 0.12)" }}>
          <HourglassEmptyIcon className={classes.cardIcon} style={{ color: "#f59e0b" }} />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* NOVOS CONTATOS */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper className={classes.card} elevation={1}>
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Novos Contatos
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {GetContacts(true)}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(14, 165, 233, 0.12)" }}>
          <GroupAddIcon className={classes.cardIcon} style={{ color: "#0ea5e9" }} />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* T.M. DE ATENDIMENTO */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper className={classes.card} elevation={1}>
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          T.M. de Conversa
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {formatTime(counters.avgSupportTime)}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(139, 92, 246, 0.12)" }}>
          <AccessAlarmIcon className={classes.cardIcon} style={{ color: "#8b5cf6" }} />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* FINALIZADOS */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper className={classes.card} elevation={1}>
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography component="h3" variant="subtitle1" className={classes.cardTitle}>
          Finalizados
        </Typography>
        <Typography component="h1" variant="h6" className={classes.cardSubtitle}>
          {counters.supportFinished}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}>
          <CheckCircleIcon className={classes.cardIcon} style={{ color: "#10b981" }} />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>


		{/* T.M. DE ESPERA */}
<Grid
  size={{
    xs: 12,
    sm: 6,
    md: 3
  }}>
  <Paper
    className={classes.card}
    style={{ overflow: "hidden" }}
    elevation={1}
  >
    <Grid container spacing={1} sx={{ alignItems: "center" }}>
      <Grid size={8}>
        <Typography 
          component="h3" 
          variant="subtitle1" 
          className={classes.cardTitle}
        >
          T.M. de Espera
        </Typography>
        <Typography 
          component="h1" 
          variant="h6" 
          className={classes.cardSubtitle}
        >
          {formatTime(counters.avgWaitTime)}
        </Typography>
      </Grid>
      <Grid size={4}>
        <div className={classes.cardIconContainer} style={{ backgroundColor: "rgba(244, 63, 94, 0.12)" }}>
          <TimerIcon
            className={classes.cardIcon}
            style={{ color: "#f43f5e" }}
          />
        </div>
      </Grid>
    </Grid>
  </Paper>
</Grid>

		  
		  {/* BARRA DE FILTROS & AÇÕES */}
          <Grid size={12}>
            <Paper className={classes.filterPaper}>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                    md: 3
                  }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
                    <Select
                      labelId="period-selector-label"
                      value={filterType}
                      label="Tipo de Filtro"
                      onChange={(e) => handleChangeFilterType(e.target.value)}
                      sx={{ borderRadius: "10px" }}
                    >
                      <MenuItem value={1}>Filtro por Data</MenuItem>
                      <MenuItem value={2}>Filtro por Período</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {renderFilters()}

                {visibleButtonsWithPrint && (
                  <Grid size={{ xs: 12, sm: "grow" }} sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
                    <ButtonWithSpinner
                      loading={loading}
                      onClick={() => fetchData()}
                      variant="contained"
                      color="primary"
                      className="buttonHover"
                      startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
                      sx={{ px: 2.5, py: 1, borderRadius: "10px", fontWeight: 700 }}
                    >
                      Filtrar
                    </ButtonWithSpinner>

                    <ButtonWithSpinner
                      loading={loading}
                      onClick={() => {
                        setVisibleButtonsWithPrint(false);
                        setTimeout(
                          () => handlePrint(null, () => pageToPrint.current),
                          500
                        );
                      }}
                      variant="outlined"
                      sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: "10px",
                        fontWeight: 700,
                        borderColor: "rgba(16, 185, 129, 0.4)",
                        color: "#10b981",
                        "&:hover": {
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                        },
                      }}
                    >
                      Imprimir
                    </ButtonWithSpinner>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* USUARIOS ONLINE */}
          <Grid size={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          {/* LINHA 1 DE GRÁFICOS: TOTAL POR USUÁRIO & TOTAL DIÁRIO (LADO A LADO) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChartsDate />
            </Paper>
          </Grid>

          {/* LINHA 2 DE GRÁFICOS: ATENDIMENTOS POR ATENDENTE & POR FILA */}
          <Grid size={12}>
            <ChartsAppointmentsAtendent />
          </Grid>

          {/* LINHA 3 DE GRÁFICOS: HORÁRIO DE PICO & AVALIAÇÕES */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartsRushHour />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartsDepartamentRatings />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
