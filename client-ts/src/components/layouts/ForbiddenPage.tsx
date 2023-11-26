import React, { useContext, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import useDelayedAction from "../../hooks/useDelayedAction";
import { GlobalContext } from "../../context/GlobalProvider";

const ForbiddenPage: React.FC = () => {
  const { isLogin } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [, jumpToHome] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });
  const [, jumpToLogin] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  useEffect(() => {
    if (isLogin) jumpToHome();
    else jumpToLogin();
  }, [isLogin, jumpToHome, jumpToLogin]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <LockOutlined sx={{ fontSize: 150, color: "error.main" }} />
      <Typography
        variant="h3"
        sx={{ fontWeight: "bold", mt: 4, color: "text.secondary" }}
      >
        403 Forbidden
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        You don't have permission to access this resource.
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} href="/public/login">
        Go Home
      </Button>
    </Box>
  );
};

export default memo(ForbiddenPage);
