import { TAU } from '@/config';

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function normalizeVector(x: number, y: number): { x: number; y: number } {
  const len = Math.sqrt(x * x + y * y);
  if (len < 0.001) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomAngle(): number {
  return Math.random() * TAU;
}

export function hslString(h: number, s: number, l: number): string {
  return `hsl(${h},${s}%,${l}%)`;
}

export function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
