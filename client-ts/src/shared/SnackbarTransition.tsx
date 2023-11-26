import React from "react";
import { Slide, SlideProps } from "@mui/material";

export type TransitionProps = Omit<SlideProps, "direction">;

export const TransitionLeft: React.FC<TransitionProps> = (props) => {
  return <Slide {...props} direction="left" />;
};

export const TransitionUp: React.FC<TransitionProps> = (props) => {
  return <Slide {...props} direction="up" />;
};

export const TransitionRight: React.FC<TransitionProps> = (props) => {
  return <Slide {...props} direction="right" />;
};

export const TransitionDown: React.FC<TransitionProps> = (props) => {
  return <Slide {...props} direction="down" />;
};
