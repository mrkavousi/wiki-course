// Procedural ornaments: geometric, so they stay crisp at any size. Nothing here is a stock picture.
import type { Ctx } from './types';

type Pt = [number, number];

/** A regular star with `n` points (inner radius ratio `k`), centred on cx, cy. */
export function starPath(c: Ctx, cx: number, cy: number, r: number, n = 8, k = 0.62, rot = 0) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 ? r * k : r;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
}

export function lozenge(c: Ctx, cx: number, cy: number, w: number, h: number) {
  c.beginPath();
  c.moveTo(cx, cy - h / 2);
  c.lineTo(cx + w / 2, cy);
  c.lineTo(cx, cy + h / 2);
  c.lineTo(cx - w / 2, cy);
  c.closePath();
}

/** One corner of a Persian-style frame: an eight-pointed star over interlaced arcs, with small lozenges along both edges. Drawn for the top-left corner; mirror it with the sign arguments. */
export function cornerOrnament(c: Ctx, x: number, y: number, size: number, sx: 1 | -1, sy: 1 | -1, line: string, fill: string, u = 1) {
  c.save();
  c.translate(x, y);
  c.scale(sx, sy);
  c.lineWidth = 2.5 * u;
  c.strokeStyle = line;
  c.fillStyle = fill;
  // arcs that meet in the corner
  c.beginPath();
  c.arc(0, 0, size, 0, Math.PI / 2);
  c.stroke();
  c.beginPath();
  c.arc(0, 0, size * 0.72, 0, Math.PI / 2);
  c.stroke();
  // star on the diagonal
  starPath(c, size * 0.42, size * 0.42, size * 0.3, 8, 0.58, Math.PI / 8);
  c.fill();
  starPath(c, size * 0.42, size * 0.42, size * 0.13, 8, 0.58, 0);
  c.fillStyle = line;
  c.fill();
  // lozenges running out along the edges
  c.fillStyle = fill;
  for (let i = 1; i <= 3; i++) {
    const d = size * (1.1 + i * 0.32);
    lozenge(c, d, 0, size * 0.14, size * 0.2);
    c.fill();
    lozenge(c, 0, d, size * 0.2, size * 0.14);
    c.fill();
  }
  c.restore();
}

/** Lattice of eight-pointed stars and connecting lines clipped to a rect: a faint pattern for a band or a background. */
export function lattice(c: Ctx, x: number, y: number, w: number, h: number, cell: number, color: string, lw = 1.5) {
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.strokeStyle = color;
  c.lineWidth = lw;
  for (let j = 0; j * cell <= h + cell; j++) {
    for (let i = 0; i * cell <= w + cell; i++) {
      const cx = x + i * cell + (j % 2 ? cell / 2 : 0);
      const cy = y + j * cell * 0.5;
      starPath(c, cx, cy, cell * 0.42, 8, 0.6, 0);
      c.stroke();
    }
  }
  c.restore();
}

/** A Greek-key (meander) line along x..x+w: the thin "historic line art" band of the dark template. */
export function meander(c: Ctx, x: number, y: number, w: number, unit: number, color: string, lw = 2) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.lineJoin = 'miter';
  c.beginPath();
  const n = Math.floor(w / (unit * 2));
  for (let i = 0; i < n; i++) {
    const X = x + i * unit * 2;
    c.moveTo(X, y + unit);
    c.lineTo(X, y);
    c.lineTo(X + unit, y);
    c.lineTo(X + unit, y + unit * 0.6);
    c.lineTo(X + unit * 0.4, y + unit * 0.6);
    c.lineTo(X + unit * 0.4, y + unit * 0.3);
    c.lineTo(X + unit * 0.7, y + unit * 0.3);
    c.moveTo(X + unit, y + unit);
    c.lineTo(X + unit * 2, y + unit);
  }
  c.stroke();
  c.restore();
}

/** Concentric arches (a doorway / vault), the line-art motif of the dark editorial template. */
export function arches(c: Ctx, cx: number, baseY: number, r: number, count: number, color: string, lw = 2) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = lw;
  for (let i = 0; i < count; i++) {
    const rr = r - (i * r) / (count + 1);
    c.beginPath();
    c.moveTo(cx - rr, baseY);
    c.lineTo(cx - rr, baseY - rr * 0.9);
    c.arc(cx, baseY - rr * 0.9, rr, Math.PI, 0);
    c.lineTo(cx + rr, baseY);
    c.stroke();
  }
  c.restore();
}

