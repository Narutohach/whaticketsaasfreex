import React from "react";
import { Card, IconButton, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory } from "react-router-dom";
import { makeStyles } from "../../styles/makeStyles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		backgroundColor: theme.palette.tabHeaderBackground,
		flex: "none",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		alignItems: "center",
		padding: "4px 8px",
		minHeight: 56,
		[theme.breakpoints.down("sm")]: {
			padding: "2px 6px",
			minHeight: 52,
		}
	},
	backButton: {
		marginRight: 4,
		padding: 6,
		color: theme.palette.mode === "dark" ? "#94a3b8" : "#475569",
		"&:hover": {
			color: theme.palette.primary.main,
		}
	}
}));

const TicketHeader = ({ loading, children, onBackClick }) => {
	const classes = useStyles();
	const history = useHistory();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const handleBack = () => {
		if (onBackClick) {
			onBackClick();
		} else {
			history.push("/tickets");
		}
	};

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card square className={classes.ticketHeader}>
					{isMobile && (
						<IconButton
							size="medium"
							edge="start"
							aria-label="voltar"
							className={classes.backButton}
							onClick={handleBack}
						>
							<ArrowBackIcon />
						</IconButton>
					)}
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
