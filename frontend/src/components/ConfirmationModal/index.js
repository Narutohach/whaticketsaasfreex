import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import { i18n } from "../../translate/i18n";

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
			PaperProps={{
				style: {
					borderRadius: 20,
					padding: "8px",
				},
			}}
		>
			<DialogTitle id="confirm-dialog" style={{ fontWeight: 800 }}>
				{title}
			</DialogTitle>
			<DialogContent dividers>
				<Typography style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
					{children}
				</Typography>
			</DialogContent>
			<DialogActions style={{ padding: "16px" }}>
				<Button
					variant="outlined"
					onClick={() => onClose(false)}
					style={{ borderRadius: 10, textTransform: "none", fontWeight: 600 }}
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					color="error"
					style={{ borderRadius: 10, textTransform: "none", fontWeight: 600 }}
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
