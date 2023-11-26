import React, {
  useReducer,
  useMemo,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableRow,
  TableHead,
  Avatar,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Add, Search, Article } from "@mui/icons-material";
import { useQuery } from "react-query";

import StyleTableRow from "../MUI/TableRow";
import FlashingIconButton from "../MUI/FlashingIconButton";
import SelectAvatarChip, { UserData } from "../../shared/SelectAvatarChip";
import { GlobalContext } from "../../context/GlobalProvider";
import Loading from "../../shared/Loading";

interface Form {
  id: number;
  formCreateTime: Date | string | number;
  formName: string;
  author: UserData;
}

interface FormResponse {
  forms: Form[];
  totalPages: number;
  message: string;
}

type State = {
  textBoxformName: string;
  searchFormName: string | null;
  searchAuther: UserData[];
  page: number;
};

type Action =
  | { type: "SET_TEXT_BOX_FORM_NAME"; payload: string }
  | { type: "SET_SEARCH_FORM_NAME"; payload: string | null }
  | { type: "SET_SEARCH_AUTHORS"; payload: UserData[] }
  | { type: "SET_PAGE"; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_TEXT_BOX_FORM_NAME":
      return { ...state, textBoxformName: action.payload };
    case "SET_SEARCH_FORM_NAME":
      return { ...state, searchFormName: action.payload };
    case "SET_SEARCH_AUTHORS":
      return { ...state, searchAuther: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  textBoxformName: "",
  searchFormName: null,
  searchAuther: [],
  page: 1,
};

const FormTable: React.FC = () => {
  const { userData } = useContext(GlobalContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRendered, setIsRendered] = useState(() => false);
  const { textBoxformName, searchFormName, searchAuther, page } = state;

  const navigate = useNavigate();

  useEffect(() => {
    setIsRendered(true);
  }, []);

  const titles: string[] = useMemo(
    () => ["FormName", "Auther", "Author Image", "Create date", "Choose"],
    []
  );

  const getFormTableData = async ({
    queryKey,
  }: {
    queryKey: {
      [key: string]: any;
    };
  }) => {
    return axios
      .get(`${process.env.REACT_APP_SEVER_URL}/form/information`, {
        withCredentials: true,
        params: {
          startPage: +queryKey[1].page,
          searchFormName: queryKey[1].searchFormName,
          searchAuthor: queryKey[1].searchAuthor,
        },
      })
      .then((response) => {
        return response.data as FormResponse;
      })
      .catch((error) => {
        return null;
      });
  };

  const { data: formData, isFetching } = useQuery<FormResponse | null>(
    [
      "getFormTableData",
      {
        page,
        searchFormName: searchFormName ? searchFormName : undefined,
        searchAuthor:
          searchAuther.length < 1
            ? undefined
            : searchAuther.map(({ userName }) => userName),
      },
    ],
    getFormTableData,
    {
      retry: false,
    }
  );

  const getFormAuthorData = useCallback(async (): Promise<
    UserData[] | null
  > => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SEVER_URL}/form/author`,
        {
          withCredentials: true,
        }
      );
      return response.data.author as UserData[];
    } catch (error) {
      console.log(error);
      return null;
    }
  }, []);

  const { data: authorData } = useQuery<UserData[] | null>(
    ["getFormAuthorData"],
    getFormAuthorData
  );

  const handleSubmitSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>, text: string) => {
      e.preventDefault();
      dispatch({ type: "SET_SEARCH_FORM_NAME", payload: text });
    },
    []
  );

  const handleSetPage = useCallback(
    (e: React.ChangeEvent<unknown>, page: number) => {
      dispatch({ type: "SET_PAGE", payload: page });
    },
    []
  );

  const handleSetTextBoxformName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch({ type: "SET_TEXT_BOX_FORM_NAME", payload: e.target.value });
    },
    []
  );

  useEffect(() => {
    dispatch({ type: "SET_PAGE", payload: 1 });
  }, [searchFormName, searchAuther]);

  useEffect(() => {
    if (textBoxformName === "")
      dispatch({ type: "SET_SEARCH_FORM_NAME", payload: null });
  }, [textBoxformName]);

  const conversionDate = useCallback((date: string | number | Date) => {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const time = newDate.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${year} ${time}`;
  }, []);

  const tableData = useMemo(
    () => (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {titles.map((title) => (
                <TableCell align="center" key={title}>
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isFetching &&
              formData !== null &&
              formData?.forms?.map(
                (
                  { id, formCreateTime, formName, author: { userName, imgId } },
                  index
                ) => (
                  <StyleTableRow key={id}>
                    <TableCell
                      align="center"
                      key={`${formName}-${formCreateTime}-${id}`}
                    >
                      {formName.length > 10
                        ? formName.slice(0, 10) + "..."
                        : formName}
                    </TableCell>
                    <TableCell align="center" key={`${userName}-${id}`}>
                      {userName.length > 15
                        ? userName.slice(0, 15) + "..."
                        : userName}
                    </TableCell>
                    <TableCell
                      align="center"
                      key={`${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${imgId}`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onDragStart={(e) => e.preventDefault()}
                      >
                        {imgId ? (
                          <Avatar
                            alt={userName}
                            src={`${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${imgId}`}
                          />
                        ) : (
                          <Avatar>{userName[0]}</Avatar>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      key={conversionDate(formCreateTime)}
                    >
                      {conversionDate(formCreateTime)}
                    </TableCell>
                    <TableCell align="center" key={id}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/user/form/write/${id}`)}
                      >
                        choose
                      </Button>
                    </TableCell>
                  </StyleTableRow>
                )
              )}
          </TableBody>
        </Table>
        <Box textAlign="center">
          {isFetching && (
            <CircularProgress
              color="inherit"
              sx={{
                marginTop: "250px",
                position: "absolute",
              }}
            />
          )}
          {(!formData || formData?.forms.length < 1) && !isFetching && (
            <>
              <Article
                sx={{ width: "250px", height: "250px", marginTop: "100px" }}
              />
              <Typography variant="h4" align="center" sx={{ height: "100%" }}>
                No Data
              </Typography>
            </>
          )}
        </Box>
      </TableContainer>
    ),
    [formData]
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        px: 10,
        py: 2,
      }}
    >
      {!isRendered ? (
        <Loading />
      ) : (
        <>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item sm={6}>
              <form onSubmit={(e) => handleSubmitSearch(e, textBoxformName)}>
                <TextField
                  placeholder="Search FormName"
                  fullWidth
                  value={textBoxformName}
                  onChange={handleSetTextBoxformName}
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
            <Grid item sm={5} width="90%">
              <SelectAvatarChip
                title="Author"
                data={authorData!}
                value={searchAuther}
                setValue={(users) => {
                  dispatch({ type: "SET_SEARCH_AUTHORS", payload: users });
                }}
              />
            </Grid>
            {userData?.role !== "USER" && (
              <FlashingIconButton
                sx={{ marginLeft: "auto" }}
                onClick={() => navigate("/doctor/form/create")}
              >
                <Add sx={{ color: "#00b0ff" }} />
              </FlashingIconButton>
            )}
          </Grid>
          {tableData}
          {!!formData?.totalPages && (
            <Box
              mt={5}
              mb={10}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Pagination
                count={formData?.totalPages}
                page={page}
                variant="outlined"
                shape="rounded"
                size="large"
                disabled={isFetching}
                boundaryCount={2}
                onChange={handleSetPage}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FormTable;
