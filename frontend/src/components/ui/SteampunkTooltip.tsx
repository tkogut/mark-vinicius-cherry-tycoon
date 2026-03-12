import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SteampunkTooltipProps {
    content: string;
    isVisible: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}

export const SteampunkTooltip: React.FC<SteampunkTooltipProps> = ({
    content,
    isVisible,
    position = 'top',
    children,
    className = ''
}) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-parchment',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-parchment',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-parchment',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-parchment'
    };

    return (
        <div className="relative inline-block group">
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className={`absolute z-[100] w-48 pointer-events-none ${positionClasses[position]} ${className}`}
                    >
                        {/* The Parchment Cloud */}
                        <div className="relative p-3 rounded-sm shadow-2xl overflow-hidden border border-[#d4af37]/40">
                            {/* Background Texture Overlay */}
                            <div
                                className="absolute inset-0 z-0 bg-cover bg-center brightness-110 sepia-[0.2]"
                                style={{ backgroundImage: 'url("/assets/textures/parchment.png")' }}
                            />

                            {/* Gold Etched Inner Border */}
                            <div className="absolute inset-1 border-[0.5px] border-[#d4af37]/20 z-1 pointer-events-none" />

                            {/* Content */}
                            <div className="relative z-10 text-[#3d2b1f] font-serif text-xs leading-relaxed italic text-center drop-shadow-sm">
                                <span className="block mb-1 font-bold not-italic tracking-wider uppercase text-[10px] text-[#5c4033] border-b border-[#5c4033]/10 pb-1">
                                    Researcher's Note
                                </span>
                                {content}
                            </div>

                            {/* Corner Decorative Dots */}
                            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#d4af37]/40 shadow-[0_0_2px_rgba(212,175,55,0.5)]" />
                            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#d4af37]/40 shadow-[0_0_2px_rgba(212,175,55,0.5)]" />
                            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#d4af37]/40 shadow-[0_0_2px_rgba(212,175,55,0.5)]" />
                            <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#d4af37]/40 shadow-[0_0_2px_rgba(212,175,55,0.5)]" />
                        </div>

                        {/* Stylized Arrow Tail */}
                        <div className={`absolute w-3 h-3 border-4 border-transparent ${arrowClasses[position]}`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
