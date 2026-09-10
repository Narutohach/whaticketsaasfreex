import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import api from "../../../services/api";
import toastError from "../../../errors/toastError";
import { toast } from "react-toastify";
import FlowNode from "./FlowNode";
import Sidebar from "./Sidebar";
import ConfigPanel from "./ConfigPanel";
import { NODE_DEFINITIONS } from "./nodeDefinitions";

let idCounter = 0;
const uid = (type) => `${type}-${Date.now()}-${idCounter++}`;

const EDGE_COLORS = {
  true: "#10b981",
  false: "#ef4444"
};

const FlowBuilderInner = () => {
  const { flowId } = useParams();
  const history = useHistory();
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const nodeTypes = useMemo(() => {
    return Object.fromEntries(Object.keys(NODE_DEFINITIONS).map((type) => [type, FlowNode]));
  }, []);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2, stroke: "#64748b" }
    }),
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/flows/${flowId}`);
        if (!mounted) return;
        setFlow(data);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (err) {
        toastError(err);
        history.push("/flows");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId]);

  const onConnect = useCallback(
    (params) => {
      const color = EDGE_COLORS[params.sourceHandle] || "#64748b";
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { strokeWidth: 2, stroke: color }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/hactoflow-node");
      if (!type || !NODE_DEFINITIONS[type]) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: uid(type),
        type,
        position,
        data: { ...NODE_DEFINITIONS[type].defaultData }
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleNodeDataChange = (newData) => {
    setNodes((nds) => nds.map((n) => (n.id === selectedNodeId ? { ...n, data: newData } : n)));
  };

  const handleDeleteNode = () => {
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanNodes = nodes.map(({ id, type, position, data }) => ({ id, type, position, data }));
      const cleanEdges = edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
        id,
        source,
        target,
        sourceHandle: sourceHandle || null,
        targetHandle: targetHandle || null
      }));

      await api.put(`/flows/${flowId}`, {
        name: flow.name,
        description: flow.description,
        nodes: cleanNodes,
        edges: cleanEdges
      });
      toast.success("Fluxo salvo!");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.put(`/flows/${flowId}`, { isActive: !flow.isActive });
      setFlow((f) => ({ ...f, isActive: !f.isActive }));
    } catch (err) {
      toastError(err);
    }
  };

  const handleRenameSave = async (newName) => {
    setFlow((f) => ({ ...f, name: newName }));
    setNameEditing(false);
    try {
      await api.put(`/flows/${flowId}`, { name: newName });
    } catch (err) {
      toastError(err);
    }
  };

  // Ctrl/Cmd+S salva sem disparar o "save page" do navegador — comum em
  // editores desse tipo (Typebot, n8n) e evita perder trabalho por engano.
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, flow]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" width="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--flow-canvas-bg, #0b1220)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid var(--flow-panel-border, rgba(148,163,184,0.15))",
          background: "var(--flow-panel-bg, #0f172a)",
          flexShrink: 0
        }}
      >
        <Tooltip title="Voltar">
          <IconButton size="small" onClick={() => history.push("/flows")}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Tooltip>

        {nameEditing ? (
          <TextField
            autoFocus
            size="small"
            defaultValue={flow.name}
            onBlur={(e) => handleRenameSave(e.target.value || flow.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
            }}
          />
        ) : (
          <Typography
            onClick={() => setNameEditing(true)}
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "var(--flow-panel-text, #f1f5f9)",
              cursor: "pointer"
            }}
          >
            {flow.name}
          </Typography>
        )}

        <Box flex={1} />

        <Box display="flex" alignItems="center" gap={0.5}>
          <Switch size="small" checked={flow.isActive} onChange={handleToggleActive} />
          <Typography style={{ fontSize: 12.5, color: "var(--flow-panel-subtext, #94a3b8)" }}>
            {flow.isActive ? "Ativo" : "Inativo"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveRoundedIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          Salvar
        </Button>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar />

        <div ref={wrapperRef} style={{ flex: 1, minWidth: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background variant="dots" gap={18} size={1.4} color="#334155" />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) => (NODE_DEFINITIONS[n.type] || {}).color || "#64748b"}
              maskColor="rgba(11, 18, 32, 0.75)"
              style={{ background: "#0f172a" }}
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onChange={handleNodeDataChange}
            onClose={() => setSelectedNodeId(null)}
            onDelete={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
};

const FlowBuilder = () => (
  <ReactFlowProvider>
    <FlowBuilderInner />
  </ReactFlowProvider>
);

export default FlowBuilder;
