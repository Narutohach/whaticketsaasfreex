import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  InputLabel,
  FormControl
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import api from "../../../services/api";
import toastError from "../../../errors/toastError";
import { NODE_DEFINITIONS } from "./nodeDefinitions";

const field = { marginBottom: 16 };

const HelperText = ({ children }) => (
  <Typography style={{ fontSize: 11, color: "var(--flow-panel-subtext, #64748b)", marginTop: -12, marginBottom: 16 }}>
    {children}
  </Typography>
);

const ConfigPanel = ({ node, onChange, onClose, onDelete }) => {
  const [prompts, setPrompts] = useState([]);
  const [tags, setTags] = useState([]);
  const [queues, setQueues] = useState([]);

  const def = NODE_DEFINITIONS[node.type] || {};
  const data = node.data || {};

  useEffect(() => {
    if (node.type === "aiPrompt") {
      api
        .get("/prompt")
        .then(({ data: res }) => setPrompts(res.prompts || []))
        .catch(toastError);
    }
    if (node.type === "tag") {
      api
        .get("/tags/list")
        .then(({ data: res }) => setTags(res || []))
        .catch(toastError);
    }
    if (node.type === "transferQueue") {
      api
        .get("/queue")
        .then(({ data: res }) => setQueues(res || []))
        .catch(toastError);
    }
  }, [node.type]);

  const set = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const renderFields = () => {
    switch (node.type) {
      case "message":
        return (
          <TextField
            label="Mensagem"
            multiline
            minRows={4}
            fullWidth
            style={field}
            value={data.text || ""}
            onChange={(e) => set("text", e.target.value)}
            helperText="Use {{firstName}}, {{name}} ou variáveis salvas em nodes anteriores, ex: {{resposta}}"
          />
        );

      case "question":
        return (
          <>
            <TextField
              label="Mensagem (pergunta)"
              multiline
              minRows={3}
              fullWidth
              style={field}
              value={data.text || ""}
              onChange={(e) => set("text", e.target.value)}
            />
            <TextField
              label="Salvar resposta na variável"
              fullWidth
              style={field}
              value={data.variableName || ""}
              onChange={(e) => set("variableName", e.target.value.replace(/\s+/g, "_"))}
              helperText="Ex: nome_cliente — depois use {{nome_cliente}} em outros nodes"
            />
          </>
        );

      case "condition":
        return (
          <>
            <TextField
              label="Variável"
              fullWidth
              style={field}
              value={data.variableName || ""}
              onChange={(e) => set("variableName", e.target.value.replace(/\s+/g, "_"))}
              helperText="Nome de uma variável definida antes (sem {{ }})"
            />
            <FormControl fullWidth style={field}>
              <InputLabel>Operador</InputLabel>
              <Select
                value={data.operator || "equals"}
                label="Operador"
                onChange={(e) => set("operator", e.target.value)}
              >
                <MenuItem value="equals">É igual a</MenuItem>
                <MenuItem value="not_equals">É diferente de</MenuItem>
                <MenuItem value="contains">Contém</MenuItem>
                <MenuItem value="not_contains">Não contém</MenuItem>
                <MenuItem value="greater_than">Maior que (número)</MenuItem>
                <MenuItem value="less_than">Menor que (número)</MenuItem>
                <MenuItem value="is_empty">Está vazia</MenuItem>
                <MenuItem value="is_not_empty">Não está vazia</MenuItem>
              </Select>
            </FormControl>
            {!["is_empty", "is_not_empty"].includes(data.operator) && (
              <TextField
                label="Valor de comparação"
                fullWidth
                style={field}
                value={data.value || ""}
                onChange={(e) => set("value", e.target.value)}
              />
            )}
            <HelperText>
              Conecte a saída <b style={{ color: "#10b981" }}>SIM</b> e{" "}
              <b style={{ color: "#ef4444" }}>NÃO</b> a caminhos diferentes do fluxo.
            </HelperText>
          </>
        );

      case "setVariable":
        return (
          <>
            <TextField
              label="Nome da variável"
              fullWidth
              style={field}
              value={data.variableName || ""}
              onChange={(e) => set("variableName", e.target.value.replace(/\s+/g, "_"))}
            />
            <TextField
              label="Valor"
              fullWidth
              style={field}
              value={data.value || ""}
              onChange={(e) => set("value", e.target.value)}
              helperText="Pode usar {{outra_variavel}} aqui também"
            />
          </>
        );

      case "delay":
        return (
          <TextField
            label="Segundos de espera"
            type="number"
            fullWidth
            style={field}
            value={data.seconds ?? 2}
            onChange={(e) => set("seconds", Number(e.target.value))}
            helperText="Máximo 15s — esperas mais longas devem usar Agendamentos"
          />
        );

      case "httpRequest":
        return (
          <>
            <FormControl fullWidth style={field}>
              <InputLabel>Método</InputLabel>
              <Select value={data.method || "GET"} label="Método" onChange={(e) => set("method", e.target.value)}>
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL"
              fullWidth
              style={field}
              value={data.url || ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://sua-api.com/webhook"
            />
            <TextField
              label="Headers (JSON)"
              multiline
              minRows={2}
              fullWidth
              style={field}
              value={data.headers || ""}
              onChange={(e) => set("headers", e.target.value)}
              placeholder='{"Authorization": "Bearer ..."}'
            />
            {data.method !== "GET" && (
              <TextField
                label="Corpo (JSON)"
                multiline
                minRows={3}
                fullWidth
                style={field}
                value={data.body || ""}
                onChange={(e) => set("body", e.target.value)}
                placeholder='{"nome": "{{firstName}}"}'
              />
            )}
            <TextField
              label="Salvar resposta na variável"
              fullWidth
              style={field}
              value={data.saveResponseAs || ""}
              onChange={(e) => set("saveResponseAs", e.target.value.replace(/\s+/g, "_"))}
            />
          </>
        );

      case "aiPrompt":
        return (
          <>
            <FormControl fullWidth style={field}>
              <InputLabel>Prompt de IA</InputLabel>
              <Select
                value={data.promptId || ""}
                label="Prompt de IA"
                onChange={(e) => set("promptId", e.target.value)}
              >
                {prompts.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Instrução extra pra IA (opcional)"
              multiline
              minRows={2}
              fullWidth
              style={field}
              value={data.instruction || ""}
              onChange={(e) => set("instruction", e.target.value)}
            />
            <FormControlLabel
              style={field}
              control={
                <Switch
                  checked={data.sendAsMessage !== false}
                  onChange={(e) => set("sendAsMessage", e.target.checked)}
                />
              }
              label="Enviar resposta como mensagem"
            />
            <TextField
              label="Salvar resposta na variável (opcional)"
              fullWidth
              style={field}
              value={data.saveResponseAs || ""}
              onChange={(e) => set("saveResponseAs", e.target.value.replace(/\s+/g, "_"))}
            />
          </>
        );

      case "tag":
        return (
          <FormControl fullWidth style={field}>
            <InputLabel>Tag</InputLabel>
            <Select value={data.tagId || ""} label="Tag" onChange={(e) => set("tagId", e.target.value)}>
              {tags.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "transferQueue":
        return (
          <FormControl fullWidth style={field}>
            <InputLabel>Fila</InputLabel>
            <Select
              value={data.queueId || ""}
              label="Fila"
              onChange={(e) => set("queueId", e.target.value)}
            >
              {queues.map((q) => (
                <MenuItem key={q.id} value={q.id}>
                  {q.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "end":
        return (
          <Typography style={{ fontSize: 13, color: "var(--flow-panel-subtext, #94a3b8)" }}>
            Ao chegar aqui, o fluxo termina e o ticket volta pro atendimento
            normal (fila/menu/IA configurados fora deste fluxo).
          </Typography>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: "1px solid var(--flow-panel-border, rgba(148,163,184,0.15))",
        background: "var(--flow-panel-bg, #0f172a)",
        padding: 18,
        overflowY: "auto"
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: def.color
            }}
          />
          <Typography style={{ fontWeight: 800, fontSize: 14, color: "var(--flow-panel-text, #f1f5f9)" }}>
            {def.label}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {renderFields()}

      {node.type !== "start" && (
        <Box mt={3} pt={2} borderTop="1px solid var(--flow-panel-border, rgba(148,163,184,0.15))">
          <IconButton size="small" onClick={onDelete} style={{ color: "#ef4444" }}>
            <DeleteOutlineOutlinedIcon fontSize="small" style={{ marginRight: 6 }} />
            <Typography style={{ fontSize: 12.5, fontWeight: 700 }}>Excluir este node</Typography>
          </IconButton>
        </Box>
      )}
    </div>
  );
};

export default ConfigPanel;
