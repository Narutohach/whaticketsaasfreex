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
import { Box, Typography, useTheme } from "@mui/material";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { getFirstDayOfMonth, getLastDayOfMonth } from "../../utils/dates";
import { getBaseOptions, modernPalette } from "./chartConfig";
import ChartDateFilter from "./ChartDateFilter";

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

  const handleGetTicketsInformation = async (start = initialDate, end = finalDate) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/dashboard/ticketsUsers?initialDate=${format(
          start,
          "yyyy-MM-dd"
        )}&finalDate=${format(end, "yyyy-MM-dd")}&companyId=${companyId}`
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
            Total de Conversas por Usuários
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8",
              display: "block",
              lineHeight: 1.3,
            }}
          >
            Volume de interações atribuídas a cada atendente
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <ChartDateFilter
            initialDate={initialDate}
            setInitialDate={setInitialDate}
            finalDate={finalDate}
            setFinalDate={setFinalDate}
            onFilter={handleGetTicketsInformation}
            loading={loading}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260, position: "relative" }}>
        <Bar options={chartOptions} data={dataCharts} />
      </Box>
    </Box>
  );
};
