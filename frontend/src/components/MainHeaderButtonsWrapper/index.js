import React from "react";

import { makeStyles } from "../../styles/makeStyles";

const useStyles = makeStyles(theme => ({
	MainHeaderButtonsWrapper: {
		flex: "none",
		marginLeft: "auto",
		display: "flex",
		flexWrap: "wrap",
		"& > *": {
			margin: theme.spacing(1),
		},
		[theme.breakpoints.down("sm")]: {
			marginLeft: 0,
			width: "100%",
		},
	},
}));

const MainHeaderButtonsWrapper = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;
