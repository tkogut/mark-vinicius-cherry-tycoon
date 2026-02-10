import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Coins, TrendingUp, Truck, Store } from "lucide-react";
import { useMarketPrices } from '@/hooks/useMarketPrices';

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

    useEffect(() => {
        if (isOpen) {
            setAmount(totalCherries);
        }
    }, [isOpen, totalCherries]);

    const handleSell = () => {
        if (amount > 0) {
            onSell(amount, saleType);
            onClose();
        }
    };

    const getPrice = (type: 'wholesale' | 'retail') => {
        if (!prices) return 0;
        const base = type === 'wholesale' ? Number(prices.wholesaleBasePrice) : Number(prices.retailBasePrice);
        const multiplier = prices.demandMultiplier * prices.seasonMultiplier;
        // Note: Backend might calculate differently, this is for estimation
        // Actually backend logic: price = base * quality * demand * season
        // We don't have exact quality here (it's per parcel), so we show base range or just base * multipliers

        // Conservative estimate using just base for now, or base * multipliers
        return Math.floor(base * multiplier);
    };

    const estimatedTotal = amount * getPrice(saleType);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Coins className="h-6 w-6 text-amber-500" />
                        Sell Harvest
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Choose your market channel and quantity.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Market Selection */}
                    <Tabs value={saleType} onValueChange={(v) => setSaleType(v as 'wholesale' | 'retail')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                            <TabsTrigger value="wholesale" className="data-[state=active]:bg-slate-700">
                                <Truck className="h-4 w-4 mr-2" />
                                Wholesale
                            </TabsTrigger>
                            <TabsTrigger value="retail" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-400">
                                <Store className="h-4 w-4 mr-2" />
                                Retail
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-300">Current Price</span>
                                {pricesLoading ? (
                                    <span className="text-xs text-slate-500">Loading markets...</span>
                                ) : (
                                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                                        ${getPrice(saleType)} / cherry
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">
                                {saleType === 'wholesale'
                                    ? "Instant sale to distributors. Lower price, guaranteed bulk purchase."
                                    : "Direct to customers. Higher price, subject to market demand."}
                            </p>
                            {prices && (
                                <div className="mt-2 text-[10px] text-slate-400 flex gap-2">
                                    <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Demand: x{prices.demandMultiplier.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </Tabs>

                    {/* Quantity Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="amount" className="text-slate-300">Quantity</Label>
                            <span className="text-xs text-slate-400 font-mono">Available: {totalCherries}</span>
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
                                className="w-20 bg-slate-800 border-slate-700 text-slate-100 text-right h-8"
                            />
                        </div>
                    </div>

                    {/* Total Estimated */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                        <span className="text-sm font-medium text-slate-400">Estimated Revenue</span>
                        <span className="text-2xl font-bold font-mono text-emerald-400">
                            ${estimatedTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSell}
                        disabled={amount <= 0 || isLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isLoading ? "Selling..." : "Confirm Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
