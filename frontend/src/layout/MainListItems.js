import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import clsx from "clsx";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import { Badge, Collapse, List } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from '@mui/icons-material/Search';
import SchemaOutlinedIcon from '@mui/icons-material/SchemaOutlined';
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/ListAlt";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ForumIcon from "@mui/icons-material/Forum";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import LogoutIcon from "@mui/icons-material/Logout";
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import LoyaltyRoundedIcon from '@mui/icons-material/LoyaltyRounded';
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import TableChartIcon from '@mui/icons-material/TableChart';
import api from "../services/api";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ToDoList from "../pages/ToDoList/";
import toastError from "../errors/toastError";
import { makeStyles } from "../styles/makeStyles";
import { AllInclusive, AttachFile, BlurCircular, Description, DeviceHubOutlined, Schedule } from '@mui/icons-material';
import usePlans from "../hooks/usePlans";
import Typography from "@mui/material/Typography";
import useVersion from "../hooks/useVersion";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    position: "static !important",
    height: "auto",
    padding: "16px 12px 4px 12px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "0.66rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: theme.palette.mode === "light" ? "#64748b" : "#64748b",
    backgroundColor: "transparent !important",
    lineHeight: "1.4",
  },
  menuItem: {
    borderRadius: 10,
    margin: "2px 4px",
    padding: "7px 12px",
    color: theme.palette.mode === "light" ? "#475569" : "#94a3b8",
    transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.05)",
      color: theme.palette.mode === "light" ? "#0f172a" : "#ffffff",
      transform: "translateX(2px)",
      "& .MuiListItemIcon-root": {
        color: theme.palette.mode === "light" ? "#10b981" : "#ffffff",
      },
    },
  },
  menuItemActive: {
    backgroundColor: theme.palette.mode === "light" ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.12)",
    color: "#10b981 !important",
    fontWeight: 700,
    border: theme.palette.mode === "light" ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(16, 185, 129, 0.22)",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "22%",
      bottom: "22%",
      width: 3.5,
      borderRadius: "0 4px 4px 0",
      backgroundColor: "#10b981",
      boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)",
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "rgba(16, 185, 129, 0.14)" : "rgba(16, 185, 129, 0.16)",
      transform: "none",
    },
  },
  menuIcon: {
    minWidth: 34,
    color: theme.palette.mode === "light" ? "#64748b" : "#64748b",
    transition: "color 0.18s ease",
    "& svg": {
      fontSize: "1.25rem",
    },
  },
  menuIconActive: {
    color: "#10b981 !important",
  },
  menuText: {
    fontSize: "0.85rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  menuTextActive: {
    fontWeight: 700,
    color: "#10b981 !important",
  },
  logoutButton: {
    borderRadius: 10,
    margin: "12px 4px 4px 4px",
    padding: "8px 12px",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& .MuiListItemIcon-root": {
      minWidth: 34,
      color: "#ef4444",
    },
    "& .MuiListItemText-primary": {
      fontSize: "0.85rem",
      fontWeight: 600,
    },
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.16)",
      borderColor: "rgba(239, 68, 68, 0.3)",
      color: "#f87171",
      transform: "translateX(2px)",
      "& .MuiListItemIcon-root": {
        color: "#f87171",
      },
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;
  const location = useLocation();
  const isActive = location.pathname === to;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li style={{ listStyle: "none" }}>
      <ListItemButton
        dense
        component={renderLink}
        className={clsx(classes.menuItem, isActive && classes.menuItemActive, className)}
      >
        {icon ? <ListItemIcon className={clsx(classes.menuIcon, isActive && classes.menuIconActive)}>{icon}</ListItemIcon> : null}
        <ListItemText
          primary={primary}
          classes={{
            primary: clsx(classes.menuText, isActive && classes.menuTextActive)
          }}
        />
      </ListItemButton>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false); const history = useHistory();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);


  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();
  
  const [version, setVersion] = useState(false);
  
  
  const { getVersion } = useVersion();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const companyId = user.companyId;
    if (!companyId) {
      // AuthContext ainda não carregou o usuário (ex.: montagem inicial ou
      // logo após expirar o token) — tentar de novo assim que companyId
      // existir, em vez de mandar "undefined" pra URL.
      return;
    }

    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.companyId]);



  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform={"drawer-service-items:view"}
        no={() => (
          <>
            <ListSubheader
              hidden={collapsed}
              className={classes.ListSubheader}
              disableSticky
              color="inherit">
              {i18n.t("Atendimento")}
            </ListSubheader>
            <>

              <ListItemLink
                to="/tickets"
                primary={i18n.t("mainDrawer.listItems.tickets")}
                icon={<WhatsAppIcon />}
              />
              <ListItemLink
                to="/quick-messages"
                primary={i18n.t("mainDrawer.listItems.quickMessages")}
                icon={<FlashOnIcon />}
              />
              {showKanban && (
                <ListItemLink
                  to="/kanban"
                  primary="Kanban"
                  icon={<LoyaltyRoundedIcon />}
                />
              )}
              <ListItemLink
                to="/todolist"
                primary={i18n.t("Tarefas")}
                icon={<BorderColorIcon />}
              />
              <ListItemLink
                to="/contacts"
                primary={i18n.t("mainDrawer.listItems.contacts")}
                icon={<ContactPhoneOutlinedIcon />}
              />
              {showSchedules && (
                <>
                  <ListItemLink
                    to="/schedules"
                    primary={i18n.t("mainDrawer.listItems.schedules")}
                    icon={<Schedule />}
                  />
                </>
              )}
              <ListItemLink
                to="/tags"
                primary={i18n.t("mainDrawer.listItems.tags")}
                icon={<LocalOfferIcon />}
              />
              {showInternalChat && (
                <>
                  <ListItemLink
                    to="/chats"
                    primary={i18n.t("mainDrawer.listItems.chats")}
                    icon={
                      <Badge color="secondary" variant="dot" invisible={invisible}>
                        <ForumIcon />
                      </Badge>
                    }
                  />
                </>
              )}
              <ListItemLink
                to="/helps"
                primary={i18n.t("mainDrawer.listItems.helps")}
                icon={<HelpOutlineIcon />}
              />
            </>
          </>
        )}
      />

      <Can
        role={user.profile}
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <ListSubheader
              hidden={collapsed}
              className={classes.ListSubheader}
              disableSticky
              color="inherit">
              {i18n.t("Gerência")}
            </ListSubheader>

            <ListItemLink
              small
              to="/"
              primary="Dashboard"
              icon={<DashboardOutlinedIcon />}
            />
			
			<ListItemLink
				to="/relatorios"
				primary={i18n.t("Relátorios")}
				icon={<SearchIcon />}
			/>
			
          </>
        )}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>

            {showCampaigns && (
              <>
                <ListSubheader
                  hidden={collapsed}
                  className={classes.ListSubheader}
                  disableSticky
                  color="inherit">
                  {i18n.t("Campanhas")}
                </ListSubheader>

                <ListItemLink
                  small
                  to="/campaigns"
                  primary={i18n.t("Listagem")}
                  icon={<ListIcon />}
                />

                <ListItemLink
                  small
                  to="/contact-lists"
                  primary={i18n.t("Listas de Contatos")}
                  icon={<PeopleIcon />}
                />


                <ListItemLink
                  small
                  to="/campaigns-config"
                  primary={i18n.t("Configurações")}
                  icon={<ListIcon />}
                />


                {/** 
                <ListItem
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon>
                    <EventAvailableIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </ListItem>

                    <ListItem
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>

                    <ListItem
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon>
                        <SettingsOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>

                  </List>
                </Collapse>
                */}
              </>
            )}

            <ListSubheader
              hidden={collapsed}
              className={classes.ListSubheader}
              disableSticky
              color="inherit">
              {i18n.t("Administração")}
            </ListSubheader>

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AnnouncementIcon />}
              />
            )}
			
			
            {showOpenAi && (
              <ListItemLink
                to="/prompts"
                primary={i18n.t("mainDrawer.listItems.prompts")}
                icon={<AllInclusive />}
              />
            )}

            {showIntegrations && (
              <ListItemLink
                to="/queue-integration"
                primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                icon={<DeviceHubOutlined />}
              />
            )}
            <ListItemLink
              to="/flows"
              primary="Fluxos"
              icon={<SchemaOutlinedIcon />}
            />
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <SyncAltIcon />
                </Badge>
              }
            />
            <ListItemLink
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<AttachFile />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon />}
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
            />
            {showExternalApi && (
              <>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<CodeRoundedIcon />}
                />
              </>
            )}
            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<LocalAtmIcon />}
            />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
            />
			
		{user.super && (	
			<ListSubheader
              hidden={collapsed}
              className={classes.ListSubheader}
              disableSticky
              color="inherit">
              {i18n.t("Sistema")}
            </ListSubheader>
			)}

            {!collapsed && (
              <React.Fragment>
                <Divider />
              {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
              <Typography style={{ fontSize: "12px", padding: "10px", textAlign: "right", fontWeight: "bold" }}>
                V: {`${version}`}

                </Typography>
              </React.Fragment>
            )}
          </>
        )}
      />
	  <Divider />
	  <ListItemButton
        component="li"
        dense
        onClick={handleClickLogout}
        className={classes.logoutButton}
      >
        <ListItemIcon>
          <LogoutIcon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText primary={i18n.t("Sair")} />
      </ListItemButton>
    </div>
  );
};

export default MainListItems;
