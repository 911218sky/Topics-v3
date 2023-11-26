import React, {
  memo,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Link,
  Stack,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import axios from "axios";

import Loading from "./Loading";
import { GlobalContext } from "../context/GlobalProvider";
import AutoSnackbar from "./AutoSnackbar";
import { TransitionDown } from "./SnackbarTransition";

type ActionType =
  | "SET_PC_ID"
  | "SET_IS_LOADING"
  | "SET_REMAINING_TIME"
  | "SET_SOCKET"
  | "SET_TOKEN"
  | "SET_ERROR";

interface State {
  pcId: string | null;
  isLoading: boolean;
  remainingTime: number | null;
  token: string | null;
  socket: WebSocket | null;
  error: string;
}

interface Action {
  type: ActionType;
  payload: any;
}

type WsActionType =
  | "LOGIN"
  | "REACQUIRE"
  | "INITIALIZATION"
  | "NEWTOKEN"
  | "ERROR";

interface WsAction {
  type: WsActionType;
  token?: string;
  pcId?: string;
  message?: string;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PC_ID":
      return { ...state, pcId: action.payload };
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_REMAINING_TIME":
      return { ...state, remainingTime: action.payload };
    case "SET_SOCKET":
      return { ...state, socket: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  pcId: null,
  isLoading: false,
  remainingTime: null,
  token: null,
  socket: null,
  error: "",
};

const LoginQRcode: React.FC<{
  open: boolean;
  setOpen: (value: boolean) => void;
}> = ({ open, setOpen }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pcId, token, isLoading, remainingTime, socket, error } = state;
  const { setIsLogin, reacquireUserData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleSubmitLogin = useCallback(async (token: string) => {
    dispatch({ type: "SET_IS_LOADING", payload: true });
    axios
      .get(`${process.env.REACT_APP_SEVER_URL}/authentication/qrlogin`, {
        withCredentials: true,
        params: {
          token: token,
        },
      })
      .then(() => {
        reacquireUserData();
        setIsLogin(true);
        navigate("/user/dashboard/home", { replace: true });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        dispatch({ type: "SET_IS_LOADING", payload: false });
      });
  }, []);

  const reacquireToken = useCallback(
    async (pcId: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        dispatch({ type: "SET_IS_LOADING", payload: true });
        socket.send(JSON.stringify({ type: "newToken", pcId }));
        dispatch({ type: "SET_IS_LOADING", payload: false });
        dispatch({ type: "SET_REMAINING_TIME", payload: 5 * 60 });
      } else {
        console.log(
          "WebSocket is not open for sending data. Current state:",
          socket?.readyState
        );
      }
    },
    [pcId, socket]
  );

  const wsTask = useCallback((action: WsAction) => {
    switch (action.type) {
      case "LOGIN":
        handleSubmitLogin(action.token!);
        break;
      case "REACQUIRE":
        reacquireToken(pcId!);
        break;
      case "INITIALIZATION":
        dispatch({ type: "SET_PC_ID", payload: action.pcId });
        dispatch({
          type: "SET_TOKEN",
          payload: action.token,
        });
        break;
      case "NEWTOKEN":
        dispatch({ type: "SET_TOKEN", payload: action.token });
        break;
      case "ERROR":
        dispatch({ type: "SET_ERROR", payload: action.message });
        break;
      default:
        console.log("Task not found");
    }
  }, []);

  useEffect(() => {
    if (!open || (remainingTime !== null && remainingTime > 0)) return;
    dispatch({ type: "SET_REMAINING_TIME", payload: 5 * 60 });
    const socket = new WebSocket(
      `wss${process.env.REACT_APP_SEVER_URL?.replace("https", "")}/connection`
    );
    dispatch({ type: "SET_SOCKET", payload: socket });
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (!message) return;
        wsTask(message);
      } catch (e) {}
    };
    socket.onerror = (event) => {
      console.log(event)
      dispatch({
        type: "SET_ERROR",
        payload: "Connection failed!",
      });
    };
  }, [open]);

  useEffect(() => {
    if (remainingTime && remainingTime > 0) {
      const timer = setInterval(() => {
        dispatch({
          type: "SET_REMAINING_TIME",
          payload: remainingTime - 1,
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [remainingTime]);

  if (isLoading) return <Loading />;
  return (
    <Box>
      <AutoSnackbar
        message={error}
        setMessage={(message: string) =>
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
          sx: { width: "60%" },
        }}
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <QRCode
            value={JSON.stringify({
              token,
              pcId,
              IDENTIFY: "PCLOGIN",
            })}
            level="M"
            size={300}
            includeMargin={true}
          />
          <Stack
            direction="row"
            spacing={2}
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6" gutterBottom>
              Remaining Time:
              {remainingTime !== 0 &&
                ` 0${Math.floor(remainingTime! / 60)} : ${String(
                  remainingTime! % 60
                ).padStart(2, "0")}`}
            </Typography>
            {remainingTime === 0 && (
              <Link
                component="button"
                variant="body1"
                onClick={() => {
                  wsTask({ type: "REACQUIRE" });
                }}
              >
                Reacquire
              </Link>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default memo(LoginQRcode);
