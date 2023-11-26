import { forwardRef, ForwardRefRenderFunction } from "react";
import { Slide, SlideProps } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const TransitionUp = forwardRef((
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TransitionDown = forwardRef((
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) => {
  return <Slide direction="down" ref={ref} {...props} />;
});


const TransitionLeft =forwardRef((
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) => {
  return <Slide direction="left" ref={ref} {...props} />;
});


const TransitionRight = forwardRef((
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) => {
  return <Slide direction="right" ref={ref} {...props} />;
});


export { TransitionUp, TransitionDown, TransitionLeft, TransitionRight };
