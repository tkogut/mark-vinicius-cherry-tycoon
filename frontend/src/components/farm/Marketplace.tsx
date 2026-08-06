import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PriceChart } from "@/components/market/PriceChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Warehouse,
    Snowflake,
    Factory,
    Users,
    Truck,
    Zap,
    Droplets,
    Shield,
    TrendingDown,
    Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStability } from '@/hooks/useFarm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { isActionAllowed, SeasonPhase, PHASE_LABELS } from '@/config/phaseConstants';
import { drawModernTractor, drawPrecisionSprayer, drawMechanicalShaker, drawBranchPruner } from './orchardMachines';

const MACHINE_THUMBNAIL_DRAW_FNS: Record<string, (ctx: CanvasRenderingContext2D, seed: number) => void> = {
    tractor: drawModernTractor,
    sprayer: drawPrecisionSprayer,
    shaker: drawMechanicalShaker,
    pruner: drawBranchPruner,
};

/** Static single-frame render of the real orchard machine model (sketch 002 / orchardMachines.ts) as a Marketplace card thumbnail — same art the machine uses when walking the orchard, not a generic icon. */
const MachineThumbnail: React.FC<{ machineType: string }> = ({ machineType }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const drawFn = MACHINE_THUMBNAIL_DRAW_FNS[machineType];
        if (drawFn) drawFn(ctx, 0);
    }, [machineType]);
    return <canvas ref={canvasRef} width={200} height={200} style={{ width: '100%', height: '100%' }} />;
};

// Building types with a seasonal raster sprite set — extracted+cleaned from
// AI-generated reference sheets (see tmp/extracted-buildings/), one per
// season, transparent background, served from
// frontend/public/assets/buildings/<folder>/<season>.png.
//
// Cold Storage and Warehouse have TWO art sets (an "l1" and a visibly bigger,
// more detailed "l2"/upgraded set) — real Infrastructure.level is 1-5, but we
// only have art for two tiers so far, so level >= 2 shows the l2 set and
// everything else (including not-yet-purchased, level 0) shows l1. Processing
// Plant and Social Facilities only have one art set so far; adding an l2 set
// later just means adding a second entry to LEVELED_BUILDING_FOLDERS below.
type BuildingSpriteType = 'coldStorage' | 'warehouse' | 'processingPlant' | 'socialFacilities';

const LEVELED_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, { l1: string; l2: string }>> = {
    coldStorage: { l1: 'cold-storage-l1', l2: 'cold-storage-l2' },
    warehouse: { l1: 'warehouse-l1', l2: 'warehouse-l2' },
};
const SINGLE_TIER_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, string>> = {
    processingPlant: 'processing-plant',
    socialFacilities: 'social-facilities',
};

function buildingSpriteFolder(buildingType: BuildingSpriteType, level: number): string {
    const leveled = LEVELED_BUILDING_FOLDERS[buildingType];
    if (leveled) return level >= 2 ? leveled.l2 : leveled.l1;
    return SINGLE_TIER_BUILDING_FOLDERS[buildingType] ?? '';
}

const BUILDING_SPRITE_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
type BuildingSpriteSeason = typeof BUILDING_SPRITE_SEASONS[number];

/** Extracts the season key ("Spring"/"Summer"/...) from a backend season variant object like `{ Spring: null }`, lowercased to match the sprite filenames. Falls back to 'spring' if unrecognized. */
function seasonKeyFromBackend(season: any): BuildingSpriteSeason {
    const raw = season && typeof season === 'object' ? Object.keys(season)[0] : season;
    const lower = String(raw || '').toLowerCase();
    return (BUILDING_SPRITE_SEASONS as readonly string[]).includes(lower) ? (lower as BuildingSpriteSeason) : 'spring';
}

/** Real seasonal (and, for buildings with more than one art tier, level-aware) raster sprite — same pre-rendered art in every season the game recognizes, swapped by an <img> src change rather than redrawn. */
const BuildingSprite: React.FC<{ buildingType: BuildingSpriteType; season: any; level: number }> = ({ buildingType, season, level }) => {
    const seasonKey = seasonKeyFromBackend(season);
    const folder = buildingSpriteFolder(buildingType, level);
    const src = `/assets/buildings/${folder}/${seasonKey}.png`;
    return <img src={src} alt="" className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />;
};

