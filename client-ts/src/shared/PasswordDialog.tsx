import React, { useState, memo, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogProps,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import AutoSnackbar from "./AutoSnackbar";
import { TransitionDown } from "./SnackbarTransition";
import useDelayedAction from "../hooks/useDelayedAction";

interface PasswordDialogProps {
  open: boolean;
  handleConfirm: (response: any) => void;
  handleCancel: () => void;
  Dialogprops?: Partial<DialogProps>;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  open,
  handleConfirm,
  handleCancel,
  Dialogprops,
}) => {
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [, jumpToHome] = useDelayedAction(3000, () => {
    setPassword("");
    setError("");
    handleCancel();
  });

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>, password: string) => {
      e.preventDefault();
      setIsLoading(true);
      axios
        .post(
          `${process.env.REACT_APP_SEVER_URL}/obtain/reviselimitetoken`,
          {
            password,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          handleConfirm(response);
        })
        .catch((error) => {
          setError("Incorrect password");
          jumpToHome();
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    []
  );

  return (
    <>
      <AutoSnackbar
        message={error}
        setMessage={setError}
        autoHideDuration={2000}
        variant="filled"
        severity="error"
        alertTitle="Error"
        otherSnackbar={{
          TransitionComponent: TransitionDown,
        }}
        otherAlert={{
          sx: {
            width: "60%",
            backgroundColor: "rgb(230, 0, 0,0.5)",
          },
        }}
      />
      <Dialog {...Dialogprops} open={open} onClose={handleCancel}>
        <form onSubmit={(e) => handleSubmit(e, password)}>
          <DialogTitle>Enter Password</DialogTitle>
          <DialogContent sx={{ width: "400px", height: "100px" }}>
            <TextField
              autoFocus
              required
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <LoadingButton
              variant="contained"
              color="primary"
              type="submit"
              disabled={!password || isLoading}
              loading={isLoading}
            >
              Confirm
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default memo(PasswordDialog);
