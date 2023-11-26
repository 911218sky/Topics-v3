import React, { memo, useState, useEffect } from "react";
import { Card, Typography, CardContent, Skeleton } from "@mui/material";

import LoadingImage from "../../../shared/LoadingImage";

export interface GameCardProps {
  id: number;
  gameName: string;
  imgId: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, gameName, imgId }) => {
  const [isRendered, setIsRendered] = useState(() => false);
  useEffect(() => {
    setIsRendered(true);
  }, []);

  return !isRendered ? (
    <Skeleton animation="wave" variant="rounded" width={130} height={200} />
  ) : (
    <Card elevation={3}>
      <Typography variant="body2" align="center">
        {id + 1}
      </Typography>
      <LoadingImage
        url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/${imgId}?folder=GameImg`}
        alt={gameName}
      />
      <CardContent>
        <Typography variant="body2" align="center">
          {gameName}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default memo(GameCard);
