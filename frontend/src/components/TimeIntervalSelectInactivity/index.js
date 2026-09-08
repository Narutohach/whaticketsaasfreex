import React from "react";
import { makeStyles } from "../../styles/makeStyles";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { i18n } from "../../translate/i18n";


const useStyles = makeStyles(theme => ({
	formControl: {
		width: '100%',
	},
}));

const TimeIntervalSelectInactivity = ({ selectedInterval, onChange }) => {
	const classes = useStyles();

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl className={classes.formControl} margin="dense" variant="outlined">
				<InputLabel id="time-interval-inactivity-select-label">{i18n.t("queueSelect.timeToClose")}</InputLabel>
				<Select
					label={i18n.t("queueSelect.timeToClose")}
					labelId="time-interval-inactivity-select-label"
					value={selectedInterval ?? ""}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
				>
                	<MenuItem key="0" value="0" selected>
							DESABILITADO
						</MenuItem>
{Array.from({length: 120}, (_, i) => (i+1)*5).map(interval => (
						<MenuItem key={interval} value={interval}>
							{`${interval} minutos`}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default TimeIntervalSelectInactivity;
