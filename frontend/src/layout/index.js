import React, { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import moment from "moment";
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import { makeStyles } from "../styles/makeStyles";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EventIcon from "@mui/icons-material/Event";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import DarkMode from "../components/DarkMode";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

//import logo from "../assets/logo.png";
import { SocketContext } from "../context/Socket/SocketContext";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";

import ColorModeContext from "../layout/themeContext";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HactoLogo from "../components/Logo";
import CommandPalette from "../components/CommandPalette";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    // 100vh não desconta a barra de endereço dinâmica dos navegadores
    // mobile — o app abre com uma faixa de altura invisível/inacessível
    // (e o scroll interno de páginas como o Dashboard fica preso atrás
    // dela). 100dvh corrige isso; suporte já é universal nos navegadores
    // que este projeto roda (Safari 15.4+, Chrome 108+, Firefox 101+).
    height: "100dvh",
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.fancyBackground,
    '& .MuiButton-outlinedPrimary': {
      color: '#FFFFFF',
      backgroundColor: theme.mode === 'light' ? '#059669' : '#1e293b',
    },
    '& .MuiTab-textColorPrimary.Mui-selected': {
      color: theme.mode === 'light' ? '#059669' : '#34d399',
    }
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 20,
    paddingLeft: 20,
    minHeight: 60,
    height: 60,
    color: theme.palette.mode === "light" ? "#0f172a" : "#f8fafc",
    backgroundColor: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(9, 13, 22, 0.82)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.07)" : "1px solid rgba(255, 255, 255, 0.06)",
    boxShadow: "none",
    gap: 8,
    "& .MuiIconButton-root": {
      width: 36,
      height: 36,
      borderRadius: 10,
      color: theme.palette.mode === "light" ? "#475569" : "#94a3b8",
      backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)",
      border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid rgba(255, 255, 255, 0.06)",
      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        color: theme.palette.mode === "light" ? "#0f172a" : "#ffffff",
        backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
        borderColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.15)",
        transform: "translateY(-1px)",
      },
      "& svg": {
        fontSize: "1.2rem",
      },
    },
    [theme.breakpoints.down("sm")]: {
      paddingRight: 10,
      paddingLeft: 10,
      minHeight: 54,
      height: 54,
    }
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    minHeight: "56px",
    borderBottom: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid rgba(255, 255, 255, 0.06)",
    [theme.breakpoints.down("sm")]: {
      height: "52px",
      minHeight: "52px"
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: "none",
    backgroundColor: "transparent",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("md")]: {
      zIndex: theme.zIndex.appBar,
    }
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
      width: "100%",
    }
  },
  menuButton: {
    marginRight: 12,
    color: theme.palette.mode === "light" ? "#0f172a" : "#f8fafc",
    [theme.breakpoints.down("sm")]: {
      marginRight: 6,
      padding: 6,
    }
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 15,
    fontWeight: 700,
    color: theme.palette.mode === "light" ? "#0f172a" : "#f8fafc",
    letterSpacing: "-0.3px",
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    }
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    borderRight: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.06)",
    backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#090d16",
    backgroundImage: theme.palette.mode === "dark" 
      ? "linear-gradient(180deg, rgba(16, 185, 129, 0.02) 0%, rgba(9, 13, 22, 1) 100%)"
      : "none",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("md")]: {
      position: "fixed",
      height: "100%",
      zIndex: theme.zIndex.drawer + 10,
    },
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    [theme.breakpoints.down("md")]: {
      width: 0,
      display: "none",
    },
    "& .MuiListItemText-root": {
      display: "none !important",
      opacity: "0 !important",
      width: "0 !important",
      visibility: "hidden !important",
    },
    "& .MuiListSubheader-root": {
      display: "none !important",
    },
    "& .MuiList-root": {
      paddingLeft: "0 !important",
      paddingRight: "0 !important",
    },
  },
  appBarSpacer: {
    minHeight: "60px",
    flex: "none",
    [theme.breakpoints.down("sm")]: {
      minHeight: "54px",
    }
  },
  content: {
    flex: 1,
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  containerWithScroll: {
    flex: 1,
    padding: "6px 6px 36px 6px",
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.09)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(16, 185, 129, 0.4)",
    },
  },
  NotificationsPopOver: {
    // color: theme.barraSuperior.secondary.main,
  },
  logo: {
    width: "80%",
    height: "auto",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "80%",
      maxWidth: 180,
    },
    logo: theme.logo
  },
}));

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  // const [dueDate, setDueDate] = useState("");
  const { user } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);
  const iconColor = theme.palette.mode === "light" ? "#0f172a" : "#f8fafc";

  // Definindo os logos para modo claro e escuro
  const logoLight = `${import.meta.env.REACT_APP_BACKEND_URL}/public/logotipos/interno.png`;
  const logoDark = `${import.meta.env.REACT_APP_BACKEND_URL}/public/logotipos/logo_w.png`;

  // Definindo o logo inicial com base no modo de tema atual
  const initialLogo = theme.palette.mode === 'light' ? logoLight : logoDark;
  const [logoImg, setLogoImg] = useState(initialLogo);


  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();


  //################### CODIGOS DE TESTE #########################################
  // useEffect(() => {
  //   navigator.getBattery().then((battery) => {
  //     console.log(`Battery Charging: ${battery.charging}`);
  //     console.log(`Battery Level: ${battery.level * 100}%`);
  //     console.log(`Charging Time: ${battery.chargingTime}`);
  //     console.log(`Discharging Time: ${battery.dischargingTime}`);
  //   })
  // }, []);

  // useEffect(() => {
  //   const geoLocation = navigator.geolocation

  //   geoLocation.getCurrentPosition((position) => {
  //     let lat = position.coords.latitude;
  //     let long = position.coords.longitude;

  //     console.log('latitude: ', lat)
  //     console.log('longitude: ', long)
  //   })
  // }, []);

  // useEffect(() => {
  //   const nucleos = window.navigator.hardwareConcurrency;

  //   console.log('Nucleos: ', nucleos)
  // }, []);

  // useEffect(() => {
  //   console.log('userAgent', navigator.userAgent)
  //   if (
  //     navigator.userAgent.match(/Android/i)
  //     || navigator.userAgent.match(/webOS/i)
  //     || navigator.userAgent.match(/iPhone/i)
  //     || navigator.userAgent.match(/iPad/i)
  //     || navigator.userAgent.match(/iPod/i)
  //     || navigator.userAgent.match(/BlackBerry/i)
  //     || navigator.userAgent.match(/Windows Phone/i)
  //   ) {
  //     console.log('é mobile ', true) //celular
  //   }
  //   else {
  //     console.log('não é mobile: ', false) //nao é celular
  //   }
  // }, []);
  //##############################################################################

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (!isTablet) {
      setDrawerOpen(true);
      setDrawerVariant("permanent");
    } else {
      setDrawerOpen(false);
      setDrawerVariant("temporary");
    }
  }, [isTablet]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [socketManager]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (isTablet) {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  }

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    // Atualiza o logo sempre que o modo do tema muda
    setLogoImg(theme.palette.mode === 'light' ? logoLight : logoDark);
  }, [theme.palette.mode]);

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
    setLogoImg((prevLogo) => (prevLogo === logoLight ? logoDark : logoLight));
  };

  if (loading) {
    return <BackdropLoading />;
  }


  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
        onClose={drawerClose}
        ModalProps={{ keepMounted: true }}
      >
        <div 
          className={classes.toolbarIcon} 
          style={{ 
            justifyContent: drawerOpen ? "space-between" : "center", 
            padding: drawerOpen ? "0 14px" : "0", 
            minHeight: 60 
          }}
        >
          {drawerOpen ? <HactoLogo size="small" light={theme.palette.mode === "light"} showTagline={false} /> : null}
          <IconButton 
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{
              color: theme.palette.mode === "light" ? "#64748b" : "#94a3b8",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              p: 0.7,
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(255, 255, 255, 0.15)",
              },
            }}
          >
            {drawerOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          <MainListItems drawerClose={drawerClose} collapsed={!drawerOpen} />
        </List>
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && !isTablet && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && !isTablet && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography
              component="h1"
              variant="body1"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: "0.88rem",
                color: theme.palette.mode === "light" ? "#1e293b" : "#f1f5f9",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: 0.6,
              }}
            >
              <span>Olá,</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>{user?.name || "Usuário"}</span>
            </Typography>

            <Box
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                alignItems: "center",
                gap: 0.7,
                px: 1.2,
                py: 0.35,
                borderRadius: "20px",
                backgroundColor: theme.palette.mode === "light" ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#10b981",
                whiteSpace: "nowrap",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                }}
              />
              {user?.company?.name || "HACTO Desk"}
            </Box>

            {user?.profile === "admin" && user?.company?.dueDate && (
              <Box
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.3,
                  borderRadius: "8px",
                  backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                  border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.07)" : "1px solid rgba(255, 255, 255, 0.07)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: theme.palette.mode === "light" ? "#64748b" : "#94a3b8",
                  whiteSpace: "nowrap",
                }}
              >
                <EventIcon sx={{ fontSize: 13, color: "#10b981" }} />
                <span>Ativo até {dateToClient(user?.company?.dueDate)}</span>
              </Box>
            )}
          </Box>

          {!isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Tooltip title={theme.mode === 'dark' ? "Modo Claro" : "Modo Escuro"} arrow>
                <IconButton onClick={toggleColorMode}>
                  {theme.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Volume das notificações" arrow>
                <div>
                  <NotificationsVolume
                    setVolume={setVolume}
                    volume={volume}
                  />
                </div>
              </Tooltip>

              <Tooltip title={i18n.t("mainDrawer.appBar.refresh")} arrow>
                <IconButton
                  onClick={handleRefreshPage}
                  aria-label={i18n.t("mainDrawer.appBar.refresh")}
                >
                  <CachedIcon />
                </IconButton>
              </Tooltip>

              {user.id && (
                <Tooltip title="Notificações de tickets" arrow>
                  <div>
                    <NotificationsPopOver volume={volume} />
                  </div>
                </Tooltip>
              )}

              <Tooltip title="Avisos do sistema" arrow>
                <div>
                  <AnnouncementsPopover />
                </div>
              </Tooltip>

              <Tooltip title="Chat interno" arrow>
                <div>
                  <ChatPopover />
                </div>
              </Tooltip>

              <Box sx={{ width: "1px", height: 20, mx: 0.5, backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)" }} />

              <Box
                onClick={handleMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  p: "3px 8px 3px 4px",
                  borderRadius: "20px",
                  backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.04)",
                  border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(16, 185, 129, 0.4)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: theme.palette.mode === "light" ? "#334155" : "#e2e8f0",
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name?.split(" ")[0]}
                </Typography>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: theme.palette.mode === "light" ? "#94a3b8" : "#64748b" }} />
              </Box>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={menuOpen}
                onClose={handleCloseMenu}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 190,
                    borderRadius: "12px",
                    backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#0d111b",
                    border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: theme.palette.mode === "light" 
                      ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                      : "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
                    "& .MuiMenuItem-root": {
                      fontSize: "0.85rem",
                      py: 1,
                      px: 1.5,
                      gap: 1.2,
                      borderRadius: "8px",
                      mx: 0.5,
                      my: 0.2,
                      "&:hover": {
                        backgroundColor: theme.palette.mode === "light" ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.06)",
                      },
                    },
                  },
                }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>
                    {user?.profile === "admin" ? "Administrador" : "Usuário"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5, borderColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)" }} />
                <MenuItem onClick={handleOpenUserModal}>
                  <PersonIcon sx={{ fontSize: 18, color: "#10b981" }} />
                  {i18n.t("mainDrawer.appBar.user.profile")}
                </MenuItem>
                <MenuItem onClick={handleClickLogout} sx={{ color: "#ef4444" }}>
                  <LogoutIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                  {i18n.t("Sair")}
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {user.id && <NotificationsPopOver volume={volume} />}
              <div>
                <IconButton
                  aria-label="mais opções"
                  onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                  style={{ padding: 6 }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="mobile-more-menu"
                  anchorEl={moreMenuAnchor}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={moreMenuOpen}
                  onClose={() => setMoreMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#0d111b",
                      border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      "& .MuiMenuItem-root": {
                        gap: 1.2,
                        py: 1,
                      },
                    }
                  }}
                >
                  <MenuItem onClick={() => { toggleColorMode(); setMoreMenuAnchor(null); }}>
                    {theme.mode === 'dark' ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
                    {theme.mode === 'dark' ? "Modo Claro" : "Modo Escuro"}
                  </MenuItem>
                  <MenuItem onClick={() => { handleRefreshPage(); setMoreMenuAnchor(null); }}>
                    <CachedIcon sx={{ fontSize: 18 }} />
                    {i18n.t("mainDrawer.appBar.refresh")}
                  </MenuItem>
                  <MenuItem onClick={() => { handleOpenUserModal(); setMoreMenuAnchor(null); }}>
                    <PersonIcon sx={{ fontSize: 18, color: "#10b981" }} />
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => { handleClickLogout(); setMoreMenuAnchor(null); }} sx={{ color: "#ef4444" }}>
                    <LogoutIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                    Sair
                  </MenuItem>
                </Menu>
              </div>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <CommandPalette />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
