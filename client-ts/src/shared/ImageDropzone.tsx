import React, { useState, useCallback } from "react";
import { Typography, Box, IconButton, SxProps } from "@mui/material";
import { Close, PhotoCamera } from "@mui/icons-material";
import { motion } from "framer-motion";

type ImageDropzoneProps = {
  image: File | null;
  setImage: React.Dispatch<React.SetStateAction<File | null>>;
  sx?: SxProps | undefined;
};

type ImageDropzoneStringProps = {
  image: string | File | null;
  setImage: React.Dispatch<React.SetStateAction<string | File | null>>;
  sx?: SxProps | undefined;
};

async function compressImage(
  imageFile: File,
  maxSizeInMB: number
): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const image = new Image();
      image.src = readerEvent.target?.result as string;
      image.onload = async () => {
        const maxDimension = Math.max(image.width, image.height);
        if (
          maxDimension <= 1024 &&
          imageFile.size <= maxSizeInMB * 1024 * 1024
        ) {
          resolve(imageFile);
          return;
        }
        const scaleFactor = 1024 / maxDimension;
        const newWidth = image.width * scaleFactor;
        const newHeight = image.height * scaleFactor;
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, newWidth, newHeight);
          canvas.toBlob(
            async (blob) => {
              if (blob) {
                const compressedFile = new File([blob], imageFile.name, {
                  type: "image/jpeg",
                });
                resolve(compressedFile);
              } else {
                reject("无法压缩图像。");
              }
            },
            "image/jpeg",
            0.9
          );
        } else {
          reject("Canvas 2D 上下文不可用。");
        }
      };
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(imageFile);
  });
}

const ImageDropzone: React.FC<
  ImageDropzoneProps | ImageDropzoneStringProps
> = ({ image, setImage, sx = {} }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      console.log("File changed", file);
      if (file) {
        const maxSizeInMB = 1.2;
        try {
          const compressedImage = await compressImage(file, maxSizeInMB);
          setImage(compressedImage);
          console.log("Compressed image");
        } catch (error) {
          console.error("压缩图像时出错:", error);
        }
      }
    },
    [setImage]
  );

  const handleDragEnter: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        const maxSizeInMB = 1.2;
        try {
          const compressedImage = await compressImage(file, maxSizeInMB);
          setImage(compressedImage);
          console.log(
            "Compressed image size:",
            compressedImage!.size / (1024 * 1024),
            "MB"
          );
        } catch (error) {
          console.error("压缩图像时出错:", error);
        }
      }
    },
    [setImage]
  );

  const handleClearImage = useCallback(() => {
    setImage(null);
  }, [setImage]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: !isDragging ? 0.75 : 1,
        border: "2px dashed #888888",
        borderRadius: "8px",
        backgroundColor: isDragging ? "#888888" : "transparent",
        overflow: "hidden",
        ...sx,
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {image ? (
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={typeof image === "string" ? image : URL.createObjectURL(image)}
            alt="Preview"
            style={{
              cursor: "grab",
              position: "relative",
            }}
          />
          <IconButton
            onClick={handleClearImage}
            sx={{ position: "absolute", top: 0, left: 0, color: "#FF0000" }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      ) : (
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <label
            htmlFor="upload-input"
            style={{ height: "100%", width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <PhotoCamera sx={{ fontSize: 48, color: "#888888" }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                Drag and drop images here or click to choose a file
              </Typography>
            </Box>
          </label>
        </motion.div>
      )}
      <input
        id="upload-input"
        type="file"
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ImageDropzone;
