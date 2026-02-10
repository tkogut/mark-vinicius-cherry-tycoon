import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface InfrastructureItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    effect: string;
    type: 'Building' | 'Machinery';
}

const MARKET_ITEMS: InfrastructureItem[] = [
    {
        id: 'Warehouse',
        name: 'Warehouse',
        description: 'Basic storage for harvested cherries.',
        cost: 25000,
        icon: <Warehouse className="h-6 w-6" />,
        effect: 'Reduces seasonal spoilage to 20%',
        type: 'Building'
    },
    {
        id: 'ColdStorage',
        name: 'Cold Storage',
        description: 'Advanced climate-controlled storage.',
        cost: 40000,
        icon: <Snowflake className="h-6 w-6" />,
        effect: 'Reduces seasonal spoilage to 5%',
        type: 'Building'
    },
    {
        id: 'ProcessingFacility',
        name: 'Processing Plant',
        description: 'Enable on-site sorting and cleaning.',
        cost: 100000,
        icon: <Factory className="h-6 w-6" />,
        effect: 'Increases wholesale base price by 15%',
        type: 'Building'
    },
    {
        id: 'SocialFacilities',
        name: 'Social Facilities',
        description: 'Better conditions for seasonal workers.',
        cost: 15000,
        icon: <Users className="h-6 w-6" />,
        effect: '-5% Labor Costs',
        type: 'Building'
    },
    {
        id: 'Tractor',
        name: 'Modern Tractor',
        description: 'Versatile farm vehicle for soil work.',
        cost: 30000,
        icon: <Truck className="h-6 w-6" />,
        effect: '-15% Labor Costs',
        type: 'Machinery'
    },
    {
        id: 'Shaker',
        name: 'Mechanical Shaker',
        description: 'Automated harvesting attachment.',
        cost: 60000,
        icon: <Zap className="h-6 w-6" />,
        effect: '-30% Labor Costs (Stackable)',
        type: 'Machinery'
    },
    {
        id: 'Sprayer',
        name: 'Precision Sprayer',
        description: 'Efficient delivery of soil treatments.',
        cost: 12000,
        icon: <Droplets className="h-6 w-6" />,
        effect: 'Reduces fertilizer usage cost by 10%',
        type: 'Machinery'
    }
];

interface MarketplaceProps {
    cash: bigint;
    ownedInfrastructure: any[]; // Infrastructure type from backend
    onPurchase: (id: string) => void;
    isLoading?: boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ cash, ownedInfrastructure, onPurchase, isLoading }) => {

    const isOwned = (id: string) => {
        return ownedInfrastructure.some(infra => {
            const type = Object.keys(infra.infraType)[0];
            return type === id;
        });
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
                            "p-2 rounded-lg",
                            owned ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                        )}>
                            {item.icon}
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

                    <Button
                        className={cn(
                            "w-full mt-4 h-9 text-xs font-bold transition-all",
                            owned
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
                        )}
                        disabled={owned || !canAfford || isLoading}
                        onClick={() => onPurchase(item.id)}
                    >
                        {owned ? "OWNED" : (isLoading ? "PURCHASING..." : "PURCHASE")}
                    </Button>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-10 py-4">
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
        </div>
    );
};
