import React, { Suspense, lazy, memo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import ErrorPage from "../components/layouts/ErrorPage";
import ForbiddenPage from "../components/layouts/ForbiddenPage";
import NotFoundPage from "../components/layouts/NotFoundPage";
import Loading from "../shared/Loading";

const PublicRoutes = lazy(() => import("./PublicRoutes"));
const UserRoutes = lazy(() => import("./UserRoutes"));
const RestrictedRoutes = lazy(() => import("./RestrictedRoutes"));
const DoctorRoutes = lazy(() => import("./DoctorRoutes"));

const GlobalRoutes = (): JSX.Element => {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <Routes>
        {/* PublicRoutes */}
        <Route
          path="/public/*"
          element={
            <Suspense fallback={<Loading />}>
              <PublicRoutes />
            </Suspense>
          }
        />
        {/* PublicRoutes */}
        <Route
          path="/user/*"
          element={
            <Suspense fallback={<Loading />}>
              <UserRoutes />
            </Suspense>
          }
        />
        {/* RestrictedRoutes */}
        <Route
          path="/restricted/*"
          element={
            <Suspense fallback={<Loading />}>
              <RestrictedRoutes />
            </Suspense>
          }
        />
        {/* DoctorRoutes */}
        <Route
          path="/doctor/*"
          element={
            <Suspense fallback={<Loading />}>
              <DoctorRoutes />
            </Suspense>
          }
        />

        {/* Navigate to home page */}
        <Route
          path="/"
          element={<Navigate to="/public/login" replace={true} />}
        />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default memo(GlobalRoutes);
