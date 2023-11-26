import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { LockOutlined } from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";

import AutoSnackbar from "../../shared/AutoSnackbar";
import BackgroundVideo from "../../shared/special/BackgroundVideo";
import useDelayedAction from "../../hooks/useDelayedAction";
import { TransitionDown } from "../../shared/SnackbarTransition";
import LoadingImage from "../../shared/LoadingImage";
import Music from "../../shared/special/Music";
import ParticleField from "../../shared/special/ParticleField";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [, jumpToLogin] = useDelayedAction(3000, () => {
    navigate("/user/login", { replace: true });
  });
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e: React.FormEvent, email: string) => {
      e.preventDefault();
      setIsSubmitLoading(true);
      axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/public/user/forgetpassword`,
          {
            account: email,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          setMessage(response.data.message);
          jumpToLogin();
        })
        .catch((error) => {
          setError(error.response.data.message);
        })
        .finally(() => {
          setIsSubmitLoading(false);
        });
    },
    [jumpToLogin]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: [0, 0.71, 0.2, 1.01],
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        {/* <BackgroundVideo
          videoUrl={`${process.env.REACT_APP_SEVER_URL}/public/system/video/Sword Art Online Progressive_ Survive the Swordland _ EPIC VERSION.mkv`}
        /> */}
        <LoadingImage
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/forgotpassword.png?original=true`}
          alt="resetpassword"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        />
      </Box>
      <ParticleField />
      <AutoSnackbar
        message={error}
        setMessage={setError}
        autoHideDuration={2000}
        severity="error"
        variant="outlined"
        alertTitle="Error"
        otherSnackbar={{
          sx: { width: "100%" },
          TransitionComponent: TransitionDown,
        }}
        otherAlert={{
          sx: {
            width: "60%",
            backgroundColor: "rgb(230, 0, 0,0.5)",
          },
        }}
      />
      <AutoSnackbar
        message={message}
        setMessage={setMessage}
        autoHideDuration={2000}
        severity="success"
        variant="filled"
        alertTitle="Information"
        otherSnackbar={{
          sx: { width: "100%" },
          TransitionComponent: TransitionDown,
        }}
        otherAlert={{
          sx: {
            width: "60%",
            color: "white",
            backgroundColor: "rgb(0, 230, 0,0.5)",
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            m: "2rem",
          }}
        >
          <form
            onSubmit={(e) => handleSubmit(e, email)}
            style={{ width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.7)",
                borderRadius: "10px",
                m: "1rem",
                p: "2rem",
              }}
            >
              <LockOutlined sx={{ fontSize: 64, color: "primary.main" }} />
              <Typography variant="h4" align="center" gutterBottom>
                Forgot Password
              </Typography>
              <Typography variant="body1" align="center" gutterBottom>
                Enter your email address below and we'll send you instructions
                on how to reset your password.
              </Typography>
              <TextField
                required
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                style={{ paddingTop: 4, width: "100%" }}
              >
                <LoadingButton
                  type="submit"
                  fullWidth
                  loading={isSubmitLoading}
                  variant="contained"
                  disabled={!email}
                >
                  Reset Password
                </LoadingButton>
              </motion.div>
            </Box>
          </form>
          <Music
            url={`${process.env.REACT_APP_SEVER_URL}/public/system/audio/forgotpassword.mp3`}
            sx={{
              position: "fixed",
              bottom: "2%",
              right: "2%",
              color: "white",
            }}
          />
        </Container>
      </Box>
    </motion.div>
  );
};

export default ForgotPasswordPage;
