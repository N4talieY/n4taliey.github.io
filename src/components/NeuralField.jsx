import { useEffect, useRef } from "react";
import "../styles/NeuralField.css";

const TAU = Math.PI * 2;

const seededRandom = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const makeBloom = (x, y, seed, born = performance.now()) => {
  const random = seededRandom(seed);
  const branches = [];
  const petals = [];
  const color = random() > 0.48 ? [196, 181, 253] : [147, 197, 253];

  const branch = (origin, angle, length, depth, start) => {
    const points = [origin];
    const steps = Math.max(5, Math.round(length / 2.2));
    let last = origin;
    for (let index = 1; index <= steps; index += 1) {
      const bend = (random() - 0.5) * (0.32 + depth * 0.11);
      const step = length / steps;
      angle += bend;
      last = { x: last.x + Math.cos(angle) * step, y: last.y + Math.sin(angle) * step };
      points.push(last);
    }
    const duration = 520 + length * 30;
    branches.push({ points, born: start, duration, width: 0.32 + (2 - depth) * 0.2 });
    if (depth < 2 && length > 8) {
      const forkAt = points[Math.floor(points.length * (0.43 + random() * 0.22))];
      const forkTime = start + duration * (0.38 + random() * 0.12);
      const forks = depth === 0 ? 2 + Math.floor(random() * 2) : 1 + Math.floor(random() * 2);
      for (let index = 0; index < forks; index += 1) {
        branch(forkAt, angle + (random() - 0.5) * 1.7, length * (0.38 + random() * 0.17), depth + 1, forkTime);
      }
    } else if (random() > 0.38) {
      petals.push({ ...last, angle, born: start + duration, size: 1.2 + random() * 1.8 });
    }
  };

  const rootCount = 5 + Math.floor(random() * 4);
  for (let index = 0; index < rootCount; index += 1) {
    branch({ x, y }, (index / rootCount) * TAU + (random() - 0.5) * 0.45, 12 + random() * 16, 0, born + random() * 180);
  }
  return { born, branches, petals, color };
};

const NeuralField = () => {
  const canvasRef = useRef(null);
  const bloomsRef = useRef([]);
  const cursorRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const spores = Array.from({ length: 32 }, (_, index) => ({
      x: ((index * 37) % 101) - 1,
      y: ((index * 61) % 103) - 1,
      phase: index * 0.72,
      size: 0.18 + (index % 4) * 0.08,
    }));
    const now = performance.now();
    bloomsRef.current = [
      makeBloom(31, 42, 291, now - 2800),
      makeBloom(68, 63, 947, now - 1500),
    ];
    let frame;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
    };

    const drawBranch = (bloom, item, age, opacity) => {
      const progress = Math.min(1, Math.max(0, (age - item.born) / item.duration));
      if (!progress) return;
      const total = (item.points.length - 1) * progress;
      const completed = Math.floor(total);
      context.beginPath();
      context.moveTo(item.points[0].x, item.points[0].y);
      for (let index = 1; index <= completed; index += 1) context.lineTo(item.points[index].x, item.points[index].y);
      if (completed < item.points.length - 1) {
        const from = item.points[completed];
        const to = item.points[completed + 1];
        context.lineTo(from.x + (to.x - from.x) * (total - completed), from.y + (to.y - from.y) * (total - completed));
      }
      context.strokeStyle = `rgba(${bloom.color.join(",")}, ${opacity * 0.64})`;
      context.lineWidth = item.width;
      context.shadowColor = `rgba(${bloom.color.join(",")}, ${opacity * 0.85})`;
      context.shadowBlur = 2.2;
      context.stroke();
    };

    const render = (time) => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(canvas.width / 100, 0, 0, canvas.height / 100, 0, 0);
      spores.forEach((spore) => {
        const drift = Math.sin(time / 1900 + spore.phase);
        context.beginPath();
        context.arc(spore.x + drift * 0.6, spore.y + Math.cos(time / 2300 + spore.phase) * 0.45, spore.size, 0, TAU);
        context.fillStyle = "rgba(199, 210, 254, .28)";
        context.fill();
      });
      bloomsRef.current = bloomsRef.current.filter((bloom) => time - bloom.born < 9400);
      bloomsRef.current.forEach((bloom) => {
        const age = time - bloom.born;
        const opacity = age < 6200 ? 1 : Math.max(0, 1 - (age - 6200) / 3200);
        bloom.branches.forEach((item) => drawBranch(bloom, item, time, opacity));
        bloom.petals.forEach((petal) => {
          const opening = Math.min(1, Math.max(0, (time - petal.born) / 600));
          if (!opening) return;
          context.save();
          context.translate(petal.x, petal.y);
          context.rotate(petal.angle);
          context.fillStyle = `rgba(${bloom.color.join(",")}, ${opacity * .68})`;
          context.shadowColor = `rgba(${bloom.color.join(",")}, ${opacity})`;
          context.shadowBlur = 3;
          for (let index = 0; index < 4; index += 1) {
            context.rotate(TAU / 4);
            context.beginPath();
            context.ellipse(petal.size * .48, 0, petal.size * opening, petal.size * .36 * opening, 0, 0, TAU);
            context.fill();
          }
          context.restore();
        });
      });
      if (cursorRef.current) {
        const { x, y } = cursorRef.current;
        context.beginPath();
        context.arc(x, y, 4.5 + Math.sin(time / 420) * .5, 0, TAU);
        context.strokeStyle = "rgba(199, 210, 254, .18)";
        context.lineWidth = .25;
        context.stroke();
      }
      context.shadowBlur = 0;
      frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const pointerPosition = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 };
  };

  return (
    <div className="mycelium-field">
      <canvas
        ref={canvasRef}
        className="mycelium-field__canvas"
        aria-label="Generative mycelium field. Click to grow a luminous bloom."
        role="img"
        onPointerMove={(event) => { cursorRef.current = pointerPosition(event); }}
        onPointerLeave={() => { cursorRef.current = null; }}
        onPointerDown={(event) => {
          const point = pointerPosition(event);
          bloomsRef.current.push(makeBloom(point.x, point.y, Date.now() + Math.round(point.x * 17 + point.y * 31)));
        }}
      />
    </div>
  );
};

export default NeuralField;
