import React, { useState, createContext, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";

import Loading from "../../shared/Loading";
import { Grid, Divider, Box, Typography } from "@mui/material";

import Card from "./mymenu/Card";
import DetailCard from "./mymenu/DetailCard";
import type { Assignment } from "./mymenu/Card";
import type { DetailCardProps } from "./mymenu/DetailCard";
import { Article } from "@mui/icons-material";

type MyMenuResponse = {
  message: string;
  assignment: Assignment[];
  totalPages: number;
};

interface ProviderValue {
  setDetailCardProps: React.Dispatch<React.SetStateAction<DetailCardProps>>;
  detailCardProps: DetailCardProps;
}

const detailCardPropsInitial = {
  id: null,
  isOpen: false,
};

export const MyMenuContext = createContext<ProviderValue>({
  setDetailCardProps: () => {},
  detailCardProps: detailCardPropsInitial,
});

const MyMenu = () => {
  const [detailCardProps, setDetailCardProps] = useState<DetailCardProps>(
    detailCardPropsInitial
  );

  const { data, isFetched } = useQuery({
    queryKey: ["MyMenu"],
    queryFn: async (key) => {
      return axios
        .get(`${process.env.REACT_APP_SEVER_URL}/menu/mymenu`, {
          withCredentials: true,
          params: { isTable: true },
        })
        .then((response) => {
          const myMenuResponse = response.data as MyMenuResponse;
          myMenuResponse.assignment.forEach((ass) => {
            ass.endDate = new Date(ass.endDate);
            ass.startDate = new Date(ass.startDate);
          });
          return myMenuResponse;
        });
    },
  });

  const providerValue = useMemo(() => {
    return {
      setDetailCardProps,
      detailCardProps,
    };
  }, [detailCardProps]);

  if (!isFetched || !data) return <Loading />;
  return (
    <MyMenuContext.Provider value={providerValue}>
      <Grid container spacing={2} p={2}>
        <DetailCard {...detailCardProps} />
        {data.assignment.map((ass) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={`${ass.menu.menuName}-${ass.id}`}
          >
            <Card {...ass} />
          </Grid>
        ))}
        <Divider />
      </Grid>
      {(!data || data.assignment.length === 0) && (
        <Box textAlign="center" sx={{ mb: "100px" }}>
          <Article fontSize="large" sx={{ width: "250px", height: "250px" }} />
          <Typography variant="h5" align="center" sx={{ height: "50%" }}>
            No Data
          </Typography>
        </Box>
      )}
    </MyMenuContext.Provider>
  );
};

export default MyMenu;
