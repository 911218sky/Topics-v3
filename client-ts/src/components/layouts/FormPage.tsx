import React, { useEffect, useReducer, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Radio,
  FormControl,
  Paper,
  Container,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import { motion } from "framer-motion";
import axios from "axios";

import { queryClient } from "../../context/ReactQueryProvider";
import { TransitionDown } from "../../shared/SnackbarTransition";
import useDelayedAction from "../../hooks/useDelayedAction";
import DoubleConfirmation from "./../../shared/DoubleConfirmation";
import AutoSnackbar from "../../shared/AutoSnackbar";
import Loading from "../../shared/Loading";

type Action =
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ANSWERS"; payload: number[][] }
  | { type: "SET_OPEN_DOUBLE_CONFIRMATION"; payload: boolean }
  | { type: "SET_DISABLED_SUBMIT_BUTTON"; payload: boolean }
  | { type: "SET_FORM_DATA"; payload: FormData };

interface questionsType {
  question: string;
  options: string[];
}

interface FormData {
  questions: questionsType[];
  formIndex: string;
  isSingleChoice: boolean;
  formName: string;
  fid: number;
}

interface State {
  isLoading: boolean;
  formData: FormData | null;
  answers: number[][];
  error: string;
  message: string;
  openDoubleConfirmation: boolean;
  disabledSubmitButton: boolean;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_ANSWERS":
      return { ...state, answers: action.payload };
    case "SET_OPEN_DOUBLE_CONFIRMATION":
      return { ...state, openDoubleConfirmation: action.payload };
    case "SET_DISABLED_SUBMIT_BUTTON":
      return { ...state, disabledSubmitButton: action.payload };
    case "SET_FORM_DATA":
      return { ...state, formData: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  isLoading: true,
  formData: null,
  answers: [[]],
  error: "",
  message: "",
  openDoubleConfirmation: false,
  disabledSubmitButton: false,
};

const FormPage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    isLoading,
    formData,
    answers,
    error,
    message,
    openDoubleConfirmation,
    disabledSubmitButton,
  } = state;

  const { id } = useParams();

  const navigate = useNavigate();

  const [, jumpToHome] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SEVER_URL}/form/specify`, {
        params: {
          fid: id,
        },
        withCredentials: true,
      })
      .then((response) => {
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_FORM_DATA", payload: response.data });
        dispatch({
          type: "SET_ANSWERS",
          payload: new Array(response.data.questions.length)
            .fill(null)
            .map(() => []),
        });
        if (response.data.questions.length < 1) jumpToHome();
      })
      .catch((error) => {
        dispatch({ type: "SET_ERROR", payload: error.response.data.message });
        jumpToHome();
      });
  }, []);

  const handleSubmit = () => {
    if (!formData) return;
    dispatch({ type: "SET_ERROR", payload: "" });
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/form/verify`,
        {
          fid: formData.fid,
          answers,
          formIndex: formData.formIndex,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch({ type: "SET_MESSAGE", payload: response.data.message });
        dispatch({ type: "SET_DISABLED_SUBMIT_BUTTON", payload: true });
        queryClient.refetchQueries(["historyData"]);
        jumpToHome();
      })
      .catch((error) => {
        dispatch({ type: "SET_ERROR", payload: error.response.data.message });
      })
      .finally(() => {
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_OPEN_DOUBLE_CONFIRMATION", payload: false });
      });
  };

  const handleCorrectChange = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      questionIndex: number,
      optionIndex: number,
      isSingleChoice: boolean,
      answers: number[][]
    ) => {
      if (isSingleChoice) {
        dispatch({
          type: "SET_ANSWERS",
          payload: answers.map((a, index) =>
            index === questionIndex ? [optionIndex] : a
          ),
        });
      } else {
        dispatch({
          type: "SET_ANSWERS",
          payload: answers.map((a, index) =>
            index === questionIndex
              ? a.includes(optionIndex)
                ? a.filter((i) => i !== optionIndex)
                : [...a, optionIndex]
              : a
          ),
        });
      }
    },
    []
  );

  if (isLoading) return <Loading />;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        overflow: "auto",
        bgcolor: (theme) => (theme.palette.mode === "light" ? "#f5f5f5" : ""),
      }}
    >
      <DoubleConfirmation
        open={openDoubleConfirmation}
        title="Reconfirm"
        contentText="You can't modify it after sending it out, make sure you want to continue the operation."
        onSuccess={handleSubmit}
        onFail={() =>
          dispatch({ type: "SET_OPEN_DOUBLE_CONFIRMATION", payload: false })
        }
      />
      <AutoSnackbar
        message={error}
        setMessage={(message) =>
          dispatch({ type: "SET_ERROR", payload: message })
        }
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
        setMessage={(message) =>
          dispatch({ type: "SET_MESSAGE", payload: message })
        }
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
            color: "#fff",
          },
        }}
      />
      {formData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              pb: 5,
            }}
          >
            <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
              {formData.formName}
            </Typography>
            <Paper sx={{ p: 4, width: "100%" }}>
              <form onSubmit={handleSubmit}>
                {formData.questions.map(
                  ({ question, options }, questionIndex) => (
                    <Paper
                      elevation={5}
                      key={question}
                      sx={{
                        mt: 5,
                        mb: 5,
                        p: 5,
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                        transition: "box-shadow 0.3s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 0 20px",
                        },
                      }}
                    >
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                          {`題目 ${questionIndex + 1}. ${question}`}
                        </Typography>
                        {options.map((option, optionIndex) => {
                          return (
                            <Box key={`${questionIndex} - ${optionIndex}`}>
                              {formData.isSingleChoice ? (
                                <FormControlLabel
                                  value={option}
                                  control={
                                    <Radio
                                      checked={
                                        answers[questionIndex].includes(
                                          optionIndex
                                        ) || false
                                      }
                                      onClick={(e) =>
                                        handleCorrectChange(
                                          e,
                                          questionIndex,
                                          optionIndex,
                                          formData.isSingleChoice,
                                          answers
                                        )
                                      }
                                    />
                                  }
                                  label={option}
                                />
                              ) : (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      onClick={(e) =>
                                        handleCorrectChange(
                                          e,
                                          questionIndex,
                                          optionIndex,
                                          formData.isSingleChoice,
                                          answers
                                        )
                                      }
                                    />
                                  }
                                  label={option}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </FormControl>
                    </Paper>
                  )
                )}
              </form>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  sx={{ mt: 3, mb: 2, width: "100%" }}
                  disabled={disabledSubmitButton}
                  onClick={() =>
                    dispatch({
                      type: "SET_OPEN_DOUBLE_CONFIRMATION",
                      payload: true,
                    })
                  }
                >
                  Submit
                </LoadingButton>
              </motion.div>
            </Paper>
          </Container>
        </motion.div>
      )}
    </Box>
  );
};

export default FormPage;
