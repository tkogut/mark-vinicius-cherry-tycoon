import React from 'react';
import { useYearlyInsights } from '@/hooks/useFarm';
import { useGuestYearlyInsights } from '@/hooks/useGuestFarm';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Info, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function PlanningBoard() {
    const { isAuthenticated } = useAuth();

    // Use real or mock insights depending on auth state
    const realInsights = useYearlyInsights();
    const guestInsights = useGuestYearlyInsights();

    const { data: insights, isLoading, isError } = isAuthenticated ? realInsights : guestInsights;

    return (
        <Card className="bg-[#1e1a16] border-[#3d2e1f] text-amber-100 shadow-xl overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-[#161210] border-b border-[#3d2e1f] px-6 py-4 flex flex-row items-center gap-4">
                <div className="p-3 bg-amber-950/30 rounded-full border border-amber-900/50 shadow-inner">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <CardTitle className="text-xl font-serif text-amber-500 tracking-wide">
                        The Governor's Planning Board
                    </CardTitle>
                    <CardDescription className="text-amber-200/60 font-serif">
                        Strategic Analytics & Victorian Market Insights
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-6 bg-[url('/noise.png')] bg-repeat opacity-95">
                <div className="bg-[#161210] border border-[#3d2e1f]/80 rounded-lg p-5 shadow-inner">
                    <h3 className="text-sm font-mono text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#3d2e1f]/50 pb-2">
                        <Info className="w-4 h-4" />
                        Annual Directorate Report
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-amber-500/50">
                            <RefreshCcw className="w-8 h-8 animate-spin mb-3" />
                            <p className="font-serif italic">Compiling steam-driven calculations...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-rose-400 font-serif italic py-4 text-center">
                            The analytical engine experienced a mechanical fault. Could not retrieve insights.
                        </div>
                    ) : !insights || insights.length === 0 ? (
                        <div className="text-amber-200/50 font-serif italic py-4 text-center">
                            No reports available for this fiscal period.
                        </div>
                    ) : (
                        <ScrollArea className="h-[200px] w-full rounded-md pr-4">
                            <div className="space-y-4">
                                {insights.map((insight: string, idx: number) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-md border border-amber-900/40 bg-[#1e1a16] shadow-md relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-600 to-amber-900" />
                                        <div className="flex-1 font-serif text-amber-100/90 leading-relaxed text-sm lg:text-base">
                                            <span className="text-amber-500 font-bold mr-2 text-lg leading-none">"</span>
                                            {insight}
                                            <span className="text-amber-500 font-bold ml-1 text-lg leading-none">"</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
