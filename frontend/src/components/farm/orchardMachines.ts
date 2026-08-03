// Geometric Brass procedural machine + worker renderer.
//
// Ported from `.planning/sketches/002-machines-and-workers/index.html`
// (Variant A "Geometric Brass", both worker proposals kept per user
// decision 2026-08-03) into reusable Canvas 2D draw functions. Machine
// names match the app's existing Marketplace terminology (Modern Tractor,
// Precision Sprayer, Mechanical Shaker) rather than inventing new ones —
// Branch Pruner is new (no in-app entity yet) but drawn wheeled to match
// the other three vehicles.
//
// All machine draw functions assume a 200x200 canvas (the sketch's working
// resolution) — callers display it at a smaller CSS size, same technique
// `geometricBrassTree.ts` uses for tree canvases. Worker draw functions
// assume a 120x200 canvas.

function mulberry32(seed: number) {
    let s = seed;
    return function () {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function groundShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.28, 0, 0, Math.PI * 2); ctx.fill();
}

function wheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, '#3a3a3a'); grad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9922e';
    ctx.beginPath(); ctx.arc(x, y, r * 0.4, 0, Math.PI * 2); ctx.fill();
}

function facetBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number, seed: number, c1: string, c2: string) {
    const rng = mulberry32(seed);
    ctx.save();
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(212,175,55,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const ang = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const rr = r * (0.82 + rng() * 0.3);
        const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr * 0.75;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
}

function facetBlobScaled(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number, seed: number, c1: string, c2: string, sx: number, sy: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    facetBlob(ctx, 0, 0, r, sides, seed, c1, c2);
    ctx.restore();
}

function gearRivet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save(); ctx.translate(x, y);
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
    grad.addColorStop(0, '#ffe9a8'); grad.addColorStop(0.55, '#c9922e'); grad.addColorStop(1, '#7a5a12');
    ctx.fillStyle = grad;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * i) / 8;
        const rad = i % 2 === 0 ? r : r * 0.68;
        ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function connector(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, w: number) {
    ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

/** Draws the "Modern Tractor" machine onto a 200x200 canvas. */
export function drawModernTractor(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 100, 178, 56);
    wheel(ctx, 62, 168, 22); wheel(ctx, 138, 168, 26);
    connector(ctx, 62, 148, 138, 142, 26);
    facetBlob(ctx, 105, 128, 40, 6, seed, '#c9922e', '#7a4f18');
    facetBlob(ctx, 75, 98, 20, 5, seed + 1, '#e8c168', '#a8792e');
    gearRivet(ctx, 105, 128, 8);
}

/** Draws the "Precision Sprayer" machine (tank + spray nozzle) onto a 200x200 canvas. */
export function drawPrecisionSprayer(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 100, 178, 58);
    wheel(ctx, 62, 172, 18); wheel(ctx, 138, 172, 18);
    connector(ctx, 62, 155, 138, 155, 20);
    facetBlob(ctx, 100, 118, 44, 7, seed, '#b87333', '#5c3616');
    connector(ctx, 138, 118, 158, 100, 6);
    for (let i = 0; i < 3; i++) {
        const ang = -0.5 + i * 0.35;
        ctx.fillStyle = 'rgba(120,200,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(160 + Math.cos(ang) * 14, 96 + Math.sin(ang) * 10, 4, 6, ang, 0, Math.PI * 2);
        ctx.fill();
    }
    gearRivet(ctx, 100, 120, 7);
}

/** Draws the "Mechanical Shaker" machine (clamp jaws gripping a trunk stub) onto a 200x200 canvas. */
export function drawMechanicalShaker(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 100, 178, 56);
    wheel(ctx, 65, 170, 20); wheel(ctx, 135, 170, 24);
    connector(ctx, 65, 152, 135, 148, 24);
    facetBlob(ctx, 102, 128, 38, 6, seed, '#c9922e', '#7a4f18');
    connector(ctx, 90, 100, 78, 66, 8);
    facetBlob(ctx, 78, 50, 7, 4, seed + 30, '#5c3616', '#2e1a0a');
    ctx.save();
    ctx.translate(78, 60);
    ctx.rotate(-0.5);
    facetBlob(ctx, -16, 0, 16, 4, seed + 20, '#e0115f', '#7a0d3f');
    ctx.rotate(1.0);
    facetBlob(ctx, 16, 0, 16, 4, seed + 21, '#e0115f', '#7a0d3f');
    ctx.restore();
    gearRivet(ctx, 102, 128, 8);
}

