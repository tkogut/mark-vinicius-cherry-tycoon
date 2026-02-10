import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Coins, TrendingUp, Truck, Store, MapPin, Calendar, Users, AlertTriangle, Leaf } from "lucide-react";
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { useFarm } from '@/hooks/useFarm';

interface SellModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSell: (amount: number, type: 'wholesale' | 'retail') => Promise<void>;
    totalCherries: number;
    isLoading?: boolean;
}

export const SellModal: React.FC<SellModalProps> = ({
    isOpen,
    onClose,
    onSell,
    totalCherries,
    isLoading
}) => {
    const [amount, setAmount] = useState<number>(0);
    const [saleType, setSaleType] = useState<'wholesale' | 'retail'>('wholesale');
    const { data: prices, isLoading: pricesLoading } = useMarketPrices();
    const { farm } = useFarm();

    // Reset amount when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount(Math.floor(totalCherries / 2)); // Default to half inventory
        }
    }, [isOpen, totalCherries]);

    // --- Dynamic Price Calculation ---
    // This logic mimics what the backend *should* essentially do in Phase 4.
    // We visualize it here to give immediate feedback to the user.

    const pricingFactors = useMemo(() => {
        if (!prices || !farm) return null;

        const base = saleType === 'wholesale'
            ? Number(prices.wholesaleBasePrice)
            : Number(prices.retailBasePrice);

        // 1. Season Modifier
        const seasonKey = Object.keys(farm.currentSeason)[0]; // "Spring", "Summer", etc.
        let seasonMod = 1.0;
        if (seasonKey === 'Winter') seasonMod = 1.4; // Scarcity
        if (seasonKey === 'Spring') seasonMod = 1.2; // Early demand
        if (seasonKey === 'Summer') seasonMod = 0.9; // Glut
        if (seasonKey === 'Autumn') seasonMod = 1.0;

        // 2. Population / Market Access (Retail only)
        // Default to 1.0 if no parcel info, or use first parcel's region
        let popMod = 1.0;
        let regionName = "Unknown Region";
        let population = 0;

        if (farm.parcels.length > 0) {
            const region = farm.parcels[0].region;
            regionName = region.commune;
            try {
                population = Number(region.population);
            } catch (e) { population = 50000; } // Fallback

            if (saleType === 'retail') {
                // Larger population = higher willingness to pay / better market
                // Normalize around 50k population. Max bonus 1.5x at 200k+
                popMod = 0.8 + (Math.min(population, 200000) / 200000) * 0.7;
            }
        }

        // 3. Volume Penalty (Saturation)
        // Selling too much at once lowers the unit price
        // Wholesale absorbs more volume better than retail
        let volumePenalty = 1.0;
        if (amount > 0) {
            const saturationPoint = saleType === 'wholesale' ? 5000 : 500;
            const saturation = amount / saturationPoint;
            // Decay curve: 1 / (1 + saturation * 0.1)
            volumePenalty = 1 / (1 + (saturation * 0.2));
        }

        const finalUnitPrice = base * seasonMod * popMod * volumePenalty * prices.demandMultiplier;

        // 4. Organic Premium (Retail Only)
        let organicMod = 1.0;
        const hasOrganicCertified = farm.parcels.some(p => p.organicCertified);
        if (saleType === 'retail' && hasOrganicCertified) {
            organicMod = 1.4;
        }

        return {
            base,
            season: seasonKey,
            seasonMod,
            regionName,
            population,
            popMod,
            volumePenalty,
            hasOrganicCertified,
            organicMod,
            finalUnitPrice: Math.max(1, finalUnitPrice * organicMod) // Minimum 1
        };

    }, [prices, farm, saleType, amount]);

    const handleSell = () => {
        if (amount > 0) {
            onSell(amount, saleType);
            onClose();
        }
    };

    const estimatedTotal = Math.floor(amount * (pricingFactors?.finalUnitPrice || 0));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-light">
                        <Coins className="h-6 w-6 text-amber-500" />
                        Market Exchange
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Sell your harvest on the open market. Prices fluctuate based on season, demand, and local population.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Market Channel Selector */}
                    <Tabs value={saleType} onValueChange={(v) => setSaleType(v as 'wholesale' | 'retail')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl h-auto">
                            <TabsTrigger
                                value="wholesale"
                                className="data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 py-3 px-4 rounded-lg transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Truck className="h-4 w-4" />
                                        <span className="font-semibold">Wholesale Distributor</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-normal">High Volume • Steady Price • Low Margin</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="retail"
                                className="data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-400 py-3 px-4 rounded-lg transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Store className="h-4 w-4" />
                                        <span className="font-semibold">Local Retail Market</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-normal">Low Volume • Volatile • High Margin</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6 flex flex-col md:flex-row gap-6">

                            {/* Left Col: Controls */}
                            <div className="flex-1 space-y-6">
                                <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="amount" className="text-slate-200 font-medium">Quantity to Sell</Label>
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-700">
                                            Max: {totalCherries.toLocaleString()}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <Slider
                                            value={[amount]}
                                            onValueChange={(vals) => setAmount(vals[0])}
                                            max={totalCherries}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Math.min(totalCherries, Math.max(0, parseInt(e.target.value) || 0)))}
                                            className="w-24 bg-slate-950 border-slate-700 text-right font-mono text-white"
                                        />
                                    </div>
                                </div>

                                {/* Economic Breakdown */}
                                {pricingFactors && (
                                    <div className="space-y-2 text-sm bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price Composition</h4>

                                        <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                            <span className="text-slate-400">Base Price</span>
                                            <span className="font-mono text-slate-200">{pricingFactors.base.toFixed(2)} PLN</span>
                                        </div>

                                        <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-sky-400" /> Season ({pricingFactors.season})
                                            </span>
                                            <span className={`font-mono ${pricingFactors.seasonMod > 1 ? 'text-emerald-400' : (pricingFactors.seasonMod < 1 ? 'text-rose-400' : 'text-slate-400')}`}>
                                                x{pricingFactors.seasonMod.toFixed(2)}
                                            </span>
                                        </div>

                                        {saleType === 'retail' ? (
                                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                                <span className="text-slate-400 flex items-center gap-2">
                                                    <Users className="h-3 w-3 text-indigo-400" /> Population ({Math.floor(pricingFactors.population / 1000)}k)
                                                </span>
                                                <span className={`font-mono ${pricingFactors.popMod > 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    x{pricingFactors.popMod.toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50 opacity-50">
                                                <span className="text-slate-500 flex items-center gap-2">
                                                    <Users className="h-3 w-3" /> Population
                                                </span>
                                                <span className="text-[10px] text-slate-600">N/A (Wholesale)</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3 text-rose-400" /> Vol. Saturation
                                            </span>
                                            <span className={`font-mono ${pricingFactors.volumePenalty < 0.9 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                                                x{pricingFactors.volumePenalty.toFixed(2)}
                                            </span>
                                        </div>

                                        {pricingFactors.hasOrganicCertified && (
                                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                                <span className="text-emerald-400 flex items-center gap-2">
                                                    <Leaf className="h-3 w-3" /> Organic Premium
                                                </span>
                                                <span className="font-mono text-emerald-400 font-bold">
                                                    x{pricingFactors.organicMod.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Receipt */}
                            <div className="w-full md:w-56 bg-slate-900 rounded-xl p-5 flex flex-col justify-between border border-slate-800 shadow-xl">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Unit Price</span>
                                    <div className="text-3xl font-bold text-white mt-1">
                                        {pricingFactors?.finalUnitPrice.toFixed(2)} <span className="text-sm font-normal text-slate-400">PLN</span>
                                    </div>
                                    <div className="text-xs text-emerald-500/80 mt-1 flex items-center">
                                        Live Market Rate
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Separator className="bg-slate-800" />

                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Revenue</span>
                                        <div className="text-3xl font-bold text-emerald-400 mt-2 truncate tracking-tight">
                                            ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>

                                    {saleType === 'retail' && amount > 500 && (
                                        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg flex gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-500/90 leading-relaxed font-medium">
                                                High retail volume saturates the local market. Try <span className="underline cursor-pointer" onClick={() => setSaleType('wholesale')}>Wholesale</span> for bulk.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </Tabs>
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    <div className="text-[10px] text-slate-600 hidden sm:block">
                        * Final price determined by server at moment of transaction
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                        <Button
                            onClick={handleSell}
                            disabled={amount <= 0 || isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-lg shadow-emerald-900/20"
                        >
                            {isLoading ? "Processing Sale..." : `Confirm Sale`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
