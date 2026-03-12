import React, { useRef, useState, useEffect } from 'react';

interface ImperialDialProps {
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
    label?: string;
}

export const ImperialDial: React.FC<ImperialDialProps> = ({ value, min, max, onChange, label = 'BID PRICE' }) => {
    const dialRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const lastTouchAngle = useRef<number>(0);
    const velocity = useRef<number>(0);
    const animationFrameId = useRef<number>(0);

    // Sync initial rotation with value
    useEffect(() => {
        if (!isDragging) {
            const percentage = (value - min) / (max - min);
            // Map 0-100% to -135 to 135 degrees (270 degree sweep)
            setRotation(-135 + (percentage * 270));
        }
    }, [value, min, max, isDragging]);

    const getAngle = (clientX: number, clientY: number) => {
        if (!dialRef.current) return 0;
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    const notifyChange = (newRotation: number) => {
        // clamp rotation between -135 and 135
        const clampedRotation = Math.max(-135, Math.min(135, newRotation));
        const percentage = (clampedRotation + 135) / 270;
        const newValue = Math.round(min + percentage * (max - min));
        onChange(newValue);
        return clampedRotation;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
        cancelAnimationFrame(animationFrameId.current);
        velocity.current = 0;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        lastTouchAngle.current = getAngle(clientX, clientY);
    };

    const handlePointerMove = (e: WindowEventMap['pointermove'] | WindowEventMap['touchmove']) => {
        if (!isDragging) return;

        let clientX, clientY;
        if ('touches' in e) {
            // @ts-ignore
            clientX = e.touches[0].clientX;
            // @ts-ignore
            clientY = e.touches[0].clientY;
        } else {
            // @ts-ignore
            clientX = e.clientX;
            // @ts-ignore
            clientY = e.clientY;
        }

        const currentAngle = getAngle(clientX, clientY);
        let delta = currentAngle - lastTouchAngle.current;

        // Handle wrap around across the 180 / -180 boundary
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        velocity.current = delta; // capture current velocity for inertia

        setRotation((prev) => {
            const next = prev + delta;
            return notifyChange(next);
        });

        lastTouchAngle.current = currentAngle;
    };

    const handlePointerUp = () => {
        setIsDragging(false);

        // Apply inertia
        const applyInertia = () => {
            if (Math.abs(velocity.current) > 0.1) {
                setRotation((prev) => {
                    const next = prev + velocity.current;
                    return notifyChange(next);
                });
                velocity.current *= 0.92; // friction
                animationFrameId.current = requestAnimationFrame(applyInertia);
            }
        };

        animationFrameId.current = requestAnimationFrame(applyInertia);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);

            return () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
                window.removeEventListener('touchmove', handlePointerMove);
                window.removeEventListener('touchend', handlePointerUp);
            };
        }
    }, [isDragging]);

    // Glow Intensity based on percentage (0-100)
    const glowPercentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    const EmeraldDropShadow = `drop-shadow(0 0 ${glowPercentage * 0.3}px rgba(16, 185, 129, ${0.4 + glowPercentage * 0.006}))`;

    return (
        <div className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-3xl border border-[#d4af37]/30 shadow-2xl relative w-full overflow-hidden">

            {/* Background vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)' }}></div>

            <div className="text-[#d4af37] font-bold tracking-[0.2em] text-[11px] mb-2 uppercase z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {label}
            </div>

            <div
                className="relative w-44 h-44 touch-none select-none"
                ref={dialRef}
                onPointerDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {/* Static Background Plate (Mahogany) */}
                <div
                    className="absolute inset-[0%] rounded-full z-10 pointer-events-none flex items-center justify-center"
                    style={{
                        backgroundImage: 'url(/assets/textures/mahogany.png)',
                        backgroundSize: 'cover',
                        border: '6px solid #3e2723',
                        boxShadow: 'inset 0 15px 30px rgba(0,0,0,0.9), 0 5px 15px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Engraved Gold Scale Ring */}
                    <div className="absolute inset-2 rounded-full border border-[#d4af37]/30 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" />
                    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100">
                        {/* Minor Ticks */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="0.5 2.45" />
                        {/* Major Ticks */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" strokeWidth="3" strokeDasharray="1 10.78" />
                    </svg>
                </div>

                {/* Rotateable Brass Gear */}
                <div
                    className="absolute inset-[10%] z-20 flex items-center justify-center pointer-events-none"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.9))' // Deep shadow for embedded look
                    }}
                >
                    {/* The Gear Texture Base */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'url(/assets/textures/brass_gear_dial.png) center/100% no-repeat',
                        }}
                    />

                    {/* Engraved Filigree Texture overlay applied to the inner gear face */}
                    <div
                        className="absolute inset-[15%] rounded-full overflow-hidden"
                        style={{ mixBlendMode: 'multiply', opacity: 0.6 }}
                    >
                        <div className="absolute inset-0 w-full h-full" style={{
                            backgroundImage: 'url(/assets/textures/brass_filigree.png)',
                            backgroundSize: '150px',
                            backgroundPosition: 'center',
                        }} />
                    </div>

                    {/* Engraved Indicator Notch */}
                    <div className="absolute top-[18%] w-2 h-6 rounded-full bg-black/80 shadow-inner z-10" style={{ boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.9)' }} />
                </div>

                {/* Bioluminescent Emerald Glass Core — GOLDEN STANDARD RADIANCE */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #00ff41 30%, #059669 65%, #064e3b 100%)',
                            boxShadow: `inset -5px -5px 20px rgba(0,0,0,0.9), inset 5px 5px 15px rgba(255,255,255,0.9), 0 0 ${glowPercentage * 0.8}px rgba(16,185,129,${0.5 + glowPercentage * 0.012})`,
                            filter: `drop-shadow(0 0 30px rgba(0, 255, 65, 0.9))`,
                            border: '2px solid rgba(255,255,255,0.8)'
                        }}
                    >
                        {/* Sharp Specular Highlight */}
                        <div className="w-4 h-4 bg-white/90 rounded-full absolute top-[15%] left-[15%] blur-[1px]" />

                        {/* Micro bubbles effect */}
                        <div className="w-1 h-1 bg-white/80 rounded-full absolute top-[40%] left-[25%]" />
                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full absolute bottom-[30%] right-[30%]" />
                    </div>
                </div>

            </div>

            <div className="mt-[10px] text-2xl font-bold font-mono tracking-wider text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10 w-48 text-center bg-black/50 py-[18px] rounded-lg border border-emerald-900/50">
                {value} <span className="text-xs opacity-80 ml-1">PLN / t</span>
            </div>
        </div>
    );
};
