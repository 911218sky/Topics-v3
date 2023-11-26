import React, { useState, memo, useCallback } from "react";
import { Box } from "@mui/material";
import Loader from "../components/MUI/Loader";

interface LoadingImageProps {
  url: string;
  alt: string;
  isLoading?: boolean;
  style?: React.CSSProperties | undefined;
}

const LoadingImage: React.FC<LoadingImageProps> = ({
  url,
  alt,
  isLoading = false,
  style = {},
}: LoadingImageProps) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {(!imageLoaded || isLoading) && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loader>Loading</Loader>
        </Box>
      )}
      <img
        key={`${url}-${imageLoaded ? "loaded" : "loading"}`}
        src={url}
        alt={alt}
        onLoad={handleImageLoad}
        style={{
          display: imageLoaded && !isLoading ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          userSelect: "none",
          ...style,
        }}
      />
    </Box>
  );
};

export default memo(LoadingImage);
