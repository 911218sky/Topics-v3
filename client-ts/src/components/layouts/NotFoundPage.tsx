import React, { useEffect, memo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchOff } from "@mui/icons-material";
import useDelayedAction from "../../hooks/useDelayedAction";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [, jumpToLogin] = useDelayedAction(3000, () => {
    navigate("/public/login", { replace: true });
  });

  useEffect(() => {
    jumpToLogin();
  }, [jumpToLogin]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <SearchOff sx={{ fontSize: 150, color: "gray" }} />
      <Typography variant="h3" sx={{ fontWeight: "bold", mt: 4 }}>
        Oops! Page not found.
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        href={`${window.location.origin}/public/login`}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default memo(NotFoundPage);
