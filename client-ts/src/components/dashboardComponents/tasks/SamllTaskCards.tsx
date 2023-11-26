import React, { memo, useContext } from "react";
import {
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineItemClasses,
  Timeline,
} from "@mui/lab";
import { useDrop } from "react-dnd";

import { TasksContext } from "../TasksTable";
import SamllTaskCard from "./SamllTaskCard";
import { TaskCardDrop, TaskCardDropType } from "./TaskCard";

export interface TaskCardProps {
  tasks: TaskCardDrop[];
}

const SamllTaskCards: React.FC<TaskCardProps> = ({ tasks }) => {
  const {
    setTasks: { addCart, sortTasks, moveCart, switchDifficulty },
    setError,
  } = useContext(TasksContext);

  const [, drop] = useDrop<
    TaskCardDrop,
    void,
    { isOver: boolean | null }
  >({
    accept: TaskCardDropType,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: ({ difficulty, ...other }, monitor) => {
      if (!difficulty) {
        setError("Please select a difficulty");
        return;
      }
      addCart({ difficulty, ...other });
    },
  });

  return (
    <Timeline
      ref={drop}
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
        width: "100%",
        minHeight: "73vh",
      }}
    >
      {tasks.map(({ difficulty, gameName, playTime, imgId, cardId }) => {
        return (
          <TimelineItem key={cardId}>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <SamllTaskCard
                gameDifficulty={difficulty}
                playTime={playTime}
                gameName={gameName}
                imgId={imgId}
                sortTasks={sortTasks}
                moveCart={moveCart}
                switchDifficulty={switchDifficulty}
                cardId={cardId}
              />
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default memo(SamllTaskCards);
