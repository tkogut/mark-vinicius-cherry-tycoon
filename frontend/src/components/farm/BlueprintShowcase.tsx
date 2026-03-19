import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleLayer } from '../effects/ParticleLayer';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, X, Award, LucideIcon } from 'lucide-react';

interface BlueprintShowcaseProps {
    title: string;
    subtitle: string;
    level: number;
    cash: bigint;
    nextCost: number;
    isUpgrading: boolean;
    onUpgrade: () => Promise<void>;
    onClose: () => void;
    isNewLevel?: boolean;
    blueprintUrl: string;
    icon: LucideIcon;
    stats: {
        label: string;
        value: string;
        trend?: string;
        icon?: LucideIcon;
    }[];
}

export const BlueprintShowcase: React.FC<BlueprintShowcaseProps> = ({
    title,
    subtitle,
    level,
    cash,
    nextCost,
    isUpgrading,
    onUpgrade,
    onClose,
    isNewLevel = false,
    blueprintUrl,
    icon: Icon,
    stats
}) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden"
            >
                {/* 1. CINEMATIC VFX: GOD RAYS */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden origin-center animate-spin-slow opacity-20">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-[200%] h-[150px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                                filter: 'blur(40px)'
                            }}
                        />
                    ))}
                </div>

                {/* 2. CINEMATIC VFX: GOLDEN HOUR LIGHTING */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/5 via-transparent to-ruby-900/10 mix-blend-overlay" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.1)_0%,transparent_70%)]" />

                {/* 3. CINEMATIC VFX: GOLDEN POLLEN */}
                <ParticleLayer preset="GoldenPollen" intensity={0.8} />

                {/* HEADER */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-8 left-8 right-8 flex justify-between items-center z-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                            <Icon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-amber-300 uppercase tracking-widest">{title}</h2>
                            <p className="text-[10px] text-amber-500/60 uppercase font-mono tracking-[0.3em]">{subtitle} • Level {level}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-amber-500/50 hover:text-amber-200 hover:bg-amber-500/10 rounded-full"
                    >
                        <X className="w-8 h-8" />
                    </Button>
                </motion.div>

                {/* MAIN ASSET (BLUEPRINT) */}
                <motion.div
                    key={`${blueprintUrl}-${level}`}
                    initial={isNewLevel ? { scale: 1.5, opacity: 0, filter: 'brightness(5)' } : { scale: 0.8, opacity: 0, rotate: -2 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'brightness(1)' }}
                    transition={isNewLevel ? { duration: 1, ease: "easeOut" } : { type: "spring", damping: 15, delay: 0.3 }}
                    className="relative w-full max-w-4xl aspect-[3:2] md:aspect-[3/2] mechanical-hull border-amber-500/30 overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.2)] flex items-center justify-center bg-black"
                >
                    {isNewLevel && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-white z-20 pointer-events-none"
                        />
                    )}
                    <img
                        src={blueprintUrl}
                        className="w-full h-full object-contain mix-blend-lighten opacity-90"
                        alt={`${title} Blueprint`}
                    />

                    {/* Technical Indicators */}
                    <div className="absolute top-[38%] left-[55%] w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-75" />
                    <div className="absolute top-[20%] left-[50%] w-3 h-3 bg-red-500 rounded-full animate-pulse opacity-75" />
                </motion.div>

                {/* STATS & CONTROL PANEL */}
                <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
                    {stats.slice(0, 2).map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="mechanical-hull p-6 bg-amber-500/5 border-amber-500/20"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {stat.icon ? <stat.icon className="w-4 h-4 text-amber-500" /> : <TrendingUp className="w-4 h-4 text-amber-500" />}
                                <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest">{stat.label}</span>
                            </div>
                            <div className="text-3xl font-serif font-bold text-white">{stat.value}</div>
                            {stat.trend && <p className="text-[11px] text-emerald-400 mt-1">{stat.trend} upgrade potential.</p>}
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-3"
                    >
                        <Button
                            disabled={isUpgrading || cash < BigInt(nextCost)}
                            onClick={onUpgrade}
                            className={`h-full group relative overflow-hidden transition-all duration-500 ${cash >= BigInt(nextCost)
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                }`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="uppercase tracking-[0.2em] font-bold text-xs">Authorize Upgrade</span>
                                <span className="font-mono text-sm mt-1">{nextCost.toLocaleString()} PLN</span>
                            </div>

                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Button>
                    </motion.div>
                </div>

                {/* FOOTER */}
                <div className="absolute bottom-6 flex flex-col items-center gap-2 opacity-30">
                    <div className="w-px h-12 bg-gradient-to-b from-amber-500/0 to-amber-500" />
                    <span className="text-[8px] uppercase tracking-[0.5em] text-amber-500 font-bold italic">Imperial Industrial Certification</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
