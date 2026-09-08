import { Button, Dialog, DialogActions, DialogContent, Grid } from "@mui/material";
import React, { useState } from "react";

const ColorPicker = ({ onChange, currentColor, handleClose, open }) => {
	const [selectedColor, setSelectedColor] = useState(currentColor);

	const handleChange = color => {
		setSelectedColor(color.hex);
		onChange(color.hex);
		handleClose();
	};

	const colors = [
		"#B80000",
		"#DB3E00",
		"#FCCB00",
		"#008B02",
		"#006B76",
		"#1273DE",
		"#004DCF",
		"#5300EB",
		"#EB9694",
		"#FAD0C3",
		"#FEF3BD",
		"#C1E1C5",
		"#BEDADC",
		"#C4DEF6",
		"#BED3F3",
		"#D4C4FB",
		"#4D4D4D",
		"#999999",
		"#F44E3B",
		"#FE9200",
		"#FCDC00",
		"#DBDF00",
		"#A4DD00",
		"#68CCCA",
		"#73D8FF",
		"#AEA1FF",
		"#FDA1FF",
		"#333333",
		"#808080",
		"#cccccc",
		"#D33115",
		"#E27300",
		"#FCC400",
		"#B0BC00",
		"#68BC00",
		"#16A5A5",
		"#009CE0",
		"#7B64FF",
		"#FA28FF",
		"#666666",
		"#B3B3B3",
		"#9F0500",
		"#C45100",
		"#FB9E00",
		"#808900",
		"#194D33",
		"#0C797D",
		"#0062B1",
		"#653294",
		"#AB149E",
	];

	return (
        <Dialog
			onClose={handleClose}
			aria-labelledby="simple-dialog-title"
			open={open}
		>
            <DialogContent>
				<Grid container spacing={1} sx={{ width: 280 }}>
					{colors.map(color => (
						<Grid key={color}>
							<button
								type="button"
								aria-label={`Selecionar cor ${color}`}
								onClick={() => handleChange({ hex: color })}
								style={{
									width: 28,
									height: 28,
									borderRadius: 6,
									border: selectedColor === color ? '3px solid #0f172a' : '1px solid rgba(15, 23, 42, .18)',
									backgroundColor: color,
									cursor: 'pointer',
								}}
							/>
						</Grid>
					))}
				</Grid>
				<input
					type="color"
					value={selectedColor || '#10b981'}
					onChange={event => handleChange({ hex: event.target.value })}
					aria-label="Escolher uma cor personalizada"
					style={{ display: 'block', width: '100%', height: 42, marginTop: 16, cursor: 'pointer' }}
				/>
			</DialogContent>
            <DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
			</DialogActions>
        </Dialog>
    );
};

export default ColorPicker;
