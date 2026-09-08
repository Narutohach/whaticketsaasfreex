import React from 'react';
import { makeStyles } from "../../../styles/makeStyles";

const useStyles = makeStyles(theme => ({
    kanbanSquare: {
        width: "1.2rem",
        height: "1.2rem",
        borderRadius: "5px"
    },
    container: {
        display: "flex",
        gap: "5px",
        alignItems: "center"
    },
    quantity: {
        fontSize: ".75rem",
        fontWeight: "normal",
        color: theme.palette.mode === "light" ? "#000000DE" : "#ffffff",
        backgroundColor: theme.palette.mode === "light" ? "#d9d9d9" : "#334155",
        padding: "0 8px",
        borderRadius: "5px"
    },
    title: {
        color: theme.palette.mode === "light" ? "#000000DE" : "#f1f5f9",
        fontWeight: 600,
    },
}));

const LaneTitle = ({squareColor, firstLane, children, quantity}) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            {!firstLane ? <div className={classes.kanbanSquare} style={{backgroundColor: squareColor}}></div> : <div style={{height: "1.2rem"}}></div>}
            <span className={classes.title}>{children}</span>
            <div className={classes.quantity}>{quantity}</div>
        </div>
    )
}

export default LaneTitle;
