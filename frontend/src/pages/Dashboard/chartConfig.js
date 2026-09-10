// Configuração central e paleta de cores moderna para Chart.js no Dashboard

export const modernPalette = [
  "#10b981", // Esmeralda
  "#06b6d4", // Ciano
  "#6366f1", // Índigo
  "#8b5cf6", // Violeta
  "#f59e0b", // Âmbar
  "#3b82f6", // Azul
  "#ec4899", // Rosa
  "#14b8a6", // Teal
  "#f97316", // Laranja
  "#a855f7", // Púrpura
];

export const getChartColor = (index, alpha = 1) => {
  const hex = modernPalette[index % modernPalette.length];
  if (alpha === 1) return hex;
  
  // Converte HEX para RGBA
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getBaseOptions = (themeMode = "dark") => {
  const isDark = themeMode === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const tooltipBg = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)";
  const tooltipText = isDark ? "#f8fafc" : "#0f172a";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false, // Desativa os rótulos de texto gigantes com borda preta
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 11,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };
};

export const getDoughnutOptions = (themeMode = "dark") => {
  const isDark = themeMode === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const tooltipBg = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)";
  const tooltipText = isDark ? "#f8fafc" : "#0f172a";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: textColor,
          padding: 14,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 12,
            weight: 500,
          },
        },
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 11,
        },
      },
    },
  };
};
