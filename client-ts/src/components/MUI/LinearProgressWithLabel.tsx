import {
  Box,
  Typography,
  LinearProgress,
  LinearProgressProps,
  SxProps,
} from "@mui/material";

interface ProgressBarProps extends LinearProgressProps {
  value: number;
  sx?: SxProps;
}

const ProgressBar = (props: ProgressBarProps): JSX.Element => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", ...props.sx }}>
      <Box sx={{ minWidth: 40 }}>
        <Typography variant="body2">{`${Math.round(props.value)}%`}</Typography>
      </Box>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
};

export default ProgressBar;
