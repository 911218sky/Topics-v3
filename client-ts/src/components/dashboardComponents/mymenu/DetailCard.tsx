import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Stack,
  Typography,
  MobileStepper,
  Paper,
  useTheme,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
} from "@mui/material";
import { useQuery } from "react-query";
import axios from "axios";

import AssignmentIcon from "@mui/icons-material/Assignment";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import { MyMenuContext } from "../MyMenu";
import { Classify } from "../../../shared/SelectGameClassify";
import useImageBrightness from "../../../hooks/useImageBrightness";
import type { Assignment } from "./Card";
import Loading from "../../../shared/Loading";
import LoadingImage from "../../../shared/LoadingImage";
import ClassifysChip from "../../../shared/ClassifysChip";

type Filtered<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

type Difficulty = "Simple" | "Medium" | "Hard";

interface Game {
  id: number;
  gameName: string;
  imgId: string;
  gameContent: string;
  playTime: number;
  classify: Classify[];
}

interface Menu {
  game: Game[];
  gameDifficulty: Difficulty[];
  menuName: string;
  menuContent: string;
}

type DetailCardResponse = {
  message: string;
  assignment: Filtered<Assignment, "isDone" | "menu"> & { menu: Menu };
};

type PlayTime = {
  hour: number;
  minute: number;
};

export type DetailCardProps = {
  isOpen: boolean;
  id: number | null;
};

