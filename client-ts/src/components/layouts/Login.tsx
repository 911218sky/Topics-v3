import React, { useContext, useReducer, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Slide,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  List,
  Link,
  Stack,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

import AutoSnackbar from "../../shared/AutoSnackbar";
import LoadingImage from "../../shared/LoadingImage";
import LoginQRcode from "../../shared/LoginQRcode";
import { TransitionDown } from "../../shared/SnackbarTransition";
import { GlobalContext } from "../../context/GlobalProvider";

interface State {
  email: string;
  password: string;
  error: string;
  loginLoading: boolean;
  showPassword: boolean;
  loginQRcodeOpen: boolean;
}

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOGIN_LOADING"; payload: boolean }
  | { type: "SET_SHOW_PASSWORD"; payload: boolean }
  | { type: "SET_LOGIN_QRCODE_OPEN"; payload: boolean };

const initialState: State = {
  email: "",
  password: "",
  error: "",
  loginLoading: false,
  showPassword: false,
  loginQRcodeOpen: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_LOGIN_LOADING":
      return { ...state, loginLoading: action.payload };
    case "SET_SHOW_PASSWORD":
      return { ...state, showPassword: action.payload };
    case "SET_LOGIN_QRCODE_OPEN":
      return { ...state, loginQRcodeOpen: action.payload };
    default:
      return state;
  }
};

const Login: React.FC = () => {
  const { setIsLogin, reacquireUserData } = useContext(GlobalContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    email,
    password,
    error,
    loginLoading,
    showPassword,
    loginQRcodeOpen,
  } = state;

  const navigate = useNavigate();

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_LOGIN_LOADING", payload: true });
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/authentication/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch({ type: "SET_ERROR", payload: "" });
        reacquireUserData();
        setIsLogin(true);
        navigate("/user/dashboard/home", { replace: true });
      })
      .catch((error) => {
        dispatch({
          type: "SET_ERROR",
          payload: error.response.data.message,
        });
        console.log(error.response.data.v);
        dispatch({ type: "SET_EMAIL", payload: "" });
        dispatch({ type: "SET_PASSWORD", payload: "" });
      })
      .finally(() => {
        dispatch({ type: "SET_LOGIN_LOADING", payload: false });
      });
  };

  const handleSetLoginQrcodeOpen = useCallback(
    (isOpen: boolean) =>
      dispatch({ type: "SET_LOGIN_QRCODE_OPEN", payload: !!isOpen }),
    []
  );

  return (
    <Box>
      <AutoSnackbar
        message={error}
        setMessage={(message) =>
          dispatch({ type: "SET_ERROR", payload: message as string })
        }
        autoHideDuration={2000}
        variant="filled"
        severity="error"
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
      <LoginQRcode open={loginQRcodeOpen} setOpen={handleSetLoginQrcodeOpen} />
      <Grid
        container
        direction="row-reverse"
        component="main"
        sx={{
          height: "100vh",
          position: "fixed",
          overflow: "auto",
        }}
      >
        <Slide direction="left" in={true} unmountOnExit>
          <Grid item xs={true} sm={6} md={5} sx={{ height: "100%" }}>
            <LoadingImage
              url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/login.png?original=true`}
              alt="login"
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
              <Typography variant="h3">Login ID</Typography>
              <Typography variant="h6">
                You don't have ID ?
                <Link href={`${window.location.origin}/public/register`}>
                  Register now
                </Link>
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmitLogin}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  error={!!error}
                  value={email}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_EMAIL",
                      payload: e.target.value,
                    })
                  }
                />
                <FormControl
                  margin="normal"
                  fullWidth
                  required
                  error={!!error}
                  variant="outlined"
                >
                  <InputLabel htmlFor="outlined-adornment-password">
                    Password
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PASSWORD",
                        payload: e.target.value,
                      })
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            dispatch({
                              type: "SET_SHOW_PASSWORD",
                              payload: !showPassword,
                            })
                          }
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                </FormControl>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{ width: "100%", paddingTop: "20px" }}
                >
                  <LoadingButton
                    type="submit"
                    loading={loginLoading}
                    variant="contained"
                    sx={{ mb: 2 }}
                    disabled={loginLoading}
                    fullWidth
                  >
                    Sign In
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
                    onClick={() => navigate(`/public/register`)}
                  >
                    Sign up now
                  </Button>
                </motion.div>
              </Box>
              <Stack
                direction="row"
                spacing={2}
                width="100%"
                alignItems="center"
                justifyContent="center"
              >
                <Link
                  sx={{ mt: 1, mb: 2 }}
                  href="/public/forgotpassword"
                  variant="body1"
                >
                  Forget the password?
                </Link>
                <Link
                  component="button"
                  type="button"
                  variant="body1"
                  onClick={() => {
                    dispatch({
                      type: "SET_LOGIN_QRCODE_OPEN",
                      payload: true,
                    });
                  }}
                >
                  QRcode Login?
                </Link>
              </Stack>
            </Box>
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
