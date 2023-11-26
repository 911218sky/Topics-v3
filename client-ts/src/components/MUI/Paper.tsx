import { styled, Paper } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light" ? theme.palette.grey[100] : "initial",
}));

export default StyledPaper;
