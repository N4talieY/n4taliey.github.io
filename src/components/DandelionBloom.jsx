import { useEffect, useRef } from "react";
import "../styles/DandelionBloom.css";

const TAU = Math.PI * 2;
const CENTER = { x: 50, y: 48 };
const INITIAL_SEED_COUNT = 92;
const MAX_ATTACHED_SEEDS = 142;

const randomFrom = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const makeSeeds = () => {
  const random = randomFrom(2251998);
  return Array.from({ length: INITIAL_SEED_COUNT }, (_, id) => ({
    id,
    angle: random() * TAU,
    radius: 10 + Math.pow(random(), 0.58) * 33,
    size: 0.28 + random() * 0.3,
    phase: random() * TAU,
    rotation: random() * TAU,
    bornAt: 0,
    retiring: false,
    retiredAt: 0,
    x: CENTER.x,
    y: CENTER.y,
    vx: 0,
    vy: 0,
  }));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);

const DandelionBloom = () => {
  const canvasRef = useRef(null);
  const seedsRef = useRef(makeSeeds());
  const pointerRef = useRef(null);
  const seedIdRef = useRef(INITIAL_SEED_COUNT);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = reducedMotion.matches;
    let frame;
    let lastTime = performance.now();

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
    };

    const paletteForTheme = () => {
      const light = document.documentElement.dataset.theme === "light";
      return light
        ? { filament: "rgba(79, 70, 229, .42)", glow: "rgba(99, 102, 241, .56)", core: "rgba(79, 70, 229, .88)" }
        : { filament: "rgba(226, 232, 255, .52)", glow: "rgba(147, 197, 253, .72)", core: "rgba(210, 201, 255, .94)" };
    };

    const anchorFor = (seed, time, growth = 1) => {
      const sway = Math.sin(time / 1900 + seed.phase) * 0.52;
      const radius = 3.5 + (seed.radius - 3.5) * growth;
      return {
        x: CENTER.x + Math.cos(seed.angle + sway * 0.014) * radius,
        y: CENTER.y + Math.sin(seed.angle + sway * 0.014) * radius + sway * growth,
      };
    };

    const drawAttachedSeed = (seed, target, time, palette, growth) => {
      const dx = target.x - CENTER.x;
      const dy = target.y - CENTER.y;
      const direction = Math.atan2(dy, dx);
      const opening = clamp((growth - 0.32) / 0.68, 0, 1);
      context.save();
      context.globalAlpha = 0.23 + growth * 0.42;
      context.lineCap = "round";
      context.strokeStyle = palette.filament;
      context.lineWidth = 0.15 + (1 - growth) * 0.14;
      context.shadowColor = palette.glow;
      context.shadowBlur = growth < 0.75 ? 4 : 1.6;
      context.beginPath();
      context.moveTo(CENTER.x + Math.cos(direction) * 2.5, CENTER.y + Math.sin(direction) * 2.5);
      context.lineTo(target.x, target.y);
      context.stroke();
      context.translate(target.x, target.y);
      context.rotate(direction + seed.rotation + Math.sin(time / 1300 + seed.phase) * 0.07);
      context.strokeStyle = palette.filament;
      context.lineWidth = 0.13;
      for (let branch = -2; branch <= 2; branch += 1) {
        const spread = branch * 0.34 * opening;
        context.beginPath();
        context.moveTo(0, 0);
        context.quadraticCurveTo(-1.1 * opening, spread * 3.7, -3.85 * opening, spread * 5.15);
        context.stroke();
      }
      context.fillStyle = palette.core;
      context.beginPath();
      context.ellipse(0.18, 0, seed.size * opening, seed.size * 0.7 * opening, 0, 0, TAU);
      context.fill();
      context.restore();
    };

    const drawFloatingSeed = (seed, time, palette, opacity) => {
      const direction = Math.atan2(seed.vy, seed.vx) + Math.PI;
      context.save();
      context.globalAlpha = opacity;
      context.translate(seed.x, seed.y);
      context.rotate(direction + seed.rotation + Math.sin(time / 800 + seed.phase) * 0.15);
      context.lineCap = "round";
      context.strokeStyle = palette.filament;
      context.lineWidth = 0.14;
      context.shadowColor = palette.glow;
      context.shadowBlur = 2.6;
      for (let branch = -2; branch <= 2; branch += 1) {
        context.beginPath();
        context.moveTo(0, 0);
        context.quadraticCurveTo(-1.15, branch * 1.28, -3.8, branch * 1.75);
        context.stroke();
      }
      context.fillStyle = palette.core;
      context.beginPath();
      context.ellipse(0.18, 0, seed.size, seed.size * 0.7, 0, 0, TAU);
      context.fill();
      context.restore();
    };

    const render = (time) => {
      const delta = Math.min(32, time - lastTime) / 16.667;
      lastTime = time;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(canvas.width / 100, 0, 0, canvas.height / 100, 0, 0);
      const palette = paletteForTheme();
      seedsRef.current = seedsRef.current.filter((seed) => !seed.retiring || time - seed.retiredAt < 4700);
      seedsRef.current.forEach((seed) => {
        if (seed.retiring) {
          seed.vx *= Math.pow(0.993, delta);
          seed.vy = seed.vy * Math.pow(0.993, delta) - 0.004 * delta;
          seed.x += seed.vx * delta;
          seed.y += seed.vy * delta;
          drawFloatingSeed(seed, time, palette, Math.max(0, 0.54 * (1 - (time - seed.retiredAt) / 4700)));
          return;
        }
        const progress = seed.bornAt ? clamp((time - seed.bornAt) / 820, 0, 1) : 1;
        const growth = easeOut(progress);
        drawAttachedSeed(seed, anchorFor(seed, time, growth), time, palette, growth);
      });
      const coreRadius = 3.1 + Math.sin(time / 1500) * 0.12;
      const coreGlow = context.createRadialGradient(CENTER.x, CENTER.y, 0, CENTER.x, CENTER.y, 8);
      coreGlow.addColorStop(0, "rgba(196, 181, 253, .26)");
      coreGlow.addColorStop(1, "rgba(99, 102, 241, 0)");
      context.fillStyle = coreGlow;
      context.beginPath();
      context.arc(CENTER.x, CENTER.y, 8, 0, TAU);
      context.fill();
      context.fillStyle = palette.core;
      context.shadowColor = palette.glow;
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(CENTER.x, CENTER.y, coreRadius, 0, TAU);
      context.fill();
      context.shadowBlur = 0;
      if (pointerRef.current) {
        const { x, y } = pointerRef.current;
        context.strokeStyle = palette.filament;
        context.lineWidth = 0.15;
        context.beginPath();
        context.arc(x, y, 2.5 + Math.sin(time / 360) * 0.28, 0, TAU);
        context.stroke();
      }
      frame = requestAnimationFrame(render);
    };

    const onPreferenceChange = (event) => { prefersReducedMotionRef.current = event.matches; };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    reducedMotion.addEventListener("change", onPreferenceChange);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  const pointerPosition = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 };
  };

  const retireOldestSeed = () => {
    const oldest = seedsRef.current.filter((seed) => !seed.retiring).sort((a, b) => a.bornAt - b.bornAt)[0];
    if (!oldest) return;
    const angle = oldest.angle + Math.sin(oldest.phase) * 0.45;
    oldest.retiring = true;
    oldest.retiredAt = performance.now();
    oldest.vx = Math.cos(angle) * (0.19 + (oldest.id % 4) * 0.035);
    oldest.vy = Math.sin(angle) * 0.13 - 0.05;
  };

  const growSeed = (point) => {
    const dx = point.x - CENTER.x;
    const dy = point.y - CENTER.y;
    const distance = Math.hypot(dx, dy);
    const angle = distance > 3 ? Math.atan2(dy, dx) : (seedIdRef.current * 2.399) % TAU;
    const random = randomFrom(seedIdRef.current * 97 + 11);
    if (seedsRef.current.filter((seed) => !seed.retiring).length >= MAX_ATTACHED_SEEDS) retireOldestSeed();
    seedsRef.current.push({
      id: seedIdRef.current,
      angle,
      radius: clamp(Math.max(17, distance + random() * 5), 17, 43),
      size: 0.28 + random() * 0.3,
      phase: random() * TAU,
      rotation: random() * TAU,
      bornAt: prefersReducedMotionRef.current ? 0 : performance.now(),
      retiring: false,
      retiredAt: 0,
      x: CENTER.x,
      y: CENTER.y,
      vx: 0,
      vy: 0,
    });
    seedIdRef.current += 1;
  };

  return (
    <div className="dandelion-bloom">
      <canvas
        ref={canvasRef}
        className="dandelion-bloom__canvas"
        role="button"
        tabIndex="0"
        aria-label="A living fiber dandelion. Click it to grow a new glowing seed."
        onPointerMove={(event) => { pointerRef.current = pointerPosition(event); }}
        onPointerLeave={() => { pointerRef.current = null; }}
        onPointerDown={(event) => { growSeed(pointerPosition(event)); }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          growSeed({ x: CENTER.x, y: CENTER.y });
        }}
      />
    </div>
  );
};

export default DandelionBloom;
