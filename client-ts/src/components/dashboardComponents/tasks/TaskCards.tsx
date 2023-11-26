import React, { memo } from "react";
import { Masonry } from "@mui/lab";
import { motion } from "framer-motion";

import TaskCard from "./TaskCard";
import { v4 as uuidv4 } from "uuid";

import { GameDataPage } from "../TasksTable";
import { InfiniteData } from "react-query";

export interface TaskCardProps {
  gameData: InfiniteData<GameDataPage>;
}

const TaskCards: React.FC<TaskCardProps> = ({ gameData }) => {
  return (
    <Masonry columns={{ md: 1, lg: 2 }} sx={{ mt: 1 }} spacing={2}>
      {gameData.pages.map((page) =>
        page.gamesData.map(
          ({
            classifys,
            gameContent,
            gameFavorite,
            gameName,
            gameUsageCount,
            playTime,
            imgId,
            isFavorite,
            id: gameId,
          }) => (
            <TaskCard
              gameName={gameName}
              classifys={classifys}
              gameContent={gameContent}
              gameFavorite={gameFavorite}
              gameUsageCount={gameUsageCount}
              imgId={imgId}
              gameId={gameId}
              playTime={playTime}
              cardId={uuidv4()}
              isFavorite={isFavorite}
              key={`${gameName}-${gameId}`}
            />
          )
        )
      )}
    </Masonry>
  );
};

export default memo(TaskCards);
