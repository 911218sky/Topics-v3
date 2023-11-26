import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import useDelayedAction from "../../hooks/useDelayedAction";

const ErrorPage: React.FC = () => {
  const [brow, setBrow] = useState(true);
  const [bgcolorIsRed, setBgcolorIsRed] = useState(true);
  const navigate = useNavigate();

  const [, jumpToHome] = useDelayedAction(3000, () => {
    navigate("/user/dashboard/home", { replace: true });
  });

  const getRandomTime = useCallback((minTime: number, maxTime: number) => {
    return Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  }, []);
  const sleep = useCallback((ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      for (let i = 0; i < 3; i++) {
        await sleep(getRandomTime(100, 400));
        setBrow((prevBrow) => !prevBrow);
        setBgcolorIsRed((prevBgcolorIsRed) => !prevBgcolorIsRed);
      }
    }, getRandomTime(4000, 8000));
    return () => clearInterval(timer);
  }, [getRandomTime, sleep]);

  useEffect(() => {
    setTimeout(() => {
      jumpToHome();
    }, 1000 * 10);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: bgcolorIsRed ? "#FF5151" : "#000000",
        height: "100%",
        width: "100%",
      }}
    >
      <Grid
        container
        sx={{
          p: 5,
          pl: "20%",
        }}
        direction="column"
      >
        <Grid item pb={5} sm={3} sx={{ userSelect: "none" }}>
          <Typography variant="h1">ERROR !!!</Typography>
          <Typography variant="h1">{brow ? "(X _ X)" : "(X U X)"}</Typography>
        </Grid>
        <Grid item sm={3}>
          <Typography variant="h5" pb={5} sx={{ userSelect: "none" }}>
            Sorry, there was a connection error between the website server and
            the upstream server.
            <br />
            Please try again later or go back to the homepage to continue
            browsing.
          </Typography>
        </Grid>
        <Grid item sm={3} sx={{ display: "flex", paddingLeft: "auto" }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <Button
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: "white",
                color: "black",
                "&:hover": {
                  bgcolor: "#F0F0F0",
                },
              }}
              href="/public/login"
            >
              Go Home
            </Button>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ErrorPage;
