import React, { memo, useMemo, useContext, useCallback } from "react";
import {
  Grid,
  Divider,
  Typography,
  Stack,
  Button,
  Card as MUICard,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import AssignmentIcon from "@mui/icons-material/Assignment";

import LoadingImage from "../../../shared/LoadingImage";
import { MyMenuContext } from "../MyMenu";

export type Author = {
  id: number;
  userName: string;
  imgId: string | null;
};

export type Menu = {
  menuName: string;
  menuContent: string;
};

export type Assignment = {
  author: Author;
  isDone: boolean;
  id: number;
  startDate: Date;
  endDate: Date;
  menu: Menu;
};

function swapColorListColors(colors: string[]): [string, string] {
  const originalGradient = `linear-gradient(60deg, ${colors.join(", ")})`;
  const reversedColors = [...colors].reverse();
  const reversedGradient = `linear-gradient(60deg, ${reversedColors.join(
    ", "
  )})`;
  return [originalGradient, reversedGradient];
}

const Card: React.FC<Assignment> = ({
  isDone,
  id,
  startDate,
  endDate,
  menu: { menuContent, menuName },
  author: { userName, imgId },
}) => {
  const [original, reversed] = useMemo(() => {
    const colorList = ["rgba(84,58,183,1)", "rgba(0,172,193,1)"];
    return swapColorListColors(colorList);
  }, []);

  const { setDetailCardProps } = useContext(MyMenuContext);

  const handleSetDetailCardProps = useCallback(() => {
    setDetailCardProps(() => ({
      isOpen: true,
      id: id,
    }));
  }, [id, setDetailCardProps]);

  return (
    <motion.div
      style={{
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.5)",
        border: "2px solid transparent",
        borderRadius: 7,
        opacity: !isDone ? 1 : 0.6,
      }}
      animate={{
        background: [original, reversed, original],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <MUICard
        sx={{
          minHeight: "300px",
        }}
      >
        <Stack direction="row" spacing={2} p={2} alignItems="center">
          <AssignmentIcon sx={{ width: "25px", height: "25px" }} />
          <Typography variant="h5">{menuName}</Typography>
        </Stack>
        <Divider variant="middle" />
        <Grid container direction="row">
          <Grid item xs={8} md={7}>
            <Stack direction="column" spacing={1} p={2}>
              <Typography variant="body1" style={{ opacity: 0.75 }}>
                {`startDate : ${startDate.toLocaleDateString()}`}
              </Typography>
              <Typography variant="body1" style={{ opacity: 0.75 }}>
                {`endDate : ${endDate.toLocaleDateString()}`}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  overflow: "auto",
                  whiteSpace: "pre-line",
                  WebkitBoxOrient: "vertical",
                }}
                style={{ opacity: 0.75 }}
              >
                {menuContent}
              </Typography>
            </Stack>
          </Grid>
          <Grid
            item
            xs={4}
            md={5}
            sx={{
              mt: 1,
              pr: 2,
            }}
          >
            <MUICard
              sx={{
                borderRadius: "15px",
                flexDirection: "column",
                width: "100%",
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
                }}
              >
                {userName}
              </Typography>
            </MUICard>
          </Grid>
        </Grid>
        <Divider variant="middle" />
        <Stack direction="row" spacing={2} p={2} alignItems="center">
          <Button variant="text" color="success" sx={{ m: 2 }}>
            Execute
          </Button>
          <Button
            variant="text"
            sx={{ m: 2 }}
            onClick={handleSetDetailCardProps}
          >
            Detail
          </Button>
        </Stack>
      </MUICard>
    </motion.div>
  );
};

export default memo(Card);
