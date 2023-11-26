import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { MusicNote, MusicOff } from "@mui/icons-material";
import { TransitionDown } from "../DialogTransition";

interface BackgroundVideoProps {
  videoUrl: string;
}

const BackgroundVideo: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  BackgroundVideoProps
> = ({ videoUrl }, ref) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleToggleMusic = useCallback(() => {
    setIsMusicPlaying((prevIsMusicPlaying) => !prevIsMusicPlaying);
  }, []);

  const handleAgree = useCallback(() => {
    setIsMusicPlaying(true);
    setOpenDialog(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const playVideo = async () => {
      try {
        await video?.play();
        setIsMusicPlaying(true);
      } catch (error) {
        videoRef.current!.muted = true;
        await video?.play();
        setIsMusicPlaying(false);
        setOpenDialog(true);
      }
    };
    video!.src = videoUrl;
    video!.loop = true;
    playVideo();
  }, [videoUrl]);

  useEffect(() => {
    videoRef.current!.muted = !isMusicPlaying;
  }, [isMusicPlaying]);

  useImperativeHandle(ref, (): HTMLVideoElement => {
    return videoRef.current!;
  });

  return (
    <Box>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        TransitionComponent={TransitionDown}
      >
        <DialogTitle>{"Play music?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Do you want to play music?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Disagree</Button>
          <Button onClick={handleAgree}>Agree</Button>
        </DialogActions>
      </Dialog>
      <video
        ref={videoRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <IconButton
        onClick={handleToggleMusic}
        sx={{
          position: "fixed",
          bottom: "2%",
          right: "2%",
        }}
      >
        {isMusicPlaying ? <MusicNote /> : <MusicOff />}
      </IconButton>
    </Box>
  );
};

export default memo(forwardRef(BackgroundVideo));
