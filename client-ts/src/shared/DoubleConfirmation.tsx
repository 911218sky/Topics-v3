import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogProps,
  Button,
} from "@mui/material";
import React from "react";

interface DoubleConfirmationProps {
  open: boolean;
  title: string;
  contentText: string;
  onSuccess?: () => void;
  onFail?: () => void;
  dialogProps?: DialogProps;
}

const DoubleConfirmation: React.FC<DoubleConfirmationProps> = ({
  open,
  title,
  contentText,
  onSuccess = () => {},
  onFail = () => {},
  dialogProps,
}) => {
  return (
    <Dialog open={open} aria-labelledby="title" {...dialogProps}>
      <DialogTitle id="title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            onFail();
          }}
        >
          Disagree
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            onSuccess();
          }}
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoubleConfirmation;
