import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Coins } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface HiringModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHire: (laborType: string) => Promise<void>;
    userCash: bigint;
    isLoading: boolean;
}

export const HiringModal: React.FC<HiringModalProps> = ({ isOpen, onClose, onHire, userCash, isLoading }) => {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const laborOptions = [
        {
            id: 'Village',
            name: 'Village Labor',
            description: 'Local workers with basic tools.',
            upfront: 500,
            harvestCost: 1,
            yieldMult: '0.9x',
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
            border: 'border-amber-500',
            icon: Users
        },
        {
            id: 'Standard',
            name: 'Standard Contract',
            description: 'Reliable seasonal workers.',
            upfront: 1500,
            harvestCost: 2,
            yieldMult: '1.0x',
            color: 'text-indigo-600',
            bg: 'bg-indigo-100 dark:bg-indigo-900/20',
            border: 'border-indigo-500',
            icon: ShieldCheck
        },
        {
            id: 'City',
            name: 'City Specialists',
            description: 'Highly trained agritech operators.',
            upfront: 3000,
            harvestCost: 3,
            yieldMult: '1.1x',
            color: 'text-violet-600',
            bg: 'bg-violet-100 dark:bg-violet-900/20',
            border: 'border-violet-500',
            icon: CheckCircle2
        }
    ];

    const handleHire = async () => {
        if (selectedType) {
            await onHire(selectedType);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] border-amber-500/20 bg-slate-900 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-amber-500">
                        <Users className="h-6 w-6" />
                        Spring Seasonal Hiring
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Secure your labor contract for the season. Skipping this step will result in emergency hiring later at penalty rates.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                    {laborOptions.map((opt) => (
                        <Card
                            key={opt.id}
                            className={cn(
                                "cursor-pointer transition-all duration-200 border-2 bg-slate-800/50 hover:bg-slate-800",
                                selectedType === opt.id ? `${opt.border} shadow-[0_0_15px_rgba(251,191,36,0.2)] scale-105 z-10` : "border-slate-700 opacity-80"
                            )}
                            onClick={() => setSelectedType(opt.id)}
                        >
                            <CardHeader className="pb-2">
                                <opt.icon className={cn("h-8 w-8 mb-2", opt.color)} />
                                <CardTitle className="text-lg">{opt.name}</CardTitle>
                                <CardDescription className="text-xs text-slate-400 min-h-[40px]">{opt.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                                    <span className="text-slate-400">Upfront Fee</span>
                                    <span className="font-bold flex items-center gap-1 text-slate-200">
                                        {opt.upfront.toLocaleString()} <Coins className="h-3 w-3 text-amber-500" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                                    <span className="text-slate-400">Harvest Cost (<span className="text-[10px]">per kg</span>)</span>
                                    <span className="font-bold text-slate-200">{opt.harvestCost} PLN</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-400 pb-2 border-b border-slate-700">
                                    <span>Yield Impact</span>
                                    <span className="font-bold">{opt.yieldMult}</span>
                                </div>

                                <div className="pt-2 text-center">
                                    {(userCash !== undefined && userCash !== null) && Number(userCash) < opt.upfront ? (
                                        <span className="text-xs text-rose-500 font-bold flex items-center justify-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Insufficient Funds
                                        </span>
                                    ) : (
                                        <span className="text-xs text-emerald-500 font-bold">Available</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300">
                        <strong>Warning:</strong> If you don't hire labor now, the system will auto-assign <strong>Emergency Labor</strong> when you start harvesting. This will cost 4 PLN per kg and reduce your total yield by 20% (0.8x multiplier).
                    </p>
                </div>

                <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center w-full">
                    <div className="text-sm">
                        <span className="text-slate-400">Your Cash: </span>
                        <span className="font-bold text-emerald-400">{(userCash !== undefined && userCash !== null) ? Number(userCash).toLocaleString() : '0'} PLN</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800">
                            Skip for now
                        </Button>
                        <Button
                            onClick={handleHire}
                            disabled={
                                !selectedType ||
                                isLoading ||
                                Boolean(selectedType && (userCash !== undefined && userCash !== null) && Number(userCash) < (laborOptions.find(o => o.id === selectedType)?.upfront || Infinity))
                            }
                            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0"
                        >
                            Sign Contract <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
