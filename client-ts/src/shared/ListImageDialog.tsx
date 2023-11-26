import { FC, useCallback, useState } from "react";
import {
  CardActionArea,
  Dialog,
  ImageList,
  ImageListItem,
} from "@mui/material";
import LoadingImage from "./LoadingImage";

interface ListImageDialogProps {
  imageUrls: string[];
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectImage?: React.Dispatch<React.SetStateAction<string>>;
}

const ListImageDialog: FC<ListImageDialogProps> = ({
  isOpen,
  setOpen,
  imageUrls,
  setSelectImage,
}) => {
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleListItemClick = useCallback(
    (url: string) => {
      if (!setSelectImage) return;
      setSelectImage(url);
      setOpen(false);
    },
    [setOpen, setSelectImage]
  );

  return (
    <Dialog fullWidth={true} maxWidth="md" open={isOpen} onClose={handleClose}>
      <ImageList
        sx={{
          p: 2,
          width: "100%",
          height: "100%",
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
        rowHeight={300}
        cols={3}
      >
        {imageUrls.map((url) => (
          <CardActionArea key={url} onClick={() => handleListItemClick(url)}>
            <ImageListItem>
              <LoadingImage url={url} alt={url} />
            </ImageListItem>
          </CardActionArea>
        ))}
      </ImageList>
    </Dialog>
  );
};

export default ListImageDialog;
