import { FC } from "react";
import { Chip, Tooltip, Typography, Zoom } from "@mui/material";

import { Classify } from "./SelectGameClassify";

interface ClassifysChipProps {
  classify: Classify;
}

const ClassifysChip: FC<ClassifysChipProps> = ({ classify }) => {
  return (
    <Tooltip
      title={
        <Typography variant="body2" gutterBottom>
          {classify.description}
        </Typography>
      }
      placement="top"
      TransitionComponent={Zoom}
      arrow
    >
      <Chip color="info" label={classify.name} sx={{ color: "white" }} />
    </Tooltip>
  );
};

export default ClassifysChip;
