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

const TimeIntervalSelect = ({ selectedInterval, onChange }) => {
	const classes = useStyles();

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl className={classes.formControl} margin="dense" variant="outlined">
				<InputLabel id="time-interval-select-label">{i18n.t("queueSelect.timeToMove")}</InputLabel>
				<Select
					label={i18n.t("queueSelect.timeToMove")}
					labelId="time-interval-select-label"
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
{Array.from({ length: 12 }, (_, i) => (i < 4 ? i + 2 : (i - 3) * 5)).map(interval => (
  <MenuItem key={interval} value={interval}>
    {`${interval} minutos`}
  </MenuItem>
))}
				</Select>
			</FormControl>
		</div>
	);
};

export default TimeIntervalSelect;
