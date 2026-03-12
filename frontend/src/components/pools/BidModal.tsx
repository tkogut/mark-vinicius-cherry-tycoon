import React, { useState } from 'react';
import { ImperialDial } from '../ui/ImperialDial';
import { EmeraldGauge } from '../ui/EmeraldGauge';
import { RivalCard, RivalStatus } from './RivalCard';
import { SteampunkTooltip } from '../ui/SteampunkTooltip';
import { HelpCircle } from 'lucide-react';

const RivalryDeck = () => {
    return (
        <div className="absolute -top-12 left-0 right-0 flex justify-center gap-4 z-40 pointer-events-none scale-[0.75] origin-bottom">
            <RivalCard name="Marek" status="outbidding" />
            <RivalCard name="Kasia" status="idle" />
            <RivalCard name="Hans" status="active" />
        </div>
    );
};

export const BidModal: React.FC = () => {
    const [bidValue, setBidValue] = useState(5000);
    const [showHelp, setShowHelp] = useState(false);
    const [hoveredEl, setHoveredEl] = useState<string | null>(null);

    // Example V_bid score preview (mock logic)
    const estimatedVbid = Math.floor(bidValue * 1.5 + 200);

    const isVisible = (id: string) => showHelp || hoveredEl === id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="mechanical-hull w-full max-w-md p-6 flex flex-col items-center gap-6">

                <div className="w-full text-center relative">
                    <h2 className="hull-header text-xl">Imperial Contract Bid</h2>
                    <p className="text-sm text-yellow-500/70 mt-1">Set your competitive offer</p>

                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className={`absolute top-0 right-0 p-2 rounded-full transition-all border ${showHelp ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-[#d4af37]/30 text-[#d4af37]/60'} hover:border-[#d4af37]/80 hover:text-[#d4af37] shadow-lg`}
                        title="Toggle Help Clouds"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>

                {/* Rival Card Slot at top */}
                <div className="w-full relative top-[30px]">
                    <RivalryDeck />
                </div>

                <div className="w-full flex flex-row items-end justify-start gap-2 sm:gap-4 py-8 pl-0 pr-20 relative z-50 -left-[5px] top-[30px]">
                    {/* LEFT GAUGE */}
                    <div className="flex-shrink-0 w-16 relative -left-[10px]">
                        <SteampunkTooltip
                            content="Reflects the quality and rarity of raw Aetheric materials gathered from your parcels."
                            isVisible={isVisible('harvest')}
                            position="top"
                        >
                            <div onMouseEnter={() => setHoveredEl('harvest')} onMouseLeave={() => setHoveredEl(null)}>
                                <EmeraldGauge value={85} label="Harvest" />
                            </div>
                        </SteampunkTooltip>
                    </div>

                    {/* CENTRAL DIAL - SCALED UP BY 10% FOR v1.8 */}
                    <div className="flex-shrink-0 w-[154px] sm:w-[176px] flex flex-col items-center relative -top-[10px]">
                        <SteampunkTooltip
                            content="The price per ton you are willing to accept. Adjusting in increments of 1000 PLN/t allows for grosze-level precision in the final tally."
                            isVisible={isVisible('price')}
                            position="top"
                        >
                            <div onMouseEnter={() => setHoveredEl('price')} onMouseLeave={() => setHoveredEl(null)}>
                                <ImperialDial
                                    value={bidValue}
                                    min={1000}
                                    max={15000}
                                    onChange={setBidValue}
                                    label="OFFER PRICE (per ton)"
                                />
                            </div>
                        </SteampunkTooltip>
                    </div>

                    {/* RIGHT GAUGES - SYMMETRIC GROUP */}
                    <div className="flex flex-row items-end gap-3 sm:gap-6 flex-shrink-0 w-[130px] sm:w-[160px] justify-end">
                        <SteampunkTooltip
                            content="Current space available in your cargo holds for incoming Contract materials."
                            isVisible={isVisible('storage')}
                            position="bottom"
                            className="ml-[-80px]"
                        >
                            <div className="relative -left-[5px]" onMouseEnter={() => setHoveredEl('storage')} onMouseLeave={() => setHoveredEl(null)}>
                                <EmeraldGauge value={40} label="Storage" />
                            </div>
                        </SteampunkTooltip>

                        <SteampunkTooltip
                            content="Reflects the dedication and precision of your labor force. High morale ensures better contract compliance."
                            isVisible={isVisible('morale')}
                            position="left"
                        >
                            <div
                                className="relative -left-[13px]"
                                onMouseEnter={() => setHoveredEl('morale')}
                                onMouseLeave={() => setHoveredEl(null)}
                            >
                                <EmeraldGauge value={95} label="Morale" />
                            </div>
                        </SteampunkTooltip>
                    </div>
                </div>

                <SteampunkTooltip
                    content="The overall score of your bid, calculated based on price, quality, and prestige."
                    isVisible={isVisible('score')}
                    position="bottom"
                    className="mt-[-50px]"
                >
                    <div
                        className="w-full p-4 bg-black/50 border border-[#d4af37]/20 rounded-xl flex justify-between items-center shadow-inner cursor-help"
                        onMouseEnter={() => setHoveredEl('score')}
                        onMouseLeave={() => setHoveredEl(null)}
                    >
                        <span className="text-[#b87333] text-sm uppercase tracking-widest font-bold">Est. V-Bid Score</span>
                        <span className="text-emerald-400 font-mono text-xl ml-4">{estimatedVbid.toLocaleString()}</span>
                    </div>
                </SteampunkTooltip>

                <div className="w-full grid grid-cols-2 gap-4 mt-2">
                    <button
                        className="py-3 px-4 bg-red-900/40 border border-red-500/30 text-red-200 rounded-lg uppercase tracking-wider text-sm font-bold hover:bg-red-900/60 transition-colors"
                    >
                        Withdraw
                    </button>
                    <button
                        className="py-3 px-4 bg-[#b87333]/20 border border-[#d4af37]/50 text-[#d4af37] rounded-lg uppercase tracking-wider text-sm font-bold hover:bg-[#d4af37]/20 hover:text-yellow-300 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    >
                        Seal Bid
                    </button>
                </div>

            </div>
        </div>
    );
};