/** Draws the "Branch Pruner" machine (wheeled, scissor head) onto a 200x200 canvas. */
export function drawBranchPruner(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 100, 178, 44);
    wheel(ctx, 82, 172, 14); wheel(ctx, 118, 172, 14);
    connector(ctx, 82, 160, 118, 160, 16);
    facetBlob(ctx, 100, 144, 24, 6, seed, '#c9922e', '#7a4f18');
    connector(ctx, 100, 126, 100, 100, 7);
    ctx.save();
    ctx.translate(100, 92);
    ctx.rotate(-0.35);
    facetBlob(ctx, -16, -14, 18, 4, seed + 3, '#e8ecef', '#8a9aa5');
    ctx.rotate(0.7);
    facetBlob(ctx, 16, -14, 18, 4, seed + 4, '#e8ecef', '#8a9aa5');
    ctx.restore();
    gearRivet(ctx, 100, 144, 7);
}

/** Draws worker Proposal A, "Sturdy Facet" (symmetrical stance, gear tool), onto a 120x200 canvas. */
export function drawWorkerSturdyFacet(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 60, 178, 24);
    gearRivet(ctx, 45, 120, 6);
    facetBlobScaled(ctx, 51, 150, 10, 5, seed, '#166534', '#0a3d1e', 0.85, 1.6);
    facetBlobScaled(ctx, 69, 150, 10, 5, seed + 1, '#166534', '#0a3d1e', 0.85, 1.6);
    facetBlobScaled(ctx, 41, 120, 8, 5, seed + 2, '#854d0e', '#4a2a08', 0.9, 1.35);
    facetBlobScaled(ctx, 81, 118, 8, 5, seed + 3, '#854d0e', '#4a2a08', 0.9, 1.35);
    facetBlob(ctx, 60, 118, 17, 6, seed + 4, '#854d0e', '#4a2a08');
    gearRivet(ctx, 88, 104, 5);
    facetBlob(ctx, 60, 95, 11, 6, seed + 5, '#D4A76A', '#8a6a3e');
}

/** Draws worker Proposal B, "Dynamic Stride" (mid-walk pose, lantern), onto a 120x200 canvas. */
export function drawWorkerDynamicStride(ctx: CanvasRenderingContext2D, seed: number) {
    groundShadow(ctx, 60, 178, 26);
    gearRivet(ctx, 46, 118, 6);
    facetBlobScaled(ctx, 50, 152, 10, 5, seed, '#166534', '#0a3d1e', 0.85, 1.55);
    facetBlobScaled(ctx, 72, 148, 10, 5, seed + 1, '#166534', '#0a3d1e', 0.85, 1.65);
    facetBlobScaled(ctx, 80, 126, 8, 5, seed + 2, '#854d0e', '#4a2a08', 0.9, 1.3);
    facetBlobScaled(ctx, 42, 116, 8, 5, seed + 3, '#854d0e', '#4a2a08', 0.9, 1.25);
    facetBlob(ctx, 62, 116, 17, 6, seed + 4, '#854d0e', '#4a2a08');
    const lgrad = ctx.createRadialGradient(38, 128, 1, 38, 128, 8);
    lgrad.addColorStop(0, '#ffe9a8'); lgrad.addColorStop(1, '#c9922e');
    ctx.fillStyle = lgrad;
    ctx.beginPath(); ctx.arc(38, 128, 6, 0, Math.PI * 2); ctx.fill();
    facetBlob(ctx, 62, 93, 11, 6, seed + 5, '#D4A76A', '#8a6a3e');
}
