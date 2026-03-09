import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGuestFarm } from '@/hooks/useGuestFarm';
import { ShoppingCart, Leaf, FlaskConical, Beaker, Factory } from 'lucide-react';

interface ProcurementModalProps {
    onPurchased: () => void;
    onClose: () => void;
}

export function ProcurementModal({ onPurchased, onClose }: ProcurementModalProps) {
    const { farm, buySupplies } = useGuestFarm();
    const [selectedSupply, setSelectedSupply] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(10);

    if (!farm) return null;

    const market = farm.inputMarket;
    const currentCash = Number(farm.cash);

    const supplies = [
        {
            id: "Fertilizer",
            name: "NPK Fertilizer",
            description: "Standard industrial yield booster.",
            price: Number(market.fertilizerPrice),
            icon: Factory,
            color: "text-amber-500",
            bgHover: "hover:border-amber-500/50 hover:bg-amber-950/30"
        },
        {
            id: "Pesticide",
            name: "Chemical Pesticide",
            description: "Aggressive pest control.",
            price: Number(market.pesticidePrice),
            icon: FlaskConical,
            color: "text-rose-500",
            bgHover: "hover:border-rose-500/50 hover:bg-rose-950/30"
        },
        {
            id: "OrganicTreatment",
            name: "Organic Treatment",
            description: "Victorian botanic brew. Certified safe.",
            price: Number(market.organicTreatmentPrice),
            icon: Leaf,
            color: "text-emerald-500",
            bgHover: "hover:border-emerald-500/50 hover:bg-emerald-950/30"
        }
    ];

    const handlePurchase = async () => {
        if (!selectedSupply) return;
        try {
            await buySupplies.mutateAsync({ supplyType: selectedSupply, amount });
            onPurchased();
        } catch (e) {
            console.error("Failed to purchase supplies", e);
        }
    };

    const selectedItem = supplies.find(s => s.id === selectedSupply);
    const totalCost = selectedItem ? selectedItem.price * amount : 0;
    const canAfford = currentCash >= totalCost;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl bg-[#1e1a16] border-[#3d2e1f] shadow-2xl overflow-hidden shadow-black/50 text-amber-100 flex flex-col max-h-[90vh]">
                <CardHeader className="border-b border-[#3d2e1f] bg-[#161210] shrink-0 sticky top-0 z-10 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-serif text-amber-500 flex items-center gap-2">
                                <ShoppingCart className="w-6 h-6" />
                                The Market Cooperative
                            </CardTitle>
                            <CardDescription className="text-amber-200/70 mt-1 font-serif">
                                Secure your seasonal supplies. Prices will inflate by 5% annually.
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-amber-500/70 uppercase tracking-widest font-mono">Treasury</div>
                            <div className="text-xl font-bold font-mono tracking-tight text-emerald-400">
                                {currentCash.toLocaleString()} PLN
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {supplies.map(supply => {
                            const Icon = supply.icon;
                            const isSelected = selectedSupply === supply.id;
                            return (
                                <button
                                    key={supply.id}
                                    onClick={() => setSelectedSupply(supply.id)}
                                    className={`relative p-4 rounded-lg border text-left transition-all duration-300 w-full flex flex-col justify-between ${isSelected
                                            ? `border-${supply.color.split('-')[1]}-500 bg-[#2a241e] ring-1 ring-${supply.color.split('-')[1]}-500/50 shadow-inner`
                                            : `border-[#3d2e1f] bg-[#161210] ${supply.bgHover}`
                                        }`}
                                >
                                    <div className="mb-4">
                                        <Icon className={`w-8 h-8 mb-3 ${supply.color}`} />
                                        <h3 className="font-bold text-lg leading-tight mb-1 font-serif text-amber-100">{supply.name}</h3>
                                        <p className="text-xs text-amber-100/60 leading-snug">{supply.description}</p>
                                    </div>
                                    <div>
                                        <div className="text-sm text-amber-500 uppercase tracking-wider mb-1">Market Price</div>
                                        <div className="text-xl font-mono text-emerald-400 font-bold">{supply.price} PLN</div>
                                        <div className="text-xs text-amber-100/40 mt-1 uppercase font-mono tracking-wider">Per Unit</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedSupply && (
                        <div className="mt-8 bg-[#161210] border border-[#3d2e1f] rounded-lg p-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                                <div className="flex-1 space-y-3 w-full">
                                    <label className="text-sm text-amber-500 uppercase tracking-widest font-mono">Requisition Quantity</label>
                                    <div className="flex items-center gap-4 bg-[#0d0a08] p-2 rounded-lg border border-[#3d2e1f]">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setAmount(Math.max(1, amount - 10))}
                                            className="text-amber-500 hover:text-amber-400 hover:bg-[#1a1512]"
                                        >
                                            -
                                        </Button>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="bg-transparent border-none text-center font-mono text-xl w-24 text-amber-100 focus:ring-0 appearance-none"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setAmount(amount + 10)}
                                            className="text-amber-500 hover:text-amber-400 hover:bg-[#1a1512]"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-right flex-1 w-full border-t md:border-t-0 md:border-l border-[#3d2e1f]/50 pt-4 md:pt-0 md:pl-6">
                                    <div className="text-sm text-amber-500/70 uppercase tracking-widest font-mono mb-1">Total Authorization</div>
                                    <div className={`text-3xl font-mono font-bold tracking-tight mb-2 ${canAfford ? 'text-emerald-400' : 'text-rose-500'}`}>
                                        {totalCost.toLocaleString()} PLN
                                    </div>
                                    {canAfford ? (
                                        <div className="text-xs text-emerald-400/70 border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 rounded inline-block uppercase font-mono tracking-wider">
                                            Funds Available
                                        </div>
                                    ) : (
                                        <div className="text-xs text-rose-500/70 border border-rose-900/50 bg-rose-950/20 px-2 py-1 rounded inline-block uppercase font-mono tracking-wider">
                                            Insufficient Treasury
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#3d2e1f]">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-[#3d2e1f] text-amber-100/70 hover:text-amber-100 hover:bg-[#2a241e] font-sans h-12 px-6"
                        >
                            Cancel Order
                        </Button>

                        <Button
                            onClick={handlePurchase}
                            disabled={buySupplies.isPending || !selectedSupply || !canAfford}
                            className={`h-12 px-8 font-bold font-serif uppercase tracking-wider transition-all duration-300 ${buySupplies.isPending
                                    ? 'bg-amber-900/50 text-amber-100/50'
                                    : canAfford && selectedSupply
                                        ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(4,120,87,0.4)] border border-emerald-500/50'
                                        : 'bg-[#2a241e] text-amber-100/30'
                                }`}
                        >
                            {buySupplies.isPending ? "Processing..." : "Authorize Transaction"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
