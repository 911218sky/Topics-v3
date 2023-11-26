import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  List,
  Slide,
  MenuItem,
  Link,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";

import AutoSnackbar from "../../shared/AutoSnackbar";
import PasswordAchievement from "../../shared/PasswordAchievement";
import LoadingImage from "../../shared/LoadingImage";
import { TransitionDown } from "../../shared/SnackbarTransition";

type Action =
  | { type: "SET_APPELLATION"; payload: string }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_IS_PASSWORD_FINISH"; payload: boolean }
  | { type: "SET_CAN_REGISTER"; payload: boolean }
  | { type: "SET_REGISTER_LOADING"; payload: boolean };

interface State {
  appellation: string;
  name: string;
  email: string;
  password: string;
  error: string;
  isPasswordFinish: boolean;
  canRegister: boolean;
  registerLoading: boolean;
}

const initialState: State = {
  appellation: "",
  name: "",
  email: "",
  password: "",
  error: "",
  isPasswordFinish: false,
  canRegister: false,
  registerLoading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_APPELLATION":
      return { ...state, appellation: action.payload };
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_IS_PASSWORD_FINISH":
      return { ...state, isPasswordFinish: action.payload };
    case "SET_CAN_REGISTER":
      return { ...state, canRegister: action.payload };
    case "SET_REGISTER_LOADING":
      return { ...state, registerLoading: action.payload };
    default:
      return state;
  }
};

const Register = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    appellation,
    name,
    email,
    password,
    error,
    isPasswordFinish,
    canRegister,
    registerLoading,
  } = state;
  const navigate = useNavigate();

  useEffect(() => {
    if (isPasswordFinish && email && name && appellation) {
      dispatch({ type: "SET_CAN_REGISTER", payload: true });
    } else {
      dispatch({ type: "SET_CAN_REGISTER", payload: false });
    }
  }, [password, email, name, appellation, isPasswordFinish]);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_REGISTER_LOADING", payload: true });
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/authentication/register`,
        {
          userName: name,
          email: email,
          password: password,
          appellation: appellation,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        navigate(`/restricted/id/${response.data.id}/verificationcodeform`);
      })
      .catch((error) => {
        dispatch({
          type: "SET_ERROR",
          payload: error.response?.data.message || "Registration failed",
        });
      })
      .finally(() => {
        dispatch({ type: "SET_REGISTER_LOADING", payload: false });
      });
  };

  return (
    <Box>
      <AutoSnackbar
        message={error}
        setMessage={(message) =>
          dispatch({ type: "SET_ERROR", payload: message })
        }
        autoHideDuration={2000}
        severity="error"
        variant="filled"
        alertTitle="error"
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
      <Grid
        container
        sx={{
          height: "100vh",
          position: "fixed",
          overflow: "auto",
        }}
      >
        <Slide direction="right" in={true} unmountOnExit>
          <Grid item xs={true} sm={6} md={5} sx={{ height: "100%" }}>
            <LoadingImage
              url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/register.png?original=true`}
              alt="register"
            />
          </Grid>
        </Slide>
        <Grid item xs={12} sm={6} md={7} sx={{ height: "100%" }}>
          <List
            disablePadding
            sx={{
              maxHeight: "100vh",
              width: "100%",
              position: "relative",
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                width: "0",
                height: "0",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "transparent",
              },
              "& ul": { padding: 0 },
            }}
          >
            <Box
              component="div"
              sx={{
                my: 17,
                mx: 5,
              }}
            >
              <Typography variant="h3">Register ID</Typography>
              <Typography variant="h6">
                Do you already have ID?
                <Link href={`${window.location.origin}/public/login`}>
                  Sign in now
                </Link>
              </Typography>
              <Box
                component="form"
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                onSubmit={handleRegister}
              >
                <FormControl sx={{ m: 1, width: "100%" }}>
                  <InputLabel id="AppellationId">Appellation</InputLabel>
                  <Select
                    labelId="AppellationId"
                    label="Appellation"
                    value={appellation}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_APPELLATION",
                        payload: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Mister">Mister</MenuItem>
                    <MenuItem value="Madam">Madam</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  type="text"
                  onChange={(e) =>
                    dispatch({ type: "SET_NAME", payload: e.target.value })
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  error={
                    error !== "" &&
                    error === "This account is already registered"
                  }
                  helperText={error}
                  value={email}
                  label="Email Address"
                  type="email"
                  onChange={(e) =>
                    dispatch({ type: "SET_EMAIL", payload: e.target.value })
                  }
                />
                <PasswordAchievement
                  password={password}
                  setPassword={(newPassword: string) =>
                    dispatch({ type: "SET_PASSWORD", payload: newPassword })
                  }
                  setIsFinish={(isFinish: boolean) =>
                    dispatch({
                      type: "SET_IS_PASSWORD_FINISH",
                      payload: isFinish,
                    })
                  }
                />
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{ width: "100%" }}
                >
                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    loading={registerLoading}
                    disabled={!canRegister}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Register
                  </LoadingButton>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{ width: "100%" }}
                >
                  <Button
                    color="inherit"
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/public/login")}
                  >
                    Sign in now
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
