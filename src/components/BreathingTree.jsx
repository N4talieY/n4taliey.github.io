import { useEffect, useRef } from "react";
import "../styles/BreathingTree.css";

const TAU = Math.PI * 2;
const ROOT = { x: 50, y: 90 };
const MAX_SPROUTS = 44;
const INITIAL_SPROUT_COUNT = 20;
const CANVAS_PADDING_X = 6;
const CANVAS_PADDING_Y = 5;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const TARGET_FRAME_MS = 1000 / 30;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);

const randomFrom = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const buildTree = () => {
  const random = randomFrom(427031);
  const segments = [];

  const grow = (start, angle, length, depth) => {
    const end = {
      x: start.x + Math.cos(angle) * length,
      y: start.y + Math.sin(angle) * length,
    };
    segments.push({ id: segments.length, start, end, depth, phase: random() * TAU });
    if (depth >= 4) return;

    const nextLength = length * (0.73 + random() * 0.07);
    const bend = (random() - 0.5) * 0.13;
    if (depth === 0) {
      grow(end, angle + bend - 0.32, 15.5, depth + 1);
      grow(end, angle + bend + 0.32, 15.1, depth + 1);
      return;
    }

    const spread = 0.35 + depth * 0.035 + random() * 0.09;
    grow(end, clamp(angle + bend - spread, -2.88, -0.26), nextLength, depth + 1);
    grow(end, clamp(angle + bend + spread, -2.88, -0.26), nextLength * (0.91 + random() * 0.1), depth + 1);
  };

  grow(ROOT, -Math.PI / 2 - 0.025, 15.5, 0);
  return segments;
};

const TREE = buildTree();

const animatedPoint = (point, time) => {
  const baseX = ROOT.x + (point.x - ROOT.x) * 1.64;
  const baseY = ROOT.y + (point.y - ROOT.y) * 1.28;
  const breath = Math.sin(time / 900);
  const height = clamp((ROOT.y - baseY) / 84, 0, 1);
  const rawX = ROOT.x + (baseX - ROOT.x) * (1 + breath * 0.045)
    + Math.sin(time / 1250 + point.y * 0.055) * height * 1.35;
  const rawY = ROOT.y + (baseY - ROOT.y) * (1 + breath * 0.016);
  return {
    x: CANVAS_PADDING_X + rawX * (1 - CANVAS_PADDING_X * 2 / 100),
    y: CANVAS_PADDING_Y + rawY * (1 - CANVAS_PADDING_Y * 2 / 100),
  };
};

const currentSegment = (segment, time) => ({
  ...segment,
  start: animatedPoint(segment.start, time),
  end: animatedPoint(segment.end, time),
});

const projectOntoSegment = (point, segment) => {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lengthSquared, 0.08, 0.94);
  const x = segment.start.x + dx * t;
  const y = segment.start.y + dy * t;
  return { segment, t, x, y, distance: Math.hypot(point.x - x, point.y - y) };
};

const findBranch = (point, time) => {
  let nearest = null;
  TREE.forEach((baseSegment) => {
    if (baseSegment.depth === 0) return;
    const hit = projectOntoSegment(point, currentSegment(baseSegment, time));
    if (!nearest || hit.distance < nearest.distance) nearest = hit;
  });
  return nearest && nearest.distance < 7.5 ? nearest : null;
};

