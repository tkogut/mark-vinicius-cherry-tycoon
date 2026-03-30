import React, { useMemo, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface ImperialOrchardProps {
    parcels: any[];
    season: any;
    county?: 'Nyski' | 'Brzeski' | 'Opolski' | string;
    onAction: (action: 'water' | 'prune' | 'fertilize' | 'harvest' | 'plant' | 'select' | 'organic', parcelId: string | null) => void;
    automationConfig?: { hasHarvesters: boolean };
}

// --- Isometric Projection Calibrator (2D Algebraic) constants ---
const TILE_W = 96;  // 120% Scaling (from 80)
const TILE_H = 48;  // 120% Scaling (from 40)
const SECTOR_SIZE = 5; // 5x5 grid
const SECTOR_GAP = 72; // 120% Scaling (from 60)

// Helper to project grid coordinates (rows, cols) + sector offset to 2D screen coordinates
const projectToIso = (row: number, col: number, sectorIdx: number = 0) => {
    // Basic Iso Math
    const base = {
        x: (col - row) * (TILE_W / 2),
        y: (col + row) * (TILE_H / 2)
    };

    // Sector Offset (Horizontal layout of sectors for now)
    const sectorOffset = sectorIdx * ((SECTOR_SIZE * TILE_W) + SECTOR_GAP);

    return {
        x: base.x + sectorOffset,
        y: base.y
    };
};

// Map Backend Season to Visual Specs & Tokens (Colors for the 3D Miniatures)
const getSeasonStyles = (seasonObj: any) => {
    // High-Contrast 'Caramel Wood' ( Peru/SaddleBrown base for visibility)
    const brightTrunk = '#CD853F';
    if (!seasonObj) return { phase: 'Dormancy', trunk: brightTrunk, leaves: 'transparent', fruit: 'transparent', vfx: 'snow' };
    const season = Object.keys(seasonObj)[0];
    switch (season) {
        case 'Winter': return { phase: 'Dormancy', trunk: brightTrunk, leaves: 'transparent', fruit: 'transparent', vfx: 'glacier-frost' };
        case 'Spring': return { phase: 'Awakening', trunk: '#8B4513', leaves: ['#368d53ff', '#364b23ff', '#379c64ff', '#04aa57ff', '#228b22'], fruit: 'transparent', vfx: 'steam' };
        case 'LateSpring': return { phase: 'Bloom', trunk: '#B8860B', leaves: ['#ffffff', '#f0fff0', '#f5fffa', '#fffafa', '#fdf5e6'], fruit: 'transparent', vfx: 'pollen' };
        case 'Summer': return { phase: 'Harvest', trunk: '#8B4513', leaves: ['#006400', '#004d00', '#1b4d3e', '#228b22', '#32cd32'], fruit: '#8B1A1A', vfx: 'smoke' };
        case 'Autumn': return { phase: 'Decay', trunk: brightTrunk, leaves: ['#b88c1dff', '#974747ff', '#5d664dff', '#8B4513', '#D2691E'], fruit: 'transparent', vfx: 'falling_leaves' };
        default: return { phase: 'Dormancy', trunk: brightTrunk, leaves: 'transparent', fruit: 'transparent', vfx: 'none' };
    }
};

const getCountyStyles = (county: string) => {
    switch (county) {
        case 'Nyski':
            return {
                bg: 'bg-[#1a0f0d]', // Very dark red/brown
                overlay: 'radial-gradient(circle at center, rgba(255,100,50,0.05) 0%, transparent 70%)',
                mist: null
            };
        case 'Brzeski':
            return {
                bg: 'bg-[#0a1018]', // Deep navy
                overlay: 'radial-gradient(circle at center, rgba(100,200,255,0.05) 0%, transparent 70%)',
                mist: 'bg-gradient-to-t from-[#8ab4f811] to-transparent animate-pulse'
            };
        case 'Opolski':
        default:
            return {
                bg: 'bg-[#141516]', // Industrial charcoal
                overlay: 'radial-gradient(circle at center, rgba(255,215,0,0.05) 0%, transparent 70%)',
                mist: null
            };
    }
};

// --- CSS 3D Components ---

const SeasonalVFX = React.memo(({ season }: { season: string }) => {
    if (season === 'Dormancy') {
        // Winter Frost Mist
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/40 blur-[2px] rounded-full animate-[frost_10s_ease-in-out_infinite]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>
        );
    }
    return null;
});

