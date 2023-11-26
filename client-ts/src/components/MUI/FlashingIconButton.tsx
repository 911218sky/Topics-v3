import { styled, IconButton, keyframes, SxProps } from "@mui/material";

const shineAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

interface StyledIconButtonProps {
  sx?: SxProps;
}

const StyledIconButton = styled(IconButton)<StyledIconButtonProps>(
  ({ theme }) => ({
    animation: `${shineAnimation} 2s infinite`,
  })
);

export default StyledIconButton;
