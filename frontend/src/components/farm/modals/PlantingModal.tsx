import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useStability } from '@/hooks/useFarm';
import { cn } from '@/lib/utils';

interface PlantingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => Promise<void>;
    maxTrees: number; // e.g. based on parcel size or cash
    userCash: bigint;
}

export const PlantingModal: React.FC<PlantingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    maxTrees,
    userCash
}) => {
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { data: stability } = useStability();
    const estimatedSurvivalCost = stability?.estimatedCost ? Number(stability.estimatedCost) : 0;

    const handlePlant = async () => {
        const numTrees = parseInt(amount);
        if (isNaN(numTrees) || numTrees <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid number of trees to plant.",
            });
            return;
        }

        if (numTrees > maxTrees) {
            toast({
                variant: "destructive",
                title: "Limit Exceeded",
                description: `You can only plant up to ${maxTrees} trees here.`,
            });
            return;
        }

        try {
            setLoading(true);
            await onConfirm(numTrees);
            setAmount('');
            onClose();
            toast({
                title: "Planting Successful!",
                description: `You have planted ${numTrees} cherry trees.`,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Planting Failed",
                description: "Something went wrong while planting. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-400">
                        <Sprout className="h-5 w-5" />
                        Plant Cherry Trees
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Choose how many trees to plant in this parcel.
                        <br />
                        <span className="text-xs text-slate-500">
                            Each tree costs 50 cash. Max capacity: {maxTrees} trees.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trees" className="text-right text-slate-300">
                            Trees
                        </Label>
                        <Input
                            id="trees"
                            type="number"
                            placeholder="e.g. 50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500"
                            autoFocus
                        />
                    </div>

                    {amount && !isNaN(parseInt(amount)) && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-4 py-2 bg-slate-950/50 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider text-[10px]">Total Cost</span>
                                <span className={cn(
                                    "font-mono font-bold",
                                    parseInt(amount) * 50 > Number(userCash) ? 'text-rose-500' : 'text-amber-400'
                                )}>
                                    ${(parseInt(amount) * 50).toLocaleString()} PLN
                                </span>
                            </div>

                            {(Number(userCash) - (parseInt(amount) * 50) < estimatedSurvivalCost) && Number(userCash) >= (parseInt(amount) * 50) && (
                                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-[10px] text-amber-200 leading-normal">
                                        <span className="font-bold text-amber-500 block mb-0.5">FINANCIAL RISK</span>
                                        This investment might leave you with insufficient funds to reach the next harvest season (Need: ${estimatedSurvivalCost.toLocaleString()} PLN).
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handlePlant} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? "Planting..." : "Confirm Planting"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
