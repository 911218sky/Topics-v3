import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  createContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Grid,
  Card,
  TextField,
  Divider,
  Chip,
  Button,
  Typography,
  Box,
  Select,
  Skeleton,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useInView } from "react-intersection-observer";
import {
  useInfiniteQuery,
  InfiniteQueryObserverResult,
  useQuery,
} from "react-query";
import { Article } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import AutoSizer from "react-virtualized-auto-sizer";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { isNumber } from "lodash";

import { GlobalContext } from "../../context/GlobalProvider";
import { TransitionDown } from "../../shared/SnackbarTransition";
import { TaskCardDrop } from "./tasks/TaskCard";
import SelectUser, { User } from "../../shared/SelectUser";
import AutoSnackbar from "../../shared/AutoSnackbar";
import SamllTaskCards from "./tasks/SamllTaskCards";
import TaskCards from "./tasks/TaskCards";
import { Classify } from "../../shared/SelectGameClassify";
export interface Task {
  id: number; // Game ID
  gameName: string;
  gameContent: string;
  playTime: number;
  gameUsageCount: number;
  gameFavorite: number;
  imgId: string | null;
  classifys: Classify[];
  isFavorite: boolean;
}

export interface GameDataPage {
  gamesData: Task[];
  token: string;
  isEnd: boolean;
}

interface CreateMenue {
  tasks: TaskCardDrop[];
  isPublic: string;
  menuName: string;
  menuContent: string;
}

interface DistributeMenue {
  usersId: Number[];
  menuId: Number;
  startTime: Date;
  endTime: Date;
}

interface MenuResponse {
  id: number;
  menuName: string;
  menuContent: string;
  gameOrderId: number[];
  totalTime: number;
  gameDifficulty: string[];
  game: {
    gameName: string;
    imgId: string;
    playTime: number;
    id: number;
  }[];
}

type CustomMenuResponse = Pick<
  MenuResponse,
  "menuName" | "menuContent" | "gameOrderId" | "gameDifficulty" | "totalTime"
>;

type isPublic = "public" | "private";
type InitialStateKey = keyof typeof initialState;
interface ProviderValue {
  tasks: TaskCardDrop[];
  setTasks: {
    moveCart: (id: string) => void;
    switchDifficulty: (difficulty: string, id: string) => void;
    sortTasks: (dragId: string, hoverId: string) => void;
    addCart: (task: TaskCardDrop) => void;
  };
  setError: (message: string) => void;
}

export const TasksContext = createContext<ProviderValue>({
  tasks: [] as TaskCardDrop[],
  setTasks: {
    moveCart: () => {},
    switchDifficulty: () => {},
    sortTasks: () => {},
    addCart: () => {},
  },
  setError: () => {},
});

function getFormattedTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

function filterState<T>(state: T, filterKeys?: (keyof T)[]): Partial<T> {
  const filteredState: Partial<T> = {};
  for (const key in state) {
    if (!filterKeys?.includes(key as keyof T)) {
      filteredState[key as keyof T] = state[key];
    }
  }
  return filteredState;
}

type Action =
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_START_TIME"; payload: Dayjs | null }
  | { type: "SET_END_TIME"; payload: Dayjs | null }
  | { type: "SET_MENU_NAME"; payload: string }
  | { type: "SET_MENU_CONTENT"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_CURRENT_SELECT_USER"; payload: User[] }
  | { type: "SET_IS_PUBLIC"; payload: isPublic }
  | { type: "ADD_TASK"; payload: TaskCardDrop }
  | { type: "REMOVE_TASK"; payload: string }
  | { type: "SET_MENUID"; payload: number }
  | { type: "SET_INITIALSTATE"; payload?: InitialStateKey[] }
  | {
      type: "UPDATE_TASK_DIFFICULTY";
      payload: { id: string; difficulty: string };
    }
  | {
      type: "SORT_TASKS";
      payload: { dragId: string; hoverId: string };
    }
  | {
      type: "SET_TEMPLATE";
      payload: { menuName: string; menuContent: string; tasks: TaskCardDrop[] };
    };

const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case "SET_INITIALSTATE":
      return { ...state, ...filterState(initialState, action.payload) };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_START_TIME":
      return { ...state, startTime: action.payload };
    case "SET_END_TIME":
      return { ...state, endTime: action.payload };
    case "SET_MENU_NAME":
      return { ...state, menuName: action.payload };
    case "SET_MENU_CONTENT":
      return { ...state, menuContent: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_CURRENT_SELECT_USER":
      return { ...state, currentSelectUser: action.payload };
    case "SET_IS_PUBLIC":
      return { ...state, isPublic: action.payload };
    case "SET_MENUID":
      return { ...state, menuId: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter(({ cardId }) => cardId !== action.payload),
      };
    case "SORT_TASKS":
      return {
        ...state,
        tasks: (() => {
          const updatedTasks = [...state.tasks];
          const dragIndex = updatedTasks.findIndex(
            ({ cardId }) => cardId === action.payload.dragId
          );
          const hoverIndex = updatedTasks.findIndex(
            ({ cardId }) => cardId === action.payload.hoverId
          );
          [updatedTasks[dragIndex], updatedTasks[hoverIndex]] = [
            updatedTasks[hoverIndex],
            updatedTasks[dragIndex],
          ];
          return updatedTasks;
        })(),
      };
    case "SET_TEMPLATE":
      return {
        ...state,
        menuName: action.payload.menuName,
        menuContent: action.payload.menuContent,
        tasks: action.payload.tasks,
      };
    case "UPDATE_TASK_DIFFICULTY":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.cardId === action.payload.id) {
            return {
              ...task,
              difficulty: action.payload.difficulty,
            };
          }
          return task;
        }),
      };
    default:
      return state;
  }
};

