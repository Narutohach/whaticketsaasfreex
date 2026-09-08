import React, { useState, useEffect, useReducer, useContext, useRef } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { makeStyles } from "../../styles/makeStyles";
import Checkbox from '@mui/material/Checkbox';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";
import CancelIcon from "@mui/icons-material/Cancel";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import {CSVLink} from "react-csv";

import {
    ArrowDropDown,
    Backup,
    CloudDownload,
    ContactPhone,
} from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectAll, setSelectAll] = useState(false); // Estado para controlar se todos os checkboxes estão marcados
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [importExportAnchorEl, setImportExportAnchorEl] = useState(null);
  const fileUploadRef = useRef(null);

  
  useEffect(() => {
    if (selectAll) {
        setSelectedContacts(contacts.map((contact) => contact.id));
    } else {
        setSelectedContacts([]);
    }
}, [contacts, selectAll]);

const handleSelectAll = () => {
    setSelectAll(!selectAll); // Alterna o estado de selectAll
};


const handleCheckboxChange = (contactId) => {
  setSelectedContacts((prevSelected) => {
      if (prevSelected.includes(contactId)) {
          return prevSelected.filter((id) => id !== contactId);
      } else {
          return [...prevSelected, contactId];
      }
  });
};

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  // const handleSaveTicket = async contactId => {
  // 	if (!contactId) return;
  // 	setLoading(true);
  // 	try {
  // 		const { data: ticket } = await api.post("/tickets", {
  // 			contactId: contactId,
  // 			userId: user?.id,
  // 			status: "open",
  // 		});
  // 		history.push(`/tickets/${ticket.id}`);
  // 	} catch (err) {
  // 		toastError(err);
  // 	}
  // 	setLoading(false);
  // };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  
  const handleDeleteSelectedContacts = async () => {
    try {
        await api.delete("/contacts", { data: { contactIds: selectedContacts } });
        toast.success(i18n.t("contacts.toasts.deleted"));
        setSelectedContacts([]);
        setSelectAll(false);

        setSearchParam("");
        setPageNumber(1);
    } catch (err) {
        toastError(err);
    }
};

  
  const handleimportContact = async () => {
    try {
      if (!!fileUploadRef.current.files[0]) {
        const formData = new FormData();
        formData.append("file", fileUploadRef.current.files[0]);
        await api.request({
          url: `/contacts/upload`,
          method: "POST",
          data: formData,
        });
      } else {
        await api.post("/contacts/import");
      }
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };
  
function getDateLastMessage(contact) {
    if (!contact) return null;
    if (!contact.tickets) return null;

    if (contact.tickets.length > 0) {
        const date = new Date(contact.tickets[contact.tickets.length - 1].updatedAt);

        const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
        const month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : `0${date.getMonth() + 1}`;
        const year = date.getFullYear().toString().slice(-2);

        const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
        const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    return null;
}

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("contacts.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
          variant="contained"
          color="primary"
          onClick={handleSelectAll}
      >
          {selectAll ? "Desmarcar Todos" : "Marcar Todos"}
        </Button>

      <Can
      role={user.profile}
      perform="contacts-page:deleteContact"
      yes={() => (
          <Button
              variant="contained"
              color="primary"
              onClick={handleDeleteSelectedContacts}
          >
              {selectAll ? "Excluir Todos" : "Excluir"}
          </Button>
      )}
      />	

         <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(event) => setImportExportAnchorEl(event.currentTarget)}
                                >
                                    Importar / Exportar
                                    <ArrowDropDown />
                                </Button>
								<Menu
                                    anchorEl={importExportAnchorEl}
                                    open={Boolean(importExportAnchorEl)}
                                    onClose={() => setImportExportAnchorEl(null)}
                                >
									<MenuItem
										onClick={() => {
											setConfirmOpen(true);
											setImportExportAnchorEl(null);
										}}
									>
									<ContactPhone
                                            fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            }}
                                        />
										{i18n.t("contacts.buttons.import")}
									</MenuItem>
									<MenuItem
										onClick={() => {
											fileUploadRef.current.value = null; // Limpa o valor do input
											fileUploadRef.current.click(); // Dispara o clique no input de upload
											setImportExportAnchorEl(null); // Fecha o menu
										}}
									>
											<Backup
                                            fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            }}
                                        />
										{i18n.t("contacts.buttons.importSheet")}
									</MenuItem>
                                    <MenuItem>
                        
									<CSVLink style={{ textDecoration:'none' }} separator=";" filename={'whaticket.csv'} 
									data={contacts.map((contact) => ({ name: contact.name, number: contact.number, email: contact.email }))}>
                                        
                                        <CloudDownload fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            
                                                }}                                                
                                        />        
                                        Exportar Excel                                
                                   </CSVLink>
                                        
                                    </MenuItem>
                                </Menu>
                    </>
					
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>

        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <>
          <input
              style={{ display: "none" }}
              id="upload"
              name="file"
              type="file"
              accept=".xls,.xlsx"
              onChange={() => {
                setConfirmOpen(true);
              }}
              ref={fileUploadRef}
          />
        </>
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell padding="checkbox" align="center"/>
            <TableCell >
                {i18n.t("Foto de Perfil")}
            </TableCell>
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.whatsapp")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.email")}
              </TableCell>
              <TableCell align="center">
              {"Última Interação"}
              </TableCell>
			  <TableCell align="center">{"Status"}</TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
                            {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedContacts.includes(contact.id)}
                                            onChange={() => handleCheckboxChange(contact.id)}
                                        />
                                    </TableCell>
                                    <TableCell style={{ paddingLeft: 40 }}>
                                        {<Avatar src={contact.profilePicUrl} />}
                                    </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell align="center">{contact.number}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                                    <TableCell align="center">
                                        {getDateLastMessage(contact)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.active ? (
                                            <CheckCircleIcon
                                                style={{ color: "green" }}
                                                fontSize="small"
                                            />
                                        ) : (
                                            <CancelIcon
                                                style={{ color: "red" }}
                                                fontSize="small"
                                            />
                                        )}
                                    </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setContactTicket(contact);
                        setNewTicketModalOpen(true);
                      }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditContact(contact.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmOpen(true);
                            setDeletingContact(contact);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
