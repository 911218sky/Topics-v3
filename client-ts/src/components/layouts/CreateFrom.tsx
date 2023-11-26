import { useReducer, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce, DebouncedFunc } from "lodash";
import {
  Box,
  Typography,
  TextField,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Checkbox,
  InputAdornment,
  IconButton,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingButton from "@mui/lab/LoadingButton";
import { Delete } from "@mui/icons-material";
import axios from "axios";

import { queryClient } from "../../context/ReactQueryProvider";
import { TransitionDown } from "../../shared/SnackbarTransition";
import useDelayedAction from "../../hooks/useDelayedAction";
import DoubleConfirmation from "./../../shared/DoubleConfirmation";
import AutoSnackbar from "../../shared/AutoSnackbar";

type Option = {
  option: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  options: Option[];
};

type Form = {
  formName: string;
  isSingleChoice: boolean;
  isRandomized: boolean;
  questions: {
    question: string;
    options: string[];
  }[];
  correctAnswer: number[][];
};

type State = {
  formName: string;
  error: string;
  message: string;
  isLoading: boolean;
  isSingleChoice: boolean;
  isRandomized: boolean;
  openDoubleConfirmation: boolean;
  submitButtonDisable: boolean;
  questions: Question[];
};

type Action =
  | { type: "SET_FORM_NAME"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_IS_RANDOMIZED"; payload: boolean }
  | { type: "SET_OPEN_DOUBLE_CONFIRMATION"; payload: boolean }
  | { type: "SET_SUBMIT_BUTTON_DISABLE"; payload: boolean }
  | { type: "SET_IS_SINGLE_CHOICE"; payload: boolean }
  | { type: "ADD_QUESTION" }
  | { type: "DELETE_QUESTION"; payload: number }
  | { type: "ADD_OPTION"; payload: number }
  | {
      type: "DELETE_OPTION";
      payload: { questionIndex: number; optionIndex: number };
    }
  | { type: "SET_QUESTION"; payload: { index: number; value: string } }
  | {
      type: "SET_CORRECT";
      payload: {
        questionIndex: number;
        optionIndex: number;
        isSingleChoice: boolean;
        value: boolean;
      };
    }
  | {
      type: "SET_OPTION";
      payload: { questionIndex: number; optionIndex: number; value: string };
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_FORM_NAME":
      return { ...state, formName: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_IS_RANDOMIZED":
      return { ...state, isRandomized: action.payload };
    case "SET_OPEN_DOUBLE_CONFIRMATION":
      return { ...state, openDoubleConfirmation: action.payload };
    case "SET_SUBMIT_BUTTON_DISABLE":
      return { ...state, submitButtonDisable: action.payload };
    case "SET_IS_SINGLE_CHOICE":
      return {
        ...state,
        isSingleChoice: action.payload,
        questions: state.questions.map((question) => ({
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: false,
          })),
        })),
      };
    case "ADD_QUESTION":
      return {
        ...state,
        questions: [
          ...state.questions,
          {
            question: "",
            options: [{ option: "", isCorrect: false }],
          },
        ],
      };
    case "DELETE_QUESTION":
      return {
        ...state,
        questions: state.questions.filter(
          (_, index) => index !== action.payload
        ),
      };
    case "ADD_OPTION":
      return {
        ...state,
        questions: state.questions.map((question, index) => {
          if (index === action.payload) {
            return {
              ...question,
              options: [...question.options, { option: "", isCorrect: false }],
            };
          }
          return question;
        }),
      };
    case "DELETE_OPTION":
      return {
        ...state,
        questions: state.questions.map((question, index) => {
          if (index === action.payload.questionIndex) {
            return {
              ...question,
              options: question.options.filter(
                (_, optionIndex) => optionIndex !== action.payload.optionIndex
              ),
            };
          }
          return question;
        }),
      };
    case "SET_QUESTION":
      return {
        ...state,
        questions: state.questions.map((question, index) => {
          if (index === action.payload.index) {
            return { ...question, question: action.payload.value };
          }
          return question;
        }),
      };
    case "SET_CORRECT":
      return {
        ...state,
        questions: state.questions.map((question, questionIndex) => {
          if (questionIndex === action.payload.questionIndex) {
            return {
              ...question,
              options: question.options.map((option, optionIndex) => {
                if (action.payload.isSingleChoice) {
                  return {
                    ...option,
                    isCorrect: optionIndex === action.payload.optionIndex,
                  };
                } else {
                  return {
                    ...option,
                    isCorrect:
                      optionIndex === action.payload.optionIndex
                        ? action.payload.value
                        : option.isCorrect,
                  };
                }
              }),
            };
          }
          return question;
        }),
      };
    case "SET_OPTION":
      return {
        ...state,
        questions: state.questions.map((question, questionIndex) => {
          if (questionIndex === action.payload.questionIndex) {
            return {
              ...question,
              options: question.options.map((option, optionIndex) => {
                if (optionIndex === action.payload.optionIndex) {
                  return { ...option, option: action.payload.value };
                }
                return option;
              }),
            };
          }
          return question;
        }),
      };
    default:
      return state;
  }
};

