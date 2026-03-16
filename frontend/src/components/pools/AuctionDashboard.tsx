import React, { useState } from 'react';
import { useAuction } from '@/hooks/useAuction';
import { useFarm } from '@/hooks/useFarm';
import { AuctionContractCard } from './AuctionContractCard';
import { AIBidderCard } from './AIBidderCard';
import { BidModal } from './BidModal';
import './AuctionDashboard.css';

export const AuctionDashboard: React.FC = () => {
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

    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [showBidModal, setShowBidModal] = useState(false);

    const handleBidClick = (contractId: string) => {
        setSelectedContractId(contractId);
        setShowBidModal(true);
    };

    const handleCommitFuture = (contractId: string) => {
        // Simple confirmation for now, could be a modal
        const contract = contracts?.find(c => c.id === contractId);
        if (!contract) return;

        if (window.confirm(`Commit to ${contractId}? Volume: ${contract.requiredVolumeKg}kg`)) {
            commitFuture.mutate({
                contractId,
                volumeKg: Number(contract.requiredVolumeKg)
            });
        }
    };

    if (isMarketLoading || isContractsLoading) {
        return (
            <div className="auction-dashboard flex items-center justify-center">
                <div className="text-amber-500 animate-pulse font-mono tracking-widest uppercase">
                    Initializing Imperial Uplink...
                </div>
            </div>
        );
    }

    const selectedContract = contracts?.find(c => c.id === selectedContractId);

    return (
        <div className="auction-dashboard">
            <div className="mechanical-hull-header">
                <div>
                    <h2 className="hull-header">The Competitive Pool</h2>
                    <p className="text-amber-100/40 text-xs">Phase 8.0: Imperial Contracts & Pre-Season Futures</p>
                </div>

                <div className="market-ticker flex flex-col items-end">
                    <span className="text-[10px] text-amber-200/50 uppercase tracking-tighter">Spot Price Index</span>
                    <span className="text-xl font-bold">
                        {marketState?.spotPrice.toString() || '0'} <small className="text-xs">PLN/KG</small>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: AI Intel */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-4 opacity-70">Market Rivals</h3>
                    <AIBidderCard
                        name="Marek"
                        archetype="The Traditionalist"
                        strategy="Stable quality, moderate prices."
                        status="idle"
                    />
                    <AIBidderCard
                        name="Kasia"
                        archetype="The Eco-Visionary"
                        strategy="Premium bio-cherries, high prestige."
                        status="active"
                    />
                    <AIBidderCard
                        name="Hans"
                        archetype="The Aggressor"
                        strategy="Massive volume, ruthless price-cutting."
                        status="outbidding"
                    />

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
                            className="bid-action-btn bg-indigo-900 border-indigo-700 text-indigo-100 mt-4"
                            onClick={() => resolveAuctions.mutate()}
                        >
                            Resolve All Contracts
                        </button>
                    )}

                    <button
                        className="w-full mt-4 py-2 border border-[#d4af37]/20 text-[#d4af37]/50 text-[10px] hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all uppercase tracking-widest"
                        onClick={refresh}
                    >
                        Refresh Intel Relay
                    </button>
                </div>

                {/* Center/Right Columns: Contracts */}
                <div className="lg:col-span-3">
                    <div className="contracts-grid">
                        {contracts && contracts.length > 0 ? (
                            contracts.map(contract => (
                                <AuctionContractCard
                                    key={contract.id}
                                    contract={contract}
                                    onBid={handleBidClick}
                                    onCommit={handleCommitFuture}
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
        </div>
    );
};
