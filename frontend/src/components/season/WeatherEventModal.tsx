import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudRain, CloudLightning, Sun, Droplets, Wind, ShieldCheck, AlertTriangle } from "lucide-react";

export type WeatherEventType = 'Drought' | 'Storm' | 'Heatwave' | 'Frost' | 'Ideal';

interface WeatherEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        type: WeatherEventType;
        name: string;
        description: string;
        yieldImpact: number; // e.g. -0.2 for -20%
        infrastructureMitigation?: string; // e.g. "Irrigation System"
    } | null;
}

const WeatherIcons: Record<WeatherEventType, React.ReactNode> = {
    'Drought': <Sun className="h-10 w-10 text-orange-500 animate-pulse" />,
    'Storm': <CloudLightning className="h-10 w-10 text-purple-500 animate-pulse" />,
    'Heatwave': <Sun className="h-10 w-10 text-red-500 animate-pulse" />,
    'Frost': <Wind className="h-10 w-10 text-cyan-500 animate-pulse" />,
    'Ideal': <CloudRain className="h-10 w-10 text-emerald-500" />
};

export const WeatherEventModal: React.FC<WeatherEventModalProps> = ({ isOpen, onClose, event }) => {
    if (!event) return null;

    const isNegative = event.yieldImpact < 0;
    const impactColor = isNegative ? "text-red-500" : "text-emerald-500";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <DialogHeader className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-slate-800 rounded-full border border-slate-700 shadow-xl">
                        {WeatherIcons[event.type]}
                    </div>

                    <div>
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {event.name}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 mt-2">
                            {event.description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <span className="text-sm font-medium text-slate-300">Yield Impact</span>
                        <span className={`font-bold ${impactColor} flex items-center gap-1`}>
                            {isNegative ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                            {event.yieldImpact > 0 ? '+' : ''}{Math.round(event.yieldImpact * 100)}%
                        </span>
                    </div>

                    {event.infrastructureMitigation && (
                        <div className="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Mitigation Available</h4>
                            <p className="text-sm text-blue-200">
                                <span className="font-semibold text-white">{event.infrastructureMitigation}</span> can reduce crop loss.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={onClose}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium"
                    >
                        Acknowledge
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
