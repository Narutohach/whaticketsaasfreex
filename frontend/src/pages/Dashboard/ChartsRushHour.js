import React, { useEffect, useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Typography from "@mui/material/Typography";
import { Box, useTheme } from "@mui/material";
import { makeStyles } from "../../styles/makeStyles";
import api from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../../utils/dates";
import { getBaseOptions } from "./chartConfig";
import ChartDateFilter from "./ChartDateFilter";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

const ChartsRushHour = () => {
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

  async function handleChangeReportData(start = initialDate, end = finalDate) {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/reports/rushHour?initialDate=${format(
          start,
          "yyyy-MM-dd"
        )}&finalDate=${format(end, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setChartData(data);
    } catch (err) {
      toast.error("Erro ao obter informações dos horários de pico");
    } finally {
      setLoading(false);
    }
  }

  const data = useMemo(() => {
    const labels = (chartData || []).map((item) => `${item.message_hour}:00`);
    const values = (chartData || []).map((item) => item.message_count);

    return {
      labels: labels.length > 0 ? labels : ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
      datasets: [
        {
          label: "Mensagens",
          data: values.length > 0 ? values : [0, 0, 0, 0, 0, 0],
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(139, 92, 246, 0.15)"
              : "rgba(139, 92, 246, 0.12)",
          borderColor: "#8b5cf6",
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#8b5cf6",
          pointBorderColor: theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [chartData, theme.palette.mode]);

  const chartOptions = useMemo(() => {
    const base = getBaseOptions(theme.palette.mode);
    return {
      ...base,
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
          alignItems: "flex-start",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "-0.01em",
              color: theme.palette.mode === "dark" ? "#f1f5f9" : "#0f172a",
              lineHeight: 1.3,
            }}
          >
            Horário de Pico - Troca de Mensagens
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8",
              display: "block",
              lineHeight: 1.3,
            }}
          >
            Fluxo de mensagens recebidas e enviadas a cada hora do dia
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <ChartDateFilter
            initialDate={initialDate}
            setInitialDate={setInitialDate}
            finalDate={finalDate}
            setFinalDate={setFinalDate}
            onFilter={handleChangeReportData}
            loading={loading}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260, position: "relative" }}>
        <Line data={data} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default ChartsRushHour;
