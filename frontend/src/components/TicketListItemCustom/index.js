import React, { useContext, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { format, isSameDay, parseISO } from "date-fns";
import { useHistory, useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { blue, green, grey } from "@mui/material/colors";
import { makeStyles } from "../../styles/makeStyles";
import FaceIcon from "@mui/icons-material/Face";
import { i18n } from "../../translate/i18n";

import { Chip, Tooltip } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";

import AndroidIcon from "@mui/icons-material/Android";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContactTag from "../ContactTag";
import TicketMessagesDialog from "../TicketMessagesDialog";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    borderRadius: 10,
    margin: "3px 6px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
      transform: "translateX(2px)",
    },
  },

  pendingTicket: {
    cursor: "unset",
  },
  queueTag: {
    background: theme.palette.mode === "dark" ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    marginRight: 4,
    padding: "2px 6px",
    fontWeight: 700,
    borderRadius: 6,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "10px",
    left: "20px",
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    marginRight: 4,
    padding: "2px 6px",
    fontWeight: 700,
    borderRadius: 6,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "5px",
    minWidth: 0,
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -21,
    background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    borderRadius: 6,
    padding: "2px 6px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "0%",
    marginLeft: "5px",
  },

  listItemText: {
    minWidth: 0,
    paddingRight: 64,
  },


  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  avatarContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    minWidth: 56,
  },
  actionButtonsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 4,
    width: "100%",
  },
  ticketActionButtonAccept: {
    backgroundColor: "#10b981 !important",
    color: "#ffffff !important",
    borderRadius: "6px !important",
    fontSize: "0.65rem !important",
    fontWeight: "700 !important",
    padding: "2px 4px !important",
    minHeight: "18px !important",
    minWidth: "50px !important",
    textTransform: "none !important",
    boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3) !important",
    "&:hover": {
      backgroundColor: "#059669 !important",
    },
  },
  ticketActionButtonClose: {
    backgroundColor: "#ef4444 !important",
    color: "#ffffff !important",
    borderRadius: "6px !important",
    fontSize: "0.65rem !important",
    fontWeight: "700 !important",
    padding: "2px 4px !important",
    minHeight: "18px !important",
    minWidth: "50px !important",
    textTransform: "none !important",
    boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3) !important",
    "&:hover": {
      backgroundColor: "#dc2626 !important",
    },
  },
  ticketActionButtonTransfer: {
    backgroundColor: "#1677ff !important",
    color: "#ffffff !important",
    borderRadius: "6px !important",
    fontSize: "0.65rem !important",
    fontWeight: "700 !important",
    padding: "2px 4px !important",
    minHeight: "18px !important",
    minWidth: "50px !important",
    textTransform: "none !important",
    boxShadow: "0 1px 3px rgba(22, 119, 255, 0.3) !important",
    "&:hover": {
      backgroundColor: "#0284c7 !important",
    },
  },
  ticketActionButtonReopen: {
    backgroundColor: "#f59e0b !important",
    color: "#ffffff !important",
    borderRadius: "6px !important",
    fontSize: "0.65rem !important",
    fontWeight: "700 !important",
    padding: "2px 4px !important",
    minHeight: "18px !important",
    minWidth: "50px !important",
    textTransform: "none !important",
    boxShadow: "0 1px 3px rgba(245, 158, 11, 0.3) !important",
    "&:hover": {
      backgroundColor: "#d97706 !important",
    },
  },


  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13
  },
  secondaryContentSecond: {
    display: 'flex',
    // marginTop: 5,
    //marginLeft: "5px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
    presence: {
    color: theme?.mode === 'light' ? "blue" : "lightgreen",
    fontWeight: "bold",
  }
}));
  {/*INSERIDO O dentro do const handleChangeTab*/}
  const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [ticketQueueName, setTicketQueueName] = useState(null);
  const [ticketQueueColor, setTicketQueueColor] = useState(null);
  const [tag, setTag] = useState([]);
  const [whatsAppName, setWhatsAppName] = useState(null);
  const [lastInteractionLabel, setLastInteractionLabel] = useState('');
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const [verpreview, setverpreview] = useState(false);
  const { profile } = user;
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const presenceMessage = { composing: "Digitando...", recording: "Gravando..." };
  
  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name?.toUpperCase());
    }
    setTicketQueueName(ticket.queue?.name?.toUpperCase());
    setTicketQueueColor(ticket.queue?.color);

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name?.toUpperCase());
    }

    setTag(ticket?.tags);

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  {/*CÓDIGO NOVO SAUDAÇÃO*/}
  const handleCloseTicket = async (id) => {
    setTag(ticket?.tags);
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  useEffect(() => {
    const renderLastInteractionLabel = () => {
      let labelColor = '';
      let labelText = '';

      if (!ticket.lastMessage) return '';

      const lastInteractionDate = parseISO(ticket.updatedAt);
      const currentDate = new Date();
      const timeDifference = currentDate - lastInteractionDate;
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));


      if (minutesDifference >= 3 && minutesDifference <= 10) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = 'green';
      } else if (minutesDifference >= 30 && minutesDifference < 60) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = 'Orange';
      } else if (minutesDifference > 60  && hoursDifference < 24) {
        labelText = `(${hoursDifference} h atrás)`;
        labelColor = 'red';
      } else if (hoursDifference >= 24) {
        labelText = `(${Math.floor(hoursDifference / 24)} dias atrás)`;
        labelColor = 'red';
      }


      return { labelText, labelColor };
    };

    // Função para atualizar o estado do componente
    const updateLastInteractionLabel = () => {
      const { labelText, labelColor } = renderLastInteractionLabel();
      setLastInteractionLabel(
        <Badge
          className={classes.lastInteractionLabel}
          style={{ color: labelColor }}
        >
          {labelText}
        </Badge>
      );
      // Agendando a próxima atualização após 30 segundos
      setTimeout(updateLastInteractionLabel, 30 * 1000);
    };

    // Inicializando a primeira atualização
    updateLastInteractionLabel();

  }, [ticket]); // Executando apenas uma vez ao montar o componente

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

    const handleAcepptTicket = async (id) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${id}`, {
                status: "open",
                userId: user?.id,
            });
            
            let settingIndex;

            try {
                const { data } = await api.get("/settings/");
                
                settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
                
            } catch (err) {
                toastError(err);
                   
            }
            
            if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
                handleSendMessage(ticket.id);
                
            }

        } catch (err) {
            setLoading(false);
            
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }

        // handleChangeTab(null, "tickets");
        // handleChangeTab(null, "open");
        history.push(`/tickets/${ticket.uuid}`);
    };
	
	    const handleSendMessage = async (id) => {
        
        const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
        const message = {
            read: 1,
            fromMe: true,
            mediaUrl: "",
            body: `*Mensagem Automática:*\n${msg.trim()}`,
        };
        try {
            await api.post(`/messages/${id}`, message);
        } catch (err) {
            toastError(err);
            
        }
    };
	{/*CÓDIGO NOVO SAUDAÇÃO*/}

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };


  const renderTicketInfo = () => {
    if (ticketUser) {

      return (
        <>
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {/* </span> */}
        </>
      );
    } else {
      return (
        <>
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}
        </>
      );
    }
  };

  const handleOpenTransferModal = () => {
    setTransferTicketModalOpen(true);
  }

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  return (
    <React.Fragment key={ticket.id}>

    <TransferTicketModalCustom
    modalOpen={transferTicketModalOpen}
    onClose={handleCloseTransferTicketModal}
    ticketid={ticket.id}
  />

      <TicketMessagesDialog
        open={openTicketMessageDialog}

        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem dense button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip arrow placement="right" title={ticket.queue?.name?.toUpperCase() || "SEM FILA"} >
          <span style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }} className={classes.ticketQueueColor}></span>
        </Tooltip>
        <ListItemAvatar className={classes.avatarContainer}>
          <Avatar
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              backgroundColor: generateColor(ticket?.contact?.number),
            }}
            src={ticket?.contact?.profilePicUrl}
          >
            {getInitials(ticket?.contact?.name || "")}
          </Avatar>

          {ticket.status === "pending" && (
            <div className={classes.actionButtonsWrapper}>
              <ButtonWithSpinner
                className={classes.ticketActionButtonAccept}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleAcepptTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.accept")}
              </ButtonWithSpinner>
              <ButtonWithSpinner
                className={classes.ticketActionButtonClose}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleCloseTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.closed")}
              </ButtonWithSpinner>
            </div>
          )}

          {ticket.status === "attending" && (
            <div className={classes.actionButtonsWrapper}>
              <ButtonWithSpinner
                className={classes.ticketActionButtonAccept}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleAcepptTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.accept")}
              </ButtonWithSpinner>
              <ButtonWithSpinner
                className={classes.ticketActionButtonClose}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleCloseTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.closed")}
              </ButtonWithSpinner>
            </div>
          )}

          {ticket.status !== "closed" && ticket.status !== "pending" && ticket.status !== "attending" && (
            <div className={classes.actionButtonsWrapper}>
              <ButtonWithSpinner
                className={classes.ticketActionButtonTransfer}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleOpenTransferModal();
                }}
              >
                {i18n.t("ticketsList.buttons.transfer")}
              </ButtonWithSpinner>
              <ButtonWithSpinner
                className={classes.ticketActionButtonClose}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleCloseTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.closed")}
              </ButtonWithSpinner>
            </div>
          )}

          {ticket.status === "closed" && (
            <div className={classes.actionButtonsWrapper}>
              <ButtonWithSpinner
                className={classes.ticketActionButtonReopen}
                size="small"
                loading={loading}
                onClick={e => {
                  e.stopPropagation();
                  handleReopenTicket(ticket.id);
                }}
              >
                {i18n.t("ticketsList.buttons.reopen")}
              </ButtonWithSpinner>
            </div>
          )}
        </ListItemAvatar>
        <ListItemText
          disableTypography
          className={classes.listItemText}

          primary={
            <span className={classes.contactNameWrapper}>
            <Typography
            noWrap
            component='span'
            variant='body2'
            color='textPrimary'
          >
            <strong>{ticket.contact.name} {lastInteractionLabel}</strong>
        <ListItemSecondaryAction>
          <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
        </ListItemSecondaryAction>
                {profile === "admin" && (
                  <Tooltip title="Espiar Conversa">
                    <VisibilityIcon
                      onClick={() => setOpenTicketMessageDialog(true)}
                      fontSize="small"
                      style={{
                        color: blue[700],
                        cursor: "pointer",
                        marginLeft: 10,
                        verticalAlign: "middle"
                      }}
                    />
                  </Tooltip>
                )}
              </Typography>
        </span>

          }
          secondary={
            <span className={classes.contactNameWrapper}>

              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {["composing", "recording"].includes(ticket?.presence) ? (
                  <span className={classes.presence}>
                    {presenceMessage[ticket.presence]}
                  </span>
                ) : (
                  <>
                    {ticket.lastMessage.includes('data:image/png;base64') ? <MarkdownWrapper> Localização</MarkdownWrapper> : <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>}
                  </>
                )}

                <span style={{ marginTop: 4, }} className={classes.secondaryContentSecond} >
                  {ticket?.whatsapp?.name ? <Badge className={classes.connectionTag}>{ticket?.whatsapp?.name?.toUpperCase()}</Badge> : <br></br>}
                  {ticketUser ? <Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticketUser}</Badge> : <br></br>}				  
                  <Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c", color: "#ffffff" }} className={classes.connectionTag}>{ticket.queue?.name?.toUpperCase() || "SEM FILA"}</Badge>
                </span>

                {/* <span style={{ marginTop: 2, fontSize: 5 }} className={classes.secondaryContentSecond} >
                  {ticket?.whatsapp?.name ? <Badge className={classes.connectionTag}>{ticket?.whatsapp?.name?.toUpperCase()}</Badge> : <br></br>}
                </span> */}

                {/*<span style={{ marginTop: 4, fontSize: 5 }} className={classes.secondaryContentSecond} >
                  {ticketUser ? <Chip size="small" icon={<FaceIcon />} label={ticketUser} variant="outlined" /> : <br></br>}
                </span>*/}

                <span style={{ paddingTop: "2px" }} className={classes.secondaryContentSecond} >
                  {tag?.map((tag) => {
                    return (
                      <ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
                    );
                  })}
                </span>

              </Typography>

              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </span>
          }

        />
        <ListItemSecondaryAction>
          {ticket.lastMessage && (
            <>

              <Typography
                className={classes.lastMessageTime}
                component="span"
                variant="body2"
                color="textSecondary"
              >

                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>

              <br />

            </>
          )}

        </ListItemSecondaryAction>
      </ListItem>

      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
