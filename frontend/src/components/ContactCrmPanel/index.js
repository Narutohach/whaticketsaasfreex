import React, { useState, useEffect } from "react";
import { makeStyles } from "../../styles/makeStyles";
import {
  Typography,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Button,
  TextField,
  Chip,
  Tooltip,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import LabelIcon from "@mui/icons-material/Label";
import NoteIcon from "@mui/icons-material/Note";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import ContactModal from "../ContactModal";
import useTicketNotes from "../../hooks/useTicketNotes";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  crmRoot: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
    borderLeft: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  crmHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
  },
  headerTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  profileCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px 16px 16px",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.4)" : "rgba(248, 250, 252, 0.8)",
    margin: "12px",
    borderRadius: 16,
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
  },
  avatar: {
    width: 72,
    height: 72,
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: 10,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  contactName: {
    fontWeight: 700,
    fontSize: "1.05rem",
    textAlign: "center",
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
    wordBreak: "break-word",
  },
  contactNumber: {
    fontSize: "0.85rem",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  quickActions: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  actionPill: {
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "none",
  },
  section: {
    padding: "12px 16px",
  },
  sectionTitle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: 6,
    height: 24,
  },
  noteItem: {
    backgroundColor: theme.palette.mode === "dark" ? "rgba(245, 158, 11, 0.1)" : "#fffbeb",
    border: theme.palette.mode === "dark" ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid #fde68a",
    borderRadius: 8,
    padding: "8px 10px",
    marginBottom: 8,
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.7rem",
    color: theme.palette.mode === "dark" ? "#fbbf24" : "#b45309",
    fontWeight: 600,
    marginBottom: 4,
  },
  noteText: {
    fontSize: "0.8rem",
    color: theme.palette.mode === "dark" ? "#fef3c7" : "#78350f",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  noteInputRow: {
    display: "flex",
    gap: 6,
    marginTop: 8,
  },
  noteInput: {
    "& .MuiOutlinedInput-root": {
      fontSize: "0.8rem",
      borderRadius: 8,
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
    },
  },
}));

const ContactCrmPanel = ({ contact, ticket, onClose }) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const { saveNote, deleteNote, listNotes } = useTicketNotes();

  useEffect(() => {
    if (ticket?.id && ticket?.contactId) {
      loadNotes();
    }
  }, [ticket?.id, ticket?.contactId]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await listNotes({
        ticketId: ticket.id,
        contactId: ticket.contactId,
      });
      setNotes(response || []);
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setSavingNote(true);
    try {
      await saveNote({
        note: newNoteText.trim(),
        ticketId: ticket.id,
        contactId: ticket.contactId,
      });
      setNewNoteText("");
      await loadNotes();
      toast.success("Nota interna adicionada!");
    } catch (err) {
      toastError(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      await loadNotes();
      toast.info("Nota removida.");
    } catch (err) {
      toastError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const openWhatsApp = () => {
    if (contact?.number) {
      const cleanNumber = contact.number.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    }
  };

  return (
    <div className={classes.crmRoot}>
      {/* Header */}
      <div className={classes.crmHeader}>
        <Typography className={classes.headerTitle}>
          CRM & Detalhes do Lead
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      {/* Perfil */}
      <div className={classes.profileCard}>
        <Avatar
          src={contact?.profilePicUrl}
          className={classes.avatar}
          style={{
            backgroundColor: generateColor(contact?.number || "default"),
          }}
        >
          {getInitials(contact?.name)}
        </Avatar>

        <Typography className={classes.contactName}>
          {contact?.name || "Sem Nome"}
        </Typography>

        <Typography className={classes.contactNumber}>
          {contact?.number}
          <IconButton
            size="small"
            onClick={() => copyToClipboard(contact?.number)}
            title="Copiar número"
          >
            <FileCopyIcon style={{ fontSize: 13 }} />
          </IconButton>
        </Typography>

        <div className={classes.quickActions}>
          <Button
            size="small"
            variant="outlined"
            className={classes.actionPill}
            startIcon={<EditIcon style={{ fontSize: 14 }} />}
            onClick={() => setModalOpen(true)}
          >
            Editar
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            className={classes.actionPill}
            startIcon={<WhatsAppIcon style={{ fontSize: 14 }} />}
            onClick={openWhatsApp}
          >
            Chat Direto
          </Button>
        </div>
      </div>

      {/* Tags do Ticket */}
      {ticket?.tags && ticket.tags.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <LabelIcon style={{ fontSize: 16 }} /> Etiquetas Ativas
          </Typography>
          <div className={classes.tagsContainer}>
            {ticket.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                className={classes.tagChip}
                style={{
                  backgroundColor: tag.color ? `${tag.color}25` : "rgba(16, 185, 129, 0.15)",
                  color: tag.color || "#10b981",
                  border: `1px solid ${tag.color || "#10b981"}40`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Divider style={{ opacity: 0.1 }} />

      {/* Notas Internas da Equipe */}
      <div className={classes.section}>
        <Typography className={classes.sectionTitle}>
          <NoteIcon style={{ fontSize: 16 }} /> Notas Privadas (Equipe)
        </Typography>

        {loadingNotes ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : notes.length === 0 ? (
          <Typography variant="caption" style={{ color: "#94a3b8", display: "block", marginBottom: 8 }}>
            Nenhuma nota privada registrada.
          </Typography>
        ) : (
          notes.map((n) => (
            <div key={n.id} className={classes.noteItem}>
              <div className={classes.noteHeader}>
                <span>{n.user?.name || "Atendente"} • {n.createdAt ? format(parseISO(n.createdAt), "dd/MM HH:mm") : ""}</span>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteNote(n.id)}
                  style={{ padding: 2 }}
                >
                  <DeleteOutlineIcon style={{ fontSize: 14, color: "#ef4444" }} />
                </IconButton>
              </div>
              <Typography className={classes.noteText}>{n.note}</Typography>
            </div>
          ))
        )}

        <div className={classes.noteInputRow}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Adicionar nota rápida..."
            fullWidth
            className={classes.noteInput}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <IconButton
            color="primary"
            size="small"
            onClick={handleAddNote}
            disabled={savingNote || !newNoteText.trim()}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* Modal de Edição de Contato */}
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contactId={contact?.id}
      />
    </div>
  );
};

export default ContactCrmPanel;
