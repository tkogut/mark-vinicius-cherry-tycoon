import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface EmeraldGaugeProps {
    value: number; // 0 to 100
    label: string;
}

/* ─── Rising bubbles (Lore: Steam-powered alchemy) ───────────────────────── */
const BUBBLES = [
    { left: '22%', size: 3, delay: '0s', duration: '3.2s' },
    { left: '50%', size: 5, delay: '0.8s', duration: '2.6s' },
    { left: '72%', size: 2, delay: '1.4s', duration: '3.8s' },
    { left: '35%', size: 4, delay: '0.3s', duration: '2.9s' },
    { left: '62%', size: 3, delay: '2.1s', duration: '3.5s' },
    { left: '15%', size: 2, delay: '1.7s', duration: '4.1s' },
];

export const EmeraldGauge: React.FC<EmeraldGaugeProps> = ({ value, label }) => {
    const [sloshOffset, setSloshOffset] = useState(0);

    useEffect(() => {
        const handleDeviceMotion = (e: DeviceOrientationEvent) => {
            if (e.gamma) setSloshOffset(e.gamma / 5);
        };
        window.addEventListener('deviceorientation', handleDeviceMotion);
        return () => window.removeEventListener('deviceorientation', handleDeviceMotion);
    }, []);

    const clampedValue = Math.max(0, Math.min(100, value));
    const isNearFull = clampedValue >= 90;
    const isEmpty = clampedValue === 0;
    const glowIntensity = clampedValue / 100;

    const W = 64;
    const H = 256;
    const CAP_H = 22;
    const liquidH = (H - CAP_H * 2) * (clampedValue / 100);

    return (
        <div
            className={cn("flex flex-col items-center justify-center space-y-2 flex-shrink-0 animate-in fade-in zoom-in-95 duration-500")}
            style={{ width: `${W}px`, background: 'transparent' }}
        >
            {/* ═══ TUBE ASSEMBLY — 64 × 256 px ═════════════════════════════════ */}
            <div
                className={cn("relative flex-shrink-0", isNearFull && "animate-vibrate")}
                style={{
                    width: `${W}px`,
                    height: `${H}px`,
                    background: 'transparent',
                }}
            >
                {/* ──────────────────────────────────────────────────────────────
                    LAYER 0  (z:1) — CHASSIS (Deep Black Vacuum)
                    Empty space is a dark, near-black vacuum-tube green.
                ────────────────────────────────────────────────────────────── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    background: 'linear-gradient(90deg, #020402 0%, #081408 45%, #020402 100%)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 35px rgba(0,0,0,0.9)',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'url(/assets/textures/emerald_gauge_chassis.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.12,
                        borderRadius: '9999px',
                    }} />
                </div>

                {/* Aged Brass Caps (Hardware) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: `${CAP_H}px`, zIndex: 10,
                    backgroundImage: 'url(/assets/textures/aged_brass_filigree.png)',
                    backgroundSize: '80px 80px', backgroundPosition: 'center top',
                    borderRadius: `${W / 2}px ${W / 2}px 4px 4px`,
                    boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,210,80,0.4)',
                }}>
                    {[-1, 0, 1].map(x => (
                        <div key={x} style={{
                            position: 'absolute', bottom: '3px', left: `calc(50% + ${x * 14}px - 2.5px)`,
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, #ffe066, #8a5a00)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }} />
                    ))}
                </div>

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: `${CAP_H}px`, zIndex: 10,
                    backgroundImage: 'url(/assets/textures/aged_brass_filigree.png)',
                    backgroundSize: '80px 80px', backgroundPosition: 'center bottom',
                    borderRadius: `4px 4px ${W / 2}px ${W / 2}px`,
                    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,210,80,0.4)',
                }}>
                    {[-1, 0, 1].map(x => (
                        <div key={x} style={{
                            position: 'absolute', top: '3px', left: `calc(50% + ${x * 14}px - 2.5px)`,
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, #ffe066, #8a5a00)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }} />
                    ))}
                </div>

                {/* ──────────────────────────────────────────────────────────────
                    LAYER 1  (z:2) — LIQUID (BRIGHTER & RADIANT)
                ────────────────────────────────────────────────────────────── */}
                <div style={{
                    position: 'absolute',
                    left: '10px', right: '10px',
                    bottom: `${CAP_H}px`,
                    height: `${liquidH}px`,
                    zIndex: 2,
                    overflow: 'hidden',
                    transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `skewY(${sloshOffset}deg)`,
                    transformOrigin: 'bottom',
                    borderRadius: '2px 2px 14px 14px',
                    // RADIANCE FIX: Stronger, more saturated emerald glow
                    filter: isEmpty ? 'none' : `drop-shadow(0 0 16px rgba(0, 255, 65, 0.9))`,
                    animation: isNearFull ? 'vibrate 0.1s infinite' : 'none',
                }}>
                    {/* Swirling Liquid Texture */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%',
                        height: `${H}px`,
                        backgroundImage: isEmpty ? 'none' : 'url(/assets/textures/emerald_gauge_liquid.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'bottom center',
                    }} />

                    {/* VIBRANT Liquid tint — Screen blend for max radiance */}
                    {!isEmpty && <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(0, 255, 65, 0.45)', // Re-boosted
                        mixBlendMode: 'screen',
                        filter: 'contrast(1.4) brightness(1.2)', // EXTREME contrast
                    }} />}

                    {/* Rising Bubbles — Sharp white highlights */}
                    {!isEmpty && BUBBLES.map((b, i) => (
                        <div key={i} style={{
                            position: 'absolute', bottom: -10, left: b.left,
                            width: `${b.size}px`, height: `${b.size}px`, borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, #ffffff, rgba(255,255,255,0.4))',
                            boxShadow: `0 0 6px rgba(0,255,65,0.8)`,
                            animation: `rise ${b.duration} ${b.delay} linear infinite`,
                        }} />
                    ))}

                    {/* Flat surface tension line — RADIANT WHITE */}
                    {!isEmpty && <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        background: '#ffffff',
                        boxShadow: '0 0 30px #00FF41, 0 0 15px #ffffff, 0 0 40px rgba(0,255,65,0.5)',
                        zIndex: 5,
                    }} />}
                </div>

                {/* ──────────────────────────────────────────────────────────────
                    LAYER 2  (z:3+) — GLASS FIDELITY (SHARP CENTER / BORDER BLUR)
                    Restoring the edge-blur that was preferred.
                ────────────────────────────────────────────────────────────── */}

                {/* LEFT Edge Blur Strip — bright refractive rim */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: '8px', width: '12px', zIndex: 3,
                    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
                }} />

                {/* RIGHT Edge Blur Strip — shadow refraction */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, right: '8px', width: '12px', zIndex: 3,
                    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                    background: 'linear-gradient(270deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
                }} />

                {/* God Ray + vertical ribbing — Center is perfectly sharp */}
                <div style={{
                    position: 'absolute', top: `${CAP_H}px`, bottom: `${CAP_H}px`, left: '8px', right: '8px', zIndex: 4,
                    backgroundImage: [
                        'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%)', // Much sharper God Ray
                        'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 8px)', // Tighter ribbing
                    ].join(', '),
                }} />

                {/* Specular Rim — Hand-crafted vertical highlights */}
                <div style={{
                    position: 'absolute', top: `${CAP_H}px`, bottom: `${CAP_H}px`, left: '8px', right: '8px', zIndex: 6,
                    borderRadius: '3px', pointerEvents: 'none',
                    boxShadow: [
                        'inset 4px 0 0 0 rgba(255,255,255,0.4)', // Left Rim Light
                        'inset -3px 0 0 0 rgba(0,0,0,0.3)',      // Right Rim Shadow
                        'inset 12px 0 18px rgba(255,255,255,0.1)',
                        'inset -12px 0 18px rgba(0,0,0,0.15)',
                    ].join(', '),
                }} />

            </div>

            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.22em] font-mono mt-1 text-center block" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {label}
            </span>
            <span
                className="text-[14px] font-bold font-mono text-center block"
                style={{ color: '#00FF41', textShadow: '0 0 12px rgba(0,255,65,1)' }}
            >
                {clampedValue}%
            </span>
        </div>
    );
};
