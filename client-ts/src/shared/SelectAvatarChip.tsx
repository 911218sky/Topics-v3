import { memo } from "react";
import {
  Box,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Chip,
  Avatar,
  Stack,
  SelectChangeEvent,
} from "@mui/material";

export interface UserData {
  userName: string;
  imgId: string | null;
}

interface SelectAvatarChipProps {
  title: string;
  data: UserData[];
  value: UserData[];
  setValue: (value: UserData[]) => void;
}

const SelectAvatarChip: React.FC<SelectAvatarChipProps> = ({
  title,
  data,
  value,
  setValue,
}) => {
  const handleChange = (e: SelectChangeEvent<UserData[]>) => {
    const selectedValues = e.target.value as UserData[];
    setValue(selectedValues);
  };

  if (!data) return null;

  return (
    <>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel id="label">{title}</InputLabel>
        <Select
          fullWidth
          multiple
          value={value}
          onChange={handleChange}
          input={<OutlinedInput label="Chip" fullWidth />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map(({ userName, imgId }) => (
                <Stack direction="column" spacing={1} key={userName}>
                  <Chip
                    avatar={
                      imgId ? (
                        <Avatar
                          alt={userName}
                          src={`${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${imgId}`}
                        />
                      ) : (
                        <Avatar>{userName[0]}</Avatar>
                      )
                    }
                    label={userName}
                    variant="outlined"
                  />
                </Stack>
              ))}
            </Box>
          )}
        >
          {data &&
            data.map((userData, index) => (
              <MenuItem key={userData.userName} value={userData as any}>
                <Box>
                  <img
                    loading="lazy"
                    width="30"
                    src={
                      userData.imgId !== null
                        ? `${process.env.REACT_APP_SEVER_URL}/obtain/user/image/${userData.imgId}`
                        : `${process.env.REACT_APP_SEVER_URL}/public/system/image/user.png`
                    }
                    alt={userData.userName}
                    style={{ borderRadius: "50%", marginRight: "10px" }}
                  />
                </Box>
                {userData.userName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
};

export default memo(SelectAvatarChip);
