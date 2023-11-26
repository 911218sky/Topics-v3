import { useState, useCallback, useEffect, memo } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Select,
  Grid,
  Pagination,
  useMediaQuery,
  useTheme,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import { Search, Article } from "@mui/icons-material";
import { useQuery } from "react-query";
import axios from "axios";
import { SnackbarProvider } from "notistack";

import { UserData } from "../context/GlobalProvider";
import UserCard from "./UserCard";

export interface User {
  id: number;
  role: UserData["role"];
  userName: string;
  imgId: string | null;
}

interface SelectUserProps {
  setCurrentSelectUser: (users: User[]) => void;
}

const SelectUser: React.FC<SelectUserProps> = ({ setCurrentSelectUser }) => {
  const theme = useTheme();
  const [selectUser, setSelectUser] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchUserName, setSearchUserName] = useState<string | null>(null);
  const [textBoxUserName, setTextBoxUserName] = useState("");
  const [page, setPage] = useState(1);
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!setCurrentSelectUser) return;
    setCurrentSelectUser(selectUser);
  }, [selectUser, setCurrentSelectUser]);

  const getUsers = useCallback(async ({ queryKey }: any) => {
    return axios
      .get(`${process.env.REACT_APP_SEVER_URL}/obtain/users`, {
        withCredentials: true,
        params: {
          startPage: queryKey[1].page,
          searchUserName: queryKey[1].searchUserName,
        },
      })
      .then((response) => {
        return {
          users: response.data.users as User[],
          totalPages: response.data.totalPages as number,
        };
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const getFavoriteUsers = useCallback(async () => {
    return axios
      .get(`${process.env.REACT_APP_SEVER_URL}/obtain/favoriteusers`, {
        withCredentials: true,
      })
      .then((response) => {
        return response.data.favoriteUsers as number[] | undefined;
      })
      .catch((error) => {
        return null;
      });
  }, []);

  const { data: favoriteUsers } = useQuery(["favoriteUsers"], getFavoriteUsers);

  const { data, isFetching } = useQuery(
    [
      "getUsersData",
      {
        page,
        searchUserName: searchUserName ? searchUserName : undefined,
      },
    ],
    getUsers
  );

  useEffect(() => {
    setPage(1);
  }, [searchUserName]);

  useEffect(() => {
    if (textBoxUserName === "") setSearchUserName(null);
  }, [textBoxUserName]);

  const handleUserCardOnClick = useCallback(
    ({ id, userName, imgId, role }: User) => {
      setSelectUser((prevSelectUser): User[] => {
        const isUserSelected = prevSelectUser.some((user) => user.id === id);
        if (isUserSelected)
          return prevSelectUser.filter((user) => user.id !== id);
        else return [...prevSelectUser, { id, userName, imgId, role }];
      });
    },
    []
  );

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="SelectUser">SelectUser</InputLabel>
        <Select
          labelId="SelectUser"
          id="SelectUser"
          label="SelectUser"
          onOpen={() => setOpenDialog(true)}
          onClose={() => setOpenDialog(false)}
          open={openDialog}
          value={selectUser}
          multiple
          renderValue={(selected) => {
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map(({ userName, imgId }) => (
                  <Stack direction="column" spacing={1} key={userName}>
                    <Chip
                      avatar={
                        <Avatar
                          alt={userName}
                          src={
                            imgId !== null
                              ? `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${imgId}`
                              : undefined
                          }
                        >
                          {imgId ? userName : undefined}
                        </Avatar>
                      }
                      label={userName}
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Box>
            );
          }}
        >
          <MenuItem disabled value="">
            <em>Selecting ...</em>
          </MenuItem>
        </Select>
      </FormControl>
      <Dialog
        maxWidth={isMdScreen ? "xs" : "md"}
        fullWidth
        onClose={() => setOpenDialog(false)}
        open={openDialog}
      >
        <Grid component={DialogContent} container spacing={2}>
          <Grid item xs={12} md={12}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchUserName(textBoxUserName);
              }}
            >
              <TextField
                placeholder="Search UserName"
                fullWidth
                value={textBoxUserName}
                onChange={(e) => setTextBoxUserName(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <Search />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <SnackbarProvider maxSnack={20}>
            {data?.users !== null &&
              data?.users.map(({ userName, id, imgId, role }, i) => (
                <Grid item xs={6} sm={4} lg={3} key={`${userName}${i}`}>
                  <UserCard
                    id={id}
                    role={role}
                    userName={userName}
                    imgId={imgId}
                    isChecked={selectUser.some((user) => user.id === id)}
                    isFavorite={
                      favoriteUsers ? favoriteUsers.includes(id) : false
                    }
                    onClick={handleUserCardOnClick}
                  />
                </Grid>
              ))}
          </SnackbarProvider>
        </Grid>
        <Box textAlign="center">
          {isFetching && (
            <CircularProgress
              color="inherit"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          {(!data || data.users.length < 1) && !isFetching && (
            <>
              <Article sx={{ width: "250px", height: "250px" }} />
              <Typography variant="h4" align="center" sx={{ height: "100%" }}>
                No Data
              </Typography>
            </>
          )}
        </Box>
        <Box py={5} style={{ display: "flex", justifyContent: "center" }}>
          {data ? (
            <Pagination
              count={data.totalPages}
              page={page}
              variant="outlined"
              shape="rounded"
              size="large"
              disabled={isFetching}
              boundaryCount={2}
              onChange={(e, page) => setPage(page)}
            />
          ) : null}
        </Box>
      </Dialog>
    </Box>
  );
};

export default memo(SelectUser);
