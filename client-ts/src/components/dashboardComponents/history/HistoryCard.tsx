import React, { memo, useCallback, useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface HistoryCardProps {
  historyFormCreateTime: string;
  score: number;
  formName: string;
  formId: string;
  id: string;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  historyFormCreateTime,
  score,
  formName,
  formId,
  id,
}) => {
  const navigate = useNavigate();
  const [isRendered, setIsRendered] = useState(() => false);
  useEffect(() => {
    setIsRendered(true);
  }, []);

  const conversionDate = useCallback((date: string) => {
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

  return (
    <>
      {!isRendered ? (
        <Skeleton animation="wave" variant="rounded" height={130} />
      ) : (
        <Card
          sx={{
            margin: 2,
            border: (theme) =>
              theme.palette.mode === "light"
                ? "2px solid #FCFCFC"
                : "2px solid #7B7B7B",
            borderRadius: "10px",
            boxShadow:
              score < 40
                ? "0 0 10px 5px rgba(150, 0, 0, 0.6)"
                : score >= 80
                ? "0 0 10px 2px"
                : "",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" component="div">
              {formName}
            </Typography>
            <Typography variant="h5" component="div">
              {`分數 ${score}`}
            </Typography>
            <Typography variant="h6" component="div">
              {`填寫日期 ${conversionDate(historyFormCreateTime)}`}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              size="medium"
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => navigate(`/user/form/write/${formId}`)}
            >
              Redo the question
            </Button>
            <Button
              size="medium"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() =>
                navigate(`/user/form/details`, {
                  state: { id },
                })
              }
            >
              Details
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
};

export default memo(HistoryCard);
