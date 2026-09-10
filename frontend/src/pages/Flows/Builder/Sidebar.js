import React from "react";
import { Typography } from "@mui/material";
import { PALETTE_ITEMS } from "./nodeDefinitions";

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/hactoflow-node", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      style={{
        width: 236,
        flexShrink: 0,
        borderRight: "1px solid var(--flow-panel-border, rgba(148,163,184,0.15))",
        background: "var(--flow-panel-bg, #0f172a)",
        padding: "16px 12px",
        overflowY: "auto"
      }}
    >
      <Typography
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--flow-panel-subtext, #64748b)",
          padding: "0 6px 12px"
        }}
      >
        Arraste pro canvas
      </Typography>

      {PALETTE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              marginBottom: 6,
              borderRadius: 10,
              cursor: "grab",
              background: "var(--flow-panel-item-bg, rgba(255,255,255,0.03))",
              border: "1px solid transparent",
              transition: "border-color 0.15s ease, background 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${item.color}55`;
              e.currentTarget.style.background = `${item.color}14`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "var(--flow-panel-item-bg, rgba(255,255,255,0.03))";
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: item.color,
                color: "#fff",
                flexShrink: 0
              }}
            >
              <Icon style={{ fontSize: 17 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Typography
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--flow-panel-text, #e2e8f0)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {item.label}
              </Typography>
              <Typography
                style={{
                  fontSize: 10.5,
                  color: "var(--flow-panel-subtext, #64748b)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {item.description}
              </Typography>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
