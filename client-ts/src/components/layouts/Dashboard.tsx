import React, {
  useCallback,
  useState,
  useMemo,
  lazy,
  Suspense,
  createContext,
  useTransition,
  useEffect,
} from "react";
import { Box, Skeleton } from "@mui/material";
import { useNavigate, Routes, Route } from "react-router-dom";

import { TransitionDown } from "../../shared/DialogTransition";
import Navigation from "./Navigation";
import PasswordDialog from "../../shared/PasswordDialog";
import IsRender from "../../shared/IsRender";

const HomePage = lazy(() => import("../dashboardComponents/HomePage"));
const FormPage = lazy(() => import("../dashboardComponents/FormTable"));
const HistoryPage = lazy(() => import("../dashboardComponents/HistoryTable"));
const TasksPage = lazy(() => import("../dashboardComponents/TasksTable"));
const MenuTemplate = lazy(() => import("../dashboardComponents/MenuTemplate"));
const MyMenu = lazy(() => import("./../dashboardComponents/MyMenu"));

interface DashboardContextProps {
  setOpenPasswordDialog: (isOpen: boolean) => void;
}

export const DashboardContext = createContext<DashboardContextProps>({
  setOpenPasswordDialog: (isOpen: boolean) => {},
});

const Dashboard: React.FC = () => {
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const PasswordDialogCancel = useCallback(() => {
    setOpenPasswordDialog(false);
  }, []);

  const PasswordDialogConfirm = useCallback((response: any) => {
    setOpenPasswordDialog(false);
    const id = response.data.id;
    navigate(`/restricted/id/${id}/usersetting`);
  }, []);

  const providerValue =
    useMemo<DashboardContextProps>((): DashboardContextProps => {
      return {
        setOpenPasswordDialog,
      };
    }, []);

  const DashboardRoutes = useMemo(() => {
    return (
      <Routes>
        <Route
          path="/home"
          element={
            <Suspense>
              <IsRender>
                <HomePage />
              </IsRender>
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense>
              <IsRender>
                <HistoryPage />
              </IsRender>
            </Suspense>
          }
        />
        <Route
          path="/form"
          element={
            <Suspense>
              <IsRender>
                <FormPage />
              </IsRender>
            </Suspense>
          }
        />
        <Route
          path="/tasks"
          element={
            <Suspense>
              <IsRender>
                <TasksPage />
              </IsRender>
            </Suspense>
          }
        />
        <Route
          path="/menu"
          element={
            <Suspense>
              <IsRender>
                <MenuTemplate />
              </IsRender>
            </Suspense>
          }
        />
        <Route
          path="/mymenu"
          element={
            <Suspense>
              <IsRender>
                <MyMenu />
              </IsRender>
            </Suspense>
          }
        />
      </Routes>
    );
  }, []);

  return (
    <DashboardContext.Provider value={providerValue}>
      <Box height="100%">
        <PasswordDialog
          open={openPasswordDialog}
          handleCancel={PasswordDialogCancel}
          handleConfirm={PasswordDialogConfirm}
          Dialogprops={{
            TransitionComponent: TransitionDown,
          }}
        />
        <Navigation />
        <Box
          height="100%"
          sx={{
            overflow: "auto",
          }}
        >
          {DashboardRoutes}
        </Box>
      </Box>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
