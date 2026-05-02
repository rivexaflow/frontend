"use client";

import { useEffect, useRef } from "react";

type ShimmerBackgroundProps = {
  className?: string;
  shapeType?: "circle" | "square";
  size?: number;
  gap?: number;
  colors?: string[];
  contrast?: number;
  speed?: number;
  radius?: number;
  overlayOpacity?: number;
  resolutionScale?: number;
  animate?: boolean;
};

class PerlinNoise {
  private p = new Array<number>(512);

  constructor() {
    this.init();
  }

  private init() {
    for (let i = 0; i < 256; i += 1) {
      this.p[i] = this.p[i + 256] = Math.floor(Math.random() * 256);
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private noise(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const nx = x - Math.floor(x);
    const ny = y - Math.floor(y);
    const u = this.fade(nx);
    const v = this.fade(ny);
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], nx, ny), this.grad(this.p[B], nx - 1, ny)),
      this.lerp(u, this.grad(this.p[A + 1], nx, ny - 1), this.grad(this.p[B + 1], nx - 1, ny - 1))
    );
  }

  private generatePerlinNoise(width: number, height: number, cellSize: number) {
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const noiseCtx = noiseCanvas.getContext("2d");
    if (!noiseCtx) return noiseCanvas;

    const imageData = noiseCtx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const value = ((this.noise(x / cellSize, y / cellSize) + 1) / 2) * 255;
        const cell = (x + y * width) * 4;
        data[cell] = value;
        data[cell + 1] = value;
        data[cell + 2] = value;
        data[cell + 3] = 255;
      }
    }

    noiseCtx.putImageData(imageData, 0, 0);
    return noiseCanvas;
  }

  createSeamlessPerlinNoise(width: number, height: number, cellSize: number) {
    const singleNoise = this.generatePerlinNoise(width, height, cellSize);
    const seamlessCanvas = document.createElement("canvas");
    seamlessCanvas.width = width * 4;
    seamlessCanvas.height = height;
    const seamlessCtx = seamlessCanvas.getContext("2d");
    if (!seamlessCtx) return "";

    seamlessCtx.drawImage(singleNoise, 0, 0);

    seamlessCtx.save();
    seamlessCtx.translate(width * 2, 0);
    seamlessCtx.scale(-1, 1);
    seamlessCtx.drawImage(singleNoise, 0, 0);
    seamlessCtx.restore();

    seamlessCtx.drawImage(singleNoise, width * 2, 0);

    seamlessCtx.save();
    seamlessCtx.translate(width * 4, 0);
    seamlessCtx.scale(-1, 1);
    seamlessCtx.drawImage(singleNoise, 0, 0);
    seamlessCtx.restore();

    return seamlessCanvas.toDataURL();
  }
}

export function ShimmerBackground({
  className,
  shapeType = "circle",
  size = 5,
  gap = 8,
  colors = ["rgb(255,255,255)"],
  contrast = 2,
  speed = 32,
  radius = 0,
  overlayOpacity = 0.75,
  resolutionScale = 0.55,
  animate = true,
}: ShimmerBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const perlin = new PerlinNoise();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = animate && !prefersReducedMotion;
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-shimmer-mask-style", "true");
    document.head.appendChild(styleTag);

    const getRandomOpacity = () => {
      let opacity = Math.random();
      if (contrast > 0) opacity = Math.pow(opacity, 1 + contrast / 5);
      else if (contrast < 0) opacity = 1 - Math.pow(1 - opacity, 1 - contrast / 5);
      return opacity;
    };

    const drawShapes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const palette = colors.length > 0 ? colors : ["rgb(128,128,128)"];

      for (let y = 0; y < canvas.height; y += size + gap) {
        for (let x = 0; x < canvas.width; x += size + gap) {
          const color = palette[Math.floor(Math.random() * palette.length)];
          const rgba = color.replace(")", `,${getRandomOpacity()})`).replace("rgb", "rgba");
          ctx.fillStyle = rgba;

          if (shapeType === "square") {
            ctx.fillRect(x, y, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const updateMask = () => {
      const width = Math.max(1, canvas.width);
      const height = Math.max(1, canvas.height);
      const cellSize = Math.max(25, size * 2);
      const dataUrl = perlin.createSeamlessPerlinNoise(width, height, cellSize);

      const sizeFactor = Math.max(1, size / 3);
      const baseValue = width * 2250 * sizeFactor;
      const maxSpeed = 100;
      const powerFactor = Math.log(baseValue / (baseValue / 100)) / Math.log(maxSpeed);
      const animationDuration = Math.round(baseValue / Math.pow(Math.max(1, speed), powerFactor));
      const maskTravelDistance = 300 * (size / 10);

      styleTag.textContent = `
        @keyframes moveMask {
          0% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; }
          100% { mask-position: -${maskTravelDistance}% 0%; -webkit-mask-position: -${maskTravelDistance}% 0%; }
        }
      `;

      if (shouldAnimate) {
        canvas.style.maskImage = `url(${dataUrl})`;
        canvas.style.webkitMaskImage = `url(${dataUrl})`;
        canvas.style.maskMode = "luminance";
        canvas.style.maskSize = `${300 * sizeFactor}% 100%`;
        canvas.style.webkitMaskSize = `${300 * sizeFactor}% 100%`;
        canvas.style.maskRepeat = "repeat-x";
        canvas.style.webkitMaskRepeat = "repeat-x";
        canvas.style.animation = `moveMask ${animationDuration}ms linear infinite`;
      } else {
        canvas.style.animation = "none";
        canvas.style.maskImage = "none";
        canvas.style.webkitMaskImage = "none";
      }
      wrapper.style.borderRadius = `${radius}px`;
    };

    const resize = () => {
      const scale = Math.min(1, Math.max(0.35, resolutionScale));
      canvas.width = Math.max(1, Math.floor(wrapper.offsetWidth * scale));
      canvas.height = Math.max(1, Math.floor(wrapper.offsetHeight * scale));
      drawShapes();
      updateMask();
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      styleTag.remove();
    };
  }, [animate, colors, contrast, gap, radius, resolutionScale, shapeType, size, speed]);

  return (
    <div
      ref={wrapperRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full [image-rendering:auto]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(19,19,19,var(--a)) 15%, rgba(19,19,19,calc(var(--a) * 0.5)) 30%, rgba(19,19,19,0) 70%)",
          ["--a" as string]: overlayOpacity,
        }}
      />
    </div>
  );
}

