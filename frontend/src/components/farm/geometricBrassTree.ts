// Geometric Brass procedural tree renderer.
//
// Ported from `.planning/sketches/001-orchard-isometric-trees/index.html`
// (Variant A, locked as the final winner 2026-07-30) into a reusable draw
// function for a SINGLE tree on its own small canvas, rather than the
// sketch's whole-grid canvas. 100% Canvas 2D procedural drawing — no image
// assets — per the "zero image assets" principle the sketch was built on.
//
// Game phases (Dormancy/Awakening/Bloom/Harvest/Decay) map onto the sketch's
// 4 season buckets. Awakening and Bloom both collapse to 'spring' — a
// deliberate simplification (see 09-01-PLAN.md Discuss section), not an
// oversight.

export type TreeSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export function mapPhaseToSeason(phase: string): TreeSeason {
    switch (phase) {
        case 'Dormancy': return 'winter';
        case 'Awakening': return 'spring';
        case 'Bloom': return 'spring';
        case 'Harvest': return 'summer';
        case 'Decay': return 'autumn';
        default: return 'summer';
    }
}

interface SeasonConfig {
    facetScale: number;
    countDelta: number;
    greens: string[];
    glow: string;
    fruit: 'blossom' | 'cherry' | 'none';
}

// Winter reuses autumn's structure (facetScale/countDelta), recolored to a
// snow palette — per the locked decision that winter should NOT be bare
// branches, but a full canopy with snow sitting on it.
const SEASON_CONFIG: Record<TreeSeason, SeasonConfig> = {
    spring: { facetScale: 0.66, countDelta: -1, greens: ['#5fc23a', '#7fd64f', '#4aa82c'], glow: '#eaffd6', fruit: 'blossom' },
    summer: { facetScale: 1.0, countDelta: 0, greens: ['#3d5c2f', '#4a6b38', '#33502a'], glow: '#c8f28a', fruit: 'cherry' },
    autumn: { facetScale: 0.864, countDelta: -1, greens: ['#d9720f', '#e89020', '#a8420f'], glow: '#ffcf6a', fruit: 'none' },
    winter: { facetScale: 0.864, countDelta: -1, greens: ['#ffffff', '#bcd8ec', '#9aa8b4'], glow: '#f4faff', fruit: 'none' },
};

const CANOPY_LIFT = 8;