const makeInitialSprouts = () => {
  const candidates = [];
  TREE.filter((segment) => segment.depth >= 2).forEach((segment) => {
    const animated = currentSegment(segment, 0);
    [0.34, 0.62, 0.9].forEach((t) => {
      candidates.push({
        segment,
        t,
        x: animated.start.x + (animated.end.x - animated.start.x) * t,
        y: animated.start.y + (animated.end.y - animated.start.y) * t,
      });
    });
  });

  const selected = [];
  while (selected.length < INITIAL_SPROUT_COUNT && candidates.length) {
    let bestIndex = 0;
    let bestDistance = -1;
    candidates.forEach((candidate, index) => {
      const distance = selected.length
        ? Math.min(...selected.map((item) => Math.hypot(candidate.x - item.x, candidate.y - item.y)))
        : Math.hypot(candidate.x - ROOT.x, candidate.y - (ROOT.y - 35));
      if (distance > bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    selected.push(candidates.splice(bestIndex, 1)[0]);
  }

  const random = randomFrom(81357);
  return selected.map((candidate, id) => ({
    id,
    segmentId: candidate.segment.id,
    t: candidate.t,
    length: 3.1 + (id % 3) * 0.45,
    phase: id * 0.83,
    tone: random() > 0.5 ? 1 : 0,
    bornAt: 0,
  }));
};

const BreathingTree = () => {
  const canvasRef = useRef(null);
  const sproutsRef = useRef(makeInitialSprouts());
  const sproutIdRef = useRef(INITIAL_SPROUT_COUNT);
  const hoverRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const redrawRef = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = reducedMotion.matches;
    let frame = null;
    let canvasVisible = true;
    let lastDraw = 0;
    let cachedTheme = null;
    let cachedPalette = null;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
    };

    const paletteForTheme = () => {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      if (theme === cachedTheme && cachedPalette) return cachedPalette;
      cachedTheme = theme;
      cachedPalette = theme === "light"
        ? {
            branch: "rgba(66, 94, 153, .59)",
            branchGlow: "rgba(86, 137, 230, .2)",
            leaves: ["rgba(55, 102, 205, .75)", "rgba(67, 145, 222, .72)"],
            flowers: ["rgba(105, 110, 214, .88)", "rgba(85, 159, 234, .9)"],
            centers: ["rgba(49, 66, 139, .88)", "rgba(30, 85, 170, .88)"],
          }
        : {
            branch: "rgba(174, 198, 240, .5)",
            branchGlow: "rgba(104, 159, 240, .35)",
            leaves: ["rgba(113, 130, 237, .76)", "rgba(96, 175, 250, .78)"],
            flowers: ["rgba(202, 211, 255, .92)", "rgba(176, 226, 253, .92)"],
            centers: ["rgba(140, 145, 238, .94)", "rgba(56, 178, 248, .94)"],
          };
      return cachedPalette;
    };

    const drawBranch = (segment, time, palette) => {
      const dx = segment.end.x - segment.start.x;
      const dy = segment.end.y - segment.start.y;
      const bend = Math.sin(segment.phase) * 0.38;
      context.save();
      context.globalAlpha = 0.82 + Math.sin(time / 900 + segment.phase * 0.16) * 0.16;
      context.beginPath();
      context.moveTo(segment.start.x, segment.start.y);
      context.quadraticCurveTo(
        (segment.start.x + segment.end.x) / 2 - dy * 0.045 * bend,
        (segment.start.y + segment.end.y) / 2 + dx * 0.045 * bend,
        segment.end.x,
        segment.end.y,
      );
      context.lineCap = "round";
      context.strokeStyle = palette.branch;
      context.lineWidth = Math.max(0.17, 1.2 * Math.pow(0.68, segment.depth));
      context.stroke();
      context.restore();
    };

    const drawSprout = (sprout, segment, time, palette) => {
      const leafColor = palette.leaves[sprout.tone];
      const flowerColor = palette.flowers[sprout.tone];
      const centerColor = palette.centers[sprout.tone];
      const progress = sprout.bornAt ? clamp((time - sprout.bornAt) / 1120, 0, 1) : 1;
      const stemProgress = easeOut(clamp(progress / 0.42, 0, 1));
      const leafProgress = easeOut(clamp((progress - 0.2) / 0.52, 0, 1));
      const flowerProgress = easeOut(clamp((progress - 0.58) / 0.42, 0, 1));
      const baseX = segment.start.x + (segment.end.x - segment.start.x) * sprout.t;
      const baseY = segment.start.y + (segment.end.y - segment.start.y) * sprout.t;
      const outward = clamp((baseX - ROOT.x) / 34, -1, 1);
      const angle = -Math.PI / 2 + outward * 0.52 + Math.sin(time / 1500 + sprout.phase) * 0.045;
      const life = 1 + Math.sin(time / 920 + sprout.phase) * 0.055;
      const tipX = baseX + Math.cos(angle) * sprout.length * life * stemProgress;
      const tipY = baseY + Math.sin(angle) * sprout.length * life * stemProgress;

      context.save();
      context.lineCap = "round";
      context.strokeStyle = leafColor;
      context.lineWidth = 0.22;
      context.shadowColor = palette.branchGlow;
      context.shadowBlur = progress < 1 ? 2.5 : 0;
      context.beginPath();
      context.moveTo(baseX, baseY);
      context.quadraticCurveTo(
        baseX + Math.cos(angle + outward * 0.08) * sprout.length * 0.52 * stemProgress,
        baseY + Math.sin(angle + outward * 0.08) * sprout.length * 0.52 * stemProgress,
        tipX,
        tipY,
      );
      context.stroke();

      context.translate(baseX + (tipX - baseX) * 0.58, baseY + (tipY - baseY) * 0.58);
      context.rotate(angle);
      context.fillStyle = leafColor;
      context.globalAlpha = 0.73;
      context.beginPath();
      context.ellipse(-0.45, -0.55, 1.55 * life * leafProgress, 0.58 * life * leafProgress, -0.45, 0, TAU);
      context.ellipse(0.55, 0.68, 1.4 * life * leafProgress, 0.52 * life * leafProgress, 0.45, 0, TAU);
      context.fill();
      context.restore();

      if (!flowerProgress) return;
      context.save();
      context.translate(tipX, tipY);
      context.rotate(sprout.phase + time / 9000);
      context.fillStyle = flowerColor;
      context.shadowColor = palette.branchGlow;
      context.shadowBlur = progress < 1 ? 3 : 0;
      for (let petal = 0; petal < 5; petal += 1) {
        context.rotate(TAU / 5);
        context.beginPath();
        context.ellipse(0, -0.92 * life * flowerProgress, 0.48 * life * flowerProgress, 0.95 * life * flowerProgress, 0, 0, TAU);
        context.fill();
      }
      context.fillStyle = centerColor;
      context.beginPath();
      context.arc(0, 0, 0.42 * flowerProgress, 0, TAU);
      context.fill();
      context.restore();
    };

    const requestDraw = () => {
      if (frame === null && canvasVisible && !document.hidden) {
        frame = requestAnimationFrame(render);
      }
    };

    const stopDrawing = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const render = (time) => {
      frame = null;
      if (!canvasVisible || document.hidden) return;
      if (!reducedMotionRef.current && time - lastDraw < TARGET_FRAME_MS) {
        requestDraw();
        return;
      }
      lastDraw = time;
      const animationTime = reducedMotionRef.current ? 0 : time;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(canvas.width / 100, 0, 0, canvas.height / 100, 0, 0);
      const palette = paletteForTheme();
      const segments = TREE.map((segment) => currentSegment(segment, animationTime));
      segments.forEach((segment) => drawBranch(segment, animationTime, palette));
      context.shadowBlur = 0;
      sproutsRef.current.forEach((sprout) => {
        const segment = segments[sprout.segmentId];
        if (segment) drawSprout(sprout, segment, animationTime, palette);
      });

      if (hoverRef.current) {
        const hit = projectOntoSegment(hoverRef.current, segments[hoverRef.current.segment.id]);
        context.strokeStyle = palette.flowers[0];
        context.globalAlpha = 0.42;
        context.lineWidth = 0.16;
        context.beginPath();
        context.arc(hit.x, hit.y, 1.45 + Math.sin(time / 330) * 0.15, 0, TAU);
        context.stroke();
        context.globalAlpha = 1;
      }
      if (!reducedMotionRef.current) requestDraw();
    };

    redrawRef.current = requestDraw;
    const onPreferenceChange = (event) => {
      reducedMotionRef.current = event.matches;
      lastDraw = 0;
      requestDraw();
    };
    const onVisibilityChange = () => {
      if (document.hidden) stopDrawing();
      else {
        lastDraw = 0;
        requestDraw();
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      lastDraw = 0;
      requestDraw();
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      canvasVisible = entry.isIntersecting;
      if (canvasVisible) {
        lastDraw = 0;
        requestDraw();
      } else {
        stopDrawing();
      }
    }, { rootMargin: "100px" });
    const themeObserver = new MutationObserver(() => {
      cachedTheme = null;
      requestDraw();
    });
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    reducedMotion.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    requestDraw();
    return () => {
      stopDrawing();
      redrawRef.current = () => {};
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      reducedMotion.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const pointerPosition = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 };
  };

  const growAt = (hit) => {
    if (!hit) return;
    const id = sproutIdRef.current;
    const random = randomFrom(id * 313 + 97);
    if (sproutsRef.current.length >= MAX_SPROUTS) sproutsRef.current.shift();
    sproutsRef.current.push({
      id,
      segmentId: hit.segment.id,
      t: hit.t,
      length: 3.1 + (id % 4) * 0.34,
      phase: id * 0.79,
      tone: random() > 0.5 ? 1 : 0,
      bornAt: reducedMotionRef.current ? 0 : performance.now(),
    });
    sproutIdRef.current += 1;
    redrawRef.current();
  };

  return (
    <div className="breathing-tree">
      <canvas
        ref={canvasRef}
        className="breathing-tree__canvas"
        role="button"
        tabIndex="0"
        aria-label="A breathing tree. Select a branch to grow leaves and a flower."
        onPointerMove={(event) => {
          const point = pointerPosition(event);
          const hit = findBranch(point, reducedMotionRef.current ? 0 : performance.now());
          hoverRef.current = hit ? { ...point, segment: hit.segment } : null;
          event.currentTarget.style.cursor = hit ? "pointer" : "default";
          redrawRef.current();
        }}
        onPointerLeave={(event) => {
          hoverRef.current = null;
          event.currentTarget.style.cursor = "default";
          redrawRef.current();
        }}
        onPointerDown={(event) => {
          const time = reducedMotionRef.current ? 0 : performance.now();
          growAt(findBranch(pointerPosition(event), time));
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          growAt({ segment: TREE[1], t: 0.6 });
        }}
      />
    </div>
  );
};

export default BreathingTree;
