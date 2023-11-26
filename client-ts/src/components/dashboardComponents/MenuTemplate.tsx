import React, { useState, useCallback, memo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Article } from "@mui/icons-material";
import { Masonry } from "@mui/lab";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import axios from "axios";

import MenuCard, { MenuCardProps } from "./menu/MenuCard";

interface MenuData extends MenuCardProps {
  id: number;
  menuId: number;
}

interface PageData {
  menus: MenuData[] | null;
  token: string;
  isEnd: boolean;
}

const MenuTemplate: React.FC = () => {
  const [token, setToken] = useState<string>("");

  const getMenuData = useCallback(
    async (tokin: string) => {
      try {
        const response = await axios.get<PageData>(
          `${process.env.REACT_APP_SEVER_URL}/menu/menu`,
          {
            withCredentials: true,
            params: {
              token,
            },
          }
        );
        setToken(response.data?.token);
        return {
          menus: response.data?.menus,
          token: response.data?.token,
          isEnd: response.data?.isEnd,
        };
      } catch (error) {
        return null;
      }
    },
    [token]
  );

  const { data, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery<PageData | null>(
      ["MenuData"],
      ({ pageParam = "" }) => getMenuData(pageParam),
      {
        getNextPageParam: (lastPage, allPages) => {
          if (!lastPage) return undefined;
          return lastPage.isEnd ? undefined : lastPage.token;
        },
        retry: 5,
      }
    );

  const { ref, inView } = useInView({
    threshold: 0.8,
    delay: 300,
    skip: !hasNextPage,
    onChange: (inView) => {
      if (!inView || !hasNextPage) return;
      fetchNextPage({
        pageParam: token,
      });
    },
  });

  return (
    <Box sx={{ p: 1, overflow: "auto", height: "100vh" }}>
      {data && data.pages !== null && (
        <Masonry columns={{ xs: 1, sm: 2, lg: 3 }} spacing={2}>
          {data.pages.map((page) =>
            page?.menus?.map(
              ({
                id: menuId,
                author,
                game,
                gameDifficulty,
                gameOrderId,
                menuContent,
                menuCreateTime,
                menuFavorite,
                menuName,
                menuUsageCount,
                totalTime,
              }) => (
                <MenuCard
                  author={author}
                  game={game}
                  gameDifficulty={gameDifficulty}
                  gameOrderId={gameOrderId}
                  menuContent={menuContent}
                  menuCreateTime={menuCreateTime}
                  menuFavorite={menuFavorite}
                  menuName={menuName}
                  menuUsageCount={menuUsageCount}
                  totalTime={totalTime}
                  id={menuId}
                  key={menuId}
                />
              )
            )
          )}
        </Masonry>
      )}
      <Box ref={ref} sx={{ mb: "100px" }}>
        {hasNextPage && <CircularProgress color="inherit" />}
        {!hasNextPage && !isFetching && (
          <Box textAlign="center">
            <Article
              fontSize="large"
              sx={{ width: "250px", height: "250px" }}
            />
            <Typography variant="h5" align="center" sx={{ height: "50%" }}>
              No Data
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(MenuTemplate);
