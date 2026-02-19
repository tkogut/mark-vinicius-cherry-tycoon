import React, { useEffect, useRef } from 'react';

interface WeatherOverlayProps {
    type: 'rain' | 'snow' | 'none';
    intensity?: number; // 0.0 to 1.0
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ type, intensity = 0.5 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (type === 'none') return;

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

        // Initialize particles based on type
        const createParticle = () => {
            if (type === 'rain') {
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 15 + 10,
                    length: Math.random() * 20 + 10,
                    opacity: Math.random() * 0.5 + 0.1
                };
            } else { // snow
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 2 + 0.5,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.8 + 0.2,
                    sway: Math.random() * 0.02 - 0.01
                };
            }
        };

        // Populate initial particles
        const particleCount = type === 'rain' ? 300 * intensity : 150 * intensity;
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (type === 'rain') {
                ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';

                particles.forEach(p => {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.length);
                    ctx.stroke();

                    // Update position
                    p.y += p.speed;
                    if (p.y > canvas.height) {
                        p.y = -p.length;
                        p.x = Math.random() * canvas.width;
                    }
                });
            } else if (type === 'snow') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

                particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Update position
                    p.y += p.speed;
                    p.x += Math.sin(p.y * 0.01) + p.sway;

                    if (p.y > canvas.height) {
                        p.y = -p.radius;
                        p.x = Math.random() * canvas.width;
                    }
                    if (p.x > canvas.width) p.x = 0;
                    if (p.x < 0) p.x = canvas.width;
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [type, intensity]);

    if (type === 'none') return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ opacity: 0.8 }} // Subtle blend
        />
    );
};
