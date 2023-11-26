import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Radio,
  FormControl,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useQuery } from "react-query";
import { useNavigate, useLocation } from "react-router-dom";

import { TransitionDown } from "../../shared/SnackbarTransition";
import useDelayedAction from "../../hooks/useDelayedAction";
import AutoSnackbar from "../../shared/AutoSnackbar";
import Loading from "../../shared/Loading";

interface FormData {
  formName: string;
  historyForm: {
    question: string;
    options: string[];
    isError: boolean;
    correctAnswerIndexs?: number[];
    errorAnswerIndexs?: number[];
    isSingleChoice: boolean;
  }[];
}

const FormPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { state } = useLocation() as {
    state: {
      id: number | null;
    };
  };
  const navigate = useNavigate();
  const [, jumpToHome] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  const getData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SEVER_URL}/obtain/historydetails/${state.id}`,
        {
          withCredentials: true,
        }
      );
      const { message, ...other } = response.data;
      return other as FormData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
      jumpToHome();
      return null;
    }
  }, [state.id, jumpToHome]);

  const { data: formData } = useQuery<FormData | null>(
    ["historydetails", state.id],
    getData,
    {
      onSettled: () => {
        setIsLoading(false);
      },
    }
  );

  useEffect(() => {
    console.log(formData);
    if (!state?.id) return navigate("/forbidden");
    if (formData) setIsLoading(false);
  }, [state, formData, navigate]);

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
      <AutoSnackbar
        message={error}
        setMessage={setError}
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
        setMessage={setMessage}
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
      {formData !== undefined && formData !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          style={{ width: "100%" }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "65%",
              mx: "auto",
              pb: 5,
            }}
          >
            <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
              {formData?.formName}
            </Typography>
            <Paper sx={{ p: 4 }}>
              {formData.historyForm.map(
                (
                  {
                    question,
                    options,
                    isError,
                    correctAnswerIndexs,
                    errorAnswerIndexs,
                    isSingleChoice,
                  },
                  questionIndex
                ) => {
                  return (
                    <Paper
                      elevation={5}
                      key={question}
                      sx={{
                        mt: 5,
                        mb: 5,
                        p: 5,
                        borderRadius: "10px",
                        transition: "box-shadow 0.3s ease-in-out",
                        boxShadow: isError
                          ? "0 0 20px rgba(233, 30, 99, 0.8)"
                          : "",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      <FormControl component="fieldset" fullWidth>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{ mb: 2 }}
                          color={isError ? "error" : ""}
                        >
                          {`題目 ${questionIndex + 1}. ${question}`}
                        </Typography>
                        {options.map((option, optionIndex) => {
                          return (
                            <Box key={`${questionIndex} - ${optionIndex}`}>
                              {!isSingleChoice ? (
                                <FormControlLabel
                                  value={option}
                                  control={
                                    <Radio
                                      color={isError ? "error" : "default"}
                                      checked={
                                        !isError
                                          ? correctAnswerIndexs?.includes(
                                              optionIndex
                                            )
                                          : errorAnswerIndexs?.includes(
                                              optionIndex
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
                                      checked={
                                        !isError
                                          ? correctAnswerIndexs?.includes(
                                              optionIndex
                                            )
                                          : errorAnswerIndexs?.includes(
                                              optionIndex
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
                  );
                }
              )}
            </Paper>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default FormPage;
