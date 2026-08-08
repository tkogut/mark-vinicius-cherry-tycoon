import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuctionContract } from '@/declarations/backend.did';
import { TrendingUp, ShieldCheck, Coins } from 'lucide-react';

interface PreSeasonFutureModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: AuctionContract;
    onConfirm: (contractId: string, volumeKg: number) => void;
    isSubmitting: boolean;
}

export const PreSeasonFutureModal: React.FC<PreSeasonFutureModalProps> = ({
    isOpen,
    onClose,
    contract,
    onConfirm,
    isSubmitting
}) => {
    const lockedPrice = contract.lockedPricePLN[0] ? Number(contract.lockedPricePLN[0]) : 0;
    const basePrice = Number(contract.basePricePLN);
    const volume = Number(contract.requiredVolumeKg);
    const commitmentFee = Math.floor(volume * lockedPrice * 0.05); // 5% fee

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] bg-slate-900 border-[#d4af37]/30 text-slate-100 mechanical-hull">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center text-blue-100">Imperial Future Commitment</DialogTitle>
                    <DialogDescription className="text-slate-400 text-center">
                        Secure your harvest revenue early with a Pre-Season Future contract.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/40 border border-[#d4af37]/10 rounded-lg">
                            <span className="text-[10px] uppercase text-amber-500/50 font-bold block mb-1">Locked Price</span>
                            <div className="text-xl font-mono text-emerald-400">{lockedPrice} <small className="text-[10px]">PLN/KG</small></div>
                            <span className="text-[9px] text-slate-500 italic">vs {basePrice} PLN base</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-[#d4af37]/10 rounded-lg">
                            <span className="text-[10px] uppercase text-amber-500/50 font-bold block mb-1">Required Volume</span>
                            <div className="text-xl font-mono text-blue-400">{volume.toLocaleString()} <small className="text-[10px]">KG</small></div>
                            <span className="text-[9px] text-slate-500 italic">Strict fulfillment</span>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider">Security Discount</h4>
                                <p className="text-[10px] text-blue-300/70 mt-1">
                                    Price is locked at a 7% discount to protect against market fluctuations.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 pt-2 border-t border-blue-500/10">
                            <Coins className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">Commitment Fee</h4>
                                <p className="text-lg font-mono text-amber-400">
                                    {commitmentFee.toLocaleString()} <small className="text-xs font-sans">PLN</small>
                                </p>
                                <p className="text-[10px] text-amber-300/50">
                                    Non-refundable 5% deposit required immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        Decline
                    </Button>
                    <Button
                        onClick={() => onConfirm(contract.id, volume)}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        {isSubmitting ? "Processing..." : "Authorize Commitment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
