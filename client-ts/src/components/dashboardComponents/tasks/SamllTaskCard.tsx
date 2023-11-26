import React, { useState, useMemo, useRef, memo } from "react";
import { Card, Typography, Stack, Chip, Button, Grid } from "@mui/material";
import type { Identifier, XYCoord } from "dnd-core";
import { useDrag, useDrop } from "react-dnd";

import AutoSizer from "react-virtualized-auto-sizer";
import LoadingImage from "../../../shared/LoadingImage";
import AnimatedChip from "../../../shared/AnimatedChip";

export interface Item {
  cardId: string;
}

export interface SamllTaskCardProps extends Item {
  gameDifficulty: string;
  gameName: string;
  playTime: number;
  imgId: string | null;
  moveCart: (id: string) => void;
  switchDifficulty: (difficulty: string, id: string) => void;
  sortTasks: (dragId: string, hoverId: string) => void;
}

export interface SamllTaskCardPropsAttr
  extends Omit<
    SamllTaskCardProps,
    "moveCart" | "switchDifficulty" | "sortTasks"
  > {}

const SamllTaskCard: React.FC<SamllTaskCardProps> = ({
  gameDifficulty,
  gameName,
  playTime,
  imgId,
  moveCart,
  switchDifficulty,
  sortTasks,
  cardId,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [difficulty, setDifficulty] = useState<string>(gameDifficulty);
  const playTimeHour = useMemo(
    () => Math.floor(+playTime / (60 * 60)),
    [+playTime]
  );
  const playTimeMinute = useMemo(() => (+playTime / 60) % 60, [+playTime]);

  const handleChipClick = (label: string) => {
    setDifficulty((prevLabel) => (prevLabel === label ? "" : label));
  };

  const [{ handlerId }, drop] = useDrop<
    Item,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "SamllTaskCard",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragId = item.cardId;
      const hoverId = cardId;
      if (dragId === hoverId) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragId < hoverId && hoverClientY < hoverMiddleY) return;
      if (dragId > hoverId && hoverClientY > hoverMiddleY) return;
      sortTasks(dragId, hoverId);
      item.cardId = cardId;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "SamllTaskCard",
    item: (): Item => {
      return { cardId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Grid
      container
      direction="row"
      component={Card}
      sx={{ width: "100%", my: 1, opacity: isDragging ? 0 : 1 }}
      spacing={1}
      ref={ref}
    >
      <Grid item container xs direction="column" spacing={1}>
        <Grid item textAlign="center">
          <Typography gutterBottom variant="h5" component="div">
            {gameName}
          </Typography>
        </Grid>
        <Grid item xs>
          <Stack spacing={{ xs: 1 }} direction="row" useFlexGap flexWrap="wrap">
            <AnimatedChip
              label="Hard"
              color={difficulty === "Hard" ? "error" : "default"}
              onClick={() => {
                handleChipClick("Hard");
                switchDifficulty("Hard", cardId);
              }}
            />
            <AnimatedChip
              label="Medium"
              color={difficulty === "Medium" ? "warning" : "default"}
              onClick={() => {
                handleChipClick("Medium");
                switchDifficulty("Medium", cardId);
              }}
            />
            <AnimatedChip
              label="Simple"
              color={difficulty === "Simple" ? "success" : "default"}
              onClick={() => {
                handleChipClick("Simple");
                switchDifficulty("Simple", cardId);
              }}
            />
          </Stack>
        </Grid>
        <Grid item xs container spacing={2}>
          <Grid item lg={4.5} xs={12}>
            <Chip
              label={`PlayTime : ${
                playTimeHour ? `${playTimeHour}h` : ""
              } ${playTimeMinute}m`}
            />
          </Grid>
          <Grid item lg={7} xs={11} mb={2}>
            <Button
              fullWidth
              color="error"
              variant="outlined"
              onClick={() => moveCart(cardId)}
            >
              Move cart
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} p={1}>
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <LoadingImage
              url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/${imgId}?folder=GameImg`}
              style={{
                width: width,
                height: height,
                borderRadius: 5,
              }}
              alt="picture"
            />
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
};

export default memo(SamllTaskCard);
