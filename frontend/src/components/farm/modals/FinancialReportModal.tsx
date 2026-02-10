import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonReport {
    seasonNumber: bigint;
    seasonName: { [key: string]: any };
    retailRevenue: bigint;
    wholesaleRevenue: bigint;
    otherRevenue: bigint;
    maintenanceCosts: bigint;
    operationalCosts: bigint;
    laborCosts: bigint;
    certificationCosts: bigint;
    totalRevenue: bigint;
    totalCosts: bigint;
    netProfit: bigint;
}

interface FinancialReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reports: SeasonReport[];
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({ isOpen, onClose, reports }) => {
    const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

    if (!latestReport) return null;

    const profitMargin = latestReport.totalRevenue > 0n
        ? (Number(latestReport.netProfit) / Number(latestReport.totalRevenue)) * 100
        : 0;

    const getSeasonName = (name: any) => Object.keys(name)[0];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-800 backdrop-blur-xl text-slate-100 p-0 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-rose-500/10 pointer-events-none" />

                <DialogHeader className="p-6 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl">
                                <PieChart className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Professional Financial Report</DialogTitle>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                                    Season {Number(latestReport.seasonNumber)} • {getSeasonName(latestReport.seasonName)} Analysis
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="p-6 space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                    <ArrowUpRight className="h-24 w-24 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Total Revenue</span>
                                <div className="text-2xl font-mono font-bold text-emerald-400">${Number(latestReport.totalRevenue).toLocaleString()}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                    <ArrowDownRight className="h-24 w-24 text-rose-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Total Costs</span>
                                <div className="text-2xl font-mono font-bold text-rose-400">${Number(latestReport.totalCosts).toLocaleString()}</div>
                                <div className="mt-1 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500">Efficiency</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{Math.max(0, 100 - profitMargin).toFixed(1)}%</span>
                                </div>
                            </div>

                            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp className="h-24 w-24 text-amber-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Net Profit</span>
                                <div className={cn(
                                    "text-2xl font-mono font-bold",
                                    latestReport.netProfit >= 0n ? "text-amber-400" : "text-rose-500"
                                )}>
                                    ${Number(latestReport.netProfit).toLocaleString()}
                                </div>
                                <div className="mt-1 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500">Margin</span>
                                    <span className="text-[10px] text-amber-500 font-bold">{profitMargin.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Income Breakdown */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
                                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Income Streams</h3>
                                </div>
                                <div className="space-y-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                                    <IncomeRow label="Retail Sales" value={latestReport.retailRevenue} total={latestReport.totalRevenue} color="bg-emerald-500" />
                                    <IncomeRow label="Wholesale Deals" value={latestReport.wholesaleRevenue} total={latestReport.totalRevenue} color="bg-sky-500" />
                                    <IncomeRow label="Misc / Other" value={latestReport.otherRevenue} total={latestReport.totalRevenue} color="bg-slate-600" />
                                </div>
                            </div>

                            {/* Expense Breakdown */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-l-2 border-rose-500 pl-3">
                                    <ArrowDownRight className="h-4 w-4 text-rose-400" />
                                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Expense Details</h3>
                                </div>
                                <div className="space-y-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                                    <ExpenseRow label="Infrastructure Maintenance" value={latestReport.maintenanceCosts} total={latestReport.totalCosts} />
                                    <ExpenseRow label="Operational (Water/Seed)" value={latestReport.operationalCosts} total={latestReport.totalCosts} />
                                    <ExpenseRow label="Labor & Services" value={latestReport.laborCosts} total={latestReport.totalCosts} />
                                    <ExpenseRow label="Certification & Fees" value={latestReport.certificationCosts} total={latestReport.totalCosts} />
                                </div>
                            </div>
                        </div>

                        {/* History Tip */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "Financial data is archived at the end of every season. Reviewing historical reports helps in optimizing labor and maintenance costs for upcoming cycles."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-950/50 border-t border-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all border border-slate-700 active:scale-95"
                    >
                        Close Report
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const IncomeRow = ({ label, value, total, color }: { label: string, value: bigint, total: bigint, color: string }) => {
    const percent = total > 0n ? (Number(value) / Number(total)) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-100 font-mono font-bold">${Number(value).toLocaleString()}</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
};

const ExpenseRow = ({ label, value, total }: { label: string, value: bigint, total: bigint }) => {
    return (
        <div className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-200 font-mono">${Number(value).toLocaleString()}</span>
        </div>
    );
};
