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
} from "@mui/material";
import { makeStyles } from "../styles/makeStyles";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

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
    height: "100vh",
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
    paddingRight: 16,
    paddingLeft: 16,
    minHeight: 56,
    color: theme.palette.mode === "light" ? "#0f172a" : "#f8fafc",
    background: theme.palette.barraSuperior,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.07)" : "1px solid rgba(255, 255, 255, 0.07)",
    boxShadow: "none",
    [theme.breakpoints.down("sm")]: {
      paddingRight: 8,
      paddingLeft: 8,
      minHeight: 52,
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
    borderRight: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.07)" : "1px solid rgba(255, 255, 255, 0.07)",
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("md")]: {
      position: "fixed",
      height: "100%",
      zIndex: theme.zIndex.drawer + 10,
    },
    ...theme.scrollbarStylesSoft
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
    }
  },
  appBarSpacer: {
    minHeight: "56px",
    flex: "none",
    [theme.breakpoints.down("sm")]: {
      minHeight: "52px",
    }
  },
  content: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
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
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
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
        <div className={classes.toolbarIcon} style={{ justifyContent: "space-between", padding: "0 12px" }}>
          {drawerOpen ? <HactoLogo size="small" light={theme.palette.mode === "light"} showTagline={false} /> : null}
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List className={classes.containerWithScroll}>
          <MainListItems drawerClose={drawerClose} collapsed={!drawerOpen} />
        </List>
        <Divider />
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

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {isMobile ? (
              <b>{user?.company?.name || "HACTO Desk"}</b>
            ) : greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                Olá <b>{user.name}</b>, Bem vindo a <b>{user?.company?.name}</b>! (Ativo até {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                Olá <b>{user.name}</b>, Bem vindo a <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {!isMobile ? (
            <>
              <IconButton edge="start" onClick={toggleColorMode}>
                {theme.mode === 'dark' ? <Brightness7Icon style={{ color: iconColor }} /> : <Brightness4Icon style={{ color: iconColor }} />}
              </IconButton>

              <NotificationsVolume
                setVolume={setVolume}
                volume={volume}
              />

              <IconButton
                onClick={handleRefreshPage}
                aria-label={i18n.t("mainDrawer.appBar.refresh")}
                color="inherit"
              >
                <CachedIcon style={{ color: iconColor }} />
              </IconButton>

              {user.id && <NotificationsPopOver volume={volume} />}

              <AnnouncementsPopover />

              <ChatPopover />

              <div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  style={{ color: iconColor }}
                >
                  <AccountCircle />
                </IconButton>
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
                >
                  <MenuItem onClick={handleOpenUserModal}>
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </MenuItem>
                  <MenuItem onClick={handleClickLogout}>
                    Sair
                  </MenuItem>
                </Menu>
              </div>
            </>
          ) : (
            <>
              {user.id && <NotificationsPopOver volume={volume} />}
              <div>
                <IconButton
                  aria-label="mais opções"
                  onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                  style={{ color: iconColor, padding: 6 }}
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
                >
                  <MenuItem onClick={() => { toggleColorMode(); setMoreMenuAnchor(null); }}>
                    {theme.mode === 'dark' ? <Brightness7Icon style={{ marginRight: 8 }} /> : <Brightness4Icon style={{ marginRight: 8 }} />}
                    {theme.mode === 'dark' ? "Modo Claro" : "Modo Escuro"}
                  </MenuItem>
                  <MenuItem onClick={() => { handleRefreshPage(); setMoreMenuAnchor(null); }}>
                    <CachedIcon style={{ marginRight: 8 }} />
                    {i18n.t("mainDrawer.appBar.refresh")}
                  </MenuItem>
                  <MenuItem onClick={() => { handleOpenUserModal(); setMoreMenuAnchor(null); }}>
                    <AccountCircle style={{ marginRight: 8 }} />
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleClickLogout(); setMoreMenuAnchor(null); }}>
                    <ExitToAppIcon style={{ marginRight: 8 }} />
                    Sair
                  </MenuItem>
                </Menu>
              </div>
            </>
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
