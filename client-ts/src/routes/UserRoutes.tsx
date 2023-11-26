import React, { lazy, Suspense, useContext, memo } from "react";
import { Route, Routes, Navigate, useRevalidator } from "react-router-dom";
import { GlobalContext } from "../context/GlobalProvider";

import Loading from "../shared/Loading";

const FormRoutes = lazy(() => import("./UserRoutes/FormRoutes"));
const Dashboard = lazy(() => import("../components/layouts/Dashboard"));
const NotFoundPage = lazy(() => import("../components/layouts/NotFoundPage"));

const UserRoutes: React.FC = () => {
  const { isLogin } = useContext(GlobalContext);
  if (!isLogin) return <Navigate to="/public/login" replace={true} />;
  return (
    <Routes>
      <Route
        path="/form/*"
        element={
          <Suspense fallback={<Loading />}>
            <FormRoutes />
          </Suspense>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<Loading />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default memo(UserRoutes);
