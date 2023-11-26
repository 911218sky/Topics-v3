import { useState, memo } from "react";
import {
  Typography,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormControl,
  Box,
  SxProps,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import LinearProgressWithLabel from "../components/MUI/LinearProgressWithLabel";

interface PasswordAchievementProps {
  password: string;
  setPassword: (value: string) => void;
  setIsFinish: (value: boolean) => void;
  sx?: SxProps;
}

const PasswordAchievement: React.FC<PasswordAchievementProps> = ({
  password,
  setPassword,
  setIsFinish,
  sx,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [achievement, setAchievement] = useState<
    { text: string; status: boolean }[]
  >([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const checkPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const achievements = [
      { pattern: /^(?=.*[a-z]).+$/, text: "至少一個小寫字母 a-z" },
      { pattern: /^(?=.*[A-Z]).+$/, text: "至少一個大寫字母 A-Z" },
      { pattern: /^(?=.*[0-9]).+$/, text: "至少包含壹個數字 0-9" },
      { pattern: /^.{8,40}$/, text: "長度介於 8 至 40 個字符之間" },
    ];
    const tempAchievement = achievements.map((achievement) => ({
      text: achievement.text,
      status: achievement.pattern.test(value),
    }));
    setAchievement(tempAchievement);
    const score =
      tempAchievement.filter((achievement) => achievement.status).length * 25;
    setProgress(score);
    setPassword(value);
    if (score === 100) setIsFinish(true);
    else setIsFinish(false);
  };

  return (
    <Box width="100%" height="100%" sx={sx}>
      <FormControl margin="normal" fullWidth required variant="outlined">
        <InputLabel htmlFor="password">Password</InputLabel>
        <OutlinedInput
          onChange={checkPassword}
          id="password"
          type={showPassword ? "text" : "password"}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((show) => !show)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
      {password && (
        <>
          <LinearProgressWithLabel value={progress} />
          {achievement.map((item, index) => (
            <div key={index}>
              <Typography color={item.status ? "" : "error"}>
                {(item.status ? "✔️" : "❌") + item.text}
              </Typography>
            </div>
          ))}
        </>
      )}
    </Box>
  );
};

export default memo(PasswordAchievement);
