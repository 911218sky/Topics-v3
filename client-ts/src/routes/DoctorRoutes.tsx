import { lazy, Suspense, useContext, memo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import { GlobalContext } from "../context/GlobalProvider";

import Loading from "../shared/Loading";

const NotFoundPage = lazy(() => import("../components/layouts/NotFoundPage"));
const CreateFrom = lazy(() => import("../components/layouts/CreateFrom"));
const CreateGame = lazy(() => import("../components/layouts/CreateGame"));

const DoctorRoutes: React.FC = () => {
  const { isLogin, userData } = useContext(GlobalContext);

  if (!isLogin) return <Navigate to="/public/login" replace={true} />;
  if (!userData || userData.role === "USER")
    return <Navigate to="/forbidden" />;

  return (
    <Routes>
      <Route
        path="/form/create"
        element={
          <Suspense fallback={<Loading />}>
            <CreateFrom />
          </Suspense>
        }
      />
      <Route
        path="/game/create"
        element={
          <Suspense fallback={<Loading />}>
            <CreateGame />
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

export default memo(DoctorRoutes);
