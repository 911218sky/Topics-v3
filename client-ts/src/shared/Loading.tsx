import React from "react";
import { Backdrop } from "@mui/material";
import Loader from "../components/MUI/Loader";

const Loading: React.FC = () => {
  return (
    <Backdrop
      sx={{ bgcolor: "black", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <Loader>Loading</Loader>
    </Backdrop>
  );
};

export default Loading;
