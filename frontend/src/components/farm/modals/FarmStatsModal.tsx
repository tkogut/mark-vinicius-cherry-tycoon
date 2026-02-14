import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cherry, LayoutDashboard, Settings } from "lucide-react";

interface FarmStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalCherries: number;
        activeParcels: number;
        productionRate: number;
    };
}

export function FarmStatsModal({ isOpen, onClose, stats }: FarmStatsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-rose-500" />
                        Farm Statistics
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Real-time overview of your farm's productivity and inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Total Cherries</CardTitle>
                            <Cherry className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-100">{stats.totalCherries.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Current inventory
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Active Parcels</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-100">{stats.activeParcels}</div>
                            <p className="text-[10px] text-slate-500 mt-1">9 parcels max</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Production Rate</CardTitle>
                            <Settings className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-100">{Math.round(stats.productionRate).toLocaleString()}/season</div>
                            <p className="text-[10px] text-slate-500 mt-1">Est. yield/season</p>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
