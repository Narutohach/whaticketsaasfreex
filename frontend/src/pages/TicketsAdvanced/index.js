import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "../../styles/makeStyles";
import Box from '@mui/material/Box';

import TicketsManagerTabs from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const useStyles = makeStyles(() => ({
    header: {
    },
    content: {
        overflow: "auto"
    },
    placeholderContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: theme.palette.boxticket, //DARK MODE//
    },
    placeholderItem: {
    }
}));

const TicketAdvanced = () => {
    const classes = useStyles();
    const theme = useTheme();
    const { ticketId } = useParams();
    const { currentTicket, setCurrentTicket } = useContext(TicketsContext);

    useEffect(() => {
        if (currentTicket.id !== null) {
            setCurrentTicket({ id: currentTicket.id, code: '#open' });
        }
        return () => {
            setCurrentTicket({ id: null, code: null });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TicketAdvancedLayout>
            <Box className={classes.content} style={{ flex: 1, height: "100%", overflow: "hidden" }}>
                {ticketId ? <Ticket /> : <TicketsManagerTabs />}
            </Box>
        </TicketAdvancedLayout>
    );
};

export default TicketAdvanced;
