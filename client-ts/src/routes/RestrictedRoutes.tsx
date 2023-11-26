import React, { Suspense, lazy, memo } from "react";
import { Routes, Route } from "react-router-dom";

import Loading from "../shared/Loading";

const IDRoutes = lazy(() => import("./RestrictedRoutes/IDRoutes"));

const RestrictedRoutes: React.FC = () => {
  return (
    <Routes>
      {/* IDRoutes */}
      <Route
        path="/id/:id/*"
        element={
          <Suspense fallback={<Loading />}>
            <IDRoutes />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default memo(RestrictedRoutes);
