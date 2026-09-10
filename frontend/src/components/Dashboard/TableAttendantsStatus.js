import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip, useTheme } from "@mui/material";
import moment from "moment";

export function RatingBox({ rating }) {
  const ratingTrunc = rating && rating > 0 ? rating.toFixed(1) : 0;
  return (
    <Tooltip title={`Nota: ${ratingTrunc}`} arrow>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
        <Rating
          defaultValue={Number(ratingTrunc)}
          max={5}
          precision={0.1}
          readOnly
          size="small"
          sx={{ color: "#f59e0b" }}
        />
        <Typography variant="caption" sx={{ fontWeight: 600, color: "#94a3b8" }}>
          ({ratingTrunc})
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function TableAttendantsStatus(props) {
  const { loading, attendants = [] } = props;
  const theme = useTheme();

  function formatTime(minutes) {
    return moment().startOf("day").add(minutes, "minutes").format("HH[h] mm[m]");
  }

  return !loading ? (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "16px",
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
      }}
    >
      <Box sx={{ p: 2.5, pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            Status dos Atendentes
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8" }}>
            Disponibilidade, avaliação média e tempo de resposta da equipe
          </Typography>
        </Box>
      </Box>

      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
              Atendente
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
              Avaliações
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
              T.M. de Atendimento
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendants.map((a, k) => (
            <TableRow
              key={k}
              sx={{
                transition: "background-color 0.15s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                },
                "& td": {
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  py: 1.5,
                },
              }}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backgroundColor: a.online ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.15)",
                      color: a.online ? "#10b981" : "#94a3b8",
                      border: a.online ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(100, 116, 139, 0.2)",
                    }}
                  >
                    {a.name ? a.name.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    {a.name}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell align="center">
                <RatingBox rating={a.rating} />
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', monospace" }}>
                  {formatTime(a.avgSupportTime)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: "20px",
                    backgroundColor: a.online
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(100, 116, 139, 0.1)",
                    border: a.online
                      ? "1px solid rgba(16, 185, 129, 0.25)"
                      : "1px solid rgba(100, 116, 139, 0.2)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: a.online ? "#10b981" : "#64748b",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: a.online ? "#10b981" : "#64748b",
                      boxShadow: a.online ? "0 0 6px #10b981" : "none",
                    }}
                  />
                  {a.online ? "Online" : "Offline"}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Skeleton
      variant="rectangular"
      height={180}
      sx={{ borderRadius: "16px" }}
    />
  );
}
