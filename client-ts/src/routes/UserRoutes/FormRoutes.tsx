import React, { lazy, Suspense, useContext, memo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import { GlobalContext } from "../../context/GlobalProvider";

import Loading from "../../shared/Loading";
const NotFoundPage = lazy(
  () => import("../../components/layouts/NotFoundPage")
);

const FormPage = lazy(() => import("../../components/layouts/FormPage"));
const DetailForm = lazy(() => import("../../components/layouts/DetailForm"));

const FormRoutes: React.FC = () => {
  const { isLogin } = useContext(GlobalContext);
  if (!isLogin) return <Navigate to="/public/login" replace={true} />;
  return (
    <Routes>
      <Route
        path="/details"
        element={
          <Suspense fallback={<Loading />}>
            <DetailForm />
          </Suspense>
        }
      />
      <Route
        path="/write/:id/*"
        element={
          <Suspense fallback={<Loading />}>
            <FormPage />
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

export default memo(FormRoutes);
