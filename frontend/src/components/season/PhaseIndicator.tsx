import React from 'react';
import { cn } from "@/lib/utils";
import { PHASE_LABELS, SeasonPhase } from "@/config/phaseConstants";

interface PhaseIndicatorProps {
    currentPhase: SeasonPhase;
    className?: string;
}

const PHASES: { id: SeasonPhase; label: string }[] = [
    { id: 'Hiring', label: 'Hire' },
    { id: 'Procurement', label: 'Supply' },
    { id: 'Investment', label: 'Invest' },
    { id: 'Growth', label: 'Grow' },
    { id: 'Harvest', label: 'Harv' },
    { id: 'Market', label: 'Market' },
    { id: 'Storage', label: 'Store' },
    { id: 'CutAndPrune', label: 'Prune' },
    { id: 'Maintenance', label: 'Maint' },
    { id: 'Planning', label: 'Plan' }
];

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase, className }) => {
    // Handle variants if phase is passed as an object
    const phaseKey = (typeof currentPhase === 'string'
        ? currentPhase
        : Object.keys(currentPhase)[0]) as SeasonPhase;

    const currentIndex = PHASES.findIndex(p => p.id === phaseKey);
    const activeLabel = PHASE_LABELS[phaseKey] || phaseKey;

    return (
        <div className={cn("flex flex-col w-full max-w-3xl", className)}>
            <div className="flex justify-between items-end mb-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
                    Current Activity: <span className="text-rose-500">{activeLabel}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-600">
                    Phase {currentIndex + 1}/10
                </div>
            </div>
            <div className="flex items-center justify-between relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0" />

                {/* Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-rose-600 -z-0 transition-all duration-500"
                    style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
                />

                {PHASES.map((phase, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                        <div key={phase.id} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-slate-900",
                                    isActive ? "border-rose-500 scale-125 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                        isCompleted ? "border-rose-600 bg-rose-600" :
                                            "border-slate-700"
                                )}
                            >
                            </div>
                            <span className={cn(
                                "absolute -bottom-5 text-[8px] font-medium transition-colors duration-300 hidden md:block whitespace-nowrap",
                                isActive ? "text-rose-400 font-bold" :
                                    isCompleted ? "text-slate-500" :
                                        "text-slate-600"
                            )}>
                                {phase.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