interface InfrastructureItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    effect: string;
    type: 'Building' | 'Machinery';
    /** When set, the Marketplace card shows the real Geometric Brass model (orchardMachines.ts) instead of `icon`. */
    machineType?: 'tractor' | 'sprayer' | 'shaker' | 'pruner';
    /** When set, the Marketplace card shows a real seasonal raster sprite (BuildingSprite) instead of `icon`. */
    buildingType?: BuildingSpriteType;
}

const MARKET_ITEMS: InfrastructureItem[] = [
    {
        id: 'Warehouse',
        name: 'Warehouse',
        description: 'Basic storage for harvested cherries.',
        cost: 25000,
        icon: <Warehouse className="h-6 w-6" />,
        effect: 'Spoilage Armor: 20% — retains 20% of stored cherries',
        type: 'Building',
        buildingType: 'warehouse'
    },
    {
        id: 'ColdStorage',
        name: 'Cold Storage',
        description: 'Advanced climate-controlled storage.',
        cost: 40000,
        icon: <Snowflake className="h-6 w-6" />,
        effect: 'Spoilage Armor: 80% — retains 80% of stored cherries',
        type: 'Building',
        buildingType: 'coldStorage'
    },
    {
        id: 'ProcessingFacility',
        name: 'Processing Plant',
        description: 'Enable on-site sorting and cleaning.',
        cost: 100000,
        icon: <Factory className="h-6 w-6" />,
        effect: 'Increases wholesale base price by 15%',
        type: 'Building',
        buildingType: 'processingPlant'
    },
    {
        id: 'SocialFacilities',
        name: 'Social Facilities',
        description: 'Better conditions for seasonal workers.',
        cost: 15000,
        icon: <Users className="h-6 w-6" />,
        effect: '-5% Labor Costs',
        type: 'Building',
        buildingType: 'socialFacilities'
    },
    {
        id: 'Tractor',
        name: 'Modern Tractor',
        description: 'Versatile farm vehicle for soil work.',
        cost: 30000,
        icon: <Truck className="h-6 w-6" />,
        effect: '-15% Labor Costs',
        type: 'Machinery',
        machineType: 'tractor'
    },
    {
        id: 'Shaker',
        name: 'Mechanical Shaker',
        description: 'Automated harvesting attachment.',
        cost: 60000,
        icon: <Zap className="h-6 w-6" />,
        effect: '-30% Labor Costs (Stackable)',
        type: 'Machinery',
        machineType: 'shaker'
    },
    {
        id: 'Sprayer',
        name: 'Precision Sprayer',
        description: 'Efficient delivery of soil treatments.',
        cost: 12000,
        icon: <Droplets className="h-6 w-6" />,
        effect: 'Reduces fertilizer usage cost by 10%',
        type: 'Machinery',
        machineType: 'sprayer'
    },
    {
        id: 'Pruner',
        name: 'Branch Pruner',
        description: 'Wheeled automated branch-trimming unit.',
        cost: 18000,
        icon: <Wrench className="h-6 w-6" />,
        effect: '-10% Labor Costs · +Quality Score per level',
        type: 'Machinery',
        machineType: 'pruner'
    }
];

