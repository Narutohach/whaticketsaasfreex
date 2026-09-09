import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import ColorModeContext from "./layout/themeContext";
import { emotionCache } from "./styles/emotionCache";
import { SocketContext, SocketManager } from './context/Socket/SocketContext';

import Routes from "./routes";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import { initNativeApp, applyStatusBarTheme } from "./native/nativeApp";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        []
    );

    const theme = createTheme(
        {
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
					borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    backgroundColor: "#10b981",
					borderRadius: "8px",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
					borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "#e2e8f0" : "#1e293b",
					borderRadius: "8px",
                },
            },
            palette: {
                mode,
                primary: { main: "#10b981", light: "#34d399", dark: "#059669" },
                secondary: { main: "#1677ff", light: "#38bdf8", dark: "#0284c7" },
				sair: { main: mode === "light" ? "#ef4444" : "#f87171" },
				vcard: { main: mode === "light" ? "#10b981" : "#34d399" },
                textPrimary: mode === "light" ? "#0f172a" : "#f8fafc",
                borderPrimary: mode === "light" ? "#10b981" : "#34d399",
                dark: { main: mode === "light" ? "#0f172a" : "#f8fafc" },
                light: { main: mode === "light" ? "#f8fafc" : "#1e293b" },
                tabHeaderBackground: mode === "light" ? "#f1f5f9" : "#1e293b",
                optionsBackground: mode === "light" ? "#ffffff" : "#0f172a",
				options: mode === "light" ? "#f8fafc" : "#1e293b",
				fontecor: mode === "light" ? "#10b981" : "#34d399",
                fancyBackground: mode === "light" ? "#f8fafc" : "#080c14",
				bordabox: mode === "light" ? "#e2e8f0" : "#1e293b",
				newmessagebox: mode === "light" ? "#e2e8f0" : "#1e293b",
				inputdigita: mode === "light" ? "#ffffff" : "#1e293b",
				contactdrawer: mode === "light" ? "#ffffff" : "#0f172a",
				announcements: mode === "light" ? "#f8fafc" : "#1e293b",
				login: mode === "light" ? "#ffffff" : "#080c14",
				announcementspopover: mode === "light" ? "#ffffff" : "#0f172a",
				chatlist: mode === "light" ? "#f8fafc" : "#0f172a",
				boxlist: mode === "light" ? "#ffffff" : "#0f172a",
				boxchatlist: mode === "light" ? "#ffffff" : "#080c14",
                total: mode === "light" ? "#ffffff" : "#0f172a",
                messageIcons: mode === "light" ? "#64748b" : "#94a3b8",
                inputBackground: mode === "light" ? "#ffffff" : "#1e293b",
                barraSuperior: mode === "light"
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(15, 23, 42, 0.9)",
				boxticket: mode === "light" ? "#ffffff" : "#0f172a",
				campaigntab: mode === "light" ? "#f8fafc" : "#1e293b",
				mediainput: mode === "light" ? "#f8fafc" : "#0b1220",
				contadordash: mode === "light" ? "#0f172a" : "#ffffff",
                background: {
                    default: mode === "light" ? "#f8fafc" : "#080c14",
                    paper: mode === "light" ? "#ffffff" : "#0f172a",
                },
            },
            shape: {
                borderRadius: 12,
            },
            components: {
                MuiPaper: {
                    styleOverrides: {
                      rounded: {
                        borderRadius: 12,
                      },
                      elevation1: {
                        boxShadow: mode === "light"
                            ? "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)"
                            : "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
                      },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                      root: {
                        borderRadius: 10,
                        textTransform: "none",
                        fontWeight: 600,
                        letterSpacing: "0.2px",
                      },
                      containedPrimary: {
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
                        },
                      },
                    },
                },
                MuiDialog: {
                    styleOverrides: {
                      paper: {
                        borderRadius: 20,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      },
                    },
                },
                MuiChip: {
                    styleOverrides: {
                      root: {
                        borderRadius: 8,
                        fontWeight: 600,
                      },
                    },
                },
            },
            typography: {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            },
            mode,
        },
        locale
    );

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale =
            i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

        if (browserLocale === "ptBR") {
            setLocale(ptBR);
        }
    }, []);

    useEffect(() => {
        initNativeApp();
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
        applyStatusBarTheme(mode === "dark");
    }, [mode]);



    return (
        <CacheProvider value={emotionCache}>
            <ColorModeContext.Provider value={{ colorMode }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <QueryClientProvider client={queryClient}>
                      <SocketContext.Provider value={SocketManager}>
                          <Routes />
                          <PwaInstallPrompt />
                      </SocketContext.Provider>
                    </QueryClientProvider>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </CacheProvider>
    );
};

export default App;
