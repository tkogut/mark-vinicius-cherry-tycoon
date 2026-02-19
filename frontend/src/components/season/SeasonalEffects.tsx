import React, { useEffect, useRef } from 'react';

interface SeasonalEffectsProps {
    season: 'Spring' | 'Autumn' | 'Summer' | 'Winter' | null;
}

export const SeasonalEffects: React.FC<SeasonalEffectsProps> = ({ season }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (season !== 'Spring' && season !== 'Autumn') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const createParticle = () => {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height, // Start above in different positions
                speedX: Math.random() * 1.5 - 0.5, // Drift
                speedY: Math.random() * 1.5 + 0.5, // Fall
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 2 - 1,
                size: Math.random() * 5 + 3,
                color: season === 'Spring'
                    ? `rgba(255, ${Math.floor(Math.random() * 50 + 150)}, 200, 0.6)` // Pinkish
                    : `rgba(${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 100 + 50)}, 0, 0.7)` // Orange/Brown
            };
        };

        // Sparse particles for subtle effect
        const particleCount = season === 'Spring' ? 40 : 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);

                ctx.fillStyle = p.color;

                // Draw petal/leaf shape (simple ellipse for now)
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                // Update position
                p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5; // Add sway
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height + 10) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.x < -10) p.x = canvas.width + 10;
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [season]);

    if (season !== 'Spring' && season !== 'Autumn') return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-40"
        />
    );
};
