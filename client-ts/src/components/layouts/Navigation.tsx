import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Chip,
} from "@mui/material";
import { Brightness4, Brightness7, ExitToApp } from "@mui/icons-material";
import { motion } from "framer-motion";

import StyledBadge from "../MUI/StyledBadge";
import { ThemeContext } from "../../context/ThemeProvider";
import { GlobalContext } from "../../context/GlobalProvider";
import { DashboardContext } from "./Dashboard";

const Navigation: React.FC = () => {
  const tabs = useMemo(
    () => ["home", "history", "form", "tasks", "menu", "mymenu"],
    []
  );
  const { setDarkMode, darkMode } = useContext(ThemeContext);
  const { logout, userData, reacquireUserData } = useContext(GlobalContext);
  const { setOpenPasswordDialog } = useContext(DashboardContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState<number>(() => {
    const pathname = location.pathname;
    const parts = pathname.split("/");
    const index = tabs.indexOf(parts[parts.length - 1]);
    if (index === -1) return 0;
    return index;
  });

  useEffect(() => {
    const pathname = location.pathname;
    const parts = pathname.split("/");
    if (parts[parts.length - 1] === tabs[value]) return;
    const index = tabs.indexOf(parts[parts.length - 1]);
    setValue(index === -1 ? 0 : index);
  }, [location.state]);

  useEffect(() => {
    const pathname = location.pathname;
    const parts = pathname.split("/");
    if (parts[parts.length - 1] === tabs[value]) return;
    navigate(`/user/dashboard/${tabs[value]}`);
  }, [value]);

  useEffect(() => {
    reacquireUserData();
  }, []);

  const handleAvatarClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setOpenPasswordDialog(true);
    },
    []
  );

  return (
    <AppBar
      position="relative"
      elevation={2}
      color="inherit"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : "initial",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            onClick={() =>
              window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            }
          >
            <img
              key="aeust"
              src="../../aeust.jpg"
              alt="aeust Logo"
              height="32"
              width="32"
            />
          </Box>
          <Typography variant="h6" component="h6" sx={{ ml: 1 }}>
            AEUST
          </Typography>
        </Box>
        <Tabs
          value={value}
          onChange={(e, n) => setValue(n)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          {tabs.map((tab) => (
            <Tab label={tab} key={tab} />
          ))}
        </Tabs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {userData && (
            <>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <IconButton
                  sx={{ marginLeft: "auto" }}
                  onClick={handleAvatarClick}
                >
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar
                      alt={userData.userName || "NULL"}
                      src={
                        userData?.imgId
                          ? `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${userData.imgId}`
                          : userData?.userName || "NULL"
                      }
                      sx={{ width: 50, height: 50 }}
                      imgProps={{
                        draggable: false,
                        onContextMenu: (e) => e.preventDefault(),
                      }}
                    />
                  </StyledBadge>
                </IconButton>
              </motion.div>
              <Typography component="h5" sx={{ marginLeft: "10px" }}>
                {userData !== null &&
                userData !== undefined &&
                userData.userName.length > 10
                  ? userData.userName.substring(0, 10) + "..."
                  : userData.userName}
              </Typography>
              {userData?.role === "DOCTOR" && (
                <Chip
                  sx={{
                    ml: 2,
                    boxShadow: `0 0 25px rgba(0, 0, 255, 0.75)`,
                  }}
                  label={"Doctor"}
                  color="info"
                />
              )}
              {userData.role === "ADMIN" && (
                <motion.div
                  style={{
                    borderRadius: 20,
                    padding: "4px 10px",
                    margin: "2px 6px",
                    userSelect: "none",
                  }}
                  animate={{
                    background: [
                      "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,0,128,1) 100%)",
                      "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,69,0,1) 100%)",
                      "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,99,71,1) 100%)",
                      "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,127,80,1) 100%)",
                      "linear-gradient(60deg, rgba(255,0,0,1) 0%, rgba(255,0,128,1) 100%)",
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  {"ADMIN"}
                </motion.div>
              )}
            </>
          )}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <IconButton
              color="inherit"
              aria-label="search"
              onClick={() =>
                setDarkMode((state) => (state === "dark" ? "light" : "dark"))
              }
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <IconButton color="inherit" aria-label="account" onClick={logout}>
              <ExitToApp />
            </IconButton>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default memo(Navigation);
