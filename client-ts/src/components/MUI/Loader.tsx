import { styled, Box } from "@mui/material";

const Loader = styled(Box)(({ theme }) => ({
  display: "inline-block",
  textAlign: "center",
  lineHeight: "86px",
  position: "relative",
  padding: "0 48px",
  fontSize: "48px",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#fff",
  "&:before, &:after": {
    content: '""',
    display: "block",
    width: "15px",
    height: "15px",
    background: "currentColor",
    position: "absolute",
    animation: "load 0.7s infinite alternate ease-in-out",
    top: 0,
  },
  "&:after": {
    top: "auto",
    bottom: 0,
  },
  "@keyframes load": {
    "0%": {
      left: 0,
      height: "43px",
      width: "15px",
      transform: "translateX(0)",
    },
    "50%": {
      height: "10px",
      width: "40px",
    },
    "100%": {
      left: "100%",
      height: "43px",
      width: "15px",
      transform: "translateX(-100%)",
    },
  },
}));

export default Loader;
