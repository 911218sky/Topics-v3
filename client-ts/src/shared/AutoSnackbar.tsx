import React, { useRef, memo } from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  SnackbarProps,
  AlertProps,
  AlertColor,
} from "@mui/material";

interface AutoSnackbarProps {
  message: string;
  setMessage: (value: string) => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
  severity?: AlertColor;
  variant?: "standard" | "filled" | "outlined";
  alertTitle?: string;
  otherSnackbar?: Partial<SnackbarProps>;
  otherAlert?: AlertProps;
}

const AutoSnackbar: React.FC<AutoSnackbarProps> = ({
  message,
  setMessage,
  autoHideDuration = 2000,
  anchorOrigin = { vertical: "top", horizontal: "center" },
  alertTitle,
  severity = "info",
  variant = "filled",
  otherSnackbar,
  otherAlert,
}: AutoSnackbarProps) => {
  const setMessageRef = useRef(setMessage);
  return (
    <Snackbar
      open={!!message}
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      onClose={() => setMessageRef.current("")}
      sx={{ width: "100%" }}
      {...otherSnackbar}
    >
      <Alert severity={severity} variant={variant} {...otherAlert}>
        <AlertTitle>{alertTitle}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default memo(AutoSnackbar);
