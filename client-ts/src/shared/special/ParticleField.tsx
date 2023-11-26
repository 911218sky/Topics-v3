import React, { useEffect, useRef, memo } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  glowColor: string;
}

interface ParticleFieldProps {
  MaxparticleQuantity?: number;
  color?: string;
  speed?: number;
}

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : null;
};

const ParticleField: React.FC<ParticleFieldProps> = ({
  MaxparticleQuantity = 100,
  color = "#ffffff",
  speed = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let particles: Particle[] = [];
  let lastParticleCreateTime = 0;

  const createParticle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3 + 1;
    const speedX = (Math.random() * 3 - 1.5) * speed;
    const speedY = (Math.random() * 3 - 1.5) * speed;
    const glowColor = `rgba(${hexToRgb(color)}, ${Math.random()})`; // Calculate glow color with opacity
    particles.push({ x, y, size, speedX, speedY, glowColor });
  };

  useEffect(() => {
    const clearParticles = () => {
      particles = [];
    };
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    animateParticles();
    return () => {
      window.removeEventListener("resize", handleResize);
      clearParticles();
    };
  }, []);

  const animateParticles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      ctx.shadowColor = particle.glowColor;
      ctx.shadowBlur = 10;

      ctx.fillStyle = particle.glowColor;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      if (
        particle.x < 0 ||
        particle.x > canvas.width ||
        particle.y < 0 ||
        particle.y > canvas.height
      ) {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
      }
    });

    const currentTime = performance.now();
    const createParticleInterval = 1000;

    if (currentTime - lastParticleCreateTime > createParticleInterval) {
      if (particles.length < MaxparticleQuantity) {
        createParticle();
      }
      lastParticleCreateTime = currentTime;
    }
    requestAnimationFrame(animateParticles);
  };

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
  );
};

export default memo(ParticleField);