function arraysAreEqual(arr1: any[], arr2: any[]): boolean {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

const initialState = {
  startTime: null as Dayjs | null,
  endTime: null as Dayjs | null,
  menuName: getFormattedTodayDate() + " Task",
  menuContent: "Enter something",
  menuId: null as number | null,
  error: "",
  message: "",
  currentSelectUser: [] as User[],
  isPublic: "private" as isPublic,
  tasks: [] as TaskCardDrop[],
  token: "",
};

const TasksTable: React.FC = () => {
  const smallTaskBoxsRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRendered, setIsRendered] = useState(() => false);

  const {
    startTime,
    endTime,
    menuName,
    menuContent,
    error,
    message,
    currentSelectUser,
    isPublic,
    tasks,
    token,
    menuId,
  } = state;
  const { userData } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsRendered(true);
    if (!location.state?.menuId || isNaN(+location.state.menuId)) return;
    dispatch({ type: "SET_MENUID", payload: location.state.menuId });
  }, [location.state]);

  const DateTimePickerStartTime = useMemo(
    () => (
      <DateTimePicker
        disablePast
        displayWeekNumber
        label="Start time*"
        views={["year", "month", "day", "hours"]}
        onAccept={(e: Dayjs | null) => {
          dispatch({
            type: "SET_START_TIME",
            payload: e,
          });
        }}
        sx={{
          width: "100%",
        }}
      />
    ),
    []
  );

  const DateTimePickerEndTime = useMemo(() => {
    const isDisabled = (): boolean => {
      if (!startTime) return true;
      const currentTime = dayjs();
      return startTime.isBefore(currentTime);
    };
    return (
      <DateTimePicker
        disablePast
        displayWeekNumber
        label="End time*"
        views={["year", "month", "day", "hours"]}
        onAccept={(e) => {
          dispatch({
            type: "SET_END_TIME",
            payload: e,
          });
        }}
        disabled={isDisabled()}
        minDateTime={startTime}
        sx={{
          width: "100%",
        }}
      />
    );
  }, [startTime]);

  const MenuContent = useMemo(
    () => (
      <TextField
        label="MenuContent"
        multiline
        fullWidth
        required
        value={menuContent}
        error={!menuContent}
        onChange={(e) => {
          dispatch({
            type: "SET_MENU_CONTENT",
            payload: e.target.value,
          });
        }}
        rows={4}
      />
    ),
    [menuContent]
  );

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

  const getGamesData = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: string;
    }): Promise<GameDataPage | null> => {
      return axios
        .get(`${process.env.REACT_APP_SEVER_URL}/game/games`, {
          withCredentials: true,
          params: {
            token: pageParam,
          },
        })
        .then((response) => {
          dispatch({ type: "SET_TOKEN", payload: response.data.token });
          const gamesData = response.data.gamesData as Task[];
          response.data.gamesData = gamesData.map(({ classifys, ...other }) => {
            return {
              classifys: classifys.map((classify) => {
                return {
                  name: classify,
                  description: gameClassifys
                    ? gameClassifys[classify as unknown as string]
                    : "No detailed information was obtained",
                };
              }),
              ...other,
            };
          });
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
    },
    [gameClassifys]
  );

  const {
    data: gameData,
    hasNextPage,
    fetchNextPage,
  }: InfiniteQueryObserverResult<GameDataPage> = useInfiniteQuery(
    ["gamesData"],
    ({ pageParam = 0 }) => getGamesData(pageParam),
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;
        return lastPage.isEnd ? undefined : lastPage.token;
      },
      enabled: gameClassifys !== undefined,
    }
  );

  const handleSortTasks = useCallback((dragId: string, hoverId: string) => {
    dispatch({
      type: "SORT_TASKS",
      payload: {
        dragId,
        hoverId,
      },
    });
  }, []);

  const handleMoveCart = useCallback((id: string) => {
    dispatch({ type: "REMOVE_TASK", payload: id });
  }, []);

  const handleAddCart = useCallback((task: TaskCardDrop) => {
    dispatch({
      type: "ADD_TASK",
      payload: task,
    });
  }, []);

  const handleSwitchDifficulty = useCallback(
    (difficulty: string, id: string) => {
      dispatch({
        type: "UPDATE_TASK_DIFFICULTY",
        payload: {
          difficulty,
          id,
        },
      });
    },
    []
  );

  const handleSetMessage = useCallback((message: string) => {
    dispatch({
      type: "SET_MESSAGE",
      payload: message,
    });
  }, []);

  const handleSetError = useCallback((message: string) => {
    dispatch({
      type: "SET_ERROR",
      payload: message,
    });
  }, []);

  const handleSetCurrentSelectUser = useCallback((users: User[]) => {
    dispatch({
      type: "SET_CURRENT_SELECT_USER",
      payload: users,
    });
  }, []);

  const handleSetIsPublic = useCallback((e: SelectChangeEvent<string>) => {
    dispatch({
      type: "SET_IS_PUBLIC",
      payload: e.target.value as isPublic,
    });
  }, []);

  const createMenue = useCallback(
    async ({
      tasks,
      isPublic,
      menuName,
      menuContent,
    }: CreateMenue): Promise<number> => {
      return axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/menu/create`,
          {
            game: tasks.map((task) => task.gameId),
            gameDifficulty: tasks.map((task) => task.difficulty),
            totalTime: tasks.reduce(
              (accumulator, task) => accumulator + task.playTime,
              0
            ),
            isPublic: isPublic === "public",
            menuName: menuName,
            menuContent: menuContent,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          dispatch({
            type: "SET_INITIALSTATE",
            payload: ["message", "endTime"],
          });
          handleSetMessage(response.data.message);
          return response.data.id;
        })
        .catch((error) => {
          console.log(error.response.data.message);
          handleSetError(error.response.data.message);
        });
    },
    [handleSetError, handleSetMessage]
  );

  const distributeMenue = useCallback(
    async ({ usersId, menuId, startTime, endTime }: DistributeMenue) => {
      return axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/menu/distribute`,
          {
            usersId,
            menuId,
            startTime,
            endTime,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          handleSetMessage(response.data.message);
        })
        .catch((error) => {
          handleSetError(error.response.data.message);
        });
    },
    [handleSetError, handleSetMessage]
  );

  useEffect(() => {
    if (smallTaskBoxsRef.current) {
      smallTaskBoxsRef.current.scrollTop =
        smallTaskBoxsRef.current.scrollHeight;
    }
  }, [tasks.length]);

  const compareMenu = useCallback(
    <T extends CustomMenuResponse>(a: T, b: T): boolean => {
      if (a.menuName !== b.menuName) return false;
      else if (a.menuContent !== b.menuContent) return false;
      else if (!arraysAreEqual(a.gameOrderId, b.gameOrderId)) return false;
      else if (a.totalTime !== b.totalTime) return false;
      else if (!arraysAreEqual(a.gameDifficulty, b.gameDifficulty))
        return false;
      return true;
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMenuData: CustomMenuResponse = {
      menuName,
      menuContent,
      gameOrderId: tasks.map((task) => task.gameId!) as number[],
      totalTime: tasks.reduce(
        (accumulator, task) => accumulator + task.playTime,
        0
      ),
      gameDifficulty: tasks.map((task) => task.difficulty),
    };
    if (menuData && menuId && compareMenu(menuData, currentMenuData)) {
      if (!startTime || !endTime) return;
      distributeMenue({
        usersId: currentSelectUser.map(({ id }) => id),
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        menuId: menuId!,
      });
    } else {
      createMenue({ tasks, isPublic, menuName, menuContent }).then((id) => {
        if (!startTime || !endTime) {
          dispatch({
            type: "SET_INITIALSTATE",
            payload: ["message", "endTime"],
          });
          return;
        }
        distributeMenue({
          usersId: currentSelectUser.map(({ id }) => id),
          startTime: startTime.toDate(),
          endTime: endTime.toDate(),
          menuId: id,
        });
      });
    }
  };

  const { ref } = useInView({
    threshold: 1,
    delay: 300,
    skip: !hasNextPage,
    onChange: (inView) => {
      if (!inView || !hasNextPage) return;
      fetchNextPage({
        pageParam: token,
      });
    },
  });

  const { data: menuData } = useQuery({
    queryKey: ["menu", menuId],
    queryFn: async (key) => {
      return axios
        .get(
          `${process.env.REACT_APP_SEVER_URL}/menu/menu/${key.queryKey[1]}`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          handleSetMessage(response.data.message);
          return response.data.menu as MenuResponse;
        });
    },
    enabled: isNumber(menuId),
  });

  useEffect(() => {
    if (!menuData) return;
    dispatch({
      type: "SET_TEMPLATE",
      payload: {
        menuName: menuData.menuName,
        menuContent: menuData.menuContent,
        tasks: menuData.game.map(
          ({ gameName, imgId, playTime, id }, i: number) => {
            return {
              gameId: id,
              gameName,
              imgId,
              playTime,
              difficulty: menuData.gameDifficulty[i],
              cardId: uuidv4(),
            };
          }
        ),
      },
    });
  }, [menuData]);

  const providerValue = useMemo(() => {
    return {
      tasks,
      setTasks: {
        moveCart: handleMoveCart,
        switchDifficulty: handleSwitchDifficulty,
        sortTasks: handleSortTasks,
        addCart: handleAddCart,
      },
      setError: handleSetError,
    };
  }, [
    handleAddCart,
    handleMoveCart,
    handleSetError,
    handleSortTasks,
    handleSwitchDifficulty,
    tasks,
  ]);

  return (
    <TasksContext.Provider value={providerValue}>
      <Grid container spacing={2} direction="row" sx={{ height: "100%" }}>
        <AutoSnackbar
          message={error}
          setMessage={handleSetError}
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
          setMessage={handleSetMessage}
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
        <Grid item xs={6} style={{ height: "100%" }} pb={5}>
          {!isRendered ? (
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  width={width}
                  height={height - 50}
                  sx={{
                    m: 2,
                  }}
                />
              )}
            </AutoSizer>
          ) : (
            <Card
              elevation={5}
              sx={{
                width: "100%",
                height: "95%",
                borderRadius: 3,
                p: 2,
                m: 2,
              }}
            >
              <Box
                sx={{
                  height: "95%",
                  overflow: "auto",
                  p: 1,
                  "::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
                ref={smallTaskBoxsRef}
              >
                <Grid container spacing={2} direction="row">
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      label="Task Name"
                      error={!menuName}
                      value={menuName}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_MENU_NAME",
                          payload: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {DateTimePickerStartTime}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {DateTimePickerEndTime}
                  </Grid>
                  <Grid item container spacing={2} direction="row">
                    <Grid item xs={12} sm={6}>
                      <SelectUser
                        setCurrentSelectUser={handleSetCurrentSelectUser}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="is-it-public-label">
                          Openness
                        </InputLabel>
                        <Select
                          labelId="is-it-public-label"
                          onChange={handleSetIsPublic}
                          value={isPublic}
                          label="Openness"
                        >
                          <MenuItem value={"public"}>Public</MenuItem>
                          <MenuItem value={"private"}>Private</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    {MenuContent}
                  </Grid>
                  <Grid item xs={12}>
                    <Divider>
                      <Chip label="TASK" />
                    </Divider>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <SamllTaskCards tasks={tasks} />
                </Grid>
              </Box>
              <Grid item xs={12}>
                <Button variant="outlined" fullWidth onClick={handleSubmit}>
                  Submit
                </Button>
              </Grid>
            </Card>
          )}
        </Grid>
        <Grid
          item
          xs={6}
          sx={{
            height: "100%",
            overflow: "auto",
            "::-webkit-scrollbar": {
              width: "0.5em",
              position: "absolute",
            },
            "::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "0.25em",
            },
          }}
        >
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="center"
            p={2}
            pb={10}
          >
            {userData?.role !== "USER" && (
              <Grid item xs={12} sm={12} lg={12} py={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  size="small"
                  onClick={() => navigate("/doctor/game/create")}
                >
                  Build game
                </Button>
              </Grid>
            )}
            {gameData && <TaskCards gameData={gameData} />}
            <Grid
              item
              ref={ref}
              xs={12}
              sm={12}
              lg={12}
              sx={{ textAlign: "center" }}
              my={5}
            >
              {gameData && gameData.pages[0].gamesData.length === 0 && (
                <Box textAlign="center">
                  <Article sx={{ width: "250px", height: "250px" }} />
                  <Typography
                    variant="h5"
                    align="center"
                    sx={{ height: "50%" }}
                  >
                    No Data
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </TasksContext.Provider>
  );
};

export default TasksTable;