/** A geometric leaf sprig: a curved stem with paired leaves; `angle` rotates it, `size` is its length. */
export function sprig(c: Ctx, x: number, y: number, size: number, angle: number, color: string, accent: string) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.strokeStyle = color;
  c.lineWidth = Math.max(2, size * 0.014);
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(size * 0.12, -size * 0.5, 0, -size);
  c.stroke();
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const px = Math.sin(t * Math.PI) * size * 0.1;
    const py = -size * t;
    const l = size * (0.24 - t * 0.12);
    for (const s of [-1, 1]) {
      c.save();
      c.translate(px, py);
      c.rotate(s * 0.9);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(l * 0.5, -l * 0.55, l, 0);
      c.quadraticCurveTo(l * 0.5, l * 0.55, 0, 0);
      c.fillStyle = i % 2 ? color : accent;
      c.globalAlpha *= 0.9;
      c.fill();
      c.restore();
    }
  }
  c.restore();
}

/** Scalloped (arched) edge along the top of a band, a classic border. */
export function scallops(c: Ctx, x: number, y: number, w: number, r: number, color: string) {
  c.save();
  c.fillStyle = color;
  const n = Math.round(w / (r * 2));
  const rr = w / n / 2;
  for (let i = 0; i < n; i++) {
    c.beginPath();
    c.arc(x + rr + i * rr * 2, y, rr, 0, Math.PI);
    c.fill();
  }
  c.restore();
}

export type IconName = 'book' | 'quote' | 'link' | 'tag' | 'clock' | 'spark';
/** Small line icons drawn with the canvas path API, `s` is the box size. */
export function icon(c: Ctx, name: IconName, x: number, y: number, s: number, color: string, lw = s * 0.09) {
  c.save();
  c.translate(x, y);
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const k = s / 24;
  c.scale(k, k);
  c.lineWidth = lw / k;
  c.beginPath();
  if (name === 'book') {
    c.moveTo(12, 6);
    c.bezierCurveTo(9, 3.5, 5, 3.5, 3, 4.5);
    c.lineTo(3, 19);
    c.bezierCurveTo(5, 18, 9, 18, 12, 20.5);
    c.bezierCurveTo(15, 18, 19, 18, 21, 19);
    c.lineTo(21, 4.5);
    c.bezierCurveTo(19, 3.5, 15, 3.5, 12, 6);
    c.moveTo(12, 6);
    c.lineTo(12, 20.5);
    c.stroke();
  } else if (name === 'quote') {
    for (const ox of [0, 10]) {
      c.moveTo(3 + ox, 17);
      c.lineTo(3 + ox, 11);
      c.quadraticCurveTo(3 + ox, 6, 8 + ox, 6);
      c.moveTo(3 + ox, 17);
      c.lineTo(8 + ox, 17);
      c.lineTo(8 + ox, 11);
      c.lineTo(3 + ox, 11);
    }
    c.stroke();
  } else if (name === 'link') {
    c.moveTo(10, 14);
    c.bezierCurveTo(8, 12, 8, 9.5, 10, 7.5);
    c.lineTo(13, 4.5);
    c.bezierCurveTo(15, 2.5, 18, 3, 19.5, 4.5);
    c.bezierCurveTo(21, 6, 21.5, 9, 19.5, 11);
    c.lineTo(17.5, 13);
    c.moveTo(14, 10);
    c.bezierCurveTo(16, 12, 16, 14.5, 14, 16.5);
    c.lineTo(11, 19.5);
    c.bezierCurveTo(9, 21.5, 6, 21, 4.5, 19.5);
    c.bezierCurveTo(3, 18, 2.5, 15, 4.5, 13);
    c.lineTo(6.5, 11);
    c.stroke();
  } else if (name === 'tag') {
    c.moveTo(3, 12);
    c.lineTo(3, 4);
    c.lineTo(11, 4);
    c.lineTo(21, 14);
    c.lineTo(14, 21);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.arc(7.5, 8.5, 1.4, 0, Math.PI * 2);
    c.fill();
  } else if (name === 'clock') {
    c.arc(12, 12, 9, 0, Math.PI * 2);
    c.moveTo(12, 7);
    c.lineTo(12, 12);
    c.lineTo(16, 14);
    c.stroke();
  } else {
    starPath(c, 12, 12, 10, 4, 0.35, 0);
    c.fill();
  }
  c.restore();
}

export type { Pt };
