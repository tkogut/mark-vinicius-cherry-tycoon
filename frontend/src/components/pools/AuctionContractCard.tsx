import React from 'react';
import { AuctionContract } from '@/declarations/backend.did';
import './AuctionDashboard.css';

interface AuctionContractCardProps {
    contract: AuctionContract;
    onBid: (contractId: string) => void;
    onCommit: (contractId: string) => void;
}

export const AuctionContractCard: React.FC<AuctionContractCardProps> = ({
    contract,
    onBid,
    onCommit
}) => {
    const isPreSeason = contract.isPreSeason;

    // Helper to extract category name from variant
    const getCategoryClass = () => {
        if ('Bio' in contract.category) return 'category-bio';
        if ('Industrial' in contract.category) return 'category-industrial';
        if ('Export' in contract.category) return 'category-export';
        return '';
    };

    const getCategoryLabel = () => {
        if ('Bio' in contract.category) return 'Organic Portfolio';
        if ('Industrial' in contract.category) return 'Industrial Supply';
        if ('Export' in contract.category) return 'Global Export';
        return 'Unknown';
    };

    const getStatusLabel = () => {
        if ('Open' in contract.status) return 'OPEN FOR OFFERS';
        if ('Awarded' in contract.status) return 'CONTRACT AWARDED';
        if ('Fulfilled' in contract.status) return 'SUCCESSFULLY FULFILLED';
        if ('Defaulted' in contract.status) return 'CONTRACT DEFAULTED';
        return 'CLOSED';
    };

    const isOpen = 'Open' in contract.status;

    return (
        <div className={`contract-card ${!isOpen ? 'opacity-75 grayscale-[0.3]' : ''}`}>
            <div className={`category-badge ${getCategoryClass()}`}>
                {getCategoryLabel()}
            </div>

            <h3 className="text-lg font-bold text-amber-900 mb-2">{contract.id}</h3>

            <div className="contract-stats mt-4">
                <div className="contract-stat">
                    <span className="stat-label">Requirement:</span>
                    <span className="stat-value">{contract.requiredVolumeKg.toString()} kg</span>
                </div>

                <div className="contract-stat">
                    <span className="stat-label">Base Price:</span>
                    <span className="stat-value">{contract.basePricePLN.toString()} PLN/kg</span>
                </div>

                {isPreSeason && contract.lockedPricePLN[0] !== undefined && (
                    <div className="contract-stat">
                        <span className="stat-label text-blue-800">Futures Price:</span>
                        <span className="stat-value text-blue-900">{contract.lockedPricePLN[0].toString()} PLN/kg</span>
                    </div>
                )}

                <div className={`mt-4 text-center py-1 border border-black/10 rounded font-mono text-xs ${isOpen ? 'text-emerald-700' : 'text-red-700'}`}>
                    {getStatusLabel()}
                </div>
            </div>

            <div className="card-actions">
                {isPreSeason ? (
                    <button
                        className="bid-action-btn"
                        disabled={!isOpen}
                        onClick={() => onCommit(contract.id)}
                    >
                        Commit to Future
                    </button>
                ) : (
                    <button
                        className="bid-action-btn"
                        disabled={!isOpen}
                        onClick={() => onBid(contract.id)}
                    >
                        Submit Bid
                    </button>
                )}
            </div>

            {/* Steam Vent trigger point */}
            {isOpen && (
                <div className="steam-vent" style={{ left: '10%', bottom: '20%' }}></div>
            )}
        </div>
    );
};
