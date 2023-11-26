import { memo, useCallback } from "react";
import axios from "axios";

import { Box } from "@mui/material";
import NeonButton from "../MUI/NeonButton";

import MovingStarrySky from "../../shared/MovingStarrySky";

const HomePage: React.FC = () => {
  const handelDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      const downloadLink = document.createElement("a");
      downloadLink.href = `${process.env.REACT_APP_SEVER_URL}/public/system/download/AEUST_GAME.png?folder=apk`;
      downloadLink.click();
    },
    []
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <MovingStarrySky
          overFlowThreshold={200}
          style={{
            backgroundColor: "black",
          }}
        />
      </Box>
      <NeonButton
        sx={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginTop: "-3rem",
        }}
        disableRipple
        onClick={handelDownload}
        href="#"
      >
        Download
      </NeonButton>
    </Box>
  );
};

export default memo(HomePage);