const initialState: State = {
  formName: "",
  error: "",
  message: "",
  isLoading: false,
  isSingleChoice: true,
  isRandomized: true,
  openDoubleConfirmation: false,
  submitButtonDisable: false,
  questions: [
    {
      question: "",
      options: [{ option: "", isCorrect: false }],
    },
  ],
};

const CreateFrom: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    formName,
    error,
    message,
    isLoading,
    isSingleChoice,
    isRandomized,
    questions,
    openDoubleConfirmation,
    submitButtonDisable,
  } = state;

  const navigate = useNavigate();
  const [, jumpToHome] = useDelayedAction(1000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  const handleAddQuestion = useCallback(() => {
    dispatch({ type: "ADD_QUESTION" });
  }, []);

  const handleIsSingleChoiceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: "SET_IS_SINGLE_CHOICE",
        payload: e.target.value === "single",
      });
    },
    [dispatch]
  );

  const handleIsRandomizedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: "SET_IS_RANDOMIZED",
        payload: e.target.value === "random",
      });
    },
    [dispatch]
  );

  const handleformNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_FORM_NAME", payload: e.target.value });
    },
    [dispatch]
  );

  const handleQuestionChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      questionIndex: number
    ) => {
      dispatch({
        type: "SET_QUESTION",
        payload: { index: questionIndex, value: e.target.value },
      });
    },
    [dispatch]
  );

  const handleCorrectChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      questionIndex: number,
      optionIndex: number
    ) => {
      dispatch({
        type: "SET_CORRECT",
        payload: {
          questionIndex,
          optionIndex,
          isSingleChoice: isSingleChoice,
          value: e.target.checked,
        },
      });
    },
    [dispatch, isSingleChoice]
  );

  const handleOptionChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      questionIndex: number,
      optionIndex: number
    ) => {
      dispatch({
        type: "SET_OPTION",
        payload: { questionIndex, optionIndex, value: e.target.value },
      });
    },
    [dispatch]
  );

  const handleDeleteOption = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      questionIndex: number,
      optionIndex: number
    ) => {
      dispatch({
        type: "DELETE_OPTION",
        payload: { questionIndex, optionIndex },
      });
    },
    [dispatch]
  );

  const handleDeleteQuestion = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      questionIndex: number
    ) => {
      dispatch({ type: "DELETE_QUESTION", payload: questionIndex });
    },
    [dispatch]
  );

  const handleAddOption = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      questionIndex: number
    ) => {
      dispatch({ type: "ADD_OPTION", payload: questionIndex });
    },
    [dispatch]
  );

  const handlSetMessage = useCallback(
    (message: string) => {
      dispatch({ type: "SET_MESSAGE", payload: message });
    },
    [dispatch]
  );

  const handlSetError = useCallback(
    (message: string) => {
      dispatch({ type: "SET_ERROR", payload: message });
    },
    [dispatch]
  );

  const handleDoubleConfirmationOnFail = useCallback(
    () =>
      dispatch({
        type: "SET_OPEN_DOUBLE_CONFIRMATION",
        payload: false,
      }),
    [dispatch]
  );

  const handleSubmit: DebouncedFunc<() => void> = debounce(() => {
    const answersExist = questions.every(({ options }) =>
      options.some(({ isCorrect }) => isCorrect)
    );

    const optionsExist = questions.some(({ options }) =>
      options.some(({ option }) => option !== "")
    );

    if (!answersExist || !optionsExist || formName === "") {
      dispatch({
        type: "SET_OPEN_DOUBLE_CONFIRMATION",
        payload: false,
      });
      handlSetError("Answer or option does not exist");
      return;
    }

    const form: Form = {
      formName: formName,
      isSingleChoice: isSingleChoice,
      isRandomized: isRandomized,
      questions: questions.map(({ question, options }) => {
        return {
          question: question,
          options: options.map(({ option }) => option),
        };
      }),
      correctAnswer: questions.map(({ options }, index) => {
        return options
          .map((option, index) => (option.isCorrect ? index : -1))
          .filter((index) => index !== -1);
      }),
    };

    dispatch({
      type: "SET_OPEN_DOUBLE_CONFIRMATION",
      payload: false,
    });

    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/form/upload`,
        { form },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        queryClient.refetchQueries(["getFormTableData"]);
        handlSetMessage(response.data.message);
        dispatch({
          type: "SET_SUBMIT_BUTTON_DISABLE",
          payload: true,
        });
        jumpToHome();
      })
      .catch((error) => {
        handlSetError(error.response.data.message);
      });
  }, 500);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <DoubleConfirmation
        open={openDoubleConfirmation}
        title="Reconfirm"
        contentText="You can't modify it after sending it out, make sure you want to continue the operation."
        onSuccess={() => handleSubmit()}
        onFail={handleDoubleConfirmationOnFail}
      />
      <AutoSnackbar
        message={error}
        setMessage={handlSetError}
        autoHideDuration={1000}
        severity="error"
        variant="filled"
        alertTitle="Error"
        otherSnackbar={{
          TransitionComponent: TransitionDown,
        }}
        otherAlert={{
          sx: { width: "60%" },
        }}
      />
      <AutoSnackbar
        message={message}
        setMessage={handlSetMessage}
        autoHideDuration={1000}
        severity="success"
        variant="filled"
        alertTitle="Information"
        otherSnackbar={{
          sx: { width: "100%" },
          TransitionComponent: TransitionDown,
        }}
        otherAlert={{
          sx: { width: "60%", color: "white" },
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0, 0.71, 0.2, 1.01],
        }}
        style={{
          width: "100%",
          paddingBottom: 5,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            pb: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mt: 4,
              mb: 4,
            }}
          >
            <TextField
              fullWidth
              required
              label="問卷名稱"
              value={formName}
              error={!formName}
              onChange={handleformNameChange}
            />
          </Typography>
          <Paper sx={{ p: 4 }}>
            <FormControl component="fieldset" sx={{ ml: 2 }} required>
              <FormLabel component="legend">選擇題型</FormLabel>
              <RadioGroup
                value={isSingleChoice ? "single" : "multi"}
                onChange={handleIsSingleChoiceChange}
                row
              >
                <FormControlLabel
                  value="single"
                  control={<Radio color="info" />}
                  label="單選"
                />
                <FormControlLabel
                  value="multi"
                  control={<Radio color="info" />}
                  label="複選"
                />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" required sx={{ ml: 2 }}>
              <FormLabel component="legend">亂數出題</FormLabel>
              <RadioGroup
                value={isRandomized ? "random" : "noRandom"}
                onChange={handleIsRandomizedChange}
                row
              >
                <FormControlLabel
                  value="random"
                  control={<Radio color="info" />}
                  label="是"
                />
                <FormControlLabel
                  value="noRandom"
                  control={<Radio color="info" />}
                  label="否"
                />
              </RadioGroup>
            </FormControl>
            {questions.map(({ question, options }, questionIndex) => {
              return (
                <Paper
                  key={questionIndex}
                  sx={{
                    mt: 5,
                    mb: 5,
                    p: 5,
                    borderRadius: "10px",
                    // boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    transition: "box-shadow 0.3s ease-in-out",
                    boxShadow:
                      !question ||
                      !options.every(({ option }) => option !== "") ||
                      !options.some(({ isCorrect }) => isCorrect)
                        ? "0 0 20px rgba(233, 30, 99, 0.8)"
                        : "",
                  }}
                  elevation={5}
                >
                  <Box
                    sx={{
                      width: "100%",
                      m: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                      問題 {questionIndex + 1}
                    </Typography>
                    {questions.length > 1 && (
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteQuestion(e, questionIndex)}
                        sx={{
                          marginLeft: "auto",
                          mb: 2,
                        }}
                      >
                        刪除問題
                      </Button>
                    )}
                  </Box>
                  <TextField
                    label="問題"
                    value={question}
                    onChange={(e) => handleQuestionChange(e, questionIndex)}
                    sx={{ ml: 2 }}
                    fullWidth
                  />
                  {options.map(({ option, isCorrect }, optionIndex) => (
                    <div key={`${questionIndex}-${optionIndex}`}>
                      <Box
                        sx={{
                          width: "100%",
                          m: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isSingleChoice ? (
                          <Radio
                            checked={isCorrect}
                            onChange={(e) =>
                              handleCorrectChange(e, questionIndex, optionIndex)
                            }
                            value={optionIndex}
                            name={`question-${questionIndex}`}
                          />
                        ) : (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isCorrect}
                                onChange={(e) =>
                                  handleCorrectChange(
                                    e,
                                    questionIndex,
                                    optionIndex
                                  )
                                }
                                color="info"
                              />
                            }
                            label=""
                          />
                        )}
                        <TextField
                          value={option}
                          label={`選項 ${optionIndex + 1}`}
                          onChange={(e) =>
                            handleOptionChange(e, questionIndex, optionIndex)
                          }
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={(e) =>
                                    handleDeleteOption(
                                      e,
                                      questionIndex,
                                      optionIndex
                                    )
                                  }
                                >
                                  <Delete sx={{ color: "red" }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </div>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={(e) => handleAddOption(e, questionIndex)}
                    sx={{ display: "flex", mb: 2, mt: 1 }}
                  >
                    新增選項
                  </Button>
                </Paper>
              );
            })}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleAddQuestion}>
                新增問題
              </Button>
            </Box>
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
                sx={{ mt: 3, mb: 2 }}
                disabled={submitButtonDisable}
                onClick={() =>
                  dispatch({
                    type: "SET_OPEN_DOUBLE_CONFIRMATION",
                    payload: true,
                  })
                }
                fullWidth
              >
                Submit
              </LoadingButton>
            </motion.div>
          </Paper>
        </Container>
      </motion.div>
    </Box>
  );
};

export default CreateFrom;
