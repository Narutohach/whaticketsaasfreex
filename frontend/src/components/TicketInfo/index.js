import React from "react";
import { Avatar, CardHeader, useTheme, useMediaQuery } from "@mui/material";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";
import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const { user } = ticket;

	const contactName = contact?.name || "";
	const userName = user?.name
		? isMobile
			? user.name
			: `${i18n.t("messagesList.header.assignedTo")} ${user.name}`
		: "";

	return (
		<CardHeader
			onClick={onClick}
			style={{
				cursor: "pointer",
				padding: isMobile ? "0 4px" : "4px 8px",
				maxWidth: isMobile ? "190px" : "320px",
				minWidth: 0,
				flex: "1 1 auto",
			}}
			titleTypographyProps={{
				noWrap: true,
				style: {
					fontSize: isMobile ? "0.85rem" : "0.95rem",
					fontWeight: 600,
					lineHeight: 1.2,
				},
			}}
			subheaderTypographyProps={{
				noWrap: true,
				style: {
					fontSize: isMobile ? "0.72rem" : "0.78rem",
					lineHeight: 1.2,
				},
			}}
			avatar={
				<Avatar
					style={{
						backgroundColor: generateColor(contact?.number),
						color: "white",
						fontWeight: "bold",
						width: isMobile ? 36 : 42,
						height: isMobile ? 36 : 42,
						fontSize: isMobile ? "0.85rem" : "1rem",
					}}
					src={contact?.profilePicUrl}
					alt="contact_image"
				>
					{getInitials(contact?.name)}
				</Avatar>
			}
			title={`${contactName} #${ticket.id}`}
			subheader={userName}
		/>
	);
};

export default TicketInfo;
