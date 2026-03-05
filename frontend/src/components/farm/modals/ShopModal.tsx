import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Zap, Map, Lock, Sparkles } from "lucide-react";

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <ShoppingBag className="h-5 w-5 text-rose-500" />
                        </div>
                        <Badge variant="outline" className="border-rose-500/50 text-rose-400 animate-pulse">
                            Coming Soon
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">JaPiTo Premium Marketplace</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enhance your agricultural empire with advanced stimulants and geographic expansions.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                    {/* Consumable Boosts Section */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col gap-3 relative grayscale opacity-60">
                        <div className="absolute top-3 right-3">
                            <Lock className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold">Bio-Stimulants</h3>
                        </div>
                        <p className="text-xs text-slate-500">Boost yield and tree health for a limited duration.</p>
                        <Button disabled size="sm" className="mt-2 bg-slate-800">Locked</Button>
                    </div>

                    {/* Map Expansion Section */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col gap-3 relative grayscale opacity-60">
                        <div className="absolute top-3 right-3">
                            <Lock className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Map className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold">Strategic Map</h3>
                        </div>
                        <p className="text-xs text-slate-500">Expand your production to other regions of Poland.</p>
                        <Button disabled size="sm" className="mt-2 bg-slate-800">Locked</Button>
                    </div>

                    {/* Special Assets Section */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col gap-3 relative grayscale opacity-60">
                        <div className="absolute top-3 right-3">
                            <Lock className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold">Unique Visuals</h3>
                        </div>
                        <p className="text-xs text-slate-500">Premium farm skins and cinematic effects.</p>
                        <Button disabled size="sm" className="mt-2 bg-slate-800">Locked</Button>
                    </div>
                </div>

                <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-300 leading-relaxed">
                        <span className="font-bold">CHERRY Credits</span> will be the primary currency for these upgrades.
                        They will be obtainable through seasonal performance milestones and direct acquisition.
                    </p>
                </div>

                <DialogFooter className="mt-4 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Produced by JaPiTo Group</span>
                        <Button onClick={onClose} variant="secondary">Close</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
