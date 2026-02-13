import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronRight,
    BarChart3,
    Filter,
    MapPin,
    Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { ParcelEconomics, SeasonReport, YearlyReport, Province } from '../../../declarations/backend';

interface FinancialReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    seasonalReports: SeasonReport[];
    yearlyReports: YearlyReport[];
    overallStatistics?: {
        totalRevenue: bigint;
        totalCosts: bigint;
        totalHarvested: bigint;
        bestYearlyProfit: bigint;
    };
    parcels: any[];
}

const VolumeBreakdownRow = ({ label, revenue, volume, color }: { label: string, revenue: bigint, volume: bigint, color: string }) => {
    const unitPrice = volume > 0n ? Number(revenue) / Number(volume) : 0;
    return (
        <div className="flex justify-between items-center text-[10px] p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", color)} />
                <span className="text-slate-400 font-medium">{label}</span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="text-right">
                    <div className="text-slate-200 font-mono font-bold">{Number(volume).toLocaleString()} kg</div>
                    <div className="text-slate-500 text-[8px] uppercase font-bold">Volume</div>
                </div>
                <div className="text-right border-l border-white/10 pl-4">
                    <div className="text-emerald-400 font-mono font-bold">${unitPrice.toFixed(2)}/kg</div>
                    <div className="text-slate-500 text-[8px] uppercase font-bold">Avg Price</div>
                </div>
            </div>
        </div>
    );
};

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
    isOpen,
    onClose,
    seasonalReports,
    yearlyReports,
    overallStatistics,
    parcels
}) => {
    const [activeTab, setActiveTab] = useState("seasonal");
    const [filterParcelId, setFilterParcelId] = useState<string>("all");
    const [filterProvince, setFilterProvince] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<YearlyReport | null>(null);

    const getSeasonName = (name: any) => name ? Object.keys(name)[0] : "N/A";
    const getProvinceName = (p: Province) => p ? Object.keys(p)[0] : "N/A";

    const provinces = useMemo(() => {
        const uniqueProvinces = new Set<string>();
        parcels.forEach(p => uniqueProvinces.add(getProvinceName(p.region.province)));
        return Array.from(uniqueProvinces);
    }, [parcels]);

    // Filtering logic for the primary display
    const filteredSeason = useMemo(() => {
        if (seasonalReports.length === 0) return null;
        const latest = seasonalReports[seasonalReports.length - 1];

        if (filterParcelId !== "all") {
            const pData = latest.parcelData.find((pd: ParcelEconomics) => pd.parcelId === filterParcelId);
            if (pData) {
                return {
                    ...latest,
                    totalRevenue: pData.revenue,
                    totalCosts: pData.costs,
                    netProfit: pData.netProfit,
                    isFiltered: true
                };
            }
        } else if (filterProvince !== "all") {
            const provData = latest.parcelData.filter((pd: ParcelEconomics) => getProvinceName(pd.province) === filterProvince);
            const totalRevenue = provData.reduce((sum: bigint, pd: ParcelEconomics) => sum + pd.revenue, 0n);
            const totalCosts = provData.reduce((sum: bigint, pd: ParcelEconomics) => sum + pd.costs, 0n);
            return {
                ...latest,
                totalRevenue,
                totalCosts,
                netProfit: totalRevenue - totalCosts,
                isFiltered: true
            };
        }

        return latest;
    }, [seasonalReports, filterParcelId, filterProvince]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-800 backdrop-blur-xl text-slate-100 p-0 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-rose-500/10 pointer-events-none" />

                <DialogHeader className="p-6 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl">
                                <BarChart3 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Financial Performance</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                                    Analytics & Reporting Dashboard
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-1">
                                <Filter className="h-3 w-3 text-slate-500 ml-1.5" />
                                <select
                                    className="bg-transparent text-[10px] font-bold text-slate-300 outline-none pr-4 cursor-pointer"
                                    value={filterProvince}
                                    onChange={(e) => {
                                        setFilterProvince(e.target.value);
                                        setFilterParcelId("all");
                                    }}
                                >
                                    <option value="all">ALL PROVINCES</option>
                                    {provinces.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-1">
                                <Box className="h-3 w-3 text-slate-500 ml-1.5" />
                                <select
                                    className="bg-transparent text-[10px] font-bold text-slate-300 outline-none pr-4 cursor-pointer"
                                    value={filterParcelId}
                                    onChange={(e) => {
                                        setFilterParcelId(e.target.value);
                                        setFilterProvince("all");
                                    }}
                                >
                                    <option value="all">ALL PARCELS</option>
                                    {parcels.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.id.split('_').pop()?.toUpperCase() || p.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 border-b border-slate-800/30 bg-slate-900/30">
                        <TabsList className="bg-transparent h-12 gap-6">
                            <TabsTrigger value="seasonal" className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all">
                                Seasonal
                            </TabsTrigger>
                            <TabsTrigger value="yearly" className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all">
                                Yearly
                            </TabsTrigger>
                            <TabsTrigger value="overall" className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all">
                                Lifetime
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6">
                        <TabsContent value="seasonal" className="mt-0 space-y-6">
                            {filteredSeason ? (
                                <ReportContent report={filteredSeason} />
                            ) : (
                                <EmptyState message="No seasonal data available for the current filters." />
                            )}
                        </TabsContent>

                        <TabsContent value="yearly" className="mt-0 space-y-6">
                            {selectedYear ? (
                                <div className="space-y-6">
                                    <button
                                        onClick={() => setSelectedYear(null)}
                                        className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                                    >
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                        Back to Yearly History
                                    </button>
                                    <ReportContent report={selectedYear} />
                                </div>
                            ) : yearlyReports.length > 0 ? (
                                yearlyReports.map((yr, idx) => (
                                    <YearlyReportCard key={idx} yr={yr} onDetails={() => setSelectedYear(yr)} />
                                ))
                            ) : (
                                <EmptyState message="Yearly reports are generated at the start of every Spring." />
                            )}
                        </TabsContent>

                        <TabsContent value="overall" className="mt-0">
                            {overallStatistics ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <StatCard label="Lifetime Revenue" value={overallStatistics.totalRevenue} color="text-emerald-400" icon={<TrendingUp />} />
                                        <StatCard label="Lifetime Costs" value={overallStatistics.totalCosts} color="text-rose-400" icon={<TrendingDown />} />
                                        <StatCard label="Total Harvested" value={overallStatistics.totalHarvested} color="text-sky-400" icon={<Box />} unit="kg" />
                                        <StatCard label="Best Yearly Profit" value={overallStatistics.bestYearlyProfit} color="text-amber-400" icon={<TrendingUp />} />
                                    </div>
                                </div>
                            ) : (
                                <EmptyState message="Historical data calculation in progress." />
                            )}
                        </TabsContent>
                    </div>
                </Tabs>

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

const ReportContent = ({ report }: { report: any }) => {
    const profitMargin = report.totalRevenue > 0n
        ? (Number(report.netProfit) / Number(report.totalRevenue)) * 100
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Revenue</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400">${Number(report.totalRevenue).toLocaleString()}</div>
                    <Progress value={100} className="h-1 mt-2 bg-slate-800" indicatorClassName="bg-emerald-500" />
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Expenses</span>
                    <div className="text-2xl font-mono font-bold text-rose-400">${Number(report.totalCosts).toLocaleString()}</div>
                    <Progress value={Math.min(100, Number(report.totalCosts) / Math.max(1, Number(report.totalRevenue)) * 100)} className="h-1 mt-2 bg-slate-800" indicatorClassName="bg-rose-500" />
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Harvested</span>
                    <div className="text-2xl font-mono font-bold text-sky-400">{Number(report.totalHarvested).toLocaleString()} kg</div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Yield</span>
                        <div className="h-1 w-1/2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Net P&L</span>
                    <div className={cn("text-2xl font-mono font-bold", report.netProfit >= 0n ? "text-amber-400" : "text-rose-500")}>
                        ${Number(report.netProfit).toLocaleString()}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Margin</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{profitMargin.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {!report.isFiltered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue Details</h4>
                        <div className="space-y-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                            <VolumeBreakdownRow label="Retail" revenue={report.retailRevenue} volume={report.retailVolume} color="bg-emerald-500" />
                            <VolumeBreakdownRow label="Wholesale" revenue={report.wholesaleRevenue} volume={report.wholesaleVolume} color="bg-sky-500" />
                            {report.otherRevenue > 0n && (
                                <BreakdownRow label="Other Revenue" value={report.otherRevenue} total={report.totalRevenue} color="bg-amber-400" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-rose-400">Operating Costs</h4>
                            <div className="space-y-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                                <BreakdownRow label="Labor" value={report.laborCosts} total={report.totalCosts} color="bg-rose-500" />
                                <BreakdownRow label="Maintenance" value={report.maintenanceCosts} total={report.totalCosts} color="bg-orange-500" />
                                <BreakdownRow label="Operations (Water/Fert)" value={report.operationalCosts} total={report.totalCosts} color="bg-amber-500" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-sky-400">Investment Costs</h4>
                            <div className="space-y-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                                <BreakdownRow label="Parcel Purchases" value={report.parcelCosts} total={report.totalCosts} color="bg-sky-500" />
                                <BreakdownRow label="Infrastructure" value={report.infrastructureCosts} total={report.totalCosts} color="bg-indigo-500" />
                                <BreakdownRow label="Certifications" value={report.certificationCosts} total={report.totalCosts} color="bg-violet-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const YearlyReportCard = ({ yr, onDetails }: { yr: YearlyReport, onDetails: () => void }) => (
    <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Year {Number(yr.year)} Summary
            </h3>
            <div className="text-xs font-mono text-slate-500">
                Harvested: <span className="text-slate-200">{Number(yr.totalHarvested).toLocaleString()} kg</span>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
            {/* Standard stat cards... */}
            <div className="text-center p-3 bg-slate-900 rounded-xl">
                <div className="text-[8px] text-slate-500 uppercase font-bold">Revenue</div>
                <div className="text-sm font-mono font-bold text-emerald-400">${Number(yr.totalRevenue).toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-slate-900 rounded-xl">
                <div className="text-[8px] text-slate-500 uppercase font-bold">Costs</div>
                <div className="text-sm font-mono font-bold text-rose-400">${Number(yr.totalCosts).toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-slate-900 rounded-xl">
                <div className="text-[8px] text-slate-500 uppercase font-bold">Net Profit</div>
                <div className={cn("text-sm font-mono font-bold", yr.netProfit >= 0n ? "text-amber-400" : "text-rose-500")}>
                    ${Number(yr.netProfit).toLocaleString()}
                </div>
            </div>
        </div>
        <div className="flex justify-between items-center">
            {yr.bestPerformingParcelId.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    Best Performance: <span className="text-slate-300 uppercase font-bold">{yr.bestPerformingParcelId[0]?.split('_').pop()}</span>
                </div>
            )}
            <button
                onClick={onDetails}
                className="ml-auto flex items-center gap-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
            >
                View Details
                <ChevronRight className="h-3 w-3" />
            </button>
        </div>
    </div>
);
const BreakdownRow = ({ label, value, total, color }: { label: string, value: bigint, total: bigint, color: string }) => {
    const percent = total > 0n ? (Number(value) / Number(total)) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-100 font-mono font-bold">${Number(value).toLocaleString()}</span>
            </div>
            <Progress value={percent} className="h-1 bg-slate-800" indicatorClassName={color} />
        </div>
    );
};

const StatCard = ({ label, value, color, icon, unit = "$" }: { label: string, value: bigint, color: string, icon: React.ReactNode, unit?: string }) => (
    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl group transition-all hover:border-emerald-500/30">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <div className={cn("p-1.5 rounded-lg bg-white/5", color)}>
                {React.cloneElement(icon as React.ReactElement, { className: "h-3 w-3" })}
            </div>
        </div>
        <div className={cn("text-xl font-mono font-bold", color)}>
            {unit === "$" ? "$" : ""}{Number(value).toLocaleString()}{unit !== "$" ? ` ${unit}` : ""}
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
        <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50 text-slate-500">
            <Calendar className="h-8 w-8" />
        </div>
        <div className="max-w-xs">
            <h3 className="text-sm font-bold text-slate-300">Financial Insight</h3>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                {message}
            </p>
        </div>
    </div>
);
