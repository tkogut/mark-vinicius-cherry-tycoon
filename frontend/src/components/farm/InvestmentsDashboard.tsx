import React, { useState, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ParticleLayer } from '../effects/ParticleLayer';
import { useFarm } from '@/hooks/useFarm';
import { Loader2, Wrench, Sprout, TrendingUp, Zap, Box, Warehouse, Truck, Tractor, Hammer, Droplets, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SOUNDS } from '@/config/sounds';
import { useAudio } from '@/contexts/AudioContext';
import { InvestmentCard } from './InvestmentCard';
import {
    WAREHOUSE_SPOILAGE_ARMOR,
    COLD_STORAGE_SPOILAGE_ARMOR,
    COLD_STORAGE_QUALITY_PER_LEVEL,
    SPRAYER_QUALITY_PER_LEVEL,
    SHAKER_QUALITY_PER_LEVEL,
} from '@/config/gameBalanceConstants';

interface InvestmentsDashboardProps {
    onBack: () => void;
}

export const InvestmentsDashboard: React.FC<InvestmentsDashboardProps> = ({ onBack }) => {
    const { farm, upgradeGoldenHarvester, upgradeInfrastructure, isLoading } = useFarm();
    const { toast } = useToast();
    const { playSFX } = useAudio();
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
    const [hapticShake, setHapticShake] = useState(false);

    // Audio debounce
    const lastSoundRef = useRef<number>(0);
    const triggerHaptic = () => {
        const now = Date.now();
        if (now - lastSoundRef.current >= 300) {
            playSFX(SOUNDS.GAME.LEVEL_UP);
            lastSoundRef.current = now;
        }
        setHapticShake(true);
        setTimeout(() => setHapticShake(false), 500);
    };

    // Helper to get infra level
    const getLevel = (type: string) => {
        const infra = farm?.infrastructure.find(i => type in i.infraType);
        return infra ? Number(infra.level) : 0;
    };

    // --- HARVESTING TAB DATA ---
    const harvesterLevel = getLevel('GoldenHarvester');
    let harvesterCostMult = 1.0;
    for (let i = 1; i <= harvesterLevel; i++) harvesterCostMult *= 1.15;
    const harvesterBaseCost = import.meta.env.VITE_DFX_NETWORK === 'ic' ? 100000 : 10000;
    const harvesterNextCost = Math.floor(harvesterBaseCost * harvesterCostMult);

    let yieldMultiplier = 1.0;
    for (let i = 1; i <= harvesterLevel; i++) yieldMultiplier *= 1.05;

    const handleHarvesterUpgrade = async () => {
        if ((farm?.cash ?? 0) < harvesterNextCost) return;
        triggerHaptic();
        try {
            setIsUpgrading('GoldenHarvester');
            await upgradeGoldenHarvester.mutateAsync();
        } finally {
            setIsUpgrading(null);
        }
    };

    // --- LOGISTICS TAB DATA ---
    const warehouseLevel = getLevel('Warehouse');
    const coldStorageLevel = getLevel('ColdStorage');

    // Fixed costs from backend: Warehouse (25k), ColdStorage (40k)
    // For simplicity in UI level-up, we'll increment cost by 50% per level
    const warehouseNextCost = 25000 * (warehouseLevel + 1);
    const coldStorageNextCost = 40000 * (coldStorageLevel + 1);

    const handleInfraUpgrade = async (type: string, cost: number) => {
        if ((farm?.cash ?? 0) < cost) return;
        triggerHaptic();
        try {
            setIsUpgrading(type);
            await upgradeInfrastructure.mutateAsync(type);
        } finally {
            setIsUpgrading(null);
        }
    };

    // --- MACHINERY TAB DATA ---
    const tractorLevel = getLevel('Tractor');
    const shakerLevel = getLevel('Shaker');
    const sprayerLevel = getLevel('Sprayer');

    const tractorNextCost = 30000 * (tractorLevel + 1);
    const shakerNextCost = 60000 * (shakerLevel + 1);
    const sprayerNextCost = 12000 * (sprayerLevel + 1);

    return (
        <div className={`relative min-h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${hapticShake ? 'animate-shake' : ''}`}>
            {/* Background & Lighting */}
            <div className="absolute inset-0 z-0 bg-[#1a0f0f]" />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0505] to-transparent opacity-90" />

            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[100%] h-[150%] bg-gradient-to-b from-amber-200/10 to-transparent transform rotate-45 blur-3xl opacity-40 mix-blend-overlay" />
                <div className="absolute top-[-30%] left-[40%] w-[80%] h-[180%] bg-gradient-to-b from-yellow-100/15 to-transparent transform rotate-12 blur-2xl opacity-30 mix-blend-overlay" />
            </div>

            <ParticleLayer preset="GoldenPollen" />

            <div className="relative z-10 p-6 sm:p-10 flex flex-col h-full bg-black/10 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 tracking-wider uppercase filter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                            Steampunk Blueprints
                        </h1>
                        <p className="text-amber-100/60 font-medium mt-1 tracking-widest uppercase text-xs">
                            Infrastructure Bureau • Industrial Certification Phase
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/30 border border-amber-900/30 backdrop-blur-sm"
                    >
                        Return to Farm
                    </Button>
                </div>

                <Tabs defaultValue="harvesting" className="w-full">
                    <TabsList className="bg-black/40 border border-amber-900/30 h-12 p-1 mb-8">
                        <TabsTrigger value="harvesting" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-bold tracking-widest uppercase text-xs gap-2">
                            <Zap className="h-4 w-4" /> Harvesting
                        </TabsTrigger>
                        <TabsTrigger value="logistics" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-bold tracking-widest uppercase text-xs gap-2">
                            <Warehouse className="h-4 w-4" /> Logistics
                        </TabsTrigger>
                        <TabsTrigger value="machinery" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-bold tracking-widest uppercase text-xs gap-2">
                            <Hammer className="h-4 w-4" /> Machinery
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="harvesting" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InvestmentCard
                                title="Golden Harvester"
                                description="Cinematic end-game upgrade. Massive yield expansion through precision-engineered ruby injectors."
                                icon={TrendingUp}
                                level={harvesterLevel}
                                cost={harvesterNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(harvesterNextCost)}
                                isUpgrading={isUpgrading === 'GoldenHarvester'}
                                onUpgrade={handleHarvesterUpgrade}
                                stats={[
                                    { label: "Yield Bonus", value: `${(yieldMultiplier * 100).toFixed(1)}%`, trend: "+5%" },
                                    { label: "Asset Value", value: `${(harvesterLevel * 50000).toLocaleString()} PLN` }
                                ]}
                            />

                            <div className="mechanical-hull p-8 flex flex-col justify-center text-center space-y-4 border-dashed border-amber-500/20">
                                <Settings className="h-12 w-12 text-amber-500/20 mx-auto animate-spin-slow" />
                                <h3 className="text-amber-200/40 uppercase font-mono tracking-widest">Blueprint Slot Empty</h3>
                                <p className="text-amber-200/20 text-sm">Experimental Harvesting Blueprints will be revealed at Farm Level 10.</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="logistics" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InvestmentCard
                                title="Main Warehouse"
                                description={`Store cherries to time the market. Reduces spoilage by ${WAREHOUSE_SPOILAGE_ARMOR}% at season end.`}
                                icon={Box}
                                level={warehouseLevel}
                                cost={warehouseNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(warehouseNextCost)}
                                isUpgrading={isUpgrading === 'Warehouse'}
                                onUpgrade={() => handleInfraUpgrade('Warehouse', warehouseNextCost)}
                                stats={[
                                    { label: "Storage Capacity", value: `${(warehouseLevel + 1) * 10} Tons` },
                                    { label: "Spoilage Armor", value: `${WAREHOUSE_SPOILAGE_ARMOR}%`, trend: "+10%" }
                                ]}
                            />
                            <InvestmentCard
                                title="Cold Storage"
                                description={`Premium climate control. ${COLD_STORAGE_SPOILAGE_ARMOR}% spoilage protection and +${COLD_STORAGE_QUALITY_PER_LEVEL} quality per level.`}
                                icon={Warehouse}
                                level={coldStorageLevel}
                                cost={coldStorageNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(coldStorageNextCost)}
                                isUpgrading={isUpgrading === 'ColdStorage'}
                                onUpgrade={() => handleInfraUpgrade('ColdStorage', coldStorageNextCost)}
                                stats={[
                                    { label: "Est. Quality Bonus", value: `+${coldStorageLevel * COLD_STORAGE_QUALITY_PER_LEVEL} Pts`, trend: `+${COLD_STORAGE_QUALITY_PER_LEVEL}` },
                                    { label: "Spoilage Armor", value: `${COLD_STORAGE_SPOILAGE_ARMOR}%`, trend: "+5%" }
                                ]}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="machinery" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InvestmentCard
                                title="Iron Horse Tractor"
                                description="Reduces reliance on village labor. Improves overall cultivation efficiency."
                                icon={Tractor}
                                level={tractorLevel}
                                cost={tractorNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(tractorNextCost)}
                                isUpgrading={isUpgrading === 'Tractor'}
                                onUpgrade={() => handleInfraUpgrade('Tractor', tractorNextCost)}
                                stats={[
                                    { label: "Labor Cost", value: `-${tractorLevel * 15}%`, trend: "-15%" },
                                    { label: "Yield Bonus", value: "+5%", trend: "+5%" }
                                ]}
                            />
                            <InvestmentCard
                                title="Steam Shaker"
                                description="Mechanical harvesting at scale. Drastically cuts costs but reduces fruit quality."
                                icon={Hammer}
                                level={shakerLevel}
                                cost={shakerNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(shakerNextCost)}
                                isUpgrading={isUpgrading === 'Shaker'}
                                onUpgrade={() => handleInfraUpgrade('Shaker', shakerNextCost)}
                                stats={[
                                    { label: "Labor Cost", value: `-${shakerLevel * 30}%`, trend: "-30%" },
                                    { label: "Quality Penalty", value: `${SHAKER_QUALITY_PER_LEVEL} Pts`, trend: "Flat" }
                                ]}
                            />
                            <InvestmentCard
                                title="Ruby Sprayer"
                                description="Automated pesticide and mist delivery. Lowers disease risk and grows perfect fruit."
                                icon={Droplets}
                                level={sprayerLevel}
                                cost={sprayerNextCost}
                                canAfford={(farm?.cash ?? 0n) >= BigInt(sprayerNextCost)}
                                isUpgrading={isUpgrading === 'Sprayer'}
                                onUpgrade={() => handleInfraUpgrade('Sprayer', sprayerNextCost)}
                                stats={[
                                    { label: "Disease Resist", value: "High" },
                                    { label: "Quality Bonus", value: `+${sprayerLevel * SPRAYER_QUALITY_PER_LEVEL} Pts`, trend: `+${SPRAYER_QUALITY_PER_LEVEL}` }
                                ]}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
