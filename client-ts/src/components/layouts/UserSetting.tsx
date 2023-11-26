import React, { useState, useMemo, useContext } from "react";
import {
  Box,
  TextField,
  Container,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Settings } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { GlobalContext } from "../../context/GlobalProvider";
import ImageDropzone from "../../shared/ImageDropzone";
import ParticleField from "../../shared/special/ParticleField";
import LoadingImage from "../../shared/LoadingImage";
import AutoSnackbar from "../../shared/AutoSnackbar";
import Music from "../../shared/special/Music";
import { TransitionDown } from "../../shared/SnackbarTransition";
import getImageBlob from "../../tool/GetImageBlob";
import DefaultUserImage from "../../shared/DefaultUserImage";

const SettingDialog: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<File | string | null>(null);
  const [openImageListDialog, setOpenImageListDialog] =
    useState<boolean>(false);

  const { reacquireUserData } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ParticleFieldMemo = useMemo(() => <ParticleField />, []);

  const ImageDropzoneComponent = useMemo(
    () => <ImageDropzone image={image} setImage={setImage} />,
    [image]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const blob =
      image && image.constructor === File ? await getImageBlob(image) : null;
    axios
      .post(
        `${process.env.REACT_APP_SEVER_URL}/revise/limite/update`,
        {
          id,
          userName,
          password,
          type: "userImg",
          image: blob ? blob : null,
          systemImageId:
            image && image.constructor === String
              ? image.split("/").pop()
              : null,
        },
        {
          withCredentials: true,
          params: { id, params: true },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log(reacquireUserData);
        reacquireUserData();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
        navigate("/user/dashboard/home", { replace: true });
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: [0, 0.71, 0.2, 1.01],
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <DefaultUserImage
          isOpen={openImageListDialog}
          setOpen={setOpenImageListDialog}
          setSelectImage={(v) => {
            setImage(v as string);
          }}
        />
        {ParticleFieldMemo}
        <AutoSnackbar
          message={error}
          setMessage={setError}
          autoHideDuration={2000}
          severity="error"
          variant="filled"
          alertTitle="Error"
          otherSnackbar={{
            TransitionComponent: TransitionDown,
          }}
          otherAlert={{
            sx: { width: "60%" },
          }}
        />
        <AutoSnackbar
          message={message}
          setMessage={setMessage}
          autoHideDuration={2000}
          severity="success"
          variant="filled"
          alertTitle="Information"
          otherSnackbar={{
            sx: { width: "100%" },
            TransitionComponent: TransitionDown,
          }}
          otherAlert={{
            sx: { width: "60%" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          <LoadingImage
            alt="settingdialog"
            url={`${process.env.REACT_APP_SEVER_URL}/public/system/image/settingdialog.png?original=true`}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Grid
            container
            component={Container}
            direction="row"
            maxWidth="lg"
            spacing={2}
            sx={{
              borderRadius: "10px",
              padding: "2rem",
              margin: "1rem",
              "::-webkit-scrollbar": {
                display: "none",
              },
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(0, 0, 0, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
              color: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgb(255, 255, 255)"
                  : "rgb(0, 0, 0)",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Settings sx={{ fontSize: 64, color: "primary.main" }} />
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                User Settings
              </Typography>
            </Grid>
            <Button
              sx={{
                marginLeft: "auto",
                mt: "-3rem",
              }}
              variant="outlined"
              onClick={() => setOpenImageListDialog(true)}
            >
              Use default image
            </Button>
            <Grid item xs={12} sx={{ height: "50vh" }}>
              {ImageDropzoneComponent}
            </Grid>
            <Grid item container spacing={2} xs={12}>
              <Grid item xs={12}>
                <TextField
                  id="userName"
                  label="userName (optional)"
                  variant="outlined"
                  onChange={(e) => setUserName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="Password"
                  label="Password (optional)"
                  type="password"
                  variant="outlined"
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{ width: "100%" }}
                >
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    variant="contained"
                    fullWidth
                  >
                    Submit
                  </LoadingButton>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </form>
        <Music
          url={`${process.env.REACT_APP_SEVER_URL}/public/system/audio/usersetting.mp3`}
          sx={{
            position: "fixed",
            bottom: "2%",
            right: "2%",
          }}
        />
      </Box>
    </motion.div>
  );
};

export default SettingDialog;
