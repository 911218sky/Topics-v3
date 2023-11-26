import React, {
  useMemo,
  memo,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Rating,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import axios from "axios";
import debounce from "lodash/debounce";

import { DashboardContext } from "../../layouts/Dashboard";
import GameCard from "./GameCard";

interface Author {
  userName: string;
  imgId: string;
}

interface Game {
  gameName: string;
  imgId: string;
}

export interface MenuCardProps {
  menuName: string;
  menuContent: string;
  author: Author;
  game: Game[];
  gameOrderId: number;
  gameDifficulty: string;
  menuCreateTime: string;
  totalTime: number;
  menuUsageCount: number;
  menuFavorite: number;
  id: number;
}

export interface TaskCardDrop {
  gameName: string;
  gameContent: string;
  difficulty: string;
  playTime: number;
  imgId: string | null;
  cardId: number;
}

const MenuCard: React.FC<MenuCardProps> = ({
  menuName,
  menuContent,
  author,
  game,
  gameOrderId,
  gameDifficulty,
  menuCreateTime,
  totalTime,
  menuUsageCount,
  menuFavorite,
  id,
}) => {
  const minutes = useMemo(() => Math.floor(totalTime / (60 * 60)), []);
  const hours = useMemo(() => Math.floor(totalTime / 60) % 60, []);
  const [isRendered, setIsRendered] = useState<boolean>(() => false);
  const [currentIsFavorite, setCurrentIsFavorite] =
    useState<number>(menuFavorite);
  const {} = useContext(DashboardContext);

  const navigate = useNavigate();

  useEffect(() => {
    setIsRendered(true);
  }, []);

  const handleFavoriteSubmit = useCallback(async (isClickFavorite: boolean) => {
    return axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/menu/favorite`,
        {
          menuId: id,
          isFavorite: isClickFavorite,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setCurrentIsFavorite(response.data.menuFavorite);
      })
      .catch((error) => {
        setCurrentIsFavorite(menuFavorite);
      });
  }, []);

  const handleUseTemplate = useCallback(() => {
    navigate("/user/dashboard/tasks", {
      state: {
        menuId: id,
      },
    });
  }, []);

  const debounceHandleFavorite = debounce(handleFavoriteSubmit, 300);

  return !isRendered ? (
    <Box></Box>
  ) : (
    <Box style={{ height: "auto" }}>
      <Card>
        <CardContent sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "8px",
            }}
          >
            <Rating
              defaultValue={menuFavorite}
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
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={4} md={4} lg={4}>
              <Avatar
                alt={author?.userName || "NULL"}
                src={
                  author?.imgId
                    ? `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${author.imgId}`
                    : author?.userName || "NULL"
                }
                sx={{ width: "85%", height: "85%", maxHeight: "150px" }}
                imgProps={{
                  draggable: "false",
                  onContextMenu: (e) => e.preventDefault(),
                }}
              />
            </Grid>
            <Grid item xs={8} sm={8} md={8} lg={8}>
              <Typography gutterBottom variant="h5" component="div">
                {menuName}
              </Typography>
              <Typography variant="body2" component="p">
                {`Author : ${author?.userName || "NULL"}`}
              </Typography>
              <Typography variant="body2" component="p">
                {`CreateTime : ${new Date(menuCreateTime).toLocaleString()}`}
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
                py={2}
              >
                {menuContent}
              </Typography>
            </Grid>
            <Grid
              container
              xs={12}
              item
              mb={2}
              spacing={1}
              justifyContent="space-between"
            >
              <Grid item>
                <Chip label={`${hours} h ${minutes} m`} variant="outlined" />
              </Grid>
              <Grid item>
                <Chip
                  color="info"
                  label={`Favorite : ${currentIsFavorite}`}
                  sx={{ color: "white" }}
                />
              </Grid>
              <Grid item>
                <Chip
                  color="info"
                  label={`UsageCount : ${menuUsageCount}`}
                  sx={{ color: "white" }}
                />
              </Grid>
              <Grid item sx={{ marginLeft: "auto" }}>
                <Button variant="outlined" onClick={(e) => handleUseTemplate()}>
                  use
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container justifyContent="flex-start" spacing={2}>
            {game &&
              game.map(({ gameName, imgId }, index) => {
                return (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`${gameName}-${imgId}-${index}`}
                  >
                    <GameCard id={index} gameName={gameName} imgId={imgId} />
                  </Grid>
                );
              })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(MenuCard);
