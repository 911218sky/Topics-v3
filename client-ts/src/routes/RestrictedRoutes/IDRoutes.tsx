import React, { Suspense, lazy, memo } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import Loading from "../../shared/Loading";
import RestrictedProvider from "../../context/RestrictedProvider";

const VerificationCodeForm = lazy(
  () => import("../../components/layouts/VerificationCodeForm")
);
const UserSetting = lazy(() => import("../../components/layouts/UserSetting"));
const ResetPasswordPage = lazy(
  () => import("../../components/layouts/ResetPasswordPage")
);

const IdRoutes: React.FC = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const navigate = useNavigate();

  if (!id) {
    navigate(-1);
    return null;
  }
  return (
    <RestrictedProvider id={id!}>
      <Routes>
        <Route
          path="/verificationcodeform"
          element={
            <Suspense fallback={<Loading />}>
              <VerificationCodeForm />
            </Suspense>
          }
        />
        <Route
          path="/resetpassword"
          element={
            <Suspense fallback={<Loading />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/usersetting"
          element={
            <Suspense fallback={<Loading />}>
              <UserSetting />
            </Suspense>
          }
        />
      </Routes>
    </RestrictedProvider>
  );
};

export default memo(IdRoutes);