// Recursive Branching (L-System Logic)
const Branch = ({ length, angle, depth, maxDepth, trunkColor, isWinter, seed = 0 }: any) => {
    if (depth >= maxDepth) return null;

    // Deterministic chaotic offset for snow
    const snowX = Math.sin(seed + depth * 0.7) * 4;
    const snowY = Math.cos(seed + depth * 1.3) * 2;

    return (
        <div
            className="absolute origin-bottom transition-all duration-1000 pointer-events-none"
            style={{
                bottom: '100%',
                left: '50%',
                width: `${Math.max(4, 12 - depth * 2.5)}px`, // Massive (12px base)
                height: `${length}px`,
                background: trunkColor,
                transform: `translateX(-50%) rotate(${angle}deg)`,
                opacity: 1 - depth * 0.05
            }}
        >
            <Branch length={length * 0.7} angle={-25 + (Math.sin(seed + depth) * 10)} depth={depth + 1} maxDepth={maxDepth} trunkColor={trunkColor} isWinter={isWinter} seed={seed + 1} />
            <Branch length={length * 0.7} angle={25 - (Math.cos(seed + depth) * 10)} depth={depth + 1} maxDepth={maxDepth} trunkColor={trunkColor} isWinter={isWinter} seed={seed + 2} />

            {/* Clinging Snow (Inner-branch integration) */}
            {isWinter && (
                <div
                    className="absolute top-0 left-1/2 w-4 h-2 bg-white/90 rounded-full blur-[0.8px] shadow-sm z-50"
                    style={{
                        transform: `translate(calc(-50% + ${snowX}px), ${snowY}px) scale(${1 - depth * 0.1})`,
                        opacity: 0.8 + Math.random() * 0.2
                    }}
                />
            )}
            {isWinter && depth > 0 && (
                <div
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full blur-[1px] z-50"
                    style={{ transform: `translate(calc(-50% + ${-snowX / 2}px), 0px)` }}
                />
            )}
        </div>
    );
};

const GroundParcel = React.memo(({ x, y, isSelected, onClick, styles, parcelId }: any) => {
    return (
        <div
            onClick={onClick}
            data-parcel-id={parcelId}
            className={cn(
                "absolute cursor-pointer transition-all duration-300",
                isSelected ? "z-50" : "z-0"
            )}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${TILE_W}px`,
                height: `${TILE_H}px`,
                transform: 'translate(-50%, -50%)', // Center it on the projected point
            }}
        >
            {/* The Isometric Diamond (Ground) */}
            <div
                className={cn(
                    "w-full h-full border border-[#C9A84C]/40",
                    isSelected ? "bg-white/10" : "bg-[#2a1b18]"
                )}
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Clean Diamond
                    boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.3)' : 'none',
                    background: isSelected
                        ? 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, #2a1b18 100%)'
                        : styles.boardSurface || '#2a1b18'
                }}
            />

            {/* Precise Grid Lines (Mosiężna siatka) */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    backgroundImage: `linear-gradient(45deg, #8C7853 1px, transparent 1px), linear-gradient(-45deg, #8C7853 1px, transparent 1px)`,
                    backgroundSize: `${TILE_W / 4}px ${TILE_H / 2}px`,
                    backgroundPosition: 'center center'
                }}
            />
        </div>
    );
});

