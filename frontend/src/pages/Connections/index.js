import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "../../styles/makeStyles";
import { green } from "@mui/material/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	Chip,
	Box,
} from "@mui/material";
import {
	Edit,
	CheckCircle,
	CropFree,
	DeleteOutlineOutlined as DeleteOutline,
	Add as AddIcon,
	RestartAlt as RestartAltIcon,
	SignalCellularAlt as SignalCellularAltIcon,
	WifiOff as WifiOffIcon,
	QrCode2 as QrCode2Icon,
} from "@mui/icons-material";
import formatSerializedId from "../../utils/formatSerializedId";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const useStyles = makeStyles((theme) => {
	const isDark = theme.palette.mode === "dark" || theme.mode === "dark";

	return {
		mainPaper: {
			flex: 1,
			padding: theme.spacing(2),
			overflowY: "auto",
			borderRadius: 20,
			backgroundColor: isDark ? "rgba(15, 23, 42, 0.75) !important" : "#ffffff !important",
			border: isDark ? "1px solid rgba(255, 255, 255, 0.08) !important" : "1px solid rgba(0, 0, 0, 0.06) !important",
			boxShadow: isDark ? "0 8px 32px rgba(0, 0, 0, 0.45)" : "0 4px 20px rgba(0, 0, 0, 0.04)",
			...theme.scrollbarStyles,
		},
		statsRow: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
			gap: theme.spacing(2),
			marginBottom: theme.spacing(2.5),
		},
		statCard: {
			padding: "16px 20px",
			borderRadius: 16,
			backgroundColor: isDark ? "rgba(30, 41, 59, 0.65) !important" : "#ffffff !important",
			border: isDark ? "1px solid rgba(255, 255, 255, 0.08) !important" : "1px solid rgba(0, 0, 0, 0.06) !important",
			boxShadow: isDark ? "0 4px 16px rgba(0, 0, 0, 0.3)" : "0 2px 10px rgba(0, 0, 0, 0.03)",
			display: "flex",
			alignItems: "center",
			gap: 16,
		},
		statNumber: {
			fontWeight: "800 !important",
			lineHeight: 1.2,
			color: isDark ? "#f8fafc !important" : "#0f172a !important",
		},
		statLabel: {
			color: isDark ? "#94a3b8 !important" : "#64748b !important",
			fontWeight: "600 !important",
		},
		statIconBox: {
			width: 46,
			height: 46,
			borderRadius: 12,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			flexShrink: 0,
		},
		customTableCell: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		},
		thCell: {
			fontWeight: "700 !important",
			color: isDark ? "#94a3b8 !important" : "#475569 !important",
			borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08) !important" : "1px solid rgba(0, 0, 0, 0.08) !important",
			fontSize: "0.82rem !important",
		},
		tbCell: {
			color: isDark ? "#f8fafc !important" : "#0f172a !important",
			borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.05) !important" : "1px solid rgba(0, 0, 0, 0.05) !important",
		},
		tbCellMuted: {
			color: isDark ? "#94a3b8 !important" : "#64748b !important",
			borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.05) !important" : "1px solid rgba(0, 0, 0, 0.05) !important",
			fontSize: "0.8rem !important",
		},
		tableRow: {
			transition: "background-color 0.15s ease",
			"&:hover": {
				backgroundColor: isDark ? "rgba(255, 255, 255, 0.04) !important" : "rgba(0, 0, 0, 0.02) !important",
			},
		},
		qrConnectBtn: {
			background: "linear-gradient(135deg, #10b981 0%, #059669 100%) !important",
			color: "#ffffff !important",
			fontWeight: "700 !important",
			textTransform: "none !important",
			borderRadius: "10px !important",
			padding: "4px 14px !important",
			fontSize: "0.8rem !important",
			boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35) !important",
			"&:hover": {
				background: "linear-gradient(135deg, #059669 0%, #047857 100%) !important",
			},
		},
		disconnectBtn: {
			borderColor: isDark ? "rgba(239, 68, 68, 0.5) !important" : "rgba(239, 68, 68, 0.35) !important",
			color: "#ef4444 !important",
			textTransform: "none !important",
			borderRadius: "10px !important",
			fontWeight: "600 !important",
			fontSize: "0.78rem !important",
			"&:hover": {
				backgroundColor: "rgba(239, 68, 68, 0.1) !important",
				borderColor: "#ef4444 !important",
			},
		},
		reconnectBtn: {
			borderColor: isDark ? "rgba(16, 185, 129, 0.5) !important" : "rgba(16, 185, 129, 0.35) !important",
			color: "#10b981 !important",
			textTransform: "none !important",
			borderRadius: "10px !important",
			fontWeight: "600 !important",
			fontSize: "0.78rem !important",
			"&:hover": {
				backgroundColor: "rgba(16, 185, 129, 0.1) !important",
				borderColor: "#10b981 !important",
			},
		},
		actionIconBtn: {
			color: isDark ? "#94a3b8 !important" : "#64748b !important",
			transition: "color 0.15s ease, transform 0.15s ease",
			"&:hover": {
				color: "#10b981 !important",
				transform: "scale(1.15)",
			},
		},
		deleteIconBtn: {
			color: isDark ? "#94a3b8 !important" : "#64748b !important",
			transition: "color 0.15s ease, transform 0.15s ease",
			"&:hover": {
				color: "#ef4444 !important",
				transform: "scale(1.15)",
			},
		},
		metaChannelChip: {
			background: "linear-gradient(135deg, #1877F2 0%, #0A5FD9 100%)",
			color: "#ffffff",
			fontWeight: 700,
			fontSize: "0.75rem",
			borderRadius: 8,
			boxShadow: "0 2px 8px rgba(24, 119, 242, 0.3)",
		},
		webChannelChip: {
			backgroundColor: isDark ? "rgba(37, 211, 102, 0.12)" : "rgba(37, 211, 102, 0.08)",
			color: "#10b981",
			border: "1px solid rgba(16, 185, 129, 0.25)",
			fontWeight: 600,
			fontSize: "0.75rem",
			borderRadius: 8,
		},
		chipConnected: {
			backgroundColor: "rgba(16, 185, 129, 0.12)",
			color: "#10b981",
			border: "1px solid rgba(16, 185, 129, 0.3)",
			fontWeight: 600,
			fontSize: "0.75rem",
		},
		chipQrcode: {
			backgroundColor: "rgba(245, 158, 11, 0.12)",
			color: "#f59e0b",
			border: "1px solid rgba(245, 158, 11, 0.3)",
			fontWeight: 600,
			fontSize: "0.75rem",
		},
		chipDisconnected: {
			backgroundColor: "rgba(239, 68, 68, 0.12)",
			color: "#ef4444",
			border: "1px solid rgba(239, 68, 68, 0.3)",
			fontWeight: 600,
			fontSize: "0.75rem",
		},
		chipOpening: {
			backgroundColor: "rgba(14, 165, 233, 0.12)",
			color: "#0ea5e9",
			border: "1px solid rgba(14, 165, 233, 0.3)",
			fontWeight: 600,
			fontSize: "0.75rem",
		},
	};
});

