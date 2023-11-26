import React, { useState, useEffect, useRef, memo } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  SxProps,
  Button,
  IconButton,
} from "@mui/material";
import { MusicNote, MusicOff } from "@mui/icons-material";

import { TransitionDown } from "../DialogTransition";

interface MusicProps {
  url: string;
  sx?: SxProps;
}

const Music: React.FC<MusicProps> = ({ url, sx }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean | null>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audioRef.current = audio;

    audio.play().catch((error) => {
      setIsMusicPlaying(false);
      setOpenDialog(true);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current === null) return;
    else if (!isMusicPlaying) {
      audioRef.current.pause();
    } else if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setOpenDialog(true);
      });
    }
  }, [isMusicPlaying]);

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
          <Button
            onClick={() => {
              setIsMusicPlaying(false);
              setOpenDialog(false);
            }}
          >
            Disagree
          </Button>
          <Button
            onClick={() => {
              setIsMusicPlaying(true);
              setOpenDialog(false);
            }}
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton sx={sx} onClick={() => setIsMusicPlaying(!isMusicPlaying)}>
        {isMusicPlaying ? <MusicNote /> : <MusicOff />}
      </IconButton>
    </Box>
  );
};

export default memo(Music);
