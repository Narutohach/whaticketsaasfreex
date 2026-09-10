import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NODE_DEFINITIONS } from "./nodeDefinitions";

const truncate = (text, max) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const summarize = (type, data = {}) => {
  switch (type) {
    case "message":
      return data.text ? `"${truncate(data.text, 60)}"` : "Sem mensagem definida";
    case "question":
      return data.text
        ? `"${truncate(data.text, 45)}" → {{${data.variableName || "?"}}}`
        : "Sem pergunta definida";
    case "condition":
      return data.variableName
        ? `{{${data.variableName}}} ${data.operator || "?"} "${data.value || ""}"`
        : "Sem condição definida";
    case "setVariable":
      return data.variableName ? `{{${data.variableName}}} = "${truncate(data.value || "", 30)}"` : "";
    case "delay":
      return `${data.seconds || 0}s`;
    case "httpRequest":
      return data.url ? `${data.method || "GET"} ${truncate(data.url, 40)}` : "URL não definida";
    case "aiPrompt":
      return data.promptId ? `Prompt #${data.promptId}` : "Nenhum prompt selecionado";
    case "tag":
      return data.tagId ? `Tag #${data.tagId}` : "Nenhuma tag selecionada";
    case "transferQueue":
      return data.queueId ? `Fila #${data.queueId}` : "Nenhuma fila selecionada";
    default:
      return "";
  }
};

const FlowNode = ({ id, type, data, selected }) => {
  const def = NODE_DEFINITIONS[type] || NODE_DEFINITIONS.message;
  const Icon = def.icon;
  const isCondition = type === "condition";
  const isStart = type === "start";
  const isEnd = type === "end";

  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 260,
        borderRadius: 14,
        background: "var(--flow-node-bg, #1e293b)",
        border: `2px solid ${selected ? def.color : "var(--flow-node-border, rgba(148,163,184,0.25))"}`,
        boxShadow: selected
          ? `0 0 0 4px ${def.color}22, 0 12px 24px rgba(0,0,0,0.35)`
          : "0 6px 16px rgba(0,0,0,0.25)",
        overflow: "hidden",
        fontFamily: "inherit"
      }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: def.color, width: 10, height: 10, border: "2px solid var(--flow-node-bg, #1e293b)" }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: `${def.color}22`,
          borderBottom: `1px solid ${def.color}33`
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: def.color,
            color: "#fff",
            flexShrink: 0
          }}
        >
          <Icon style={{ fontSize: 16 }} />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--flow-node-text, #f1f5f9)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {data?.customLabel || def.label}
        </span>
      </div>

      {!isStart && (
        <div
          style={{
            padding: "10px 12px",
            fontSize: 12,
            color: "var(--flow-node-subtext, #94a3b8)",
            lineHeight: 1.4,
            wordBreak: "break-word",
            minHeight: 18
          }}
        >
          {summarize(type, data) || <em>Clique para configurar</em>}
        </div>
      )}

      {isStart && (
        <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--flow-node-subtext, #94a3b8)" }}>
          Disparado quando o ticket entra na fila configurada
        </div>
      )}

      {!isEnd && !isCondition && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: def.color, width: 10, height: 10, border: "2px solid var(--flow-node-bg, #1e293b)" }}
        />
      )}

      {isCondition && (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{
              top: "35%",
              background: "#10b981",
              width: 10,
              height: 10,
              border: "2px solid var(--flow-node-bg, #1e293b)"
            }}
          />
          <span
            style={{
              position: "absolute",
              right: -6,
              top: "22%",
              fontSize: 9,
              fontWeight: 800,
              color: "#10b981",
              background: "var(--flow-node-bg, #1e293b)",
              padding: "1px 4px",
              borderRadius: 4
            }}
          >
            SIM
          </span>
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{
              top: "75%",
              background: "#ef4444",
              width: 10,
              height: 10,
              border: "2px solid var(--flow-node-bg, #1e293b)"
            }}
          />
          <span
            style={{
              position: "absolute",
              right: -6,
              top: "80%",
              fontSize: 9,
              fontWeight: 800,
              color: "#ef4444",
              background: "var(--flow-node-bg, #1e293b)",
              padding: "1px 4px",
              borderRadius: 4
            }}
          >
            NÃO
          </span>
        </>
      )}
    </div>
  );
};

export default memo(FlowNode);
