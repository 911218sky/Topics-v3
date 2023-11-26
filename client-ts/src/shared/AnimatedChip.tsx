import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedChip: React.FC<ChipProps> = (props) => {
  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <Chip {...props} />
    </motion.div>
  );
};

export default AnimatedChip;