const MechanicalTree = React.memo(({ x, y, isSelected, styles, onClick, seed = 0, parcel, isHarvested }: any) => {
    const isWinter = styles.phase === 'Dormancy';
    const isSummer = styles.phase === 'Harvest';
    const isAutumn = styles.phase === 'Decay';

    // Perlin-style Wind Synchronization (Spatial Wave Motion)
    const windPhase = useMemo(() => (x / 200 + y / 200) * -2, [x, y]);

    // Randomized leaf cluster (Fixed per-tree based on seed)
    const leafClusters = useMemo(() => {
        return Array.from({ length: 18 }).map((_, i) => { // Increased count for density
            const angle = (i / 18) * Math.PI * 2 + (Math.sin(seed + i) * 0.4);
            const dist = 4 + (Math.abs(Math.sin(seed * (i + 1))) * 15); // Spread further
            const lx = Math.cos(angle) * dist;
            const ly = Math.sin(angle) * (dist * 0.7);
            const size = 14 + (Math.abs(Math.cos(seed + i)) * 11); // Upscaled by ~10%
            return { lx, ly, size, colorIdx: i % 5 };
        });
    }, [seed]);

    const fruitPositions = useMemo(() => {
        // More uniform radial distribution (Golden Angle Spiral derivative)
        return Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 137.5 * Math.PI) / 180; // Golden angle for even spread
            const dist = 6 + (Math.sqrt(i) * 5.5); // Square root spread for uniform density
            return {
                lx: Math.cos(angle) * dist,
                ly: Math.sin(angle) * (dist * 0.7) // Squashed for isometric perspective
            };
        });
    }, [seed]);

    const renderCrown = () => {
        if (isWinter) return null;

        return (
            <div className="absolute inset-0 pointer-events-none transition-all duration-1000 z-20">
                {/* 1. Blurred Leaf Crown (Metaballs Effect) */}
                <div style={{ filter: 'blur(3.5px) contrast(160%) brightness(1.05)', position: 'absolute', inset: 0 }}>
                    {leafClusters.map((leaf, i) => {
                        const dynamicSize = isSummer ? leaf.size * 1.5 : leaf.size;
                        let color = Array.isArray(styles.leaves) ? styles.leaves[leaf.colorIdx] : styles.leaves;

                        return (
                            <div
                                key={`leaf-${i}`}
                                className="absolute rounded-full"
                                style={{
                                    width: `${dynamicSize}px`,
                                    height: `${dynamicSize}px`,
                                    left: `calc(50% + ${leaf.lx}px)`,
                                    bottom: `calc(32px + ${leaf.ly}px)`,
                                    background: color,
                                    transform: 'translate(-50%, 0)',
                                    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        );
                    })}
                </div>

                {/* 2. Sharp Fruits (Summer Cherries) - Outside the blur filter */}
                {isSummer && !isHarvested && (
                    <div className="absolute inset-0 pointer-events-none">
                        {fruitPositions.map((fruit, i) => (
                            <div
                                key={`cherry-${i}`}
                                className="absolute w-2.5 h-2.5 rounded-full bg-[#8B1A1A]"
                                style={{
                                    left: `calc(50% + ${fruit.lx}px)`,
                                    bottom: `calc(42px + ${fruit.ly}px)`,
                                    boxShadow: '0 0 5px rgba(255,0,0,0.8)',
                                    zIndex: 100
                                }}
                            >
                                {/* Shimmer Glint (Tiny Jewelry Highlight) */}
                                <div className="absolute top-[20%] left-[20%] w-[1.2px] h-[1.2px] bg-white rounded-full shadow-[0_0_2px_white] animate-[pulse_2s_infinite]" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            data-parcel-id={parcel.id}
            className={cn("absolute origin-bottom transition-all duration-300 cursor-pointer")}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: '60px',
                height: '60px',
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 9999 : undefined // Only override if explicitly selected
            }}
        >
            {/* Shadow (Black-Gray Expanded for 120%) */}
            <div className="absolute w-14 h-7 bg-[rgba(30,30,30,0.45)] rounded-full blur-[4px] pointer-events-none" style={{ left: '50%', bottom: '-4px', transform: 'translate(-50%, 0) scale(1, 0.4)' }} />

            {/* Base Ring (Brass Tank) */}
            <div className="absolute w-7 h-3 rounded-full border border-black/40 pointer-events-none" style={{ left: '50%', bottom: '-1px', transform: 'translate(-50%, 0)', background: 'radial-gradient(circle at center, #B87333 10%, #C9A84C 100%)', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }} />

            {/* Tree Structure */}
            <div className="h-full w-full flex flex-col items-center justify-end relative" style={{ animation: `wind-sway 6s ease-in-out infinite alternate`, animationDelay: `${windPhase}s` }}>
                {renderCrown()}

                {/* Fixed Tree Structure: Separate Visual Trunk from Recursive Branches to prevent clipping */}
                <div className="relative w-[20px] h-8 z-0">
                    {/* The Visual Trunk Shape (Clipped) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, #774716ff 30%, #fff 30%, #CD853F 70%, rgba(0,0,0,0.9) 100%)`,
                            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                            border: '1.5px solid rgba(0,0,0,0.4)',
                            boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.5), inset 3px 0 6px rgba(255,255,255,0.15)',
                            borderRadius: '0 0 4px 4px'
                        }}
                    />

                    {/* The Branches (Unclipped Sibling) */}
                    <div className="absolute inset-x-0 top-0">
                        <Branch length={isWinter ? 18 : 14} angle={-60} depth={0} maxDepth={isWinter ? 5 : 3} trunkColor={styles.trunk} isWinter={isWinter} seed={seed + 10} />
                        <Branch length={isWinter ? 18 : 14} angle={-30} depth={0} maxDepth={isWinter ? 5 : 3} trunkColor={styles.trunk} isWinter={isWinter} seed={seed + 20} />
                        <Branch length={isWinter ? 20 : 16} angle={0} depth={0} maxDepth={isWinter ? 5 : 3} trunkColor={styles.trunk} isWinter={isWinter} seed={seed + 30} />
                        <Branch length={isWinter ? 18 : 14} angle={30} depth={0} maxDepth={isWinter ? 5 : 3} trunkColor={styles.trunk} isWinter={isWinter} seed={seed + 40} />
                        <Branch length={isWinter ? 18 : 14} angle={60} depth={0} maxDepth={isWinter ? 5 : 3} trunkColor={styles.trunk} isWinter={isWinter} seed={seed + 50} />
                        {isWinter && <div className="absolute inset-x-0 top-0 h-1.5 bg-white/50 blur-[0.8px] z-50" />}
                    </div>
                </div>


                {/* Autumn Leaf Fall VFX */}
                {isAutumn && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                        {/* Existing autumn leaves */}
                        <div className="absolute w-1 h-1 bg-amber-600 rounded-sm animate-[leaf-fall_3s_linear_infinite]" style={{ left: '30%', animationDelay: '0.2s' }} />
                        <div className="absolute w-1 h-1 bg-orange-800 rounded-sm animate-[leaf-fall_4s_linear_infinite]" style={{ left: '70%', animationDelay: '1.5s' }} />
                    </div>
                )}

            </div>

            {/* Autumn Leaf Fall VFX */}
            {isAutumn && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    <div className="absolute w-1 h-1 bg-amber-600 rounded-sm animate-[leaf-fall_3s_linear_infinite]" style={{ left: '30%', animationDelay: '0.2s' }} />
                    <div className="absolute w-1 h-1 bg-orange-800 rounded-sm animate-[leaf-fall_4s_linear_infinite]" style={{ left: '70%', animationDelay: '1.5s' }} />
                </div>
            )}
        </div>
    );
});

const WorkerNPC = React.memo(({ x, y, isSelected, onClick }: any) => {
    // Continuous walking phase
    const [phase, setPhase] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => setPhase(p => p + 0.15), 50);
        return () => clearInterval(interval);
    }, []);

    const legAngle = Math.sin(phase) * 25;

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={cn("absolute origin-bottom transition-all duration-300 cursor-pointer")}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: '32px',
                height: '38px', // Shorter legs/height
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 9999 : undefined
            }}
        >
            {/* Shadow */}
            <div className="absolute w-8 h-4 bg-[rgba(30,30,30,0.5)] rounded-full blur-[3px] opacity-60" style={{ left: '50%', bottom: '-2px', transform: 'translateX(-50%)' }} />

            {/* Humanoid Body */}
            <div className="flex flex-col items-center h-full">
                {/* Head (Smoother) */}
                <div className="w-3.5 h-3.5 bg-[#D4A76A] rounded-full border border-black/30 shadow-sm z-10" />

                {/* Torso (Rounded) */}
                <div className="w-6 h-6 bg-[#4E342E] rounded-full border border-black/40 -mt-1 relative shadow-inner">
                    <div className="absolute inset-x-1 bottom-1 h-2 bg-[#263238] opacity-40 rounded-full" />
                </div>

                {/* Legs (Shorter) */}
                <div className="flex gap-1.5 -mt-1.5">
                    <div className="w-2 h-4 bg-[#263238] rounded-full border border-black/40" style={{ transformOrigin: 'top center', transform: `rotate(${legAngle}deg)` }} />
                    <div className="w-2 h-4 bg-[#263238] rounded-full border border-black/40" style={{ transformOrigin: 'top center', transform: `rotate(${-legAngle}deg)` }} />
                </div>
            </div>
        </div>
    );
});


