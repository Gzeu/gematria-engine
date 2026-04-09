import React, { useEffect, useRef } from 'react';

interface CipherPoint {
  label: string;
  value: number;
  color: string;
}

interface Props {
  ciphers: CipherPoint[];
  size?: number;
}

export default function RadarChart({ ciphers, size = 260 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ciphers.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const r  = size * 0.38;
    const n  = ciphers.length;
    const max = Math.max(...ciphers.map(c => c.value), 1);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    const gridColor  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)';
    const labelColor = isDark ? '#7c7a91' : '#7a7974';
    const fillColor  = isDark ? 'rgba(167,139,250,.18)' : 'rgba(124,58,237,.12)';
    const strokeColor = isDark ? '#a78bfa' : '#7c3aed';

    ctx.clearRect(0, 0, size, size);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + rr * Math.cos(angle);
        const y = cy + rr * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    ciphers.forEach((c, i) => {
      const pct = c.value / max;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * pct * Math.cos(angle);
      const y = cy + r * pct * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    ciphers.forEach((c, i) => {
      const pct = c.value / max;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * pct * Math.cos(angle);
      const y = cy + r * pct * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.color || strokeColor;
      ctx.fill();
    });

    // Labels
    ctx.font = `700 11px var(--fm, monospace)`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = labelColor;
    ciphers.forEach((c, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = cx + (r + 22) * Math.cos(angle);
      const ly = cy + (r + 22) * Math.sin(angle);
      ctx.fillText(c.label, lx, ly);
    });
  }, [ciphers, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', margin: '0 auto' }}
      aria-label="Radar chart of cipher values"
    />
  );
}
