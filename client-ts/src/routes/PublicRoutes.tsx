import React, { Suspense, lazy, useContext, memo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { GlobalContext } from "../context/GlobalProvider";
import Loading from "../shared/Loading";

const Login = lazy(() => import("../components/layouts/Login"));
const Register = lazy(() => import("../components/layouts/Register"));
const ForgotPasswordPage = lazy(
  () => import("../components/layouts/ForgotPasswordPage")
);

const PublicRoutes: React.FC = () => {
  const { isLogin } = useContext(GlobalContext);
  if (isLogin) return <Navigate to="/user/dashboard/home" replace={true} />;
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<Loading />}>
            <Register />
          </Suspense>
        }
      />
      <Route
        path="/forgotpassword"
        element={
          <Suspense fallback={<Loading />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default memo(PublicRoutes);