const DetailCard: React.FC<DetailCardProps> = ({ isOpen, id }) => {
  const { detailCardProps, setDetailCardProps } = useContext(MyMenuContext);
  const [activeStep, setActiveStep] = useState(0);
  const [gameUrl, setGameUrl] = useState<string>();
  const {
    brightness: imageBrightness,
    setImageUrl: setBrightnessUrl,
    isLoading: brightnessIsLoading,
  } = useImageBrightness();
  const [gamePlayTime, setGamePlayTime] = useState<PlayTime>({
    hour: 0,
    minute: 0,
  });

  const difficultyColor = useMemo<{ [key in Difficulty]: string }>(() => {
    return {
      Simple: "#019858",
      Medium: "#FF8000",
      Hard: "#FF2D2D",
    };
  }, []);
  const theme = useTheme();

  const { data: gameClassifys } = useQuery({
    queryKey: ["gameClassifys"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_SEVER_URL}/game/gameclassify`,
        {
          withCredentials: true,
        }
      );
      if (!response.data.classify) return;
      const transformedObj: { [key: string]: string } = {};
      for (const classify of response.data.classify) {
        transformedObj[classify.name] = classify.description;
      }
      return transformedObj;
    },
  });

  const { data: detailCardResponse, isFetching } = useQuery({
    queryKey: ["DetailCard", detailCardProps.id],
    queryFn: async (key) => {
      if (!detailCardProps.id) return;
      return axios
        .get(
          `${process.env.REACT_APP_SEVER_URL}/menu/mymenudetail/${key.queryKey[1]}`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          const data = response.data as DetailCardResponse;
          data.assignment.startDate = new Date(data.assignment.startDate);
          data.assignment.endDate = new Date(data.assignment.endDate);
          data.assignment.menu.game = data.assignment.menu.game.map(
            ({ classify, ...other }) => {
              return {
                classify: classify.map((classify) => {
                  return {
                    name: classify as unknown as string,
                    description: gameClassifys
                      ? gameClassifys[classify as unknown as string]
                      : "No detailed information was obtained",
                  };
                }),
                ...other,
              };
            }
          );
          return data;
        });
    },
    enabled: detailCardProps.id ? true : false,
  });
  useEffect(() => {
    if (!detailCardResponse) return;
    const game = detailCardResponse.assignment.menu.game;
    const gamePlayTime = game[activeStep].playTime;
    setGameUrl(
      `${process.env.REACT_APP_SEVER_URL}/public/system/image/${game[activeStep].imgId}?folder=GameImg`
    );
    setGamePlayTime({
      hour: Math.floor(gamePlayTime / (60 * 60)),
      minute: (gamePlayTime / 60) % 60,
    });
  }, [detailCardResponse, activeStep]);

  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (!detailCardResponse) return;
  }, [detailCardResponse]);

  useEffect(() => {
    if (!gameUrl) return;
    setBrightnessUrl(gameUrl);
  }, [gameUrl, setBrightnessUrl]);

  const handelClose = useCallback(() => {
    setDetailCardProps((detailCardProps) => ({
      ...detailCardProps,
      isOpen: false,
    }));
  }, [setDetailCardProps]);

  if (!isOpen) return null;
  if (isFetching || !detailCardResponse) return <Loading />;
  const {
    assignment: {
      author: { userName, imgId },
      menu: { game, menuName, gameDifficulty, menuContent },
      startDate,
      endDate,
    },
  } = detailCardResponse;

  return (
    <Dialog
      open={isOpen}
      onClose={handelClose}
      maxWidth={"md"}
      fullWidth={true}
      sx={{ width: "100%" }}
    >
      <DialogContent>
        <Stack
          direction="row"
          spacing={2}
          py={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AssignmentIcon sx={{ width: "25px", height: "25px" }} />
          <Typography variant="h5">{menuName}</Typography>
        </Stack>
        <Divider variant="middle" />
        <Grid container p={2}>
          <Grid item xs={4} lg={4}>
            <Stack direction="column" spacing={1} px={2}>
              <Card
                sx={{
                  borderRadius: "15px",
                  minWidth: "150px",
                  display: "flex",
                  flexDirection: "column",
                  m: 1,
                  ml: 3,
                }}
                elevation={2}
              >
                <LoadingImage
                  alt={userName}
                  url={
                    imgId
                      ? `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${imgId}`
                      : `${process.env.REACT_APP_SEVER_URL}/public/system/image/user.png`
                  }
                  style={{
                    height: "150px",
                    borderRadius: 5,
                  }}
                />
                <Typography
                  variant="body1"
                  style={{
                    opacity: 0.75,
                    textAlign: "center",
                    flexGrow: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    padding: 2,
                  }}
                >
                  {userName}
                </Typography>
              </Card>
              <Typography variant="body1" style={{ opacity: 0.75 }}>
                {`startDate : ${startDate.toLocaleDateString()}`}
              </Typography>
              <Typography variant="body1" style={{ opacity: 0.75 }}>
                {`endDate : ${endDate.toLocaleDateString()}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  WebkitBoxOrient: "vertical",
                }}
                style={{ opacity: 0.75, wordBreak: "break-word" }}
              >
                {menuContent}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={8} lg={8}>
            <Paper
              square
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                bgcolor: difficultyColor[gameDifficulty[activeStep]],
              }}
            >
              <Typography>{game[activeStep].gameName}</Typography>
            </Paper>
            <Box
              sx={{ height: "85%", overflow: "hidden", position: "relative" }}
            >
              {brightnessIsLoading ? (
                <Skeleton variant="rectangular" width="100%" height={255} />
              ) : (
                <>
                  <LoadingImage
                    url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/${game[activeStep].imgId}?folder=GameImg`}
                    alt={game[activeStep].gameName}
                    style={{
                      filter: "blur(5px)",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      overflow: "auto",
                      height: "100%",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: imageBrightness < 128 ? "white" : "black",
                        padding: "10px",
                        fontWeight: "bold",
                        mb: 10,
                        overflow: "auto",
                        whiteSpace: "pre-line",
                        WebkitBoxOrient: "vertical",
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                      }}
                      style={{ opacity: 0.75, wordBreak: "break-word" }}
                    >
                      {game[activeStep].gameContent
                        .split("\n")
                        .map((text, index) => (
                          <span key={index}>
                            {text}
                            <br />
                          </span>
                        ))}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                    }}
                  >
                    <Stack
                      spacing={1}
                      direction="row"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        label={`PlayTime : ${
                          gamePlayTime.hour ? `${gamePlayTime.hour}h` : ""
                        } ${gamePlayTime.minute}m`}
                        sx={{
                          bgcolor:
                            imageBrightness < 128 ? "#424242" : "#eeeeee",
                          color: imageBrightness < 128 ? "white" : "black",
                        }}
                      />
                      {game[activeStep].classify &&
                        game[activeStep].classify.map((classify, index) => (
                          <ClassifysChip
                            classify={classify}
                            key={classify.name}
                          />
                        ))}
                    </Stack>
                  </Box>
                </>
              )}
            </Box>
            <MobileStepper
              variant="text"
              steps={game.length}
              position="static"
              activeStep={activeStep}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={activeStep === game.length - 1}
                >
                  Next
                  {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                  ) : (
                    <KeyboardArrowRight />
                  )}
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                  ) : (
                    <KeyboardArrowLeft />
                  )}
                  Back
                </Button>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DetailCard);
