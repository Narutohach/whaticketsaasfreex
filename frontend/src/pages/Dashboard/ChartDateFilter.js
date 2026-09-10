import React from "react";
import { Box, Typography, Button, TextField, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import FilterListIcon from "@mui/icons-material/FilterList";

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: { xs: 0.5, sm: 0.75 },
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
        }}
      >
        <DatePicker
          value={initialDate}
          onChange={(val) => setInitialDate(val)}
          label="Início"
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{
                width: { xs: 110, sm: 122 },
                "& .MuiInputBase-root": {
                  height: 34,
                  fontSize: "0.78rem",
                  borderRadius: "8px",
                  backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : "#ffffff",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.78rem",
                  transform: "translate(12px, 8px) scale(1)",
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(12px, -6px) scale(0.75)",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 16,
                },
                "& .MuiIconButton-root": {
                  padding: "3px",
                  mr: "-3px",
                },
              }}
            />
          )}
        />

        <Typography
          component="span"
          sx={{
            fontSize: "0.76rem",
            fontWeight: 600,
            color: isDark ? "#64748b" : "#94a3b8",
            userSelect: "none",
            px: 0.2,
          }}
        >
          a
        </Typography>

        <DatePicker
          value={finalDate}
          onChange={(val) => setFinalDate(val)}
          label="Fim"
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{
                width: { xs: 110, sm: 122 },
                "& .MuiInputBase-root": {
                  height: 34,
                  fontSize: "0.78rem",
                  borderRadius: "8px",
                  backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : "#ffffff",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.78rem",
                  transform: "translate(12px, 8px) scale(1)",
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(12px, -6px) scale(0.75)",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 16,
                },
                "& .MuiIconButton-root": {
                  padding: "3px",
                  mr: "-3px",
                },
              }}
            />
          )}
        />

        <Button
          onClick={onFilter}
          disabled={loading}
          variant="contained"
          size="small"
          sx={{
            height: 34,
            minWidth: "auto",
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 700,
            textTransform: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            },
            "&:disabled": {
              opacity: 0.6,
              color: "#ffffff",
            },
          }}
          startIcon={<FilterListIcon sx={{ fontSize: 15 }} />}
        >
          {loading ? "..." : "Filtrar"}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default ChartDateFilter;
