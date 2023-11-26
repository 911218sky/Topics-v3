import React, { useState, useReducer, useCallback } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";

import { Key } from "@mui/icons-material";

import { TransitionDown } from "../../shared/SnackbarTransition";
import Music from "../../shared/special/Music";
import ParticleField from "../../shared/special/ParticleField";
import useDelayedAction from "../../hooks/useDelayedAction";
import AutoSnackbar from "../../shared/AutoSnackbar";
import PasswordAchievement from "../../shared/PasswordAchievement";
import LoadingImage from "../../shared/LoadingImage";

type Action =
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_SUBMIT_LOADING"; payload: boolean };

interface State {
  password: string;
  error: string;
  message: string;
  isSubmitLoading: boolean;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_SUBMIT_LOADING":
      return { ...state, isSubmitLoading: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  password: "",
  error: "",
  message: "",
  isSubmitLoading: false,
};

const ResetPasswordPage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { password, error, message, isSubmitLoading } = state;

  const [passwordIsFinish, setPasswordIsFinish] = useState(false);
  const { id } = useParams();

  const navigate = useNavigate();
  const [, jumpToLogin] = useDelayedAction(3000, () => {
    navigate("/public/login", { replace: true });
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>, password: string) => {
      e.preventDefault();
      dispatch({ type: "SET_SUBMIT_LOADING", payload: true });
      axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/public/user/resetpassword`,
          {
            id: id,
            password,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          dispatch({ type: "SET_MESSAGE", payload: response.data.message });
          jumpToLogin();
        })
        .catch((error) => {
          dispatch({ type: "SET_ERROR", payload: error.response.data.message });
        })
        .finally(() => {
          dispatch({ type: "SET_SUBMIT_LOADING", payload: false });
        });
    },
    [id, jumpToLogin]
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
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <AutoSnackbar
          message={error}
          setMessage={(message) => {
            dispatch({ type: "SET_ERROR", payload: message });
          }}
          autoHideDuration={2000}
          severity="error"
          alertTitle="Error"
          variant="filled"
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
          setMessage={(message) => {
            dispatch({ type: "SET_MESSAGE", payload: message });
          }}
          autoHideDuration={2000}
          severity="success"
          alertTitle="Success"
          variant="filled"
          otherSnackbar={{
            sx: { width: "100%" },
            TransitionComponent: TransitionDown,
          }}
          otherAlert={{
            sx: {
              width: "60%",
              backgroundColor: "rgb(0, 230, 0,0.5)",
              color: "white",
            },
          }}
        />
        <ParticleField />
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
          <LoadingImage
            url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/resetpassword.png?original=true`}
            alt="resetpassword"
          />
        </Box>
        <Container
          maxWidth="md"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(255, 255, 255, 0.7)",
            padding: "2rem",
            borderRadius: "10px",
          }}
        >
          <Box
            onSubmit={(e) => {
              handleSubmit(e, password);
            }}
            component="form"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Key sx={{ fontSize: 63, color: "primary.main" }} />
            <Typography variant="h4" align="center">
              Reset Password
            </Typography>
            <Typography variant="body2" align="center">
              Please enter a new password
            </Typography>
            <PasswordAchievement
              password={password}
              setPassword={(password) => {
                dispatch({ type: "SET_PASSWORD", payload: password });
              }}
              setIsFinish={setPasswordIsFinish}
              sx={{
                mb: 2,
              }}
            />
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LoadingButton
                type="submit"
                loading={isSubmitLoading}
                variant="contained"
                disabled={!passwordIsFinish}
                sx={{ width: "100%" }}
              >
                Reset Password
              </LoadingButton>
            </motion.div>
          </Box>
        </Container>
        <Music
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/audio/resetpassword.mp3`}
          sx={{
            position: "fixed",
            bottom: "2%",
            right: "2%",
            color: "white",
          }}
        />
      </Box>
    </motion.div>
  );
};

export default ResetPasswordPage;
