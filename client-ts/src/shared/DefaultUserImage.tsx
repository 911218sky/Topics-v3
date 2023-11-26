import React, { FC, memo } from "react";
import { useQuery } from "react-query";
import ListImageDialog from "./ListImageDialog";
import axios from "axios";

import Loading from "./Loading";

interface DefaultUserImageProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectImage: React.Dispatch<React.SetStateAction<string>>;
}

const DefaultUserImage: FC<DefaultUserImageProps> = ({
  isOpen,
  setOpen,
  setSelectImage,
}) => {
  const { data, isFetching } = useQuery({
    queryKey: ["DefaultUserImage"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SEVER_URL}/obtain/defaultuserpicture`,
          {
            withCredentials: true,
          }
        );
        const imageFiles = response.data.imageFiles as string[] | undefined;
        if (!imageFiles) return;

        return imageFiles.map((file) => {
          return `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${file}`;
        });
      } catch (error) {
        return null;
      }
    },
  });

  if (isFetching) return <Loading />;
  else if (!data) return null;
  return (
    <ListImageDialog
      isOpen={isOpen}
      setOpen={setOpen}
      imageUrls={data}
      setSelectImage={setSelectImage}
    />
  );
};

export default memo(DefaultUserImage);
