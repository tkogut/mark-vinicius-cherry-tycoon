import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export type GamePhase = 'Planning' | 'Hiring' | 'Procurement' | 'Investment' | 'Growth' | 'Harvest' | 'Market' | 'Storage' | 'CutAndPrune' | 'Maintenance';

interface PhaseIndicatorProps {
    currentPhase: GamePhase;
    className?: string;
}

{ id: 'Hiring', label: 'Hire' },
{ id: 'Procurement', label: 'Buy' },
{ id: 'Investment', label: 'Invest' },
{ id: 'Growth', label: 'Grow' },
{ id: 'Harvest', label: 'Harv' },
{ id: 'Market', label: 'Sell' },
{ id: 'Storage', label: 'Store' },
{ id: 'CutAndPrune', label: 'Prune' },
{ id: 'Maintenance', label: 'Maint' },
{ id: 'Planning', label: 'Plan' }
];

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase, className }) => {
    const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

    return (
        <div className={cn("flex flex-col w-full max-w-3xl", className)}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-center md:text-left">
                Season Phase
            </div>
            <div className="flex items-center justify-between relative">
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
                                    "w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-slate-900",
                                    isActive ? "border-rose-500 scale-125 bg-rose-500" :
                                        isCompleted ? "border-rose-600 bg-rose-600" :
                                            "border-slate-700"
                                )}
                            >
                            </div>
                            <span className={cn(
                                "absolute -bottom-5 text-[9px] font-medium transition-colors duration-300",
                                isActive ? "text-rose-400" :
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
