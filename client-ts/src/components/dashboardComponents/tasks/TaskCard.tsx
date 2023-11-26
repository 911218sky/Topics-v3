import React, {
  useCallback,
  useMemo,
  useState,
  useContext,
  memo,
  useEffect,
} from "react";
import {
  Card,
  Rating,
  Grid,
  Typography,
  Divider,
  Button,
  Stack,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDrag } from "react-dnd";
import { Favorite, FavoriteBorder, ExpandMore } from "@mui/icons-material";
import { useAnimation, motion } from "framer-motion";
import axios from "axios";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";

import { Classify } from "../../../shared/SelectGameClassify";
import ClassifysChip from "../../../shared/ClassifysChip";
import { TasksContext } from "../TasksTable";
import LoadingImage from "../../../shared/LoadingImage";
import AnimatedChip from "../../../shared/AnimatedChip";

export interface TaskCardProps {
  gameName: string;
  classifys: Classify[];
  gameContent: string;
  gameFavorite: number;
  gameUsageCount: number;
  playTime: number;
  imgId: string | null;
  cardId: string;
  gameId: number;
  isFavorite: boolean;
}

export const TaskCardDropType = "TaskCardDrop";

export interface TaskCardDrop {
  gameName: string;
  difficulty: string;
  playTime: number;
  imgId: string | null;
  cardId: string;
  gameId: number | null;
}

const TaskCard: React.FC<TaskCardProps> = ({
  gameName,
  classifys,
  gameContent,
  gameFavorite,
  gameUsageCount,
  playTime,
  imgId,
  gameId,
  isFavorite,
}) => {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [currentIsFavorite, setCurrentIsFavorite] =
    useState<number>(gameFavorite);
  const playTimeHour = useMemo(() => Math.floor(playTime / (60 * 60)), []);
  const playTimeMinute = useMemo(() => (playTime / 60) % 60, []);
  const [isRendered, setIsRendered] = useState(() => false);
  const theme = useTheme();
  const isLgScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const infoAnimationControls = useAnimation();

  useEffect(() => {
    setTimeout(() => {
      setIsRendered(true);
    }, 300);
  }, []);

  const {
    setError,
    setTasks: { addCart },
  } = useContext(TasksContext);

  const handleMoreInfoClick = useCallback(async () => {
    setShowMoreInfo((showMoreInfo) => !showMoreInfo);
    await infoAnimationControls.start({
      height: showMoreInfo ? 0 : "25px",
      opacity: showMoreInfo ? 0 : 1,
      transition: { duration: 0.3 },
    });
  }, [infoAnimationControls, showMoreInfo]);

  const handleChipClick = useCallback((label: string) => {
    setDifficulty((prevLabel) => (prevLabel === label ? null : label));
  }, []);

  const handleFavoriteSubmit = useCallback(
    async (isClickFavorite: boolean) => {
      return axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/game/favorite`,
          {
            gameId: gameId,
            isFavorite: isClickFavorite,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          setCurrentIsFavorite(response.data.gameFavorite);
        })
        .catch((error) => {
          setCurrentIsFavorite(gameFavorite);
        });
    },
    [gameFavorite, gameId]
  );

  const handleAddTask = useCallback(
    (difficulty: string | null) => {
      if (!difficulty) {
        setError("Please select a difficulty");
        return;
      }
      addCart({
        gameName,
        cardId: uuidv4(),
        difficulty,
        playTime,
        imgId,
        gameId,
      });
    },
    [addCart, gameId, gameName, imgId, playTime, setError]
  );
  const debounceHandleFavorite = debounce(handleFavoriteSubmit, 300);

  const [{ isDragging }, drag] = useDrag({
    type: TaskCardDropType,
    item: {
      gameName,
      cardId: uuidv4(),
      difficulty,
      playTime,
      imgId,
      gameId,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <>
      {/* <DragPreviewImage
      connect={preview}
      src={`${process.env.REACT_APP_SEVER_URL}/public/system/image/drag.png`}
    /> */}
      {!isRendered &&
        (isLgScreen ? (
          <Skeleton
            animation="wave"
            variant="rounded"
            width={500}
            height={550}
          />
        ) : (
          <Skeleton
            animation="wave"
            variant="rounded"
            width={450}
            height={550}
          />
        ))}
      {isRendered && (
        <Card
          sx={{
            width: "100%",
            borderRadius: 5,
            p: 3,
            opacity: isDragging ? 0 : 1,
          }}
          ref={drag}
        >
          <Grid container spacing={4}>
            <Grid item xs={7}>
              <Typography gutterBottom variant="h4" component="div">
                {gameName}
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{
                  overflow: "auto",
                  whiteSpace: "pre-line",
                  WebkitBoxOrient: "vertical",
                  maxHeight: "200px",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {gameContent}
              </Typography>
              <Divider sx={{ py: 1 }} />
              <Box sx={{ py: 2 }}>
                <Typography gutterBottom variant="inherit" pb={1}>
                  Select type
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <AnimatedChip
                    label="Hard"
                    color={difficulty === "Hard" ? "error" : "default"}
                    onClick={() => handleChipClick("Hard")}
                  />
                  <AnimatedChip
                    label="Medium"
                    color={difficulty === "Medium" ? "warning" : "default"}
                    onClick={() => handleChipClick("Medium")}
                  />
                  <AnimatedChip
                    label="Simple"
                    color={difficulty === "Simple" ? "success" : "default"}
                    onClick={() => handleChipClick("Simple")}
                  />
                </Stack>
              </Box>
              <Divider />
              <Stack
                sx={{ py: 2 }}
                direction="column"
                spacing={1}
                justifyContent="center"
                alignItems="baseline"
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  label={`PlayTime : ${
                    playTimeHour ? `${playTimeHour}h` : ""
                  } ${playTimeMinute}m`}
                />
                <motion.div
                  animate={infoAnimationControls}
                  initial={{ height: 0, opacity: 0 }}
                >
                  {showMoreInfo && (
                    <Stack direction="row" spacing={1}>
                      <Chip label={`Favorite : ${currentIsFavorite}`} />
                      <Chip label={`UsageCount : ${gameUsageCount}`} />
                    </Stack>
                  )}
                </motion.div>
                <Box display="flex" justifyContent="center">
                  <Tooltip title="More information">
                    <IconButton
                      onClick={handleMoreInfoClick}
                      color="primary"
                      size="small"
                    >
                      <ExpandMore />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Stack
                spacing={1}
                direction="row"
                useFlexGap
                flexWrap="wrap"
                paddingBottom={2}
              >
                {classifys &&
                  classifys.map((classify, index) => (
                    <ClassifysChip key={classify.name} classify={classify} />
                  ))}
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Rating
                  defaultValue={+isFavorite}
                  max={1}
                  icon={<Favorite fontSize="inherit" />}
                  emptyIcon={<FavoriteBorder fontSize="inherit" />}
                  onChange={(e, newValue) => {
                    debounceHandleFavorite(!!newValue);
                  }}
                  sx={{
                    marginTop: "8px",
                    "& .MuiRating-iconFilled": {
                      color: "#ff6d75",
                    },
                    "& .MuiRating-iconHover": {
                      color: "#ff3d47",
                    },
                  }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleAddTask(difficulty)}
                >
                  Add to cart
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={5}>
              <LoadingImage
                url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/${imgId}?folder=GameImg&original=true`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 5,
                }}
                alt="picture"
              />
            </Grid>
          </Grid>
        </Card>
      )}
    </>
  );
};

export default memo(TaskCard);
