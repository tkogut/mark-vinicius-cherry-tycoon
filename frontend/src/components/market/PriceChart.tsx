import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PricePoint {
    season: string; // e.g. "Year 1 Spring"
    wholesale: number;
    retail: number;
}

// Mock data for Phase 5.4 - in real app this would come from backend history
const MOCK_HISTORY: PricePoint[] = [
    { season: "Y1 Spr", wholesale: 5.2, retail: 12.5 },
    { season: "Y1 Sum", wholesale: 4.8, retail: 11.2 },
    { season: "Y1 Aut", wholesale: 5.5, retail: 12.8 },
    { season: "Y1 Win", wholesale: 6.2, retail: 14.5 },
    { season: "Y2 Spr", wholesale: 5.8, retail: 13.2 },
    { season: "Y2 Sum", wholesale: 5.1, retail: 11.8 },
];

export const PriceChart: React.FC = () => {
    const data = MOCK_HISTORY;
    const maxPrice = Math.max(...data.map(d => Math.max(d.wholesale, d.retail))) * 1.1;
    const minPrice = 0;
    const height = 200;
    const width = 600;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth;
    const getY = (price: number) => height - padding - (price / maxPrice) * chartHeight;

    const pointsWholesale = data.map((d, i) => `${getX(i)},${getY(d.wholesale)}`).join(" ");
    const pointsRetail = data.map((d, i) => `${getX(i)},${getY(d.retail)}`).join(" ");

    // Calculate trend
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const trendRetail = last.retail > prev.retail ? 'up' : last.retail < prev.retail ? 'down' : 'flat';

    return (
        <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Market Price Trends</CardTitle>
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendRetail === 'up' ? 'text-emerald-400' : trendRetail === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                        {trendRetail === 'up' && <TrendingUp className="h-3 w-3" />}
                        {trendRetail === 'down' && <TrendingDown className="h-3 w-3" />}
                        {trendRetail === 'flat' && <Minus className="h-3 w-3" />}
                        Last Season
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative h-[200px] w-full overflow-hidden">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                            <line
                                key={p}
                                x1={padding}
                                y1={height - padding - p * chartHeight}
                                x2={width - padding}
                                y2={height - padding - p * chartHeight}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                opacity="0.3"
                            />
                        ))}

                        {/* Retail Line */}
                        <polyline
                            points={pointsRetail}
                            fill="none"
                            stroke="#10b981" // emerald-500
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Wholesale Line */}
                        <polyline
                            points={pointsWholesale}
                            fill="none"
                            stroke="#0ea5e9" // sky-500
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data Points (Retail) */}
                        {data.map((d, i) => (
                            <g key={`r-${i}`}>
                                <circle cx={getX(i)} cy={getY(d.retail)} r="3" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                                <text x={getX(i)} y={getY(d.retail) - 8} textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="bold">
                                    ${d.retail}
                                </text>
                            </g>
                        ))}
                        {/* Data Points (Wholesale) - only every other label to avoid clutter */}
                        {data.map((d, i) => (
                            <g key={`w-${i}`}>
                                <circle cx={getX(i)} cy={getY(d.wholesale)} r="3" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="2" />
                            </g>
                        ))}

                        {/* X Axis Labels */}
                        {data.map((d, i) => (
                            <text key={`l-${i}`} x={getX(i)} y={height - 5} textAnchor="middle" fontSize="10" fill="#64748b">
                                {d.season}
                            </text>
                        ))}
                    </svg>
                </div>
                <div className="flex gap-4 justify-center mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-400">Retail</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                        <span className="text-slate-400">Wholesale</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
