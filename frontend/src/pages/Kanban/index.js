import React, { useState, useEffect, useContext, useMemo } from "react";
import { makeStyles } from "../../styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import LaneTitle from "../../components/Kanban/LaneTitle";
import CardTitle from "../../components/Kanban/CardTitle";
import DeleteButton from "../../components/Kanban/DeleteButton";
import FooterButtons from "../../components/Kanban/FooterButtons";
import "./responsive.css";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    maxHeight: "calc(100vh - 48px)"
  }
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);
  
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverLane, setDragOverLane] = useState(null);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || []; 
      setTags(fetchedTags);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchTickets();
  }, []);

  const lanes = useMemo(() => [
    {
      id: "0",
      title: "Em aberto",
      firstLane: true,
      cards: tickets.filter(ticket => ticket.tags.length === 0),
    },
    ...tags.map(tag => ({
      id: tag.id.toString(),
      title: tag.name,
      color: tag.color,
      cards: tickets.filter(ticket => ticket.tags.some(t => t.id === tag.id)),
    })),
  ], [tags, tickets]);

  const handleDragStart = (event, card, laneId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify({ cardId: card.id, laneId }));
    setDraggedCard({ cardId: card.id, laneId });
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverLane(null);
  };

  const handleDrop = async (event, targetLaneId) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData("text/plain");
    const source = payload ? JSON.parse(payload) : draggedCard;

    if (source && source.laneId !== targetLaneId) {
      await handleCardMove(source.laneId, targetLaneId, source.cardId);
    }

    handleDragEnd();
  };

  const handleCardMove = async (sourceLaneId, targetLaneId, cardId) => {
    try {
      await api.delete(`/ticket-tags/${cardId}`);
      if(targetLaneId !== "0") {
        await api.put(`/ticket-tags/${cardId}/${targetLaneId}`);
      }
      toast.success('Ticket movido com sucesso');
      
      fetchTickets();
      fetchTags();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box className={classes.root} sx={{ overflowX: "auto", width: "100%" }}>
      <Box
        component="section"
        aria-label="Quadro Kanban"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          minWidth: "max-content",
          width: "100%",
          minHeight: "calc(100vh - 48px)",
          p: 1,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {lanes.map(lane => (
          <Paper
            key={lane.id}
            component="section"
            elevation={0}
            onDragOver={event => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOverLane(lane.id);
            }}
            onDragLeave={() => setDragOverLane(null)}
            onDrop={event => handleDrop(event, lane.id)}
            sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: 290, sm: 320 },
              maxHeight: "85vh",
              minHeight: 220,
              p: 1,
              gap: 1,
              flexShrink: 0,
              bgcolor: theme.palette.optionsBackground,
              border: `1px solid ${theme.palette.bordabox}`,
              borderRadius: 2,
              transition: "border-color 160ms ease, background-color 160ms ease",
              ...(dragOverLane === lane.id && {
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.action.hover,
              }),
            }}
          >
            <Box sx={{ px: 1, py: 0.5 }}>
              <LaneTitle firstLane={lane.firstLane} squareColor={lane.color} quantity={lane.cards.length}>
                {lane.title}
              </LaneTitle>
            </Box>
            <Box
              component="div"
              role="list"
              aria-label={`Tickets em ${lane.title}`}
              sx={{ overflowY: "auto", minHeight: 150, p: 0.5 }}
            >
              {lane.cards.map(ticket => (
                <Paper
                  key={ticket.id}
                  component="article"
                  role="listitem"
                  draggable
                  onDragStart={event => handleDragStart(event, ticket, lane.id)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    position: "relative",
                    mb: 1,
                    p: 1,
                    cursor: "grab",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: theme.shadows[3] },
                    "&:active": { cursor: "grabbing" },
                    ...(draggedCard?.cardId === ticket.id && { opacity: 0.45 }),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <CardTitle ticket={ticket} userProfile={user.profile} />
                    </Box>
                    <DeleteButton setTickets={setTickets} ticket={ticket} userProfile={user.profile} />
                  </Box>
                  <Box sx={{ mt: 0.5 }}>
                    <FooterButtons ticket={ticket} />
                  </Box>
                </Paper>
              ))}
              {!lane.cards.length && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                  Arraste um ticket para cá
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Kanban;