const Connections = () => {
	const classes = useStyles();

	const { user } = useContext(AuthContext);
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);

	const restartWhatsapps = async () => {
		try {
			await api.post(`/whatsapp-restart/`);
			toast.warn(i18n.t("Aguarde... reiniciando conexões..."));
		} catch (err) {
			toastError(err);
		}
	};

	const handleStartWhatsAppSession = async (whatsAppId) => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async (whatsAppId) => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, []);

	const handleOpenQrModal = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, []);

	const handleEditWhatsApp = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = (whatsApp) => {
		if (whatsApp.provider === "meta_cloud") {
			return (
				<Chip
					size="small"
					label="Oficial (Meta API)"
					className={classes.metaChannelChip}
				/>
			);
		}
		return (
			<Box display="flex" alignItems="center" justifyContent="center" gap={1}>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						className={classes.qrConnectBtn}
						startIcon={<CropFree style={{ fontSize: 16 }} />}
						onClick={() => handleOpenQrModal(whatsApp)}
					>
						Conectar QR
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="small"
							variant="outlined"
							className={classes.reconnectBtn}
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>
						<Button
							size="small"
							variant="outlined"
							className={classes.disconnectBtn}
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
					<Button
						size="small"
						variant="outlined"
						className={classes.disconnectBtn}
						onClick={() => {
							handleOpenConfirmationModal("disconnect", whatsApp.id);
						}}
					>
						{i18n.t("connections.buttons.disconnect")}
					</Button>
				)}
				{whatsApp.status === "OPENING" && (
					<Chip
						size="small"
						label="Iniciando..."
						className={classes.chipOpening}
					/>
				)}
			</Box>
		);
	};

	const renderStatusToolTips = (whatsApp) => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<Chip label="Desconectado" size="small" className={classes.chipDisconnected} />
				)}
				{whatsApp.status === "OPENING" && (
					<Chip
						label="Conectando..."
						size="small"
						icon={<CircularProgress size={12} color="inherit" />}
						className={classes.chipOpening}
					/>
				)}
				{whatsApp.status === "qrcode" && (
					<Chip label="QR Pendente" size="small" className={classes.chipQrcode} />
				)}
				{whatsApp.status === "CONNECTED" && (
					<Chip label="● Conectado" size="small" className={classes.chipConnected} />
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<Chip label="Pareando..." size="small" className={classes.chipQrcode} />
				)}
			</div>
		);
	};

	const connectedCount = whatsApps?.filter((w) => w.status === "CONNECTED").length || 0;
	const qrPendingCount = whatsApps?.filter((w) => w.status === "qrcode").length || 0;

	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>

			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>

			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>

			<MainHeader>
				<Title>{i18n.t("connections.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Can
						role={user.profile}
						perform="connections-page:addConnection"
						yes={() => (
							<>
								<Button
									variant="contained"
									color="primary"
									startIcon={<AddIcon />}
									onClick={handleOpenWhatsAppModal}
									style={{ borderRadius: 10, textTransform: "none", fontWeight: 700 }}
								>
									{i18n.t("connections.buttons.add")}
								</Button>
								<Button
									variant="outlined"
									color="primary"
									startIcon={<RestartAltIcon />}
									onClick={restartWhatsapps}
									style={{ borderRadius: 10, textTransform: "none", fontWeight: 600 }}
								>
									Reiniciar Conexões
								</Button>
							</>
						)}
					/>
				</MainHeaderButtonsWrapper>
			</MainHeader>

			{/* Cards de Métricas em Destaque */}
			<div className={classes.statsRow}>
				<div className={classes.statCard}>
					<div className={classes.statIconBox} style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
						<SignalCellularAltIcon />
					</div>
					<div>
						<Typography variant="h6" className={classes.statNumber}>
							{connectedCount}
						</Typography>
						<Typography variant="caption" className={classes.statLabel}>
							Canais Online
						</Typography>
					</div>
				</div>

				<div className={classes.statCard}>
					<div className={classes.statIconBox} style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
						<QrCode2Icon />
					</div>
					<div>
						<Typography variant="h6" className={classes.statNumber}>
							{qrPendingCount}
						</Typography>
						<Typography variant="caption" className={classes.statLabel}>
							Aguardando QR Code
						</Typography>
					</div>
				</div>

				<div className={classes.statCard}>
					<div className={classes.statIconBox} style={{ backgroundColor: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }}>
						<CropFree />
					</div>
					<div>
						<Typography variant="h6" className={classes.statNumber}>
							{whatsApps?.length || 0}
						</Typography>
						<Typography variant="caption" className={classes.statLabel}>
							Total de Canais
						</Typography>
					</div>
				</div>
			</div>

			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center" className={classes.thCell}>
								{i18n.t("connections.table.name")}
							</TableCell>
							<TableCell align="center" className={classes.thCell}>
								Canal / Tipo
							</TableCell>
							<TableCell align="center" className={classes.thCell}>
								{i18n.t("connections.table.number")}
							</TableCell>
							<TableCell align="center" className={classes.thCell}>
								{i18n.t("connections.table.status")}
							</TableCell>
							<Can
								role={user.profile}
								perform="connections-page:actionButtons"
								yes={() => (
									<TableCell align="center" className={classes.thCell}>
										{i18n.t("connections.table.session")}
									</TableCell>
								)}
							/>
							<TableCell align="center" className={classes.thCell}>
								{i18n.t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center" className={classes.thCell}>
								{i18n.t("connections.table.default")}
							</TableCell>
							<Can
								role={user.profile}
								perform="connections-page:editOrDeleteConnection"
								yes={() => (
									<TableCell align="center" className={classes.thCell}>
										{i18n.t("connections.table.actions")}
									</TableCell>
								)}
							/>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsApps?.length > 0 &&
									whatsApps.map((whatsApp) => (
										<TableRow key={whatsApp.id} className={classes.tableRow}>
											<TableCell align="center" className={classes.tbCell} style={{ fontWeight: 600 }}>
												{whatsApp.name}
											</TableCell>
											<TableCell align="center" className={classes.tbCell}>
												{whatsApp.provider === "meta_cloud" ? (
													<Chip
														label="Meta Cloud API"
														size="small"
														className={classes.metaChannelChip}
													/>
												) : (
													<Chip
														label="WhatsApp Web"
														size="small"
														className={classes.webChannelChip}
													/>
												)}
											</TableCell>
											<TableCell align="center" className={classes.tbCell} style={{ fontWeight: 500 }}>
												{whatsApp.number ? (
													<>{formatSerializedId(whatsApp.number)}</>
												) : (
													<span style={{ color: "#94a3b8" }}>-</span>
												)}
											</TableCell>
											<TableCell align="center" className={classes.tbCell}>
												{renderStatusToolTips(whatsApp)}
											</TableCell>
											<Can
												role={user.profile}
												perform="connections-page:actionButtons"
												yes={() => (
													<TableCell align="center" className={classes.tbCell}>
														{renderActionButtons(whatsApp)}
													</TableCell>
												)}
											/>
											<TableCell align="center" className={classes.tbCellMuted}>
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center" className={classes.tbCell}>
												{whatsApp.isDefault && (
													<div className={classes.customTableCell}>
														<CheckCircle style={{ color: green[500], fontSize: 20 }} />
													</div>
												)}
											</TableCell>
											<Can
												role={user.profile}
												perform="connections-page:editOrDeleteConnection"
												yes={() => (
													<TableCell align="center" className={classes.tbCell}>
														<IconButton
															size="small"
															className={classes.actionIconBtn}
															onClick={() => handleEditWhatsApp(whatsApp)}
														>
															<Edit fontSize="small" />
														</IconButton>

														<IconButton
															size="small"
															className={classes.deleteIconBtn}
															onClick={() => {
																handleOpenConfirmationModal("delete", whatsApp.id);
															}}
														>
															<DeleteOutline fontSize="small" />
														</IconButton>
													</TableCell>
												)}
											/>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default Connections;
