import React from 'react';
import { cn } from "@/lib/utils";

interface RotatingGearsProps {
    className?: string;
}

export const RotatingGears: React.FC<RotatingGearsProps> = ({ className }) => {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none mix-blend-overlay opacity-30 z-0", className)}>
            {/* Very Large Background Gear */}
            <svg
                className="absolute -right-32 -bottom-32 w-[500px] h-[500px] animate-spin-slow text-[#C9A84C]"
                viewBox="0 0 100 100"
                fill="currentColor"
                style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.3))' }}
            >
                <path d="M50,5 L55,15 A40,40 0 0,1 85,45 L95,50 L85,55 A40,40 0 0,1 55,85 L50,95 L45,85 A40,40 0 0,1 15,55 L5,50 L15,45 A40,40 0 0,1 45,15 Z" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="8" />
                <circle cx="50" cy="50" r="8" fill="currentColor" />
                <circle cx="50" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="50" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="80" cy="50" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* Medium Top Left Gear - Counter Rotating */}
            <svg
                className="absolute -left-16 top-10 w-80 h-80 text-[#B36A2A]"
                style={{ animation: 'spin-slow 18s linear infinite reverse', filter: 'drop-shadow(0 0 15px rgba(179,106,42,0.4))' }}
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                <path d="M50,15 L55,25 A25,25 0 0,1 75,45 L85,50 L75,55 A25,25 0 0,1 55,75 L50,85 L45,75 A25,25 0 0,1 25,55 L15,50 L25,45 A25,25 0 0,1 45,25 Z" />
                <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
            </svg>

            {/* Small Connector Gear */}
            <svg
                className="absolute left-40 top-[300px] w-40 h-40 text-[#8B1A1A]"
                style={{ animation: 'spin-slow 10s linear infinite', filter: 'drop-shadow(0 0 10px rgba(139,26,26,0.5))' }}
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                {/* 8-tooth gear */}
                <path d="M45,10 L55,10 L58,22 A28,28 0 0,1 78,42 L90,45 L90,55 L78,58 A28,28 0 0,1 58,78 L55,90 L45,90 L42,78 A28,28 0 0,1 22,58 L10,55 L10,45 L22,42 A28,28 0 0,1 42,22 Z" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
        </div>
    );
};
