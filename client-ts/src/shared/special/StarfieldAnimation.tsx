import React, { useEffect, useState, memo } from "react";
import { StarField, StarFieldProps } from "starfield-react";
import debounce from "lodash/debounce";

const StarfieldAnimation: React.FC<StarFieldProps> = (
  props: StarFieldProps
): JSX.Element => {
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = debounce(() => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);
    }, 200);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <StarField
      noBackground
      fps={30}
      starRatio={60}
      starShape="square"
      width={innerWidth}
      height={innerHeight}
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        opacity: 0.5,
      }}
      {...props}
    />
  );
};

export default memo(StarfieldAnimation);