function mulberry32(seed: number) {
    let s = seed;
    return function () {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function darkenHex(hex: string, factor: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.floor(((n >> 16) & 255) * factor);
    const g = Math.floor(((n >> 8) & 255) * factor);
    const b = Math.floor((n & 255) * factor);
    return `rgb(${r},${g},${b})`;
}

function leafRadialFill(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, baseColor: string, glowColor: string) {
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r * 1.15);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(0.55, baseColor);
    grad.addColorStop(1, darkenHex(baseColor, 0.45));
    return grad;
}

function drawTrunk(ctx: CanvasRenderingContext2D, x: number, groundY: number, height: number, width: number) {
    const grad = ctx.createLinearGradient(x - width / 2, groundY, x + width / 2, groundY - height);
    grad.addColorStop(0, '#2e1a0a');
    grad.addColorStop(0.5, '#8a5a30');
    grad.addColorStop(1, '#2e1a0a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, groundY);
    ctx.lineTo(x - width / 3, groundY - height);
    ctx.lineTo(x + width / 3, groundY - height);
    ctx.lineTo(x + width / 2, groundY);
    ctx.closePath();
    ctx.fill();
}

function drawGearIcon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.translate(x, y);
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(0.55, '#c9922e');
    grad.addColorStop(1, '#7a5a12');
    ctx.fillStyle = grad;
    const teeth = 8;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const ang = (Math.PI * i) / teeth;
        const rad = i % 2 === 0 ? r : r * 0.68;
        ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawCherry(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r * 1.1);
    grad.addColorStop(0, '#ff6b81');
    grad.addColorStop(0.5, '#c41e3a');
    grad.addColorStop(1, '#6e0f1f');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill();
}

function drawBlossom(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#ffe4ec';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff9fc4';
    ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
}

export interface DrawGeometricBrassTreeOptions {
    /** Canvas 2D context to draw into. */
    ctx: CanvasRenderingContext2D;
    /** Horizontal center of the tree within the canvas. */
    x: number;
    /** Y coordinate of the ground/base of the trunk within the canvas. */
    groundY: number;
    /** Deterministic per-tree seed (reuse the existing `seed` prop). */
    seed: number;
    /** Game phase string, e.g. "Harvest", "Dormancy". */
    phase: string;
    /** Whether this parcel was already harvested this season (hides cherries). */
    isHarvested?: boolean;
}

/** Draws one full Geometric Brass tree (trunk + gear rivet + canopy + fruit) onto the given canvas context. */
export function drawGeometricBrassTree({ ctx, x, groundY, seed, phase, isHarvested }: DrawGeometricBrassTreeOptions) {
    const season = mapPhaseToSeason(phase);
    const cfg = SEASON_CONFIG[season];
    const rng = mulberry32(seed);

    const trunkH = 34 + rng() * 6;
    drawTrunk(ctx, x, groundY, trunkH, 10);
    drawGearIcon(ctx, x, groundY - trunkH * 0.4, 4);

    const canopyY = groundY - trunkH - 6;
    const baseR = 34 + rng() * 10;

    const facets = Math.max(2, 5 + cfg.countDelta);
    for (let i = 0; i < facets; i++) {
        const ang = (Math.PI * 2 * i) / facets + rng() * 0.3;
        const dist = baseR * (0.35 + rng() * 0.25);
        const fx = x + Math.cos(ang) * dist;
        const fy = canopyY - CANOPY_LIFT + Math.sin(ang) * dist * 0.55;
        const size = baseR * cfg.facetScale * (0.55 + rng() * 0.3);
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(rng() * 0.6 - 0.3);
        ctx.beginPath();
        const sides = 5;
        for (let s = 0; s < sides; s++) {
            const a = (Math.PI * 2 * s) / sides - Math.PI / 2;
            const r = size * (0.8 + (s % 2 === 0 ? 0.2 : 0));
            const px = Math.cos(a) * r, py = Math.sin(a) * r * 0.85;
            if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = leafRadialFill(ctx, 0, 0, size, cfg.greens[i % cfg.greens.length], cfg.glow);
        ctx.fill();
        ctx.strokeStyle = 'rgba(212,175,55,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    if (cfg.fruit === 'cherry' && !isHarvested) {
        const cherryCount = 5 + Math.floor(rng() * 4);
        for (let i = 0; i < cherryCount; i++) {
            const ang = rng() * Math.PI * 2;
            const dist = baseR * (0.3 + rng() * 0.5);
            const cx = x + Math.cos(ang) * dist;
            const cy = canopyY - CANOPY_LIFT + Math.sin(ang) * dist * 0.55;
            drawCherry(ctx, cx, cy, 3);
        }
    } else if (cfg.fruit === 'blossom') {
        const blossomCount = 6 + Math.floor(rng() * 5);
        for (let i = 0; i < blossomCount; i++) {
            const ang = rng() * Math.PI * 2;
            const dist = baseR * (0.25 + rng() * 0.45);
            drawBlossom(ctx, x + Math.cos(ang) * dist, canopyY - CANOPY_LIFT + Math.sin(ang) * dist * 0.55);
        }
    }
}

// ---------- Seasonal ground decoration (grass/flowers/leaves/snow), clipped to a diamond tile ----------

const GRASS_SHADES: Record<'spring' | 'summer', string[]> = {
    spring: ['#3f9e2a', '#5cb83f', '#7fe654'],
    summer: ['#8a7a2a', '#a89a3a', '#c9b94a'],
};
const LEAF_SHADES = ['#d9720f', '#a8420f', '#f0b040'];

function drawGrassClump(ctx: CanvasRenderingContext2D, x: number, y: number, shades: string[], rng: () => number) {
    for (let i = 0; i < 3; i++) {
        const ang = -Math.PI / 2 + (i - 1) * 0.4 + (rng() - 0.5) * 0.15;
        const len = 3 + rng() * 1.6;
        ctx.strokeStyle = shades[Math.floor(rng() * shades.length)];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(ang) * 1.6, y + Math.sin(ang) * len * 0.5, x + Math.cos(ang) * 2.4, y + Math.sin(ang) * len);
        ctx.stroke();
    }
}

function drawGrassTuft(ctx: CanvasRenderingContext2D, x: number, y: number, shades: string[], rng: () => number) {
    const clumpCount = 1 + Math.floor(rng() * 3);
    for (let c = 0; c < clumpCount; c++) {
        drawGrassClump(ctx, x + (rng() - 0.5) * 5, y + (rng() - 0.5) * 3, shades, rng);
    }
}

export interface DrawGroundDecorOptions {
    ctx: CanvasRenderingContext2D;
    /** Center of the diamond tile within the canvas. */
    cx: number;
    cy: number;
    tileW: number;
    tileH: number;
    seed: number;
    phase: string;
}

/** Draws seasonal ground decor (grass/flowers/leaves/snow) clipped to a diamond tile. */
export function drawGroundDecor({ ctx, cx, cy, tileW, tileH, seed, phase }: DrawGroundDecorOptions) {
    const season = mapPhaseToSeason(phase);
    const rng = mulberry32(seed);
    const w = tileW * 0.42, h = tileH * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - tileH / 2);
    ctx.lineTo(cx + tileW / 2, cy);
    ctx.lineTo(cx, cy + tileH / 2);
    ctx.lineTo(cx - tileW / 2, cy);
    ctx.closePath();
    ctx.clip();

    if (season === 'spring') {
        ctx.fillStyle = 'rgba(70,180,40,0.22)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - tileH / 2); ctx.lineTo(cx + tileW / 2, cy);
        ctx.lineTo(cx, cy + tileH / 2); ctx.lineTo(cx - tileW / 2, cy);
        ctx.closePath(); ctx.fill();

        const tufts = 6 + Math.floor(rng() * 4);
        for (let i = 0; i < tufts; i++) {
            drawGrassTuft(ctx, cx + (rng() - 0.5) * w * 2, cy + (rng() - 0.5) * h * 1.6, GRASS_SHADES.spring, rng);
        }
        const flowers = 3 + Math.floor(rng() * 3);
        const flowerColors = ['#ffffff', '#ffe066', '#ff9fc4'];
        for (let i = 0; i < flowers; i++) {
            ctx.fillStyle = flowerColors[Math.floor(rng() * flowerColors.length)];
            ctx.beginPath();
            ctx.arc(cx + (rng() - 0.5) * w * 1.8, cy + (rng() - 0.5) * h * 1.4, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (season === 'summer') {
        const tufts = 3 + Math.floor(rng() * 2);
        for (let i = 0; i < tufts; i++) {
            drawGrassTuft(ctx, cx + (rng() - 0.5) * w * 2, cy + (rng() - 0.5) * h * 1.6, GRASS_SHADES.summer, rng);
        }
    } else if (season === 'autumn') {
        const leaves = 5 + Math.floor(rng() * 4);
        for (let i = 0; i < leaves; i++) {
            const lx = cx + (rng() - 0.5) * w * 2, ly = cy + (rng() - 0.5) * h * 1.6;
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(rng() * Math.PI * 2);
            ctx.fillStyle = LEAF_SHADES[Math.floor(rng() * LEAF_SHADES.length)];
            ctx.beginPath();
            ctx.ellipse(0, 0, 2, 1.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else if (season === 'winter') {
        const patches = 4 + Math.floor(rng() * 3);
        for (let i = 0; i < patches; i++) {
            const nx = cx + (rng() - 0.5) * w * 2, ny = cy + (rng() - 0.5) * h * 1.6;
            const r = 3 + rng() * 4;
            ctx.fillStyle = 'rgba(238,248,252,0.88)';
            ctx.beginPath();
            ctx.ellipse(nx, ny, r, r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

// ---------- Path lane (ragged-edge dirt track along a tile's spine) ----------
//
// Ported from the sketch's drawRaggedPath/drawPathSeams: a STRAIGHT centerline
// whose edges are independently jittered per sample point, so the boundary
// reads as a torn/trodden track rather than a bent line. Drawn per-tile
// (left-vertex to right-vertex of this tile's diamond) rather than the
// sketch's whole-grid seam network, so it inherits this tile's own z-index —
// required for correct occlusion against trees on other rows/tiles.

function drawRaggedRibbon(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, halfWidth: number, color: string, rng: () => number) {
    const steps = 10;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux;

    const left: { x: number; y: number }[] = [];
    const right: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + dx * t, cy = y1 + dy * t;
        const jL = (0.45 + rng() * 0.7) * halfWidth;
        const jR = (0.45 + rng() * 0.7) * halfWidth;
        left.push({ x: cx + px * jL, y: cy + py * jL });
        right.push({ x: cx - px * jR, y: cy - py * jR });
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i <= steps; i++) ctx.lineTo(left[i].x, left[i].y);
    for (let i = steps; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fill();
}

export interface DrawPathTileOptions {
    ctx: CanvasRenderingContext2D;
    /** Center of the diamond tile within the canvas. */
    cx: number;
    cy: number;
    tileW: number;
    tileH: number;
    seed: number;
    /** Draw the segment toward this tile's left vertex (connects to the previous tile in the row). */
    connectLeft: boolean;
    /** Draw the segment toward this tile's right vertex (connects to the next tile in the row). */
    connectRight: boolean;
}

/** Draws a ragged-edge dirt path lane crossing this tile's diamond, clipped to the diamond shape. */
export function drawPathTile({ ctx, cx, cy, tileW, tileH, seed, connectLeft, connectRight }: DrawPathTileOptions) {
    if (!connectLeft && !connectRight) return;
    const rng = mulberry32(seed);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - tileH / 2);
    ctx.lineTo(cx + tileW / 2, cy);
    ctx.lineTo(cx, cy + tileH / 2);
    ctx.lineTo(cx - tileW / 2, cy);
    ctx.closePath();
    ctx.clip();

    const x1 = connectLeft ? cx - tileW / 2 : cx;
    const x2 = connectRight ? cx + tileW / 2 : cx;

    drawRaggedRibbon(ctx, x1, cy, x2, cy, tileW * 0.055, 'rgba(58,40,22,0.92)', rng);
    const rngNarrow = mulberry32(seed);
    drawRaggedRibbon(ctx, x1, cy, x2, cy, tileW * 0.022, 'rgba(94,64,34,0.85)', rngNarrow);

    ctx.restore();
}
