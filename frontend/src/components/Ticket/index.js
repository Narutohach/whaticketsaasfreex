import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import clsx from "clsx";
import { toast } from "react-toastify";

import { Paper, IconButton, Tooltip } from "@mui/material";
import { makeStyles } from "../../styles/makeStyles";
import PersonIcon from "@mui/icons-material/Person";

import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactCrmPanel from "../ContactCrmPanel";
import MessageInput from "../MessageInputCustom/";
import MessagesList from "../MessagesList";
import { TagsContainer } from "../TagsContainer";
import TicketActionButtons from "../TicketActionButtonsCustom";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: 0,
    borderRight: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
  },

  crmWrapper: {
    width: 320,
    height: "100%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 20,
      boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
    },
  },

  crmWrapperClosed: {
    width: 0,
    opacity: 0,
    pointerEvents: "none",
  },

  toggleCrmBtn: {
    padding: 6,
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

const Ticket = () => {
  const { ticketId } = useParams();
  const history = useHistory();
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [crmOpen, setCrmOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/u/" + ticketId);
          const { queueId } = data;
          const { queues, profile } = user;

          const queueAllowed = queues.find((q) => q.id === queueId);
          if (queueAllowed === undefined && profile !== "admin") {
            toast.error("Acesso não permitido");
            history.push("/tickets");
            return;
          }

          setContact(data.contact);
          setTicket(data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, user, history]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on("ready", () => socket.emit("joinChatBox", `${ticket.id}`));

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === "update" && data.ticket.id === ticket.id) {
        setTicket(data.ticket);
      }

      if (data.action === "delete" && data.ticketId === ticket.id) {
        history.push("/tickets");
      }
    });

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket, history, socketManager]);

  const toggleCrm = () => {
    setCrmOpen((prev) => !prev);
  };

  const renderTicketInfo = () => {
    if (ticket.user !== undefined) {
      return (
        <TicketInfo
          contact={contact}
          ticket={ticket}
          onClick={toggleCrm}
        />
      );
    }
  };

  const renderMessagesList = () => {
    return (
      <>
        <MessagesList
          ticket={ticket}
          ticketId={ticket.id}
          isGroup={ticket.isGroup}
        />
        <MessageInput
          ticket={ticket}
          ticketId={ticket.id}
          ticketStatus={ticket.status}
        />
      </>
    );
  };

  return (
    <div className={classes.root} id="drawer-container">
      {/* Coluna 2: Chat & Conversa */}
      <Paper
        variant="outlined"
        elevation={0}
        className={classes.mainWrapper}
      >
        <TicketHeader loading={loading}>
          {renderTicketInfo()}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <TicketActionButtons ticket={ticket} />
            <Tooltip title={crmOpen ? "Ocultar CRM" : "Exibir CRM"}>
              <IconButton
                size="small"
                className={classes.toggleCrmBtn}
                onClick={toggleCrm}
              >
                <PersonIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </TicketHeader>

        <Paper square elevation={0}>
          <TagsContainer ticket={ticket} />
        </Paper>

        <ReplyMessageProvider>{renderMessagesList()}</ReplyMessageProvider>
      </Paper>

      {/* Coluna 3: Painel CRM do Lead */}
      <div
        className={clsx(classes.crmWrapper, {
          [classes.crmWrapperClosed]: !crmOpen,
        })}
      >
        <ContactCrmPanel
          contact={contact}
          ticket={ticket}
          onClose={() => setCrmOpen(false)}
        />
      </div>
    </div>
  );
};

export default Ticket;
