import React, {
  useState,
  useCallback,
  createContext,
  useMemo,
  ReactNode,
  memo,
  useInsertionEffect,
} from "react";
import axios from "axios";
import Loading from "../shared/Loading";
import {
  useQueryClient,
  useMutation,
  useQuery,
  QueryFunctionContext,
  QueryKey,
  UseMutateFunction,
} from "react-query";

export interface UserData {
  userName: string;
  appellation: string;
  email: string;
  imgId: string | null;
  role: "USER" | "ADMIN" | "DOCTOR";
}

interface GlobalContextType {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  userData: UserData | null | undefined;
  reacquireUserData: UseMutateFunction<
    UserData,
    unknown,
    void,
    QueryFunctionContext<QueryKey, any>
  >;
}

export const GlobalContext = createContext<GlobalContextType>({
  isLogin: false,
  setIsLogin: () => {},
  logout: () => {},
  userData: null,
  reacquireUserData: () => {},
});

const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const getPersonalInformation = useCallback(async () => {
    return axios
      .get(`${process.env.REACT_APP_SEVER_URL}/obtain/information`, {
        withCredentials: true,
      })
      .then((response) => {
        return response.data?.user as UserData;
      })
      .catch(() => {
        throw new Error("Failed to fetch personal information");
      });
  }, []);

  const { data: userData, refetch } = useQuery<UserData | null>(
    ["personalInformation"],
    getPersonalInformation,
    {
      retry: 2,
      staleTime: Infinity,
      cacheTime: Infinity,
      initialData: null,
    }
  );

  const reacquireUserData = useMutation<
    UserData,
    unknown,
    void,
    QueryFunctionContext
  >(getPersonalInformation, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["personalInformation"]);
    },
  });

  const logout = useCallback(() => {
    setIsLogin(false);
    axios
      .get(`${process.env.REACT_APP_SEVER_URL}/authentication/logout`, {
        withCredentials: true,
      })
      .then(() => {
        setIsLogin(false);
        queryClient.clear();
      });
  }, [queryClient]);

  useInsertionEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SEVER_URL}/authentication/login`, {
        withCredentials: true,
      })
      .then(() => {
        refetch();
        setIsLogin(true);
      })
      .catch((error) => {
        setIsLogin(false);
        if (userData != null) logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const providerValue = useMemo<GlobalContextType>((): GlobalContextType => {
    return {
      isLogin,
      setIsLogin,
      logout,
      userData,
      reacquireUserData: reacquireUserData.mutate,
    };
  }, [isLogin, logout, reacquireUserData.mutate, userData]);

  return (
    <GlobalContext.Provider value={providerValue}>
      {loading || (userData == null && isLogin) ? <Loading /> : children}
    </GlobalContext.Provider>
  );
};

export default memo(GlobalProvider);
