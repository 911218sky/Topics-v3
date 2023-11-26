import { useCallback, useReducer } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  createTheme,
  ThemeProvider,
  Grid,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { VideogameAsset } from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers";
import axios from "axios";
import { Dayjs } from "dayjs";

import { TransitionDown } from "../../shared/SnackbarTransition";
import { queryClient } from "../../context/ReactQueryProvider";
import SelectGameClassify from "../../shared/SelectGameClassify";
import LoadingImage from "../../shared/LoadingImage";
import ParticleField from "../../shared/special/ParticleField";
import ImageDropzone from "../../shared/ImageDropzone";
import AutoSnackbar from "../../shared/AutoSnackbar";
import Music from "../../shared/special/Music";
import useDelayedAction from "../../hooks/useDelayedAction";
import getImageBlob from "../../tool/GetImageBlob";
import { Classify } from "../../shared/SelectGameClassify";

type State = {
  image: File | null;
  error: string | null;
  message: string | null;
  isLoading: boolean;
  gameName: string;
  gameContent: string;
  playTime: number | null;
  classifys: Classify[];
  isSubmit: boolean;
};

type Action =
  | { type: "SET_IMAGE"; payload: File | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MESSAGE"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_GAME_NAME"; payload: string }
  | { type: "SET_GAME_CONTENT"; payload: string }
  | { type: "SET_PLAY_TIME"; payload: number | null }
  | { type: "SET_CLASSIFYS"; payload: Classify[] }
  | { type: "SET_IS_SUBMIT"; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_IMAGE":
      return { ...state, image: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_GAME_NAME":
      return { ...state, gameName: action.payload };
    case "SET_GAME_CONTENT":
      return { ...state, gameContent: action.payload };
    case "SET_PLAY_TIME":
      return { ...state, playTime: action.payload };
    case "SET_CLASSIFYS":
      return { ...state, classifys: action.payload };
    case "SET_IS_SUBMIT":
      return { ...state, isSubmit: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  image: null,
  error: null,
  message: null,
  isLoading: false,
  gameName: "",
  gameContent: "",
  playTime: null,
  classifys: [],
  isSubmit: false,
};

const CreateGame: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    image,
    error,
    message,
    isLoading,
    gameName,
    gameContent,
    playTime,
    classifys,
    isSubmit,
  } = state;

  const theme = createTheme({
    palette: {
      mode: "light",
    },
  });
  const navigate = useNavigate();
  const [, jumpToHome] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  const handleSetMessage = useCallback((message: string) => {
    dispatch({ type: "SET_MESSAGE", payload: message });
  }, []);

  const handleSetError = useCallback((message: string) => {
    dispatch({ type: "SET_ERROR", payload: message });
  }, []);

  const handleSetGameName = useCallback((name: string) => {
    dispatch({ type: "SET_GAME_NAME", payload: name });
  }, []);

  const handleSetClassifys = useCallback((classifys: Classify[]) => {
    dispatch({ type: "SET_CLASSIFYS", payload: classifys });
  }, []);

  const handleSetContent = useCallback((content: string) => {
    dispatch({ type: "SET_GAME_CONTENT", payload: content });
  }, []);

  const handleSetPlayTime = useCallback((value: Dayjs | null) => {
    if (!value) return;
    const hour = value.hour();
    const minute = value.minute();
    dispatch({
      type: "SET_PLAY_TIME",
      payload: hour * 60 * 60 + minute * 60,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !playTime || !classifys || !gameContent) {
      handleSetError("Please fill all the fields");
      return;
    }
    dispatch({ type: "SET_IS_SUBMIT", payload: true });
    dispatch({ type: "SET_LOADING", payload: true });
    const blob = image ? await getImageBlob(image) : null;
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/game/creategame`,
        {
          type: "gameImg",
          gameName: gameName,
          gameContent: gameContent,
          playTime: playTime,
          classifys: classifys.map((item) => item.name),
          image: blob,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        handleSetMessage(response.data.message);
        queryClient.refetchQueries(["gamesData"]);
        jumpToHome();
      })
      .catch((error) => {
        handleSetError(error.response.data.message);
        dispatch({ type: "SET_IS_SUBMIT", payload: false });
      })
      .finally(() => {
        dispatch({ type: "SET_LOADING", payload: false });
      });
  };

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
      <ThemeProvider theme={theme}>
        <AutoSnackbar
          message={message || ""}
          setMessage={handleSetMessage}
          autoHideDuration={2000}
          severity="success"
          alertTitle="Information"
          variant="filled"
          otherSnackbar={{
            sx: { width: "100%" },
            TransitionComponent: TransitionDown,
          }}
          otherAlert={{
            sx: {
              width: "60%",
              color: "#fff",
              backgroundColor: "rgb(0, 230, 0,0.5)",
            },
          }}
        />
        <AutoSnackbar
          message={error || ""}
          setMessage={handleSetError}
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
        <ParticleField MaxparticleQuantity={100} />
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
            url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/creategame.png?original=true`}
            alt="CreateGame"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Grid
            container
            component={Container}
            direction="column"
            maxWidth="lg"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              padding: "2rem",
              margin: "1rem",
              borderRadius: "10px",
              color: "black",
              overflow: "auto",
              maxHeight: "100vh",
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Grid container item direction="row" spacing={{ xs: 2, lg: 2 }}>
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <VideogameAsset sx={{ fontSize: 63, color: "primary.dark" }} />
                <Typography variant="h4" gutterBottom>
                  Create Game
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{ maxHeight: "65vh", minHeight: "300px" }}
              >
                <ImageDropzone
                  image={image}
                  setImage={(image: any) =>
                    dispatch({
                      type: "SET_IMAGE",
                      payload: image as File,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container direction="row" spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      label="GameName"
                      value={gameName}
                      onChange={(e) => handleSetGameName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      sx={{ width: "100%" }}
                      label="PlayTime *"
                      ampm={false}
                      onAccept={handleSetPlayTime}
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <SelectGameClassify
                      classifys={classifys}
                      setClassifys={handleSetClassifys}
                      selectProps={{
                        required: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                      label="GameContent"
                      multiline
                      fullWidth
                      required
                      value={gameContent}
                      onChange={(e) => handleSetContent(e.target.value)}
                      rows={16}
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      loading={isLoading}
                      disabled={isSubmit}
                    >
                      Submit
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
        <Music
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/audio/creategame.mp3`}
          sx={{
            position: "fixed",
            bottom: "2%",
            right: "2%",
            color: "white",
          }}
        />
      </ThemeProvider>
    </motion.div>
  );
};

export default CreateGame;