interface MarketplaceProps {
    cash: bigint;
    ownedInfrastructure: any[]; // Infrastructure type from backend
    onPurchase: (id: string) => void;
    isLoading?: boolean;
    currentPhase?: SeasonPhase | string;
    /** Backend season variant, e.g. `{ Spring: null }` — picks which BuildingSprite image to show. Optional so existing callers keep working; defaults to spring. */
    season?: any;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ cash, ownedInfrastructure, onPurchase, isLoading, currentPhase, season }) => {
    // Normalize currentPhase
    const phaseKey = (typeof currentPhase === 'string'
        ? currentPhase
        : (currentPhase ? Object.keys(currentPhase)[0] : 'Planning')) as SeasonPhase;

    const canBuy = isActionAllowed(phaseKey, 'buy_infrastructure');

    const { data: stability } = useStability();
    const estimatedSurvivalCost = stability?.estimatedCost ? Number(stability.estimatedCost) : 0;

    const isOwned = (id: string) => {
        return ownedInfrastructure.some(infra => {
            const type = Object.keys(infra.infraType)[0];
            return type === id;
        });
    };

    /** Current level of an owned infrastructure item, 0 if not owned — feeds BuildingSprite's l1/l2 art tier selection. */
    const getLevel = (id: string): number => {
        const infra = ownedInfrastructure.find(i => Object.keys(i.infraType)[0] === id);
        return infra ? Number(infra.level) : 0;
    };

    const renderItem = (item: InfrastructureItem) => {
        const owned = isOwned(item.id);
        const canAfford = Number(cash) >= item.cost;

        return (
            <Card key={item.id} className={cn(
                "relative overflow-hidden border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300",
                owned && "border-emerald-500/30 bg-emerald-950/5"
            )}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className={cn(
                            (item.machineType || item.buildingType) ? "p-1 rounded-lg w-16 h-16" : "p-2 rounded-lg",
                            owned ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                        )}>
                            {item.machineType ? <MachineThumbnail machineType={item.machineType} />
                                : item.buildingType ? <BuildingSprite buildingType={item.buildingType} season={season} level={getLevel(item.id)} />
                                : item.icon}
                        </div>
                        {owned ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Installed
                            </Badge>
                        ) : (
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cost</span>
                                <span className={cn(
                                    "text-sm font-mono font-bold",
                                    canAfford ? "text-amber-400" : "text-rose-400"
                                )}>
                                    ${item.cost.toLocaleString()}
                                </span>
                                {(Number(cash) - item.cost < estimatedSurvivalCost) && Number(cash) >= item.cost && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1 cursor-help hover:text-amber-400">
                                                    <AlertCircle className="h-3 w-3" />
                                                    FINANCIAL RISK
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] bg-slate-800 border-slate-700 text-slate-100">
                                                <p>Buying this item might leave you with too little cash to reach the next harvest.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <span className="text-[10px] text-slate-500 font-medium mt-1">
                                    Upkeep: ${item.type === 'Machinery' ? (item.cost * 0.02) : (item.cost * 0.01)} / season
                                </span>
                            </div>
                        )}
                    </div>
                    <CardTitle className="mt-4 text-lg text-slate-100">{item.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-xs leading-relaxed">
                        {item.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                        <TrendingDown className="h-3 w-3" />
                        <span>Effect: {item.effect}</span>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        className={cn(
                                            "w-full mt-4 h-9 text-xs font-bold transition-all",
                                            owned
                                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                                : (!canBuy ? "bg-slate-800 text-slate-500 opacity-60" : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20")
                                        )}
                                        disabled={owned || !canAfford || isLoading || !canBuy}
                                        onClick={() => onPurchase(item.id)}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        {owned ? "OWNED" : (isLoading ? "PURCHASING..." : "PURCHASE")}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!canBuy && !owned && (
                                <TooltipContent className="bg-hull border-slate-700">
                                    <p>Purchases restricted to {PHASE_LABELS['Investment']} phase</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-10 py-4">
            {/* Market Trends Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">Market Analytics</h3>
                        <p className="text-xs text-slate-500">Historical price data for Wholesale vs Retail channels.</p>
                    </div>
                </div>
                <PriceChart />
            </section>
            {/* Buildings Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Warehouse className="h-5 w-5 text-rose-500" />
                    <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">Main Assets & Buildings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MARKET_ITEMS.filter(i => i.type === 'Building').map(renderItem)}
                </div>
            </section>

            {/* Machinery Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Wrench className="h-5 w-5 text-rose-500" />
                    <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">Machinery & Logistics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MARKET_ITEMS.filter(i => i.type === 'Machinery').map(renderItem)}
                </div>
            </section>

            <div className="flex justify-center mt-12 pb-12">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                    Produced by JaPiTo Group
                </span>
            </div>
        </div>
    );
};
