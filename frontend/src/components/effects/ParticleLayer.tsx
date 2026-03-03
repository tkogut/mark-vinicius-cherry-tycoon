import React, { useEffect, useRef } from 'react';

type Preset = 'CherryBlossom' | 'GoldenPollen' | 'SteamSparks';

interface ParticleLayerProps {
    preset: Preset;
}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({ preset }) => {
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

        // Init particles
        const particleCount = preset === 'CherryBlossom' ? 50 : preset === 'GoldenPollen' ? 100 : 75;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: preset === 'GoldenPollen' ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
                speedX: preset === 'SteamSparks' ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 2,
                speedY: preset === 'SteamSparks' ? Math.random() * -5 - 1 : Math.random() * 2 + 1,
                opacity: Math.random(),
                oscillationSpeed: Math.random() * 0.05 + 0.01,
                angle: Math.random() * Math.PI * 2,
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
                if (preset === 'GoldenPollen') {
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
    }, [preset]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            aria-hidden="true"
        />
    );
};
