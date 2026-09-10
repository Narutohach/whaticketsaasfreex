import React, { useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Popover,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const ChartDateFilter = ({
  initialDate,
  setInitialDate,
  finalDate,
  setFinalDate,
  onFilter,
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [tempInitial, setTempInitial] = useState(initialDate);
  const [tempFinal, setTempFinal] = useState(finalDate);

  const handleClick = (event) => {
    setTempInitial(initialDate);
    setTempFinal(finalDate);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    setInitialDate(tempInitial);
    setFinalDate(tempFinal);
    handleClose();
    if (onFilter) {
      setTimeout(() => onFilter(tempInitial, tempFinal), 50);
    }
  };

  const applyPreset = (start, end) => {
    setTempInitial(start);
    setTempFinal(end);
    setInitialDate(start);
    setFinalDate(end);
    handleClose();
    if (onFilter) {
      setTimeout(() => onFilter(start, end), 50);
    }
  };

  const handleThisMonth = () => {
    const now = new Date();
    applyPreset(startOfMonth(now), endOfMonth(now));
  };

  const handleLast7Days = () => {
    const now = new Date();
    applyPreset(subDays(now, 7), now);
  };

  const handleLast30Days = () => {
    const now = new Date();
    applyPreset(subDays(now, 30), now);
  };

  const dateLabel = `${format(initialDate, "dd/MM/yy")} - ${format(finalDate, "dd/MM/yy")}`;

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon sx={{ fontSize: "13px !important", color: "#10b981" }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: "16px !important", color: isDark ? "#94a3b8" : "#64748b" }} />}
        sx={{
          height: 30,
          px: 1.2,
          py: 0.4,
          borderRadius: "8px",
          fontSize: "0.74rem",
          fontWeight: 600,
          textTransform: "none",
          whiteSpace: "nowrap",
          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.9)",
          color: isDark ? "#e2e8f0" : "#334155",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#10b981",
            backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.06)",
          },
        }}
      >
        {dateLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              mt: 1,
              width: 300,
              borderRadius: "14px",
              boxShadow: isDark
                ? "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                : "0 10px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
            },
          },
        }}
      >
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 700,
            mb: 1.5,
            color: isDark ? "#f1f5f9" : "#0f172a",
          }}
        >
          Filtrar Período do Gráfico
        </Typography>

        {/* ATALHOS RÁPIDOS */}
        <Stack direction="row" spacing={0.8} sx={{ mb: 2 }}>
          <Chip
            label="Este mês"
            size="small"
            clickable
            onClick={handleThisMonth}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
            }}
          />
          <Chip
            label="7 dias"
            size="small"
            clickable
            onClick={handleLast7Days}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
            }}
          />
          <Chip
            label="30 dias"
            size="small"
            clickable
            onClick={handleLast30Days}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              borderRadius: "6px",
              "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
            }}
          />
        </Stack>

        {/* CAMPOS DE DATA */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <DatePicker
              label="Data Inicial"
              value={tempInitial}
              onChange={(val) => setTempInitial(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { borderRadius: "8px", fontSize: "0.82rem" },
                  }}
                />
              )}
            />
            <DatePicker
              label="Data Final"
              value={tempFinal}
              onChange={(val) => setTempFinal(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { borderRadius: "8px", fontSize: "0.82rem" },
                  }}
                />
              )}
            />
          </Stack>
        </LocalizationProvider>

        {/* BOTÃO APLICAR */}
        <Button
          onClick={handleApply}
          disabled={loading}
          fullWidth
          variant="contained"
          size="small"
          startIcon={<FilterAltIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 0.9,
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            },
          }}
        >
          {loading ? "Carregando..." : "Aplicar Filtro"}
        </Button>
      </Popover>
    </>
  );
};

export default ChartDateFilter;