export const ImperialOrchard: React.FC<ImperialOrchardProps> = ({ parcels, season, county = 'Opolski', onAction, automationConfig }) => {

    // Safety fallback for empty parcels during initialization
    const displayParcels = parcels && parcels.length > 0 ? parcels : [{ id: 'empty-1', plantedTrees: 0, quality: 0 }];

    const seasonStyles = useMemo(() => getSeasonStyles(season), [season]);
    const countyStyles = useMemo(() => getCountyStyles(county), [county]);

    const [selectedParcel, setSelectedParcel] = useState<{ id: string, screenX: number, screenY: number, parcel: any } | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [harvestedParcels, setHarvestedParcels] = useState<Set<string>>(new Set());
    const [zoom, setZoom] = useState(1); // For future zoom functionality

    // Reset harvest state when season changes ( replenishing trees)
    useEffect(() => {
        if (seasonStyles.phase !== 'Harvest') {
            setHarvestedParcels(new Set());
        }
    }, [seasonStyles.phase]);

    // Grid calculations for centering
    const totalParcels = displayParcels.length;
    const cols = totalParcels <= 3 ? totalParcels : Math.ceil(Math.sqrt(totalParcels));
    const rows = Math.ceil(totalParcels / cols);

    const handleBackgroundClick = () => {
        if (selectedParcel) setSelectedParcel(null);
        if (selectedEntity) setSelectedEntity(null);
    };

    const handleAction = (action: any) => {
        if (!selectedParcel) return;
        if (navigator.vibrate) navigator.vibrate(20);

        if (action === 'harvest') {
            setHarvestedParcels(prev => new Set(prev).add(selectedParcel.parcel.id));
        }

        onAction(action, selectedParcel.parcel.id);
        setSelectedParcel(null);
    };

    // Calculate total trees and derived tiles early for usage in effects & memo
    const totalTrees = useMemo(() => {
        const sum = displayParcels.reduce((acc, p) => acc + (Number(p.plantedTrees) || 0), 0);
        return sum > 0 ? sum : 50;
    }, [displayParcels]);

    const totalVisualTrees = Math.ceil(totalTrees / 2);
    const sectorsCount = Math.ceil(totalVisualTrees / (SECTOR_SIZE * SECTOR_SIZE));

    // Fixed Workers (NPCs) with Manhattan Movement
    const [workerPos, setWorkerPos] = useState({ r: 0, c: 0, s: 0, targetR: 2, targetC: 2, targetS: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setWorkerPos(prev => {
                // Manhattan Step: move only one dimension at a time
                let nextR = prev.r;
                let nextC = prev.c;
                let nextS = prev.s;

                const step = 0.04;
                if (Math.abs(prev.r - prev.targetR) > 0.01) {
                    nextR += prev.targetR > prev.r ? step : -step;
                } else if (Math.abs(prev.c - prev.targetC) > 0.01) {
                    nextC += prev.targetC > prev.c ? step : -step;
                } else {
                    // New target selection
                    return {
                        ...prev,
                        targetR: Math.floor(Math.random() * SECTOR_SIZE),
                        targetC: Math.floor(Math.random() * SECTOR_SIZE),
                        targetS: Math.floor(Math.random() * sectorsCount)
                    };
                }

                return { ...prev, r: nextR, c: nextC, s: nextS };
            });
        }, 30);
        return () => clearInterval(interval);
    }, [sectorsCount]);

    // Flatten entities for Modular Isometric Projection
    const worldEntities = useMemo(() => {
        const entities: any[] = [];
        let tilesPlaced = 0;

        for (let s = 0; s < sectorsCount; s++) {
            const tilesInSector = Math.min(25, totalVisualTrees - tilesPlaced);

            for (let idx = 0; idx < tilesInSector; idx++) {
                const r = Math.floor(idx / SECTOR_SIZE);
                const c = idx % SECTOR_SIZE;
                const { x, y } = projectToIso(r, c, s);

                // Map back to a parcel for props
                const parcel = displayParcels[0];

                // 1. Soil Plane
                entities.push({
                    type: 'soil',
                    key: `soil-${idx}-${s}`,
                    parcelId: parcel.id,
                    x, y, r, c, s,
                    zIndex: s * 100 + (r + c) * 10
                });

                // 2. Tree (Single high-fidelity model)
                entities.push({
                    type: 'tree',
                    key: `tree-${idx}-${s}`,
                    parcel,
                    x, y,
                    seed: (s * 100) + idx,
                    delay: (idx % 7) * -0.8,
                    zIndex: s * 100 + (r + c) * 10 + 2 // Offset +2
                });
            }
            tilesPlaced += tilesInSector;

            // 4. Brass Perimeter (The Platform Border)
            // Geometric center of a 5x5 grid (0,0 to 4,4) is (2,2)
            const center = projectToIso(2, 2, s);
            entities.push({
                type: 'perimeter',
                key: `perimeter-${s}`,
                x: center.x,
                y: center.y,
                s,
                zIndex: s * 100 - 5
            });

            // 5. Visual Bridge
            if (s < sectorsCount - 1) {
                const startPoint = projectToIso(2, 4, s); // Edge of this sector
                entities.push({
                    type: 'bridge',
                    key: `bridge-${s}`,
                    x: startPoint.x + (SECTOR_GAP / 2) + 20,
                    y: startPoint.y,
                    s,
                    zIndex: s * 100 - 2
                });
            }
        }

        // 3. Worker NPC (Manhattan path)
        const npos = projectToIso(workerPos.r, workerPos.c, workerPos.s);
        entities.push({
            type: 'npc',
            key: 'npc-worker-1',
            x: npos.x,
            y: npos.y,
            zIndex: workerPos.s * 100 + (workerPos.r + workerPos.c) * 10 + 5 // Offset +5
        });

        return entities.sort((a, b) => a.zIndex - b.zIndex);
    }, [displayParcels, totalTrees, totalVisualTrees, sectorsCount, workerPos]);

    return (
        <div
            className={cn("w-full h-full relative overflow-visible rounded-t-[2rem] border-b-4 shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)] touch-none transition-colors duration-1000", countyStyles.bg)}
            style={{ borderColor: 'var(--brass-primary)' }}
            onClick={handleBackgroundClick}
        >
            {/* Global Ambient Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.15)_0%,transparent_60%)] pointer-events-none z-0"></div>
            <div className="absolute inset-0" style={{ backgroundImage: countyStyles.overlay }}></div>
            {countyStyles.mist && <div className={cn("absolute bottom-0 w-full h-1/2 pointer-events-none z-10", countyStyles.mist)}></div>}

            {/* Tilt-Shift Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-50 backdrop-blur-[4px]"
                style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 15%, transparent 85%, black 100%)',
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 15%, transparent 85%, black 100%)'
                }}
            />

            {/* Camera Viewport (Isometric Perspective setup) */}
            <div
                className="md:w-full h-full flex items-center justify-center p-12 transition-all duration-700 overflow-visible"
                style={{ perspective: '1200px' }}
            >
                {/* Viewport: No main rotation, pure 2D space with mathematical projection */}
                <div
                    className="relative overflow-hidden cursor-default bg-[#111] shadow-2xl rounded-xl border border-white/10"
                    style={{ width: '100%', height: 'calc(100% - 10px)' }}
                >
                    {/* 2D Isometric World */}
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <SeasonalVFX season={seasonStyles.phase} />
                        <div
                            className="relative"
                            style={{
                                // The actual size of the isometric grid in screen pixels
                                width: `${(SECTOR_SIZE * sectorsCount + SECTOR_SIZE) * TILE_W / 2 + SECTOR_GAP * sectorsCount}px`,
                                height: `${(SECTOR_SIZE + SECTOR_SIZE) * TILE_H / 2}px`
                            }}
                        >
                            {worldEntities.map((entity) => {
                                if (entity.type === 'soil') {
                                    return (
                                        <GroundParcel
                                            key={entity.key}
                                            x={entity.x}
                                            y={entity.y}
                                            styles={seasonStyles}
                                            parcelId={entity.parcelId}
                                            isSelected={selectedParcel?.id === entity.parcelId}
                                            onClick={(e: any) => {
                                                e.stopPropagation();
                                                const p = displayParcels.find(p => p.id === entity.parcelId);
                                                if (p) {
                                                    if (navigator.vibrate) navigator.vibrate(20);
                                                    setSelectedParcel({ id: p.id, screenX: e.clientX, screenY: e.clientY, parcel: p });
                                                }
                                            }}
                                        />
                                    );
                                }

                                if (entity.type === 'tree') {
                                    return (
                                        <div key={entity.key} style={{ zIndex: entity.zIndex, position: 'absolute' }}>
                                            <MechanicalTree
                                                x={entity.x}
                                                y={entity.y}
                                                parcel={entity.parcel}
                                                styles={seasonStyles}
                                                delay={entity.delay}
                                                seed={entity.seed}
                                                isSelected={selectedParcel?.id === entity.parcel.id}
                                                isHarvested={harvestedParcels.has(entity.parcel.id)}
                                                onClick={() => {
                                                    if (navigator.vibrate) navigator.vibrate(20);
                                                    const element = document.querySelector(`[data-parcel-id="${entity.parcel.id}"]`);
                                                    const rect = element?.getBoundingClientRect() || { x: window.innerWidth / 2, y: window.innerHeight / 2, width: 0, height: 0 };
                                                    setSelectedParcel({ id: entity.parcel.id, screenX: rect.x + rect.width / 2, screenY: rect.y + rect.height / 2, parcel: entity.parcel });
                                                    setSelectedEntity({ id: entity.key, type: 'tree' });
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                if (entity.type === 'npc') {
                                    return (
                                        <div key={entity.key} style={{ zIndex: entity.zIndex, position: 'absolute' }}>
                                            <WorkerNPC
                                                x={entity.x}
                                                y={entity.y}
                                                isSelected={selectedEntity?.id === entity.key}
                                                onClick={() => {
                                                    if (navigator.vibrate) navigator.vibrate(20);
                                                    setSelectedEntity({ id: entity.key, type: 'worker' });
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                if (entity.type === 'perimeter') {
                                    return (
                                        <div
                                            key={entity.key}
                                            className="absolute pointer-events-none border-[3.5px] border-[#C9A84C]/50"
                                            style={{
                                                left: `${entity.x}px`,
                                                top: `${entity.y}px`,
                                                width: `${SECTOR_SIZE * TILE_W + 16}px`, // Slight padding
                                                height: `${SECTOR_SIZE * TILE_H + 8}px`,
                                                transform: 'translate(-50%, -50%)', // Center on sector center
                                                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                                zIndex: entity.zIndex,
                                                boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(201,168,76,0.2)',
                                                background: 'rgba(201, 168, 76, 0.03)'
                                            }}
                                        />
                                    );
                                }

                                if (entity.type === 'bridge') {
                                    return (
                                        <div
                                            key={entity.key}
                                            className="absolute pointer-events-none"
                                            style={{
                                                left: `${entity.x}px`,
                                                top: `${entity.y}px`,
                                                width: `${SECTOR_GAP + 20}px`,
                                                height: '10px',
                                                background: 'linear-gradient(to bottom, #8C7853, #C9A84C, #8C7853)',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: entity.zIndex,
                                                boxShadow: '0 5px 10px rgba(0,0,0,0.6)',
                                                borderRadius: '2px'
                                            }}
                                        >
                                            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/50" />
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </div>
                </div>

                {/* Storage Silo (Fixed UI Overlay) */}
                <div className="absolute top-8 left-8 z-20 flex items-end gap-3 pointer-events-none">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-32 brass-rim bg-[var(--charcoal)] rounded-t-full relative overflow-hidden flex items-end shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[var(--brass-primary)]">
                            <div className="w-full bg-[var(--emerald-glow)] shadow-[0_0_20px_var(--emerald-glow)] transition-all duration-1000 origin-bottom" style={{ height: '60%' }}>
                                <div className="w-full h-full bg-gradient-to-t from-transparent to-white/30 animate-pulse"></div>
                            </div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--brass-primary)] mt-3 uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(0,0,0,1)]">Storage</span>
                    </div>
                </div>

                {/* Radial Menu Overlay (HTML Space, mapped from screenX/screenY) */}
                {selectedParcel && (
                    <div className="fixed inset-0 z-50 pointer-events-none">
                        <div className="absolute w-0 h-0 pointer-events-auto" style={{ left: selectedParcel.screenX, top: selectedParcel.screenY }}>
                            <div className="relative">
                                {/* Background Blur Circle */}
                                <div className="absolute inset-0 -m-24 bg-black/60 backdrop-blur-md rounded-full animate-in zoom-in-50 duration-200 border border-[var(--brass-primary)]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]" />

                                {[
                                    { id: 'water', icon: '💧', label: 'Irrigate', angle: -135, color: 'bg-blue-900', shadow: 'rgba(30,58,138,0.8)', phases: ['Awakening', 'Bloom', 'Decay'] },
                                    { id: 'prune', icon: '✂️', label: 'Prune', angle: -45, color: 'bg-slate-800', shadow: 'rgba(30,41,59,0.8)', phases: ['Dormancy', 'Decay'] },
                                    { id: 'fertilize', icon: '🌿', label: 'Fertilize', angle: 135, color: 'bg-emerald-900', shadow: 'rgba(6,78,59,0.8)', phases: ['Awakening', 'Bloom', 'Decay'] },
                                    { id: 'harvest', icon: '🍒', label: 'Harvest', angle: 45, color: 'bg-rose-900', shadow: 'rgba(136,19,55,0.8)', phases: ['Harvest'] }
                                ].map((action, i) => {
                                    const rad = (action.angle * Math.PI) / 180;
                                    const radius = 70;
                                    const tx = Math.cos(rad) * radius;
                                    const ty = Math.sin(rad) * radius;

                                    const isDisabled = !action.phases.includes(seasonStyles.phase) ||
                                        (action.id === 'harvest' && harvestedParcels.has(selectedParcel.id));

                                    return (
                                        <button
                                            key={action.id}
                                            disabled={isDisabled}
                                            onClick={() => handleAction(action.id)}
                                            className={cn(
                                                "absolute flex items-center justify-center w-14 h-14 border-2 border-[var(--brass-primary)] rounded-full transition-all duration-300 group",
                                                action.color,
                                                isDisabled ? "opacity-30 grayscale pointer-events-none" : "hover:scale-110 animate-in zoom-in"
                                            )}
                                            style={{
                                                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
                                                boxShadow: isDisabled ? 'none' : `0 0 20px ${action.shadow}`,
                                                animationDelay: `${i * 50}ms`
                                            }}
                                        >
                                            <span className="text-xl">{action.icon}</span>
                                            <span className={cn(
                                                "absolute text-[12px] font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap drop-shadow-md",
                                                ty < 0 ? "-top-8" : "-bottom-8",
                                                action.id === 'harvest' ? "text-rose-300" :
                                                    action.id === 'water' ? "text-blue-300" :
                                                        action.id === 'fertilize' ? "text-emerald-300" : "text-slate-300"
                                            )}>
                                                {action.label}
                                            </span>
                                        </button>
                                    );
                                })}

                                <button onClick={() => setSelectedParcel(null)} className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/90 border border-[var(--ruby-harvest)] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_20px_var(--ruby-harvest)] animate-in fade-in zoom-in duration-300 hover:bg-red-900 transition-colors pointer-events-auto">
                                    ❌
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Season Indicator Pill */}
                <div className="absolute top-6 right-6 bg-[#0f1115]/80 border border-[var(--brass-primary)]/40 px-6 py-3 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.8)] flex items-center gap-4 backdrop-blur-md z-20 pointer-events-none">
                    <span className="w-3 h-3 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: seasonStyles.trunk === 'var(--copper-dormant)' ? '#FFBF00' : (seasonStyles.leaves !== 'transparent' ? 'var(--emerald-glow)' : '#FFF'), boxShadow: `0 0 10px ${seasonStyles.leaves !== 'transparent' ? 'var(--emerald-glow)' : '#FFF'}` }}></span>
                    <span className="text-sm uppercase font-bold font-mono tracking-[0.2em] text-[var(--brass-primary)] drop-shadow-md">{seasonStyles.phase}</span>
                </div>

                <style>{`
                    @keyframes wind-sway {
                        0%, 100% { transform: rotate(-1deg); }
                        50% { transform: rotate(1deg); }
                    }
                    @keyframes puff {
                        0% { transform: translate(-50%, 0) scale(1); opacity: 0.8; }
                        100% { transform: translate(-50%, -30px) scale(3); opacity: 0; }
                    }
                    @keyframes leaf-fall {
                        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                        10% { opacity: 1; }
                        100% { transform: translate(-40px, 80px) rotate(360deg); opacity: 0; }
                    }
                    @keyframes frost {
                        0%, 100% { transform: translate(0, 0); opacity: 0.3; }
                        50% { transform: translate(20px, 20px); opacity: 0.6; }
                    }
                `}</style>
            </div>
        </div>
    );
};
