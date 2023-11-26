import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Step,
  Stepper,
  StepLabel,
  Typography,
  StepConnector,
  CircularProgress,
  styled,
  Container,
} from "@mui/material";
import {
  SentimentSatisfiedAlt,
  SentimentNeutral,
  SentimentVeryDissatisfied,
} from "@mui/icons-material";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { Article } from "@mui/icons-material";

import HistoryCard from "./history/HistoryCard";

const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  [`& .MuiStepConnector-line`]: {
    borderWidth: 2,
  },
}));

interface HistoryForm {
  historyFormCreateTime: string;
  score: number;
  formName: string;
  formId: string;
  id: string;
}

interface HistoryPage {
  historyForm: HistoryForm[];
  token: string;
  isEnd: boolean;
}

const HistoryTable: React.FC = () => {
  const [token, setToken] = useState<string>("");

  const getHistoryData = useCallback(
    async (tokenParam: string): Promise<HistoryPage | null> => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SEVER_URL}/obtain/history`,
          {
            withCredentials: true,
            params: {
              token: tokenParam,
            },
          }
        );
        const responseData = {
          historyForm: response.data?.history,
          token: response.data?.token,
          isEnd: response.data?.isEnd,
        } as HistoryPage;
        setToken(response.data.token);
        return responseData;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    []
  );

  const { data, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery<HistoryPage | null>(
      ["historyData"],
      ({ pageParam = "" }) => getHistoryData(pageParam),
      {
        getNextPageParam: (lastPage) => {
          if (!lastPage || lastPage.isEnd) return undefined;
          return lastPage.token;
        },
        retry: 2,
      }
    );

  const { ref } = useInView({
    threshold: 0.8,
    delay: 300,
    skip: !hasNextPage,
    onChange: (inView) => {
      if (!inView || !hasNextPage) return;
      fetchNextPage({
        pageParam: token,
      });
    },
  });

  const getIcon = useCallback((score: number) => {
    if (score < 40) return <SentimentVeryDissatisfied fontSize="large" />;
    else if (score < 60) return <SentimentNeutral fontSize="large" />;
    return <SentimentSatisfiedAlt fontSize="large" />;
  }, []);

  const HistoryCards = useMemo(() => {
    if (!data) return null;
    return data.pages.flatMap((page, pageIndex) =>
      page?.historyForm.map(
        ({ historyFormCreateTime, score, formName, formId, id }, index) => (
          <Step key={`${formId}-${pageIndex}-${index}`}>
            <StepLabel
              icon={getIcon(score)}
              optional={
                <HistoryCard
                  historyFormCreateTime={historyFormCreateTime}
                  score={score}
                  formName={formName}
                  formId={formId}
                  id={id}
                />
              }
            />
          </Step>
        )
      )
    );
  }, [data, getIcon]);

  return (
    <Box
      sx={{
        height: "calc(100vh - 50px)",
        flexDirection: "column",
        padding: 5,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Stepper
          activeStep={3}
          orientation="vertical"
          connector={<StyledStepConnector />}
          sx={{
            mb: 5,
            width: "100%",
          }}
        >
          {HistoryCards}
        </Stepper>
      </Container>
      <Box ref={ref} sx={{ mb: "20px" }}>
        {hasNextPage && <CircularProgress color="inherit" />}
        {!hasNextPage && !isFetching && (
          <Box textAlign="center">
            <Article
              fontSize="large"
              sx={{ width: "250px", height: "250px" }}
            />
            <Typography variant="h5" align="center" sx={{ height: "50%" }}>
              No Data
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HistoryTable;
