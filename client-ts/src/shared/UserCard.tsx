import { useState, useContext, memo, useCallback } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Rating,
  Typography,
  CardActionArea,
  Checkbox,
  Paper,
  Grid,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import axios from "axios";
import debounce from "lodash/debounce";

import { GlobalContext, UserData } from "../context/GlobalProvider";
import LoadingImage from "./LoadingImage";

interface UserCardProps {
  id: number;
  role: UserData["role"];
  userName: string;
  imgId: string | null;
  isChecked?: boolean;
  isFavorite?: boolean;
  onClick?: (data: {
    id: number;
    userName: string;
    imgId: string | null;
    role: UserData["role"];
  }) => void;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ROLEFRAME = {
  DOCTOR: [
    hexToRgba("#8E44AD", 1),
    hexToRgba("#5DADE2", 1),
    hexToRgba("#A9DFBF", 1),
    hexToRgba("#E0E0E0", 1),
    hexToRgba("#8E44AD", 1),
  ],
  ADMIN: [
    hexToRgba("#FF0000", 1),
    hexToRgba("#FF4500 ", 1),
    hexToRgba("#FF7F50  ", 1),
    hexToRgba("#FFA07A ", 1),
    hexToRgba("#FFC0CB ", 1),
    hexToRgba("#FF0000", 1),
  ],
};

const ROLEFNAMESTYLE = {
  DOCTOR: [
    "linear-gradient(60deg, rgba(84,58,183,1) 0%, rgba(0,172,193,1) 100%)",
    "linear-gradient(60deg, rgb(173, 162, 218) 0%, rgb(201, 14, 189) 100%)",
    "linear-gradient(60deg, rgba(84,58,183,1) 0%, rgba(0,172,193,1) 100%)",
  ],
  ADMIN: [
    "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,0,128,1) 100%)",
    "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,69,0,1) 100%)",
    "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,99,71,1) 100%)",
    "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,127,80,1) 100%)",
    "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,0,128,1) 100%)",
  ],
};

const UserCard: React.FC<UserCardProps> = ({
  id,
  role,
  userName,
  imgId,
  isChecked = false,
  isFavorite = false,
  onClick = () => {},
}) => {
  const [checked, setChecked] = useState(isChecked);
  const { userData } = useContext(GlobalContext);
  const [currentIsFavorite, setCurrentIsFavorite] =
    useState<boolean>(isFavorite);
  const { enqueueSnackbar } = useSnackbar();

  const handleFavoriteSubmit = useCallback(async (isClickFavorite: boolean) => {
    return axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/user/favorite`,
        {
          userId: id,
          isFavorite: isClickFavorite,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setCurrentIsFavorite((isFavorite) => !isFavorite);
      })
      .catch((error) => {
        setCurrentIsFavorite(isFavorite!);
      });
  }, []);

  const debounceHandleFavorite = debounce(handleFavoriteSubmit, 300);

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        boxShadow:
          role === "ADMIN"
            ? `0 0 10px ${hexToRgba("#FF7F50", 1)}`
            : "0px 4px 10px rgba(0, 0, 0, 0.5)",
        border: "2px solid transparent",
        borderRadius: 7,
      }}
      animate={{
        borderColor: role !== "USER" ? ROLEFRAME[role] : undefined,
      }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      <Card sx={{ width: "100%" }}>
        <CardActionArea
          onClick={(e) => {
            if (role === "ADMIN" && userData!.role !== "ADMIN")
              enqueueSnackbar("You have no right!", { variant: "error" });
            else {
              onClick({ id, userName, imgId, role });
              setChecked((checked) => !checked);
            }
          }}
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
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            elevation={7}
          >
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
              }}
              animate={{
                background: role !== "USER" ? ROLEFNAMESTYLE[role] : undefined,
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Typography variant="h6">{role}</Typography>
            </motion.div>
          </Paper>
          <CardContent
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Grid item xs zeroMinWidth>
              <Typography noWrap variant="h6" component="div">
                {userName}
              </Typography>
            </Grid>
          </CardContent>
          <CardActions
            sx={{
              mt: -3,
              justifyContent: "space-between",
            }}
          >
            <Rating
              defaultValue={currentIsFavorite ? 1 : 0}
              max={1}
              icon={<Favorite fontSize="inherit" />}
              emptyIcon={<FavoriteBorder fontSize="inherit" />}
              onChange={(e, newValue) => {
                debounceHandleFavorite(!!newValue);
              }}
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#ff6d75",
                },
                "& .MuiRating-iconHover": {
                  color: "#ff3d47",
                },
              }}
            />
            <Checkbox checked={checked} inputProps={{ readOnly: true }} />
          </CardActions>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default memo(UserCard);
