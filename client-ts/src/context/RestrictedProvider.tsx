import React, { useState, useEffect, ReactNode, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Loading from "../shared/Loading";

interface Data {
  exist: boolean;
}

interface RestrictedContextValue {
  data: Data | null;
  id: string;
}

export const RestrictedContext = React.createContext<RestrictedContextValue>({
  data: null,
  id: "",
});

interface RestrictedProviderProps {
  id: string;
  children: ReactNode;
}

const RestrictedProvider: React.FC<RestrictedProviderProps> = ({
  id,
  children,
}: RestrictedProviderProps) => {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExist, setIsExist] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/public/limit/exist`,
        {
          id,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (!response.data?.exist) navigate("/forbidden");
        setIsExist(response.data.exist);
        setData(response.data);
      })
      .catch(() => {
        navigate("/forbidden");
        setIsExist(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate]);

  const providerValue =
    useMemo<RestrictedContextValue>((): RestrictedContextValue => {
      return {
        data,
        id,
      };
    }, [data, id]);

  if (isLoading) return <Loading />;
  else if (!isExist) return null;
  return (
    <RestrictedContext.Provider value={{ data, id }}>
      {children}
    </RestrictedContext.Provider>
  );
};

export default memo(RestrictedProvider);
