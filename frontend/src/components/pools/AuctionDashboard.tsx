import React, { useState, useMemo } from 'react';
import { useAuction } from '@/hooks/useAuction';
import { useFarm, useCompetitors } from '@/hooks/useFarm';
import { AuctionContractCard } from './AuctionContractCard';
import { AIBidderCard } from './AIBidderCard';
import { BidModal } from './BidModal';
import { PreSeasonFutureModal } from './PreSeasonFutureModal';
import { ShortfallAlert } from './ShortfallAlert';
import { FloodFactorIndicator } from './FloodFactorIndicator';
import { useAuth } from '@/hooks/useAuth';
import './AuctionDashboard.css';

export const AuctionDashboard: React.FC = () => {
    const { backendActor } = useAuth();
    const {
        marketState,
        contracts,
        isMarketLoading,
        isContractsLoading,
        submitBid,
        commitFuture,
        resolveAuctions,
        refresh
    } = useAuction();
    const { farm } = useFarm();
    const { data: aiCompetitors } = useCompetitors();

    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [showBidModal, setShowBidModal] = useState(false);
    const [showFutureModal, setShowFutureModal] = useState(false);

    // AI Capacity Constants (matching backend defaults)
    const AI_CAPACITIES: Record<string, number> = {
        'ai_marek_GL02': 45000,
        'ai_kasia_NM01': 18000,
        'ai_hans_OPCITY': 70000
    };

    const handleBidClick = (contractId: string) => {
        setSelectedContractId(contractId);
        setShowBidModal(true);
    };

    const handleCommitClick = (contractId: string) => {
        setSelectedContractId(contractId);
        setShowFutureModal(true);
    };

    const handleConfirmFuture = (contractId: string, volumeKg: number) => {
        commitFuture.mutate({
            contractId,
            volumeKg
        }, {
            onSuccess: () => setShowFutureModal(false)
        });
    };

    // Calculate shortfall
    const shortfall = useMemo(() => {
        if (!contracts || !farm) return 0;
        const awardedVolume = (contracts as any[])
            .filter((c: any) => 'Awarded' in c.status && c.committedByPlayer[0] === farm.playerId)
            .reduce((acc: number, c: any) => acc + Number(c.requiredVolumeKg), 0);

        const totalInventory = Number(farm.inventory.cherries) + Number(farm.inventory.organicCherries);
        return Math.max(0, awardedVolume - totalInventory);
    }, [contracts, farm]);

    if (isMarketLoading || isContractsLoading) {
        return (
            <div className="auction-dashboard flex items-center justify-center h-64">
                <div className="text-amber-500 animate-pulse font-mono tracking-widest uppercase">
                    Initializing Imperial Uplink...
                </div>
            </div>
        );
    }

    const selectedContract = contracts?.find(c => c.id === selectedContractId);

    return (
        <div className="auction-dashboard space-y-6">
            <div className="mechanical-hull-header">
                <div>
                    <h2 className="hull-header">The Competitive Pool</h2>
                    <p className="text-amber-100/40 text-xs">Phase 8.0: Imperial Contracts & Pre-Season Futures</p>
                </div>

                <div className="flex items-center gap-6">
                    <FloodFactorIndicator spotPrice={Number(marketState?.spotPrice || 0)} />

                    <div className="market-ticker flex flex-col items-end">
                        <span className="text-[10px] text-amber-200/50 uppercase tracking-tighter">Spot Price Index</span>
                        <span className="text-xl font-bold">
                            {marketState?.spotPrice.toString() || '0'} <small className="text-xs">PLN/KG</small>
                        </span>
                    </div>
                </div>
            </div>

            {shortfall > 0 && (
                <ShortfallAlert
                    missingKg={shortfall}
                    spotPrice={Number(marketState?.spotPrice || 0)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: AI Intel */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-4 opacity-70">Market Rivals</h3>

                    {aiCompetitors && aiCompetitors.length > 0 ? (
                        aiCompetitors.map((ai: any) => {
                            const personality = Object.keys(ai.personality)[0];
                            const strategyState = Object.keys(ai.currentStrategy)[0];
                            const strategyLabel = strategyState; // Simplified for display
                            const status = ai.id === 'ai_hans_OPCITY' ? 'outbidding' : (ai.id === 'ai_kasia_NM01' ? 'active' : 'idle');

                            return (
                                <AIBidderCard
                                    key={ai.id}
                                    name={ai.name}
                                    archetype={personality}
                                    strategy={strategyLabel}
                                    strategyState={strategyState as any}
                                    reputation={Number(ai.reputation)}
                                    prestige={Number(ai.prestige)}
                                    inventory={Number(ai.inventoryKg)}
                                    capacity={AI_CAPACITIES[ai.id] || 50000}
                                    status={status as any}
                                />
                            );
                        })
                    ) : (
                        <div className="text-[10px] text-amber-500/30 italic text-center py-4">Scanning for regional rivals...</div>
                    )}

                    <div className="mt-8 p-4 bg-black/40 border border-[#d4af37]/10 rounded-lg">
                        <h4 className="text-amber-500 text-[10px] uppercase font-bold mb-2">Portfolio Overview</h4>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-amber-100/60">Inventory</span>
                            <span className="text-emerald-400 font-mono">
                                {(Number(farm?.inventory.cherries || 0) + Number(farm?.inventory.organicCherries || 0)).toLocaleString()} kg
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-amber-100/60">Liquidity</span>
                            <span className="text-emerald-400 font-mono">
                                {Number(farm?.cash || 0).toLocaleString()} PLN
                            </span>
                        </div>
                    </div>

                    {farm?.currentPhase && 'Storage' in farm.currentPhase && (
                        <button
                            className="bid-action-btn bg-indigo-900 border-indigo-700 text-indigo-100 mt-4 h-10"
                            onClick={() => resolveAuctions.mutate()}
                            disabled={resolveAuctions.isPending}
                        >
                            {resolveAuctions.isPending ? "Closing Pool..." : "Resolve All Contracts"}
                        </button>
                    )}

                    <button
                        className="w-full mt-2 py-2 border border-[#d4af37]/20 text-[#d4af37]/50 text-[10px] hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all uppercase tracking-widest"
                        onClick={refresh}
                    >
                        Refresh Intel Relay
                    </button>
                </div>

                {/* Center/Right Columns: Contracts */}
                <div className="lg:col-span-3">
                    <div className="contracts-grid">
                        {contracts && contracts.length > 0 ? (
                            (contracts as any[]).map((contract: any) => (
                                <AuctionContractCard
                                    key={contract.id}
                                    contract={contract}
                                    onBid={handleBidClick}
                                    onCommit={handleCommitClick}
                                />
                            ))
                        ) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#d4af37]/10 rounded-xl">
                                <span className="text-amber-100/20 uppercase tracking-[0.3em] font-light">No Active Contracts</span>
                                <span className="text-[10px] text-amber-100/10 mt-2">Wait for the next Market phase or Planning phase</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showBidModal && selectedContract && (
                <BidModal
                    isOpen={showBidModal}
                    onClose={() => setShowBidModal(false)}
                    contract={selectedContract}
                    onSubmit={(offerPrice) => {
                        submitBid.mutate({
                            contractId: selectedContract.id,
                            offerPrice
                        });
                        setShowBidModal(false);
                    }}
                />
            )}

            {showFutureModal && selectedContract && (
                <PreSeasonFutureModal
                    isOpen={showFutureModal}
                    onClose={() => setShowFutureModal(false)}
                    contract={selectedContract}
                    isSubmitting={commitFuture.isPending}
                    onConfirm={handleConfirmFuture}
                />
            )}
        </div>
    );
};
