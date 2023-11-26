import { FC, useRef, useEffect, memo, useState, useMemo } from "react";

interface MovingStarrySkyProps {
  starColor?: string;
  starSize?: number;
  starMinScale?: number;
  overFlowThreshold?: number;
  starCount?: number;
  style?: React.CSSProperties;
}

interface Direction {
  up: number;
  down: number;
  left: number;
  right: number;
}

interface Axis {
  vertical: number;
  horizontal: number;
}

interface StarPosition {
  x: number;
  y: number;
  z: number;
}

interface Pointer {
  x: number | null;
  y: number | null;
}

interface WindowSize {
  height: number;
  width: number;
}

interface velocity {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
}

const MovingStarrySky: FC<MovingStarrySkyProps> = ({
  starColor = "#FFF",
  starSize = 3,
  starMinScale = 0.2,
  overFlowThreshold = 50,
  starCount = (window.innerWidth + window.innerHeight) / 8,
  style = {},
}: MovingStarrySkyProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  let [touchInput, setTouchInput] = useState<boolean>(false);
  let animationFrame = useMemo<null | number>(() => null, []);
  const [stars, setStars] = useState<StarPosition[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [pointer, setPointer] = useState<Pointer>({
    x: 0,
    y: 0,
  });
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });
  const [velocity, setVelocity] = useState<velocity>({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    z: 0.0009,
  });

  const generateStars = () => {
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: 0,
        y: 0,
        z: starMinScale * Math.random() * (1 - starMinScale),
      });
    }
    setStars(stars);
  };

  const placeStars = (star: StarPosition) => {
    star.x = Math.random() * windowSize.width;
    star.y = Math.random() * windowSize.height;
  };

  const recycleStar = (star: StarPosition) => {
    let direction: keyof Direction | "z" = "z";
    const vx = Math.abs(velocity.x);
    const vy = Math.abs(velocity.y);
    if (vx > 1 || vy > 1) {
      let axis: keyof Axis;
      if (vx > vy) {
        axis = Math.random() < vx / (vx + vy) ? "horizontal" : "vertical";
      } else {
        axis = Math.random() < vy / (vx + vy) ? "vertical" : "horizontal";
      }
      if (axis === "horizontal") {
        direction = velocity.x > 0 ? "left" : "right";
      } else {
        direction = velocity.y > 0 ? "up" : "down";
      }
    }
    star.z = starMinScale + Math.random() * (1 - starMinScale);
    switch (direction) {
      case "z":
        star.x = Math.random() * windowSize.width;
        star.y = Math.random() * windowSize.height;
        star.z = 0.1;
        break;
      case "left":
        star.x = -overFlowThreshold;
        star.y = Math.random() * windowSize.height;
        break;
      case "right":
        star.x = overFlowThreshold + windowSize.width;
        star.y = Math.random() * windowSize.height;
        break;
      case "up":
        star.x = Math.random() * windowSize.width;
        star.y = -overFlowThreshold;
        break;
      case "down":
        star.x = Math.random() * windowSize.width;
        star.y = overFlowThreshold + windowSize.height;
        break;
      default:
        break;
    }
  };

  const resize = () => {
    const scale = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    windowSize.width = window.innerWidth * scale;
    windowSize.height = window.innerHeight * scale;
    setScale(scale);
    setWindowSize(windowSize);
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;
    stars.forEach(placeStars);
    setStars(stars);
  };

  const updatedStar = () => {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;
    velocity.x += (velocity.tx - velocity.x) * 0.8;
    velocity.y += (velocity.ty - velocity.y) * 0.8;
    stars.forEach((star) => {
      star.x += velocity.x * star.z;
      star.y += velocity.y * star.z;
      star.x += (star.x - windowSize.width / 2) * velocity.z * star.z;
      star.y += (star.y - windowSize.height / 2) * velocity.z * star.z;
      star.z += velocity.z;
      if (
        star.x > windowSize.width + overFlowThreshold ||
        star.x < -overFlowThreshold ||
        star.y > windowSize.height + overFlowThreshold ||
        star.y < -overFlowThreshold
      ) {
        recycleStar(star);
      }
    });
    setStars(stars);
    setVelocity(velocity);
  };

  const renderStars = () => {
    stars.forEach((star) => {
      if (!context) return;
      context.beginPath();
      context.lineCap = "round";
      context.lineWidth = starSize * star.z * scale;
      context.globalAlpha = 0.5 + 0.5 * Math.random();
      context.strokeStyle = starColor;
      context.beginPath();
      context.moveTo(star.x, star.y);
      let tileX = velocity.x * 2;
      let tileY = velocity.y * 2;
      if (Math.abs(tileX) < 0.1) tileX = 0.5;
      if (Math.abs(tileY) < 0.1) tileY = 0.5;
      context.lineTo(star.x + tileX, star.y + tileY);
      context.stroke();
    });
  };

  const movePointer = (x: number, y: number) => {
    if (pointer.x && pointer.y) {
      let ox = x - pointer.x;
      let oy = y - pointer.y;
      velocity.tx = velocity.tx + (ox / 8) * scale * (touchInput ? 1 : -1);
      velocity.ty = velocity.ty + (oy / 8) * scale * (touchInput ? 1 : -1);
      setVelocity(velocity);
    }
    pointer.x = x;
    pointer.y = y;
    setPointer(pointer);
  };

  const onMouseMove = (e: MouseEvent) => {
    touchInput = false;
    setTouchInput(touchInput);
    movePointer(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    touchInput = true;
    setTouchInput(touchInput);
    movePointer(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  };

  const onMouseLeave = (e: MouseEvent) => {
    pointer.x = null;
    pointer.y = null;
    setPointer(pointer);
  };

  const step = () => {
    if (!context) return;
    context.clearRect(0, 0, windowSize.width, windowSize.height);
    updatedStar();
    renderStars();
    animationFrame = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    context = canvas.getContext("2d");
    setContext(context);
    generateStars();
    resize();
    step();

    window.onresize = resize;
    canvas.onmousemove = onMouseMove;
    canvas.ontouchend = onTouchMove;
    canvas.onmouseleave = onMouseLeave;
    document.onmouseleave = onMouseLeave;

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchend", onTouchMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (typeof animationFrame === "number")
        cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} style={style} />;
};

export default MovingStarrySky;
