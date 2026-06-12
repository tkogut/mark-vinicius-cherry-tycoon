import React, { useState } from 'react';
import { EmeraldGauge } from '../ui/EmeraldGauge';
import { ImperialDial } from '../ui/ImperialDial';
import { RotatingGears } from '../effects/RotatingGears';
import { Button } from '@/components/ui/button';
import { useGuestFarm } from '@/hooks/useGuestFarm';

export const MainDashboard: React.FC = () => {
    const { farm } = useGuestFarm();
    const [enginePower, setEnginePower] = useState(75);

    const totalCherries = farm ? Number(farm.inventory.cherries) + Number(farm.inventory.organicCherries) : 0;
    const organicCherries = farm ? Number(farm.inventory.organicCherries) : 0;

    const storagePercentage = Math.min(100, Math.max(0, (totalCherries / 50000) * 100)) + 15;
    const organicPercentage = Math.min(100, Math.max(0, (organicCherries / 20000) * 100)) + 5;

    return (
        <div className="mechanical-hull w-full h-full flex flex-col justify-center relative isolate overflow-hidden">
            <div className="god-ray-45"></div>
            <RotatingGears className="opacity-20 translate-y-20" />

            <div className="mahogany-plate brass-rim w-full h-full z-10 shadow-2xl flex items-center justify-between px-4 md:px-8">

                 {/* LEFT: Diagnostics HUD */}
                <div className="flex-1 max-w-sm">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 brass-rim shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                        <h3 className="hull-header text-xs mb-2 text-center tracking-[0.2em]">Diagnostics</h3>
                        <div className="grid grid-cols-2 gap-1.5 text-center">
                            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                                <p className="text-slate-400 text-[9px] uppercase font-mono tracking-widest leading-none mb-1">Phase</p>
                                <p className="text-amber-400 font-bold text-xs leading-none drop-shadow-md">
                                    {farm?.currentPhase ? Object.keys(farm.currentPhase)[0] : 'Idle'}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                                <p className="text-slate-400 text-[9px] uppercase font-mono tracking-widest leading-none mb-1">Treasury</p>
                                <p className="text-amber-400 font-bold text-xs leading-none drop-shadow-md">
                                    {farm ? Number(farm.cash).toLocaleString() : 0} <span className="text-[9px]">PLN</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: The Engine Dial & Button */}
                <div className="flex flex-col items-center justify-center gap-1.5 z-10 px-4">
                    <div className="origin-center transition-transform">
                        <ImperialDial
                            value={enginePower}
                            min={0}
                            max={100}
                            onChange={setEnginePower}
                            label="STEAM PRESSURE"
                        />
                    </div>
                    <Button
                        className="bg-gradient-to-b from-[#d4af37] via-[#b87333] to-[#8a5a00] hover:from-[#f5d08a] hover:via-[#d4af37] hover:to-[#b87333] text-black font-extrabold border border-[#ffdf99] shadow-[0_0_10px_rgba(201,168,76,0.5)] transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.8)] px-5 py-1.5 h-8 text-[10px] uppercase tracking-[0.1em] rounded-lg mt-1 relative z-20"
                        onClick={() => console.log('Go to Auction')}
                    >
                        Market Auction
                    </Button>
                </div>

                {/* RIGHT: Emerald Gauges */}
                <div className="flex-1 max-w-sm flex justify-end gap-2 md:gap-4">
                    <div className="flex flex-col items-center bg-black/40 p-2 rounded-xl brass-rim backdrop-blur-sm origin-bottom-right">
                        <EmeraldGauge value={storagePercentage > 100 ? 100 : storagePercentage} label="Reserves" />
                        <div className="text-emerald-400 font-mono font-bold text-center text-xs drop-shadow-[0_0_8px_rgba(80,200,120,0.6)] mt-0.5">
                            {totalCherries >= 1000 ? `${(totalCherries / 1000).toFixed(1)}t` : `${totalCherries}kg`}
                        </div>
                    </div>
                    <div className="flex flex-col items-center bg-black/40 p-2 rounded-xl brass-rim backdrop-blur-sm origin-bottom-right">
                        <EmeraldGauge value={organicPercentage > 100 ? 100 : organicPercentage} label="Organic" />
                        <div className="text-emerald-400 font-mono font-bold text-center text-xs drop-shadow-[0_0_8px_rgba(80,200,120,0.6)] mt-0.5">
                            {organicCherries >= 1000 ? `${(organicCherries / 1000).toFixed(1)}t` : `${organicCherries}kg`}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
