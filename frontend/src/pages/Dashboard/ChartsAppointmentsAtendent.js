import React, { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Typography from "@mui/material/Typography";
import { Button, Stack, TextField, Box, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { makeStyles } from "../../styles/makeStyles";
import brLocale from "date-fns/locale/pt-BR";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "./button.css";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../../utils/dates";
import { getDoughnutOptions, modernPalette } from "./chartConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

const useStyles = makeStyles((theme) => ({
  card: {
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
}));

const ChartsAppointmentsAtendent = () => {
  const classes = useStyles();
  const theme = useTheme();
  const companyId = localStorage.getItem("companyId");

  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [ticketsData, setTicketsData] = useState({
    appointmentsByAttendents: [],
    ticketsByQueues: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleChangeReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangeReportData() {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/reports/appointmentsAtendent?initialDate=${format(
          initialDate,
          "yyyy-MM-dd"
        )}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch (err) {
      toast.error("Erro ao obter informações dos atendimentos");
    } finally {
      setLoading(false);
    }
  }

  const dataAttendents = useMemo(() => {
    const list = ticketsData.appointmentsByAttendents || [];
    const labels = list.map((item) => item.user_name || "Sem nome");
    const data = list.map((item) => Number(item.total_tickets) || 0);
    const backgroundColor = data.map((_, i) => modernPalette[i % modernPalette.length]);

    return {
      labels: labels.length > 0 ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Atendimentos",
          data: data.length > 0 ? data : [0],
          backgroundColor: data.length > 0 ? backgroundColor : ["rgba(100, 116, 139, 0.2)"],
          borderColor: theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [ticketsData.appointmentsByAttendents, theme.palette.mode]);

  const dataQueues = useMemo(() => {
    const list = ticketsData.ticketsByQueues || [];
    const labels = list.map((item) => item.name || "Sem fila");
    const data = list.map((item) => Number(item.total_tickets) || 0);
    const backgroundColor = data.map((_, i) => modernPalette[(i + 3) % modernPalette.length]);

    return {
      labels: labels.length > 0 ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Atendimentos",
          data: data.length > 0 ? data : [0],
          backgroundColor: data.length > 0 ? backgroundColor : ["rgba(100, 116, 139, 0.2)"],
          borderColor: theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [ticketsData.ticketsByQueues, theme.palette.mode]);

  const doughnutOptions = useMemo(() => {
    return getDoughnutOptions(theme.palette.mode);
  }, [theme.palette.mode]);

  return (
    <Grid container spacing={3}>
      {/* ATENDIMENTOS POR ATENDENTE */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper className={classes.card}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                component="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "-0.01em",
                  color: theme.palette.mode === "dark" ? "#f1f5f9" : "#0f172a",
                }}
              >
                Atendimentos por Atendente
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8" }}>
                Produtividade da equipe no período
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                <DatePicker
                  value={initialDate}
                  onChange={(val) => setInitialDate(val)}
                  label="Início"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        width: "130px",
                        "& .MuiInputBase-root": { fontSize: "0.8rem", borderRadius: "8px" },
                      }}
                    />
                  )}
                />
                <DatePicker
                  value={finalDate}
                  onChange={(val) => setFinalDate(val)}
                  label="Fim"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        width: "130px",
                        "& .MuiInputBase-root": { fontSize: "0.8rem", borderRadius: "8px" },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>

              <Button
                className="buttonHover"
                onClick={handleChangeReportData}
                disabled={loading}
                variant="contained"
                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
              >
                {loading ? "..." : "Filtrar"}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ minHeight: 270, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Doughnut data={dataAttendents} options={doughnutOptions} />
          </Box>
        </Paper>
      </Grid>

      {/* ATENDIMENTOS POR FILA / DEPARTAMENTO */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper className={classes.card}>
          <Box sx={{ mb: 2 }}>
            <Typography
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
                color: theme.palette.mode === "dark" ? "#f1f5f9" : "#0f172a",
              }}
            >
              Atendimentos por Departamento / Fila
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8" }}>
              Distribuição da demanda pelos setores de atendimento
            </Typography>
          </Box>

          <Box sx={{ minHeight: 270, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", mt: { xs: 0, sm: "42px" } }}>
            <Doughnut data={dataQueues} options={doughnutOptions} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ChartsAppointmentsAtendent;
