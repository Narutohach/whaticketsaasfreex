import React, { useEffect, useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Typography from "@mui/material/Typography";
import { Button, Stack, TextField, Box, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { makeStyles } from "../../styles/makeStyles";
import brLocale from "date-fns/locale/pt-BR";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import api from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import "./button.css";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../../utils/dates";
import { getBaseOptions, modernPalette } from "./chartConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const ChartsDepartamentRatings = () => {
  const classes = useStyles();
  const theme = useTheme();
  const companyId = localStorage.getItem("companyId");

  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleChangeReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangeReportData() {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/reports/departamentRatings?initialDate=${format(
          initialDate,
          "yyyy-MM-dd"
        )}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setChartData(data);
    } catch (err) {
      toast.error("Erro ao obter informações das avaliações");
    } finally {
      setLoading(false);
    }
  }

  const data = useMemo(() => {
    const labels = (chartData || []).map((item) => item.name);
    const values = (chartData || []).map((item) => parseFloat(item.total_rate || 0).toFixed(1));
    const backgroundColor = values.map((_, i) => modernPalette[(i + 4) % modernPalette.length] + "cc");
    const borderColor = values.map((_, i) => modernPalette[(i + 4) % modernPalette.length]);

    return {
      labels: labels.length > 0 ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Média de Avaliação",
          data: values.length > 0 ? values : [0],
          backgroundColor: values.length > 0 ? backgroundColor : ["rgba(100, 116, 139, 0.2)"],
          borderColor: values.length > 0 ? borderColor : ["rgba(100, 116, 139, 0.4)"],
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 34,
        },
      ],
    };
  }, [chartData]);

  const chartOptions = useMemo(() => {
    const base = getBaseOptions(theme.palette.mode);
    return {
      ...base,
      scales: {
        ...base.scales,
        y: {
          ...base.scales.y,
          max: 5,
          ticks: {
            ...base.scales.y.ticks,
            stepSize: 1,
          },
        },
      },
      plugins: {
        ...base.plugins,
        title: { display: false },
      },
    };
  }, [theme.palette.mode]);

  return (
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
            Avaliações por Departamento / Fila
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8" }}>
            Satisfação média dos clientes por setor (escala 0 a 5)
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

      <Box sx={{ flex: 1, minHeight: 260, position: "relative" }}>
        <Bar data={data} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default ChartsDepartamentRatings;
