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
import { Sprout, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

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
                        <div className="flex justify-between items-center px-4 py-2 bg-slate-950/50 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider text-[10px]">Total Cost</span>
                            <span className={`font-mono font-bold ${parseInt(amount) * 50 > Number(userCash) ? 'text-rose-500' : 'text-amber-400'}`}>
                                ${(parseInt(amount) * 50).toLocaleString()} PLN
                            </span>
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
