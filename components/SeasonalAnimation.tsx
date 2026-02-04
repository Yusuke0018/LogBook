'use client';

import { useEffect, useRef, useCallback } from 'react';

// 24節気ごとのアニメーション設定（季節に合った表現）
const SEKKI_ANIMATIONS: Record<string, { types: string[]; count: number; colors: string[] }> = {
  // === 冬（11月〜2月初旬）===
  // 立冬（11月7日頃）: 冬の始まり、枯葉が舞う
  '立冬': { types: ['leaf', 'sparkle'], count: 28, colors: ['#A0522D', '#8B4513', '#D2691E', '#CD853F'] },
  // 小雪（11月22日頃）: 初雪、わずかな雪
  '小雪': { types: ['snow', 'sparkle'], count: 24, colors: ['#FFFFFF', '#F5F5F5', '#E8E8E8'] },
  // 大雪（12月7日頃）: 本格的な雪
  '大雪': { types: ['snow'], count: 48, colors: ['#FFFFFF', '#FFFAFA', '#F0FFFF'] },
  // 冬至（12月22日頃）: 最も昼が短い、ゆず湯の金色
  '冬至': { types: ['sparkle', 'snow'], count: 40, colors: ['#FFD700', '#FFA500', '#FFFAF0', '#FFFFFF'] },
  // 小寒（1月5日頃）: 寒の入り、凍てつく寒さ
  '小寒': { types: ['snow', 'frost'], count: 36, colors: ['#FFFFFF', '#E0FFFF', '#F0F8FF', '#B0E0E6'] },
  // 大寒（1月20日頃）: 最も寒い時期、厳しい冬
  '大寒': { types: ['snow', 'frost'], count: 52, colors: ['#FFFFFF', '#DDEEFF', '#C6E2FF', '#B0C4DE'] },

  // === 早春（2月）===
  // 立春（2月4日頃）: 暦の上で春、まだ寒い、梅がほころぶ
  '立春': { types: ['plum', 'sparkle', 'frost'], count: 28, colors: ['#FFFFFF', '#FFF5EE', '#FFE4E1', '#E8E8E8'] },
  // 雨水（2月19日頃）: 雪が雨に変わる、雪解け
  '雨水': { types: ['raindrop', 'plum'], count: 36, colors: ['#ADD8E6', '#B0E0E6', '#FFFFFF', '#FFE4E1'] },

  // === 仲春（3月）===
  // 啓蟄（3月5日頃）: 虫が出てくる、芽吹き始める
  '啓蟄': { types: ['sprout', 'sparkle'], count: 26, colors: ['#90EE90', '#98FB98', '#7CFC00', '#F0FFF0'] },
  // 春分（3月20日頃）: 昼夜等分、桜が咲き始める
  '春分': { types: ['petal', 'sparkle'], count: 38, colors: ['#FFC0CB', '#FFB6C1', '#FFDAB9', '#FFF0F5'] },

  // === 晩春（4月）===
  // 清明（4月5日頃）: 花見の季節、桜満開
  '清明': { types: ['petal', 'sparkle'], count: 50, colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FFFFFF'] },
  // 穀雨（4月20日頃）: 春雨、新緑が芽吹く
  '穀雨': { types: ['raindrop', 'leaf'], count: 44, colors: ['#87CEEB', '#ADD8E6', '#90EE90', '#98FB98'] },

  // === 初夏（5月）===
  // 立夏（5月5日頃）: 夏の始まり、新緑が美しい
  '立夏': { types: ['leaf', 'sparkle'], count: 34, colors: ['#32CD32', '#00FF00', '#7FFF00', '#ADFF2F'] },
  // 小満（5月21日頃）: 万物が成長、麦が実る
  '小満': { types: ['seed', 'sparkle'], count: 36, colors: ['#F5DEB3', '#DEB887', '#FFD700', '#FFFACD'] },

  // === 梅雨〜盛夏（6月〜7月）===
  // 芒種（6月6日頃）: 梅雨入り、田植えの時期
  '芒種': { types: ['raindrop', 'leaf'], count: 48, colors: ['#87CEEB', '#ADD8E6', '#556B2F', '#6B8E23'] },
  // 夏至（6月21日頃）: 最も昼が長い、強い日差し
  '夏至': { types: ['sparkle', 'firefly'], count: 50, colors: ['#FFD700', '#FFA500', '#FFFF00', '#FF8C00'] },
  // 小暑（7月7日頃）: 梅雨明け、蝉が鳴き始める
  '小暑': { types: ['firefly', 'sparkle'], count: 42, colors: ['#87CEEB', '#00BFFF', '#FFD700', '#FFFF00'] },
  // 大暑（7月23日頃）: 最も暑い時期、入道雲
  '大暑': { types: ['sparkle', 'firefly'], count: 56, colors: ['#FF6347', '#FF4500', '#FFD700', '#FFA500'] },

  // === 初秋（8月〜9月）===
  // 立秋（8月7日頃）: 暦の上で秋、まだ暑い、夕立
  '立秋': { types: ['sparkle', 'firefly'], count: 32, colors: ['#FFD700', '#FFA500', '#CD853F', '#D2B48C'] },
  // 処暑（8月23日頃）: 暑さが和らぐ、稲穂が垂れ始める
  '処暑': { types: ['seed', 'sparkle'], count: 36, colors: ['#DAA520', '#B8860B', '#CD853F', '#DEB887'] },
  // 白露（9月7日頃）: 朝露、涼しくなる
  '白露': { types: ['bubble', 'sparkle'], count: 28, colors: ['#F0F8FF', '#F8F8FF', '#FFFFFF', '#E0FFFF'] },
  // 秋分（9月23日頃）: 昼夜等分、彼岸花
  '秋分': { types: ['leaf', 'sparkle'], count: 38, colors: ['#DC143C', '#FF4500', '#FFD700', '#B22222'] },

  // === 晩秋（10月〜11月）===
  // 寒露（10月8日頃）: 露が冷たい、紅葉が美しい
  '寒露': { types: ['leaf', 'sparkle'], count: 40, colors: ['#FF6347', '#FF4500', '#DC143C', '#FFD700'] },
  // 霜降（10月23日頃）: 霜が降り始める、落ち葉
  '霜降': { types: ['leaf', 'frost'], count: 34, colors: ['#A0522D', '#8B4513', '#E6E6FA', '#D8BFD8'] },
};

const TYPE_SIZE: Record<string, { min: number; max: number }> = {
  snow: { min: 1.8, max: 3.6 },
  petal: { min: 4, max: 10 },      // 桜の花びら
  plum: { min: 3, max: 7 },        // 梅の花（5弁、小ぶり）
  leaf: { min: 4, max: 10 },
  sprout: { min: 3, max: 6 },      // 新芽
  sparkle: { min: 1.5, max: 3.5 },
  raindrop: { min: 3, max: 5 },
  firefly: { min: 1.5, max: 3.2 },
  bubble: { min: 3, max: 7 },
  seed: { min: 3, max: 6 },
  frost: { min: 2, max: 4 },       // 霜・氷の結晶
};

const TYPE_SPEED: Record<string, { min: number; max: number }> = {
  snow: { min: 0.3, max: 0.8 },
  petal: { min: 0.5, max: 1.2 },      // 桜の花びら（ひらひら）
  plum: { min: 0.3, max: 0.7 },       // 梅の花（ゆっくり落ちる）
  leaf: { min: 0.6, max: 1.4 },
  sprout: { min: 0.1, max: 0.3 },     // 新芽（ゆっくり漂う）
  sparkle: { min: 0.2, max: 0.6 },
  raindrop: { min: 1.6, max: 3.0 },
  firefly: { min: 0.05, max: 0.15 },
  bubble: { min: 0.15, max: 0.35 },
  seed: { min: 0.4, max: 0.9 },
  frost: { min: 0.15, max: 0.4 },     // 霜（ゆっくりきらめく）
};

interface Particle {
  layer: { depth: number; opacity: number };
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  color: string;
  type: string;
  mode: string;
}

function pickModeForType(t: string): string {
  switch (t) {
    case 'petal':
    case 'leaf':
    case 'seed':
      return Math.random() < 0.5 ? 'swirl' : 'fall';
    case 'plum':
      return Math.random() < 0.3 ? 'swirl' : 'fall';  // 梅はゆっくり落ちる
    case 'sprout':
      return 'wander';  // 新芽は漂う
    case 'bubble':
      return 'rise';
    case 'firefly':
      return 'wander';
    case 'frost':
      return Math.random() < 0.5 ? 'wander' : 'fall';  // 霜はきらめきながら漂う
    default:
      return 'fall';
  }
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function hexToRgba(hex: string, a: number): string {
  if (hex.startsWith('rgb')) return hex;
  const c = hex.replace('#', '');
  const bigint = parseInt(c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

interface SeasonalAnimationProps {
  sekkiName: string;
}

export default function SeasonalAnimation({ sekkiName }: SeasonalAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const windRef = useRef(0);
  const transitionAlphaRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const colorsRef = useRef<string[]>(['#fff']);
  const sizeMultiplierRef = useRef(1);

  const makeParticle = useCallback((
    layer: { depth: number; opacity: number },
    types: string[],
    colors: string[],
    w: number,
    h: number
  ): Particle => {
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const typeSize = TYPE_SIZE[chosenType] || TYPE_SIZE.snow;
    const typeSpeed = TYPE_SPEED[chosenType] || TYPE_SPEED.snow;
    const size = rand(typeSize.min, typeSize.max) * layer.depth * sizeMultiplierRef.current;
    const speed = rand(typeSpeed.min, typeSpeed.max) * layer.depth;
    const angle = Math.random() * Math.PI * 2;
    return {
      layer,
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * 0.1,
      vy: speed,
      size,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-0.02, 0.02) * layer.depth,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: chosenType,
      mode: pickModeForType(chosenType),
    };
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle, now: number) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const color = p.color;

    switch (p.type) {
      case 'snow': {
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'petal': {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'leaf': {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.2, 0, p.size);
        ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.2, 0, -p.size);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'sparkle': {
        const blink = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(now / 300 + p.x * 0.02));
        ctx.globalAlpha *= blink;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.4);
        grd.addColorStop(0, hexToRgba(color, 0.35));
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillRect(-p.size * 0.05, -p.size, p.size * 0.1, p.size * 2);
        ctx.fillRect(-p.size, -p.size * 0.05, p.size * 2, p.size * 0.1);
        break;
      }
      case 'raindrop': {
        ctx.strokeStyle = hexToRgba(color, 0.8);
        ctx.lineWidth = Math.max(1, p.size * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.6);
        ctx.lineTo(0, p.size * 1.6);
        ctx.stroke();
        break;
      }
      case 'firefly': {
        const blink = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now / 500 + p.y * 0.03));
        ctx.globalAlpha *= blink;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        grd.addColorStop(0, hexToRgba(color, 0.6));
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1, p.size * 0.4), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bubble': {
        ctx.strokeStyle = hexToRgba(color, 0.5);
        ctx.lineWidth = Math.max(1, p.size * 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'seed': {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, p.size * 0.2, p.size * 0.25, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hexToRgba(color, 0.7);
        ctx.lineWidth = Math.max(1, p.size * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.8);
        ctx.lineTo(0, p.size * 0.2);
        ctx.stroke();
        break;
      }
      case 'plum': {
        // 梅の花（5弁の小ぶりな花）
        ctx.fillStyle = color;
        const petalCount = 5;
        const petalSize = p.size * 0.45;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * petalSize;
          const py = Math.sin(angle) * petalSize;
          ctx.beginPath();
          ctx.ellipse(px, py, petalSize * 0.5, petalSize * 0.7, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        // 花芯（黄色）
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sprout': {
        // 新芽（小さな双葉）
        ctx.fillStyle = color;
        // 茎
        ctx.beginPath();
        ctx.moveTo(0, p.size * 0.5);
        ctx.lineTo(0, -p.size * 0.2);
        ctx.lineWidth = Math.max(1, p.size * 0.1);
        ctx.strokeStyle = hexToRgba(color, 0.8);
        ctx.stroke();
        // 左の葉
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.25, -p.size * 0.3, p.size * 0.2, p.size * 0.35, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        // 右の葉
        ctx.beginPath();
        ctx.ellipse(p.size * 0.25, -p.size * 0.3, p.size * 0.2, p.size * 0.35, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'frost': {
        // 霜・氷の結晶（六角形のきらめき）
        const blink = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(now / 400 + p.x * 0.02 + p.y * 0.01));
        ctx.globalAlpha *= blink;
        ctx.strokeStyle = hexToRgba(color, 0.7);
        ctx.lineWidth = Math.max(0.5, p.size * 0.08);
        // 6本の枝
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const length = p.size * 0.9;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
          ctx.stroke();
          // 小さな枝
          const branchLen = length * 0.35;
          const branchPos = length * 0.6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * branchPos, Math.sin(angle) * branchPos);
          ctx.lineTo(
            Math.cos(angle) * branchPos + Math.cos(angle + Math.PI / 4) * branchLen,
            Math.sin(angle) * branchPos + Math.sin(angle + Math.PI / 4) * branchLen
          );
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * branchPos, Math.sin(angle) * branchPos);
          ctx.lineTo(
            Math.cos(angle) * branchPos + Math.cos(angle - Math.PI / 4) * branchLen,
            Math.sin(angle) * branchPos + Math.sin(angle - Math.PI / 4) * branchLen
          );
          ctx.stroke();
        }
        break;
      }
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = SEKKI_ANIMATIONS[sekkiName];
    if (!config) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth <= 768;
    const baseCount = isMobile ? Math.min(Math.floor(config.count * 1.2), 90) : config.count;
    sizeMultiplierRef.current = isMobile ? 1.25 : 1.0;
    colorsRef.current = config.colors;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const layers = [
      { depth: 0.5, opacity: 0.5, count: Math.floor(baseCount * 0.4) },
      { depth: 1.0, opacity: 0.8, count: Math.floor(baseCount * 0.45) },
      { depth: 1.6, opacity: 1.0, count: Math.floor(baseCount * 0.3) },
    ];

    const particles: Particle[] = [];
    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        particles.push(makeParticle(layer, config.types, config.colors, w, h));
      }
    });
    particlesRef.current = particles;
    transitionAlphaRef.current = 0;
    lastTimeRef.current = performance.now();

    // 風のゆらぎ
    const windInterval = setInterval(() => {
      const target = (Math.random() - 0.5) * 3;
      const start = windRef.current;
      const duration = 3000 + Math.random() * 3000;
      const startTime = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - startTime) / duration);
        const eased = t * (2 - t);
        windRef.current = start + (target - start) * eased;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 5000 + Math.random() * 5000);

    const loop = (now: number) => {
      const dt = Math.min(50, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      if (transitionAlphaRef.current < 1) {
        transitionAlphaRef.current = Math.min(1, transitionAlphaRef.current + dt / 800);
      }

      for (const p of particlesRef.current) {
        const t = now / 1000;
        const sway = Math.sin(t + p.y * 0.01 + p.x * 0.005) * 0.4;

        switch (p.mode) {
          case 'swirl': {
            p.vx = Math.cos(t + p.y * 0.005) * 0.3 + windRef.current * 0.002;
            p.vy = Math.sin(t * 0.7) * 0.2 + Math.abs(p.vy) * 0.6;
            p.x += p.vx * p.layer.depth;
            p.y += (p.vy + 0.2) * (dt / 16) * 0.8;
            p.rot += p.rotSpeed * (dt / 16) + 0.01;
            break;
          }
          case 'wander': {
            const turn = Math.sin(t * 0.8 + p.x * 0.01) * 0.02;
            p.vx += windRef.current * 0.001 + turn;
            p.vy += Math.cos(t * 1.1 + p.y * 0.01) * 0.01;
            p.x += p.vx * 0.8;
            p.y += p.vy * 0.8;
            p.rot += p.rotSpeed * 0.5;
            break;
          }
          case 'rise': {
            p.vx += windRef.current * 0.001 + Math.sin(t + p.x * 0.01) * 0.002;
            p.x += p.vx * p.layer.depth;
            p.y -= Math.abs(p.vy) * 0.5;
            p.rot += p.rotSpeed * 0.3;
            break;
          }
          default: {
            p.vx += windRef.current * 0.002 + sway * 0.002;
            p.x += p.vx * p.layer.depth;
            p.y += p.vy * (dt / 16) * 0.6;
            p.rot += p.rotSpeed * (dt / 16);
          }
        }

        if (p.y - p.size > h) {
          p.y = -p.size;
          p.x = Math.random() * w;
          p.vx = (Math.random() - 0.5) * 0.2;
        }
        if (p.y + p.size < 0 && p.mode === 'rise') {
          p.y = h + p.size;
          p.x = Math.random() * w;
        }
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;

        ctx.globalAlpha = transitionAlphaRef.current * p.layer.opacity;
        drawParticle(ctx, p, now);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(windInterval);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sekkiName, makeParticle, drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}
