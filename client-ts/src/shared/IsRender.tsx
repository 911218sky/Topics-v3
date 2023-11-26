import React, { ReactNode, useEffect, useState, memo } from "react";
import { CircularProgress, Box } from "@mui/material";
interface IsRenderProps {
  children: ReactNode;
}

const IsRender: React.FC<IsRenderProps> = ({ children }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRendered(true);
    }, 300);

    return () => {
      setIsRendered(false);
      clearTimeout(timer);
    };
  }, [children]);

  return (
    <>
      {!isRendered && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
      {isRendered && children}
    </>
  );
};

export default memo(IsRender);
