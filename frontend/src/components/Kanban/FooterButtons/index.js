import { IconButton, Tooltip } from "@mui/material";
import { makeStyles } from "../../../styles/makeStyles";
import React, { useState } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ScheduleModal from "../../ScheduleModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ContactNotesDialog from "../../ContactNotesDialog";

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        alignItems: "center"
    }
  }));

export default function FooterButtons({ticket}) {
    const classes = useStyles();
    const color = "#4d4d4d"
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactNotesModal, setContactNotesModal] = useState(false)
    const history = useHistory();

    const handleOpenScheduleModal = () => {
        setScheduleModalOpen(true);
    };

    const handleOpenContactNotesModal = () => {
        setContactNotesModal(true)
    }

    const handleCloseContactNotesModal = () => {
        setContactNotesModal(false)
    }

    const handleCloseScheduleModal = () => {
        setScheduleModalOpen(false);
    };

    const handleSelectTicket = () => {
        history.push(`/tickets/${ticket.uuid}`);
    };

    return (
        <>
            <ContactNotesDialog modalOpen={contactNotesModal} onClose={handleCloseContactNotesModal} ticket={ticket} />
            <div className={classes.container}>
                <Tooltip title="Anotações">
                <IconButton onClick={handleOpenContactNotesModal} size="small">
                    <MenuBookIcon style={{ color }} fontSize="small" />
                </IconButton>
                </Tooltip>
                <Tooltip title="Criar agendamento">
                    <IconButton onClick={handleOpenScheduleModal} size="small">
                        <CalendarTodayIcon style={{ color }} fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Ir para conversa">   
                    <IconButton onClick={handleSelectTicket} size="small">
                        <WhatsAppIcon style={{color: color}} fontSize="small" />
                    </IconButton>
                </Tooltip>

                <ScheduleModal
                    open={scheduleModalOpen}
                    onClose={handleCloseScheduleModal}
                    aria-labelledby="form-dialog-title"
                    contactId={ticket.contact.id}
                />
            </div>
        </>
    )
}
