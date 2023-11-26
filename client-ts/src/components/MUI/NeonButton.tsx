import { styled, Button, keyframes } from "@mui/material";

const neonKeyframes = keyframes`
  0%, 100% {
    text-shadow: 0 0 1vw #FA1C16, 0 0 3vw #FA1C16, 0 0 10vw #FA1C16, 0 0 10vw #FA1C16, 0 0 .4vw #FED128, .5vw .5vw .1vw #806914;
    color: #FFFC00;
  }
  50% {
    text-shadow: 0 0 .5vw #800E0B, 0 0 1.5vw #800E0B, 0 0 5vw #800E0B, 0 0 5vw #800E0B, 0 0 .2vw #800E0B, .5vw .5vw .1vw #40340A;
    color: #806914;
  }
`;

const NeonButton = styled(Button)(({ theme }) => ({
  position: "relative",
  textShadow: "0 0 3vw #F4BD0A",
  animation: `${neonKeyframes} 2s ease-in-out infinite`,
  variant: "text",
  "&:hover": {
    background: "none",
    boxShadow: "none",
    transform: "none",
  },
}));

export default NeonButton;
