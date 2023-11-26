import React, { useReducer, useEffect, useCallback } from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { MarkEmailRead } from "@mui/icons-material";
import axios from "axios";

import Music from "../../shared/special/Music";
import AutoSnackbar from "../../shared/AutoSnackbar";
import LoadingImage from "../../shared/LoadingImage";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ParticleField from "../../shared/special/ParticleField";
import useDelayedAction from "../../hooks/useDelayedAction";
import { TransitionDown } from "../../shared/SnackbarTransition";

type Action =
  | { type: "SET_VERIFICATION_CODE"; payload: string }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SUBMIT_LOADING"; payload: boolean }
  | { type: "SET_RESEND_DISABLED"; payload: boolean }
  | { type: "SET_COUNTDOWN"; payload: number }
  | { type: "SET_INNER_WIDTH"; payload: number }
  | { type: "SET_INNER_HEIGHT"; payload: number }
  | { type: "SET_SUBMIT_BUTTON"; payload: boolean };

interface State {
  verificationCode: string;
  message: string;
  error: string;
  isSubmitLoading: boolean;
  isResendDisabled: boolean;
  disabledSubmitButton: boolean;
  countdown: number;
  innerWidth: number;
  innerHeight: number;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_VERIFICATION_CODE":
      return { ...state, verificationCode: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SUBMIT_LOADING":
      return { ...state, isSubmitLoading: action.payload };
    case "SET_RESEND_DISABLED":
      return { ...state, isResendDisabled: action.payload };
    case "SET_COUNTDOWN":
      return { ...state, countdown: action.payload };
    case "SET_INNER_WIDTH":
      return { ...state, innerWidth: action.payload };
    case "SET_INNER_HEIGHT":
      return { ...state, innerHeight: action.payload };
    case "SET_SUBMIT_BUTTON":
      return { ...state, disabledSubmitButton: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  verificationCode: "",
  message: "",
  error: "",
  isSubmitLoading: false,
  isResendDisabled: false,
  disabledSubmitButton: false,
  countdown: 30,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
};

const VerificationCodeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    verificationCode,
    message,
    error,
    isSubmitLoading,
    isResendDisabled,
    disabledSubmitButton,
  } = state;

  const [, jumpToLogin] = useDelayedAction(2500, () => {
    navigate("/public/login");
  });

  const [, jumpToRegister] = useDelayedAction(2500, () => {
    navigate("/public/register");
  });

  const [currentCountdown, waitingStart] = useDelayedAction(30000, () => {
    dispatch({ type: "SET_RESEND_DISABLED", payload: false });
    dispatch({ type: "SET_COUNTDOWN", payload: 30 });
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      dispatch({
        type: "SET_INNER_WIDTH",
        payload: window.innerWidth,
      });
      dispatch({
        type: "SET_INNER_HEIGHT",
        payload: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResendCode = useCallback(() => {
    dispatch({ type: "SET_RESEND_DISABLED", payload: true });
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/authentication/resendotp`,
        {
          id,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch({
          type: "SET_MESSAGE",
          payload: response.data.message,
        });
      })
      .catch((error) => {
        dispatch({
          type: "SET_ERROR",
          payload: error.response.data.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_SUBMIT_LOADING", payload: false });
        waitingStart();
      });
  }, [id, waitingStart]);

  const handleSubmit = useCallback(
    (e: React.FormEvent, otp: string) => {
      e.preventDefault();
      dispatch({ type: "SET_SUBMIT_LOADING", payload: true });
      axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/authentication/verify`,
          {
            id,
            otp: otp,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          dispatch({
            type: "SET_MESSAGE",
            payload: response.data.message,
          });
          dispatch({ type: "SET_SUBMIT_BUTTON", payload: true });
          jumpToLogin();
        })
        .catch((error) => {
          if (error.response.data.message === "Authentication timeout") {
            dispatch({
              type: "SET_ERROR",
              payload: "verification timed out, please re-register",
            });
            jumpToRegister();
          } else {
            dispatch({
              type: "SET_ERROR",
              payload: error.response.data.message,
            });
          }
        })
        .finally(() => {
          dispatch({ type: "SET_SUBMIT_LOADING", payload: false });
        });
    },
    [id, jumpToLogin, jumpToRegister]
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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <ParticleField />
        <AutoSnackbar
          message={error}
          setMessage={(message) =>
            dispatch({ type: "SET_ERROR", payload: message })
          }
          autoHideDuration={2000}
          severity="error"
          variant="filled"
          alertTitle="Error"
          otherSnackbar={{
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
          setMessage={(message) =>
            dispatch({ type: "SET_MESSAGE", payload: message })
          }
          autoHideDuration={2000}
          severity="success"
          variant="filled"
          alertTitle="Information"
          otherAlert={{
            sx: {
              width: "60%",
              color: "#fff",
              backgroundColor: "rgb(0, 230, 0,0.5)",
            },
          }}
        />
        <LoadingImage
          alt="email"
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/email_.png?original=true`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(255, 255, 255, 0.7)",
            padding: "2rem",
            borderRadius: "10px",
          }}
        >
          <MarkEmailRead sx={{ fontSize: 64, color: "primary.main" }} />
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Email Verification Code
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Enter the verification code sent to your email address to reset your
            password.
          </Typography>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            onSubmit={(e) => handleSubmit(e, verificationCode)}
          >
            <Stack
              spacing={1}
              sx={{
                width: "100%",
                mt: 2,
              }}
            >
              <TextField
                onChange={(e) =>
                  dispatch({
                    type: "SET_VERIFICATION_CODE",
                    payload: e.target.value,
                  })
                }
                id="verification-code"
                label="Verification Code"
                variant="outlined"
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                style={{ paddingTop: 4 }}
              >
                <LoadingButton
                  type="submit"
                  loading={isSubmitLoading}
                  variant="contained"
                  fullWidth
                  disabled={!verificationCode || disabledSubmitButton}
                >
                  Submit
                </LoadingButton>
              </motion.div>
              <Typography variant="caption" sx={{ color: "#fff", mt: 1 }}>
                {isResendDisabled ? `Resend code in ${currentCountdown}s` : ""}
              </Typography>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <LoadingButton
                  onClick={handleResendCode}
                  disabled={isResendDisabled}
                  variant="outlined"
                  fullWidth
                >
                  Resend Verification Code
                </LoadingButton>
              </motion.div>
            </Stack>
          </Box>
        </Box>
        <Music
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/audio/verificationcodeform.mp3`}
          sx={{
            position: "fixed",
            bottom: "2%",
            right: "2%",
          }}
        />
      </Box>
    </motion.div>
  );
};

export default VerificationCodeForm;
