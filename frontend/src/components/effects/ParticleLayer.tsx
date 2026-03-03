import React, { useEffect, useRef } from 'react';

type Preset = 'CherryBlossom' | 'GoldenPollen' | 'SteamSparks' | 'SunsetGlow';

interface ParticleLayerProps {
    preset: Preset;
    intensity?: number; // 0.0 - 1.0, controls particle count and speed
}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({ preset, intensity = 1.0 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: any[] = [];
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', resize);
        resize();

        // Clamp intensity
        const clampedIntensity = Math.max(0, Math.min(1, intensity));

        // Base particle counts per preset
        const baseCounts: Record<Preset, number> = {
            CherryBlossom: 50,
            GoldenPollen: 100,
            SteamSparks: 75,
            SunsetGlow: 120,
        };
        const particleCount = Math.max(5, Math.floor(baseCounts[preset] * clampedIntensity));

        for (let i = 0; i < particleCount; i++) {
            const isSunset = preset === 'SunsetGlow';
            const isSteam = preset === 'SteamSparks';
            const isGolden = preset === 'GoldenPollen';

            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: isSunset
                    ? Math.random() * 4 + 1.5
                    : isGolden
                        ? Math.random() * 3 + 1
                        : Math.random() * 4 + 2,
                speedX: isSteam
                    ? (Math.random() - 0.5) * 5 * clampedIntensity
                    : isSunset
                        ? (Math.random() - 0.5) * 1.5 * clampedIntensity
                        : (Math.random() - 0.5) * 2,
                speedY: isSteam
                    ? (Math.random() * -5 - 1) * clampedIntensity
                    : isSunset
                        ? (Math.random() * 1.5 + 0.3) * clampedIntensity
                        : Math.random() * 2 + 1,
                opacity: Math.random() * clampedIntensity,
                oscillationSpeed: Math.random() * 0.05 + 0.01,
                angle: Math.random() * Math.PI * 2,
                // SunsetGlow specific: each particle picks either amber or ruby
                hue: isSunset ? (Math.random() > 0.35 ? 'amber' : 'ruby') : null,
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.angle += p.oscillationSpeed;
                p.x += Math.sin(p.angle) * 0.5 + p.speedX;
                p.y += p.speedY;

                if (p.y > height) p.y = 0;
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
                if (p.y < 0 && preset === 'SteamSparks') p.y = height;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                let fillColor = '';
                if (preset === 'SunsetGlow') {
                    if (p.hue === 'ruby') {
                        fillColor = `rgba(155, 17, 30, ${p.opacity * 0.7})`; // Ruby red
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = `rgba(155, 17, 30, ${p.opacity * 0.6})`;
                    } else {
                        fillColor = `rgba(212, 175, 55, ${p.opacity * 0.85})`; // Brass/Amber
                        ctx.shadowBlur = 12;
                        ctx.shadowColor = `rgba(255, 180, 0, ${p.opacity * 0.7})`;
                    }
                } else if (preset === 'GoldenPollen') {
                    fillColor = `rgba(255, 215, 0, ${p.opacity * 0.8})`; // Gold/Amber
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(255, 140, 0, 0.8)'; // Orange glow
                } else if (preset === 'SteamSparks') {
                    fillColor = `rgba(255, 100, 0, ${p.opacity})`; // Brass/Fire
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = 'rgba(255, 50, 0, 1)';
                } else {
                    fillColor = `rgba(255, 183, 197, ${p.opacity})`; // Pink
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.shadowBlur = 0; // reset
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [preset, intensity]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            aria-hidden="true"
        />
    );
};

