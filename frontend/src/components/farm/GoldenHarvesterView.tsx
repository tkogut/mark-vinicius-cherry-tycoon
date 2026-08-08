import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleLayer } from '../effects/ParticleLayer';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, X, Award } from 'lucide-react';

interface GoldenHarvesterViewProps {
    level: number;
    cash: bigint;
    nextCost: number;
    isUpgrading: boolean;
    onUpgrade: () => Promise<void>;
    onClose: () => void;
    isNewLevel?: boolean;
}

export const GoldenHarvesterView: React.FC<GoldenHarvesterViewProps> = ({
    level,
    cash,
    nextCost,
    isUpgrading,
    onUpgrade,
    onClose,
    isNewLevel = false
}) => {
    const yieldBonus = useMemo(() => {
        let multi = 1.0;
        for (let i = 1; i <= level; i++) multi *= 1.05;
        return ((multi - 1) * 100).toFixed(1);
    }, [level]);

    const nextYieldBonus = useMemo(() => {
        let multi = 1.0;
        for (let i = 1; i <= level + 1; i++) multi *= 1.05;
        return ((multi - 1) * 100).toFixed(1);
    }, [level]);

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
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-amber-300 uppercase tracking-widest">The Golden Harvester</h2>
                            <p className="text-[10px] text-amber-500/60 uppercase font-mono tracking-[0.3em]">Imperial Infrastructure • Level {level}</p>
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
                    key={level}
                    initial={isNewLevel ? { scale: 1.5, opacity: 0, filter: 'brightness(5)' } : { scale: 0.8, opacity: 0, rotate: -2 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'brightness(1)' }}
                    transition={isNewLevel ? { duration: 1, ease: "easeOut" } : { type: "spring", damping: 15, delay: 0.3 }}
                    className="relative w-full max-w-4xl aspect-[3/2] mechanical-hull border-amber-500/30 overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.2)] flex items-center justify-center bg-black"
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
                        src="/assets/golden_harvester_blueprint.png"
                        className="w-full h-full object-contain mix-blend-lighten opacity-90"
                        alt="Golden Harvester Blueprint"
                    />

                    {/* Pulsing Indicators */}
                    <div className="absolute top-[38%] left-[55%] w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-75" />
                    <div className="absolute top-[20%] left-[50%] w-3 h-3 bg-red-500 rounded-full animate-pulse opacity-75" />
                </motion.div>

                {/* STATS & CONTROL PANEL */}
                <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mechanical-hull p-6 bg-amber-500/5 border-amber-500/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest">Yield Multiplier</span>
                        </div>
                        <div className="text-3xl font-serif font-bold text-white">+{yieldBonus}%</div>
                        <p className="text-[11px] text-white/40 mt-1">Global production exponential scale.</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mechanical-hull p-6 bg-amber-500/5 border-amber-500/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest">Next Level</span>
                        </div>
                        <div className="text-3xl font-serif font-bold text-amber-200">+{nextYieldBonus}%</div>
                        <p className="text-[11px] text-amber-200/40 mt-1">Efficiency increase upon upgrade.</p>
                    </motion.div>

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
                    <span className="text-[8px] uppercase tracking-[0.5em] text-amber-500 font-bold">Imperial Industrial Certification</span>
                </div>

                {/* HAPTIC SHAKE OVERLAY */}
                {isUpgrading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[110] bg-white/5 backdrop-invert-[0.1] pointer-events-none"
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};
