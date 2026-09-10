import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import HttpRoundedIcon from "@mui/icons-material/HttpRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ForwardToInboxRoundedIcon from "@mui/icons-material/ForwardToInboxRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";

// Fonte única de verdade sobre cada tipo de node: ícone, cor, rótulo da
// paleta lateral e dado inicial ao ser arrastado pro canvas. Usado tanto
// pelo Sidebar (paleta) quanto pelos componentes de node e pelo ConfigPanel.
export const NODE_DEFINITIONS = {
  start: {
    label: "Início",
    description: "Ponto de partida do fluxo",
    color: "#64748b",
    icon: PlayCircleRoundedIcon,
    hideFromPalette: true,
    defaultData: { label: "Início" }
  },
  message: {
    label: "Enviar mensagem",
    description: "Envia um texto pro contato",
    color: "#0ea5e9",
    icon: ChatBubbleOutlineRoundedIcon,
    defaultData: { text: "Olá {{firstName}}! 👋" }
  },
  question: {
    label: "Perguntar",
    description: "Envia uma mensagem e espera a resposta",
    color: "#8b5cf6",
    icon: HelpOutlineRoundedIcon,
    defaultData: { text: "Qual o seu nome?", variableName: "resposta" }
  },
  condition: {
    label: "Condição",
    description: "Ramifica o fluxo em Sim/Não",
    color: "#f59e0b",
    icon: CallSplitRoundedIcon,
    defaultData: { variableName: "resposta", operator: "equals", value: "" }
  },
  setVariable: {
    label: "Definir variável",
    description: "Guarda um valor pra usar depois",
    color: "#14b8a6",
    icon: DataObjectRoundedIcon,
    defaultData: { variableName: "variavel", value: "" }
  },
  delay: {
    label: "Aguardar",
    description: "Pausa alguns segundos",
    color: "#94a3b8",
    icon: ScheduleRoundedIcon,
    defaultData: { seconds: 2 }
  },
  httpRequest: {
    label: "Requisição HTTP",
    description: "Chama uma API externa (webhook, n8n, CRM...)",
    color: "#6366f1",
    icon: HttpRoundedIcon,
    defaultData: { method: "GET", url: "", saveResponseAs: "resposta_http" }
  },
  aiPrompt: {
    label: "Resposta com IA",
    description: "Usa um prompt de IA já cadastrado",
    color: "#10b981",
    icon: AutoAwesomeRoundedIcon,
    defaultData: { promptId: "", sendAsMessage: true, saveResponseAs: "resposta_ia" }
  },
  tag: {
    label: "Adicionar tag",
    description: "Marca o ticket com uma etiqueta",
    color: "#ec4899",
    icon: LocalOfferRoundedIcon,
    defaultData: { tagId: "" }
  },
  transferQueue: {
    label: "Transferir para fila",
    description: "Encaminha o ticket e encerra o fluxo",
    color: "#f97316",
    icon: ForwardToInboxRoundedIcon,
    defaultData: { queueId: "" }
  },
  end: {
    label: "Encerrar fluxo",
    description: "Libera o ticket pro atendimento normal",
    color: "#ef4444",
    icon: StopCircleRoundedIcon,
    defaultData: { label: "Fim" }
  }
};

export const PALETTE_ITEMS = Object.entries(NODE_DEFINITIONS)
  .filter(([, def]) => !def.hideFromPalette)
  .map(([type, def]) => ({ type, ...def }));
