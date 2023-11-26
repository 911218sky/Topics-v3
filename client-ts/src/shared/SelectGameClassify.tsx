import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Chip,
  SelectProps,
  Checkbox,
  CircularProgress,
  SelectChangeEvent,
  Typography,
  Tooltip,
  Zoom,
} from "@mui/material";
import { useQuery } from "react-query";
import axios from "axios";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps: SelectProps["MenuProps"] = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export interface Classify {
  name: string;
  description: string;
}

interface SelectGameClassifyProps {
  classifys: Classify[];
  setClassifys: (classifys: Classify[]) => void;
  selectProps?: SelectProps<Classify[]>;
}

const SelectGameClassify: React.FC<SelectGameClassifyProps> = ({
  classifys,
  setClassifys,
  selectProps = {},
}) => {
  const { data: gameClassifys, isFetched } = useQuery({
    queryKey: ["gameClassifysList"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_SEVER_URL}/game/gameclassify`,
        {
          withCredentials: true,
        }
      );
      return response.data.classify as Classify[];
    },
  });

  const handleChange = (event: SelectChangeEvent<Classify[]>) => {
    const {
      target: { value },
    } = event;
    setClassifys(value as Classify[]);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="Classify">Classify</InputLabel>
      <Select
        labelId="Classify"
        id="Classify"
        multiple
        value={classifys}
        onChange={handleChange}
        input={<OutlinedInput id="Classify" label="Classify" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value.name} label={value.name} color="primary" />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
        {...selectProps}
      >
        {!isFetched && (
          <MenuItem
            disabled
            value="CircularProgress"
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </MenuItem>
        )}
        {gameClassifys &&
          gameClassifys.map((classify) => (
            <MenuItem key={classify.name} value={classify as unknown as string}>
              <Tooltip
                title={
                  <Typography variant="body2" gutterBottom>
                    {classify.description}
                  </Typography>
                }
                placement="left"
                TransitionComponent={Zoom}
                arrow
              >
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Checkbox checked={classifys.indexOf(classify) > -1} />
                  {classify.name}
                </Box>
              </Tooltip>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default SelectGameClassify;
