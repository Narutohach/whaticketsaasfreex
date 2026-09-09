import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const TicketAdvancedLayout = styled(Paper)(({ theme }) => ({
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
}));

export default TicketAdvancedLayout;