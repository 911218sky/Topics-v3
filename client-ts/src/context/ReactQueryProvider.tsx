import React, { ReactNode, memo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      retryDelay: 200,
      retry: 3,
    },
  },
});

interface ReactQueryProviderProps {
  children: ReactNode;
  openReactQueryDevtools?: boolean;
}

const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({
  children,
  openReactQueryDevtools = false,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {openReactQueryDevtools && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};

export default memo(ReactQueryProvider);
