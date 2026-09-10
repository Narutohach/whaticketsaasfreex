import React, { useEffect, useState, useMemo } from "react";
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Button, Stack, TextField, Box, Typography, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
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

export const ChatsUser = () => {
  const theme = useTheme();
  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [ticketsData, setTicketsData] = useState({ data: [] });
  const [loading, setLoading] = useState(false);

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    handleGetTicketsInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetTicketsInformation = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/dashboard/ticketsUsers?initialDate=${format(
          initialDate,
          "yyyy-MM-dd"
        )}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch (error) {
      toast.error("Erro ao obter informações da conversa");
    } finally {
      setLoading(false);
    }
  };

  const dataCharts = useMemo(() => {
    const labels = (ticketsData?.data || []).map((item) => item.nome);
    const data = (ticketsData?.data || []).map((item) => item.quantidade);
    const backgroundColor = data.map((_, i) => modernPalette[i % modernPalette.length] + "cc");
    const borderColor = data.map((_, i) => modernPalette[i % modernPalette.length]);

    return {
      labels,
      datasets: [
        {
          label: "Conversas",
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 38,
        },
      ],
    };
  }, [ticketsData]);

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
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
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
            Total de Conversas por Usuários
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8" }}>
            Volume de interações atribuídas a cada atendente
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
                    width: "140px",
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
                    width: "140px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem", borderRadius: "8px" },
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <Button
            className="buttonHover"
            onClick={handleGetTicketsInformation}
            disabled={loading}
            variant="contained"
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
          >
            {loading ? "..." : "Filtrar"}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260, position: "relative" }}>
        <Bar options={chartOptions} data={dataCharts} />
      </Box>
    </Box>
  );
};
