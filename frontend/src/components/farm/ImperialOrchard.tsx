import React, { useMemo, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface ImperialOrchardProps {
    parcels: any[];
    season: any;
    hiredLabor?: any;
    county?: 'Nyski' | 'Brzeski' | 'Opolski' | string;
    onAction: (action: 'water' | 'prune' | 'fertilize' | 'harvest' | 'plant' | 'select' | 'organic', parcelId: string | null) => void;
    automationConfig?: { hasHarvesters: boolean };
    totalCherries?: number;
    maxCapacity?: number;
}

// --- Isometric Projection Calibrator (2D Algebraic) constants ---
const TILE_W = 96;  // 120% Scaling (from 80)
const TILE_H = 48;  // 120% Scaling (from 40)
const SECTOR_SIZE = 5; // 5x5 grid
const SECTOR_GAP = 72; // 120% Scaling (from 60)

// Shifting offsets to align the grid inside the container bounds strictly positive
const X_OFFSET = SECTOR_SIZE * (TILE_W / 2); // 240px
const Y_OFFSET = TILE_H / 2; // 24px

// Helper to project grid coordinates (rows, cols) + sector offset to 2D screen coordinates
const projectToIso = (row: number, col: number, sectorIdx: number = 0) => {
    const base = {
        x: (col - row) * (TILE_W / 2),
        y: (col + row) * (TILE_H / 2)
    };

    const sectorOffset = sectorIdx * ((SECTOR_SIZE * TILE_W) + SECTOR_GAP);

    return {
        x: base.x + sectorOffset + X_OFFSET,
        y: base.y + Y_OFFSET
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
        case 'LateSpring': return { phase: 'Bloom', trunk: '#B8860B', leaves: ['#ffb6c1', '#ffc0cb', '#fff0f5', '#ffe4e1', '#ffa07a'], fruit: 'transparent', vfx: 'pollen' };
        case 'Summer': return { phase: 'Harvest', trunk: '#8B4513', leaves: ['#006400', '#004d00', '#1b4d3e', '#228b22', '#32cd32'], fruit: '#8B1A1A', vfx: 'smoke' };
        case 'Autumn': return { phase: 'Decay', trunk: brightTrunk, leaves: ['#b88c1dff', '#974747ff', '#5d664dff', '#8B4513', '#D2691E'], fruit: 'transparent', vfx: 'falling_leaves' };
        default: return { phase: 'Dormancy', trunk: brightTrunk, leaves: 'transparent', fruit: 'transparent', vfx: 'none' };
    }
};

// Deterministic slot picker based on parcel ID
const getDeterministicSlots = (count: number, parcelId: string) => {
    let seed = 0;
    const idStr = parcelId || "default";
    for (let i = 0; i < idStr.length; i++) {
        seed += idStr.charCodeAt(i);
    }
    const slots = Array.from({ length: 25 }, (_, i) => i);
    let s = seed;
    const lcg = () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
    for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(lcg() * (i + 1));
        const temp = slots[i];
        slots[i] = slots[j];
        slots[j] = temp;
    }
    return new Set(slots.slice(0, count));
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
    // 1. Winter: Snowflakes falling + Frost Mist
    if (season === 'Dormancy') {
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {/* Frost particles */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={`frost-${i}`}
                        className="absolute w-2.5 h-2.5 bg-white/40 blur-[1px] rounded-full animate-[frost_12s_ease-in-out_infinite]"
                        style={{
                            left: `${(i * 7) % 100}%`,
                            top: `${(i * 13) % 100}%`,
                            animationDelay: `${(i * 0.7) % 5}s`
                        }}
                    />
                ))}
                {/* Falling Snow */}
                {Array.from({ length: 25 }).map((_, i) => (
                    <div
                        key={`snow-${i}`}
                        className="absolute bg-white/80 rounded-full blur-[0.5px]"
                        style={{
                            width: `${2 + (i % 3)}px`,
                            height: `${2 + (i % 3)}px`,
                            left: `${(i * 4) % 100}%`,
                            top: `-10px`,
                            animation: `snow-fall ${3 + (i % 3)}s linear infinite`,
                            animationDelay: `${i * 0.25}s`
                        }}
                    />
                ))}
            </div>
        );
    }

    // 2. Spring: Green pollen/sparks rising (Steam energy)
    if (season === 'Awakening') {
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={`steam-${i}`}
                        className="absolute w-1.5 h-1.5 bg-emerald-400/50 rounded-full blur-[0.5px]"
                        style={{
                            left: `${(i * 7.5) % 100}%`,
                            bottom: `0px`,
                            animation: `puff ${4 + (i % 3)}s ease-out infinite`,
                            animationDelay: `${i * 0.4}s`
                        }}
                    />
                ))}
            </div>
        );
    }

    // 3. Late Spring: Falling Pink Blossom Petals
    if (season === 'Bloom') {
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div
                        key={`petal-${i}`}
                        className="absolute rounded-t-full rounded-br-full"
                        style={{
                            width: `${6 + (i % 4)}px`,
                            height: `${8 + (i % 4)}px`,
                            background: 'linear-gradient(135deg, #fff0f5 0%, #ffc0cb 70%, #ffb6c1 100%)',
                            boxShadow: '0 1px 2px rgba(255,182,193,0.4)',
                            left: `${(i * 4) % 100}%`,
                            top: `-20px`,
                            animation: `petal-fall ${5 + (i % 4)}s linear infinite`,
                            animationDelay: `${i * 0.3}s`
                        }}
                    />
                ))}
            </div>
        );
    }

    // 4. Summer: Warm Golden Heat Pollen
    if (season === 'Harvest') {
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={`summer-pollen-${i}`}
                        className="absolute w-1.5 h-1.5 bg-amber-300/40 rounded-full blur-[0.5px] animate-pulse"
                        style={{
                            left: `${(i * 6) % 100}%`,
                            top: `${(i * 11) % 100}%`,
                            animationDuration: `${2 + (i % 3)}s`,
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
            </div>
        );
    }

    // 5. Autumn: Falling Autumn Leaves
    if (season === 'Decay') {
        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => {
                    const leafColors = ['#CD853F', '#D2691E', '#B8860B', '#8B4513', '#A0522D'];
                    const color = leafColors[i % leafColors.length];
                    return (
                        <div
                            key={`decay-leaf-${i}`}
                            className="absolute rounded-full"
                            style={{
                                width: `${5 + (i % 4)}px`,
                                height: `${3 + (i % 3)}px`,
                                backgroundColor: color,
                                left: `${(i * 5) % 100}%`,
                                top: `-10px`,
                                animation: `leaf-fall ${4 + (i % 3)}s linear infinite`,
                                animationDelay: `${i * 0.4}s`
                            }}
                        />
                    );
                })}
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

const GroundParcel = React.memo(({ x, y, isSelected, onClick, styles, parcelId, parcel }: any) => {
    const humidity = parcel?.humidity || 0.5;
    const fertility = parcel?.fertility || 0.5;
    
    // Mineral Veins (miedziane linie) if fertility > 0.6
    const showVeins = fertility > 0.6;
    // Wet highlight if humidity > 0.7
    const isWet = humidity > 0.7;

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
                    "w-full h-full border transition-colors duration-500",
                    isSelected ? "border-white" : "border-[#C9A84C]/40"
                )}
                style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Clean Diamond
                    boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.3)' : 'none',
                    background: isSelected
                        ? 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, #2a1b18 100%)'
                        : isWet 
                            ? 'radial-gradient(circle at center, #1b263b 0%, #0f172a 100%)' // Wet dark clay
                            : showVeins
                                ? 'radial-gradient(circle at center, #3d251e 0%, #221411 100%)' // Mineral rich red clay
                                : '#2a1b18'
                }}
            >
                {/* Mineral Veins (Miedziane żyły) overlay */}
                {showVeins && (
                    <div 
                        className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(ellipse at 30% 30%, #d4af37 1px, transparent 1px), radial-gradient(ellipse at 70% 60%, #b87333 2px, transparent 2px)`,
                            backgroundSize: '16px 16px'
                        }}
                    />
                )}

                {/* Wet Shine overlay */}
                {isWet && (
                    <div 
                        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                            backgroundSize: '200% 200%',
                            animation: 'shine 4s linear infinite'
                        }}
                    />
                )}
            </div>

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
    const isBloom = styles.phase === 'Bloom';
    const isSpring = styles.phase === 'Awakening';

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

    const flowerPositions = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180 + Math.sin(seed + i) * 0.3;
            const dist = 5 + (Math.abs(Math.sin(seed + i)) * 12);
            return {
                lx: Math.cos(angle) * dist,
                ly: Math.sin(angle) * (dist * 0.7)
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
                        // In autumn, some leaves fall (made invisible) to look sparse
                        const isLeafVisible = !isAutumn || (leaf.colorIdx % 3 !== 0);
                        if (!isLeafVisible) return null;

                        // Spring leaves are small fresh buds. Summer leaves are large.
                        const scale = isSpring ? 0.6 : (isSummer ? 1.4 : (isAutumn ? 0.75 : 1.0));
                        const dynamicSize = leaf.size * scale;
                        let color = Array.isArray(styles.leaves) ? styles.leaves[leaf.colorIdx] : styles.leaves;

                        return (
                            <div
                                key={`leaf-${i}`}
                                className="absolute rounded-full"
                                style={{
                                    width: `${dynamicSize}px`,
                                    height: `${dynamicSize}px`,
                                    left: `calc(50% + ${leaf.lx}px)`,
                                    bottom: `calc(52px + ${leaf.ly}px)`, // Adjusted from 32px to center with trunk height
                                    background: color,
                                    transform: 'translate(-50%, 0)',
                                    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        );
                    })}
                </div>

                {/* Tiny Mechanical Gears in the crown */}
                <div className="absolute inset-0 pointer-events-none z-30">
                    {[
                        { lx: -8, ly: 12, size: 8, speed: '8s' },
                        { lx: 10, ly: 6, size: 6, speed: '12s' }
                    ].map((gear, i) => (
                        <svg
                            key={`gear-${i}`}
                            className="absolute fill-[#c9a84c] opacity-60 animate-[spin_infinite_linear]"
                            style={{
                                left: `calc(50% + ${gear.lx}px)`,
                                bottom: `calc(52px + ${gear.ly}px)`,
                                width: `${gear.size}px`,
                                height: `${gear.size}px`,
                                animationDuration: gear.speed,
                                transformOrigin: 'center',
                                transform: 'translate(-50%, 50%)'
                            }}
                            viewBox="0 0 24 24"
                        >
                            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.47,5.34 14.86,5.08L14.47,2.42C14.43,2.18 14.22,2 13.97,2H9.97C9.72,2 9.51,2.18 9.47,2.42L9.08,5.08C8.47,5.34 7.9,5.66 7.38,6.05L4.89,5.05C4.67,4.96 4.4,5.05 4.28,5.27L2.28,8.73C2.16,8.95 2.21,9.22 2.4,9.37L4.51,11C4.47,11.32 4.5,11.67 4.5,12C4.5,12.32 4.47,12.65 4.51,13L2.4,14.63C2.21,14.78 2.16,15.05 2.28,15.27L4.28,18.73C4.4,18.95 4.67,19.04 4.89,18.95L7.38,17.95C7.9,18.34 8.47,18.66 9.08,18.92L9.47,21.58C9.51,21.82 9.72,22 9.97,22H13.97C14.22,22 14.43,21.82 14.47,21.58L14.86,18.92C15.47,18.66 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                        </svg>
                    ))}
                </div>

                {/* 3. Bloom Flowers (Late Spring) */}
                {isBloom && (
                    <div className="absolute inset-0 pointer-events-none z-30">
                        {flowerPositions.map((flower, i) => (
                            <div
                                key={`flower-${i}`}
                                className="absolute w-2 h-2 rounded-full bg-white border border-pink-300 shadow-[0_1px_2px_rgba(255,192,203,0.6)]"
                                style={{
                                    left: `calc(50% + ${flower.lx}px)`,
                                    bottom: `calc(52px + ${flower.ly}px)`, // Lifted
                                    transform: 'translate(-50%, 0)'
                                }}
                            >
                                {/* Yellow center */}
                                <div className="absolute top-[30%] left-[30%] w-[1.5px] h-[1.5px] bg-yellow-400 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Sharp Fruits (Summer Cherries) - Double cherries with stems */}
                {isSummer && !isHarvested && (
                    <div className="absolute inset-0 pointer-events-none">
                        {fruitPositions.map((fruit, i) => (
                            <div
                                key={`cherry-${i}`}
                                className="absolute w-4 h-6 z-[100]"
                                style={{
                                    left: `calc(50% + ${fruit.lx}px)`,
                                    bottom: `calc(52px + ${fruit.ly}px)`, // Centered inside leaves
                                    transform: 'translate(-50%, 0)' // Perfect horizontal center alignment
                                }}
                            >
                                {/* Left cherry */}
                                <div className="absolute w-2 h-2 rounded-full bg-[#991b1b] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" style={{ left: '-2px', top: '4px' }}>
                                    <div className="absolute top-[20%] left-[20%] w-[0.8px] h-[0.8px] bg-white rounded-full opacity-80" />
                                </div>
                                {/* Right cherry */}
                                <div className="absolute w-2 h-2 rounded-full bg-[#7f1d1d] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" style={{ left: '3px', top: '5px' }}>
                                    <div className="absolute top-[20%] left-[20%] w-[0.8px] h-[0.8px] bg-white rounded-full opacity-80" />
                                </div>
                                {/* Stems */}
                                <svg className="absolute w-4 h-6 -left-1 -top-2 overflow-visible pointer-events-none" viewBox="0 0 16 24">
                                    <path d="M8,2 C8,6 1,10 1,12 M8,2 C8,7 9,11 11,13" fill="none" stroke="#4d7c0f" strokeWidth="0.85" />
                                </svg>
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
                width: '80px',
                height: '90px', // Larger space for taller trunks and crowns
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 9999 : undefined // Only override if explicitly selected
            }}
        >
            {/* Shadow (Black-Gray Expanded for 120%) */}
            <div className="absolute w-16 h-8 bg-[rgba(30,30,30,0.45)] rounded-full blur-[4px] pointer-events-none" style={{ left: '50%', bottom: '-4px', transform: 'translate(-50%, 0) scale(1, 0.4)' }} />

            {/* Base Ring (Brass Tank) */}
            <div className="absolute w-8 h-3.5 rounded-full border border-black/40 pointer-events-none" style={{ left: '50%', bottom: '-1px', transform: 'translate(-50%, 0)', background: 'radial-gradient(circle at center, #B87333 10%, #C9A84C 100%)', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }} />

            {/* Tree Structure */}
            <div className="h-full w-full flex flex-col items-center justify-end relative" style={{ animation: `wind-sway 6s ease-in-out infinite alternate`, animationDelay: `${windPhase}s` }}>
                {renderCrown()}

                {/* Fixed Tree Structure: Separate Visual Trunk from Recursive Branches to prevent clipping */}
                <div className="relative w-[20px] h-10 z-0">
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
                        <div className="absolute w-1 h-1 bg-amber-600 rounded-sm animate-[leaf-fall_3s_linear_infinite]" style={{ left: '30%', animationDelay: '0.2s' }} />
                        <div className="absolute w-1 h-1 bg-orange-800 rounded-sm animate-[leaf-fall_4s_linear_infinite]" style={{ left: '70%', animationDelay: '1.5s' }} />
                    </div>
                )}
            </div>
        </div>
    );
});

const WorkerNPC = React.memo(({ x, y, phase, isSelected, onClick, role = 'owner' }: any) => {
    // Continuous walking phase
    const [phaseStep, setPhaseStep] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => setPhaseStep(p => p + 0.15), 50);
        return () => clearInterval(interval);
    }, []);

    const isWinter = phase === 'Dormancy';
    const isSummer = phase === 'Harvest';
    const isSpring = phase === 'Awakening' || phase === 'Bloom';

    // Dress colors based on season & role
    const shirtColor = role === 'owner'
        ? (isWinter ? '#1e3a8a' : (isSummer ? '#991b1b' : (isSpring ? '#166534' : '#854d0e')))
        : (isWinter ? '#475569' : (isSummer ? '#d97706' : (isSpring ? '#0f766e' : '#7c2d12')));

    const pantsColor = role === 'owner'
        ? (isWinter ? '#0f172a' : (isSummer ? '#1d4ed8' : '#27272a'))
        : (isWinter ? '#1e293b' : (isSummer ? '#4f46e5' : '#3f3f46'));

    const legAngle = Math.sin(phaseStep) * 25;
    const bobY = Math.abs(Math.sin(phaseStep)) * -1.0; // Bouncy walk bobbing scaled down

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={cn("absolute origin-bottom transition-[transform] duration-300 cursor-pointer")}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: '18px',
                height: '22px', // Scaled down for better micro-tycoon proportions
                transform: `translate(-50%, -100%) translateY(${bobY}px)`,
                zIndex: isSelected ? 9999 : undefined
            }}
        >
            {/* Shadow */}
            <div className="absolute w-5 h-2 bg-[rgba(30,30,30,0.5)] rounded-full blur-[2px] opacity-60" style={{ left: '50%', bottom: '-1px', transform: 'translateX(-50%)' }} />

            {/* Humanoid Body */}
            <div className="flex flex-col items-center h-full relative">
                {/* Steam boiler backpack */}
                <div className="absolute -left-1 top-1 w-1.5 h-2.5 bg-[#b87333] border border-black/40 rounded-full shadow-md z-0">
                    <div className="w-0.5 h-0.5 bg-[#c9a84c] rounded-full mx-auto mt-0.2" />
                    {/* Steam spark chimney */}
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-[0.5px] h-0.5 bg-[#8c7853]" />
                </div>

                {/* Straw Hat for Owner in Summer */}
                {role === 'owner' && isSummer && (
                    <div className="w-3.5 h-1 bg-[#d97706] rounded-full border border-black/30 -mb-[1px] relative z-20 shadow-sm animate-pulse" />
                )}
                {/* Bandana for Helper in Summer */}
                {role === 'helper' && isSummer && (
                    <div className="w-3 h-0.7 bg-[#dc2626] rounded-t-full border border-black/30 -mb-[1px] relative z-20 shadow-sm" />
                )}
                {/* Winter cap */}
                {isWinter && (
                    <div className="w-2.5 h-1 bg-[#1e293b] rounded-t-full border border-black/30 -mb-[0.5px] relative z-20 shadow-sm" />
                )}
                
                {/* Head (Smoother) */}
                <div className="w-2 h-2 bg-[#D4A76A] rounded-full border border-black/30 shadow-sm z-10" />

                {/* Torso (Rounded) */}
                <div 
                    className="w-3.5 h-3.5 rounded-full border border-black/40 -mt-0.5 relative shadow-inner transition-colors duration-500 z-10"
                    style={{ backgroundColor: shirtColor }}
                >
                    <div className="absolute inset-x-0.5 bottom-0.5 h-1 bg-black/20 opacity-40 rounded-full" />
                </div>

                {/* Legs (Shorter) */}
                <div className="flex gap-0.5 -mt-1 z-10">
                    <div 
                        className="w-1 h-2.5 rounded-full border border-black/40 transition-colors duration-500" 
                        style={{ transformOrigin: 'top center', transform: `rotate(${legAngle}deg)`, backgroundColor: pantsColor }} 
                    />
                    <div 
                        className="w-1 h-2.5 rounded-full border border-black/40 transition-colors duration-500" 
                        style={{ transformOrigin: 'top center', transform: `rotate(${-legAngle}deg)`, backgroundColor: pantsColor }} 
                    />
                </div>
            </div>
        </div>
    );
});

export const ImperialOrchard: React.FC<ImperialOrchardProps> = ({ parcels, season, hiredLabor, county = 'Opolski', onAction, automationConfig, totalCherries = 0, maxCapacity = 10000 }) => {

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

    // Calculate sectorsCount based directly on the number of parcels
    const sectorsCount = displayParcels.length;

    // Calculate default auto-zoom based on sector count
    const defaultZoom = useMemo(() => {
        // 1 sector: 1.0, 2 sectors: 0.85, 3 sectors: 0.7, etc.
        return Math.min(1.2, Math.max(0.4, 1.25 / (1 + sectorsCount * 0.25)));
    }, [sectorsCount]);

    // Initialize zoom to defaultZoom when sectorsCount changes
    useEffect(() => {
        setZoom(defaultZoom);
    }, [defaultZoom]);

    // Build list of valid tree positions for worker targeting
    const treePositions = useMemo(() => {
        const positions: { r: number, c: number, s: number }[] = [];
        for (let s = 0; s < sectorsCount; s++) {
            const parcel = displayParcels[s];
            if (!parcel) continue;
            const parcelSize = parcel.size ? Number(parcel.size) : 0.5;
            const maxTrees = Math.floor(parcelSize * 400);
            const planted = parcel.plantedTrees ? Number(parcel.plantedTrees) : 0;
            const scaleFactor = Math.max(1, Math.ceil(maxTrees / 25));
            const visualTreesCount = planted > 0 ? Math.min(25, Math.max(1, Math.ceil(Math.sqrt(planted / maxTrees) * 25))) : 0;
            const treeSlots = getDeterministicSlots(visualTreesCount, parcel.id);

            for (let idx = 0; idx < 25; idx++) {
                if (treeSlots.has(idx)) {
                    const r = Math.floor(idx / SECTOR_SIZE);
                    const c = idx % SECTOR_SIZE;
                    positions.push({ r, c, s });
                }
            }
        }
        return positions;
    }, [displayParcels, sectorsCount]);

    // Fixed Workers (NPCs) with Manhattan Movement and Seasonal Behavior
    const [workerPos, setWorkerPos] = useState({ r: 0, c: 0, s: 0, targetR: 2, targetC: 2, targetS: 0, pauseTicks: 0, onBridge: false, bridgeProgress: 0 });
    const [helperPos, setHelperPos] = useState({ r: 4, c: 4, s: 0, targetR: 1, targetC: 1, targetS: 0, pauseTicks: 0, onBridge: false, bridgeProgress: 0 });

    const hasHelper = !!(hiredLabor && hiredLabor.length > 0);

    useEffect(() => {
        const interval = setInterval(() => {
            // 1. Update Owner Worker
            setWorkerPos(prev => {
                if (prev.onBridge) {
                    const nextProgress = prev.bridgeProgress + 0.05;
                    if (nextProgress >= 1.0) {
                        return {
                            ...prev,
                            onBridge: false,
                            bridgeProgress: 0,
                            s: prev.targetS > prev.s ? prev.s + 1 : prev.s - 1,
                            r: prev.targetS > prev.s ? 2 : 2,
                            c: prev.targetS > prev.s ? 0 : 4
                        };
                    }
                    return { ...prev, bridgeProgress: nextProgress };
                }

                if (prev.pauseTicks > 0) {
                    return { ...prev, pauseTicks: prev.pauseTicks - 1 };
                }

                let nextR = prev.r;
                let nextC = prev.c;
                let nextS = prev.s;

                // Dynamic speed based on season
                let step = 0.04;
                const phase = seasonStyles.phase;
                if (phase === 'Dormancy') step = 0.015;
                else if (phase === 'Awakening') step = 0.03;
                else if (phase === 'Bloom') step = 0.035;
                else if (phase === 'Harvest') step = 0.06;
                else if (phase === 'Decay') step = 0.025;

                // Immediate target for pathfinding across bridges
                let immR = prev.targetR;
                let immC = prev.targetC;

                if (prev.s < prev.targetS) {
                    immR = 2;
                    immC = 4;
                } else if (prev.s > prev.targetS) {
                    immR = 2;
                    immC = 0;
                }

                // Move closer to immediate target
                if (Math.abs(prev.r - immR) > 0.01) {
                    nextR += immR > prev.r ? Math.min(step, immR - prev.r) : Math.max(-step, immR - prev.r);
                } else if (Math.abs(prev.c - immC) > 0.01) {
                    nextC += immC > prev.c ? Math.min(step, immC - prev.c) : Math.max(-step, immC - prev.c);
                } else {
                    // Reached immediate target
                    if (prev.s < prev.targetS) {
                        return {
                            ...prev,
                            onBridge: true,
                            bridgeProgress: 0.05
                        };
                    } else if (prev.s > prev.targetS) {
                        return {
                            ...prev,
                            onBridge: true,
                            bridgeProgress: 0.05
                        };
                    } else {
                        // Reached final target! Set pause based on season
                        let pause = 0;
                        if (phase === 'Harvest') pause = 50;
                        else if (phase === 'Awakening' || phase === 'Bloom') pause = 25;
                        else if (phase === 'Dormancy') pause = 120;

                        // Choose next target
                        let nextTarget = { r: 2, c: 2, s: 0 };
                        if (phase === 'Dormancy') {
                            const atShelter = prev.r === 0 && prev.c === 0;
                            nextTarget = atShelter ? { r: 4, c: 4, s: 0 } : { r: 0, c: 0, s: 0 };
                        } else if ((phase === 'Harvest' || phase === 'Awakening' || phase === 'Bloom') && treePositions.length > 0) {
                            const randTree = treePositions[Math.floor(Math.random() * treePositions.length)];
                            nextTarget = { r: randTree.r, c: randTree.c, s: randTree.s };
                        } else {
                            nextTarget = {
                                r: Math.floor(Math.random() * SECTOR_SIZE),
                                c: Math.floor(Math.random() * SECTOR_SIZE),
                                s: Math.floor(Math.random() * sectorsCount)
                            };
                        }

                        return {
                            ...prev,
                            targetR: nextTarget.r,
                            targetC: nextTarget.c,
                            targetS: nextTarget.s,
                            pauseTicks: pause
                        };
                    }
                }

                return { ...prev, r: nextR, c: nextC, s: nextS };
            });

            // 2. Update Helper Worker (if present)
            if (hasHelper) {
                setHelperPos(prev => {
                    if (prev.onBridge) {
                        const nextProgress = prev.bridgeProgress + 0.05;
                        if (nextProgress >= 1.0) {
                            return {
                                ...prev,
                                onBridge: false,
                                bridgeProgress: 0,
                                s: prev.targetS > prev.s ? prev.s + 1 : prev.s - 1,
                                r: prev.targetS > prev.s ? 2 : 2,
                                c: prev.targetS > prev.s ? 0 : 4
                            };
                        }
                        return { ...prev, bridgeProgress: nextProgress };
                    }

                    if (prev.pauseTicks > 0) {
                        return { ...prev, pauseTicks: prev.pauseTicks - 1 };
                    }

                    let nextR = prev.r;
                    let nextC = prev.c;
                    let nextS = prev.s;

                    // Helper speeds
                    let step = 0.04;
                    const phase = seasonStyles.phase;
                    if (phase === 'Dormancy') step = 0.015;
                    else if (phase === 'Awakening') step = 0.03;
                    else if (phase === 'Bloom') step = 0.035;
                    else if (phase === 'Harvest') step = 0.06;
                    else if (phase === 'Decay') step = 0.025;

                    let immR = prev.targetR;
                    let immC = prev.targetC;

                    if (prev.s < prev.targetS) {
                        immR = 2;
                        immC = 4;
                    } else if (prev.s > prev.targetS) {
                        immR = 2;
                        immC = 0;
                    }

                    if (Math.abs(prev.r - immR) > 0.01) {
                        nextR += immR > prev.r ? Math.min(step, immR - prev.r) : Math.max(-step, immR - prev.r);
                    } else if (Math.abs(prev.c - immC) > 0.01) {
                        nextC += immC > prev.c ? Math.min(step, immC - prev.c) : Math.max(-step, immC - prev.c);
                    } else {
                        if (prev.s < prev.targetS) {
                            return {
                                ...prev,
                                onBridge: true,
                                bridgeProgress: 0.05
                            };
                        } else if (prev.s > prev.targetS) {
                            return {
                                ...prev,
                                onBridge: true,
                                bridgeProgress: 0.05
                            };
                        } else {
                            let pause = 0;
                            if (phase === 'Harvest') pause = 40;
                            else if (phase === 'Awakening' || phase === 'Bloom') pause = 20;
                            else if (phase === 'Dormancy') pause = 100;

                            let nextTarget = { r: 2, c: 2, s: 0 };
                            if (phase === 'Dormancy') {
                                const atShelter = prev.r === 0 && prev.c === 4;
                                nextTarget = atShelter ? { r: 4, c: 0, s: 0 } : { r: 0, c: 4, s: 0 };
                            } else if ((phase === 'Harvest' || phase === 'Awakening' || phase === 'Bloom') && treePositions.length > 0) {
                                const randTree = treePositions[Math.floor(Math.random() * treePositions.length)];
                                nextTarget = { r: randTree.r, c: randTree.c, s: randTree.s };
                            } else {
                                nextTarget = {
                                    r: Math.floor(Math.random() * SECTOR_SIZE),
                                    c: Math.floor(Math.random() * SECTOR_SIZE),
                                    s: Math.floor(Math.random() * sectorsCount)
                                };
                            }

                            return {
                                ...prev,
                                targetR: nextTarget.r,
                                targetC: nextTarget.c,
                                targetS: nextTarget.s,
                                pauseTicks: pause
                            };
                        }
                    }

                    return { ...prev, r: nextR, c: nextC, s: nextS };
                });
            }
        }, 30);
        return () => clearInterval(interval);
    }, [sectorsCount, treePositions, seasonStyles.phase, hasHelper]);

    // Flatten entities for Modular Isometric Projection
    const worldEntities = useMemo(() => {
        const entities: any[] = [];

        for (let s = 0; s < sectorsCount; s++) {
            const parcel = displayParcels[s];
            if (!parcel) continue;

            const parcelSize = parcel.size ? Number(parcel.size) : 0.5;
            const maxTrees = Math.floor(parcelSize * 400);
            const planted = parcel.plantedTrees ? Number(parcel.plantedTrees) : 0;
            const scaleFactor = Math.max(1, Math.ceil(maxTrees / 25));
            const visualTreesCount = planted > 0 ? Math.min(25, Math.max(1, Math.ceil(Math.sqrt(planted / maxTrees) * 25))) : 0;
            const treeSlots = getDeterministicSlots(visualTreesCount, parcel.id);

            for (let idx = 0; idx < 25; idx++) {
                const r = Math.floor(idx / SECTOR_SIZE);
                const c = idx % SECTOR_SIZE;
                const { x, y } = projectToIso(r, c, s);

                // 1. Soil Plane
                entities.push({
                    type: 'soil',
                    key: `soil-${idx}-${s}`,
                    parcelId: parcel.id,
                    parcel,
                    x, y, r, c, s,
                    zIndex: s * 100 + (r + c) * 10
                });

                // 2. Tree (only if this slot is selected)
                if (treeSlots.has(idx)) {
                    entities.push({
                        type: 'tree',
                        key: `tree-${idx}-${s}`,
                        parcel,
                        x, y,
                        seed: (s * 100) + idx,
                        delay: (idx % 7) * -0.8,
                        zIndex: s * 100 + (r + c) * 10 + 2
                    });
                }
            }

            // 4. Brass Perimeter (The Platform Border)
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

        // 3. Owner Worker NPC
        let wX = 0;
        let wY = 0;
        if (workerPos.onBridge) {
            const startS = workerPos.s;
            const endS = workerPos.targetS > startS ? startS + 1 : startS - 1;
            const posA = projectToIso(2, workerPos.targetS > startS ? 4 : 0, startS);
            const posB = projectToIso(2, workerPos.targetS > startS ? 0 : 4, endS);
            wX = posA.x + (posB.x - posA.x) * workerPos.bridgeProgress;
            wY = posA.y + (posB.y - posA.y) * workerPos.bridgeProgress;
        } else {
            const npos = projectToIso(workerPos.r, workerPos.c, workerPos.s);
            wX = npos.x;
            wY = npos.y;
        }

        entities.push({
            type: 'npc',
            key: 'npc-worker-1',
            x: wX,
            y: wY,
            role: 'owner',
            zIndex: workerPos.s * 100 + (workerPos.r + workerPos.c) * 10 + 5
        });

        // 3b. Helper Worker NPC (if active)
        if (hasHelper) {
            let hX = 0;
            let hY = 0;
            if (helperPos.onBridge) {
                const startS = helperPos.s;
                const endS = helperPos.targetS > startS ? startS + 1 : startS - 1;
                const posA = projectToIso(2, helperPos.targetS > startS ? 4 : 0, startS);
                const posB = projectToIso(2, helperPos.targetS > startS ? 0 : 4, endS);
                hX = posA.x + (posB.x - posA.x) * helperPos.bridgeProgress;
                hY = posA.y + (posB.y - posA.y) * helperPos.bridgeProgress;
            } else {
                const hpos = projectToIso(helperPos.r, helperPos.c, helperPos.s);
                hX = hpos.x;
                hY = hpos.y;
            }

            entities.push({
                type: 'npc',
                key: 'npc-helper-1',
                x: hX,
                y: hY,
                role: 'helper',
                zIndex: helperPos.s * 100 + (helperPos.r + helperPos.c) * 10 + 5
            });
        }

        return entities.sort((a, b) => a.zIndex - b.zIndex);
    }, [displayParcels, sectorsCount, workerPos, helperPos, hiredLabor]);

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
                className="w-full h-full flex items-center justify-center p-4 transition-all duration-700 overflow-visible"
                style={{ perspective: '1200px' }}
            >
                {/* Viewport: No main rotation, pure 2D space with mathematical projection */}
                <div
                    className="relative overflow-hidden cursor-default bg-transparent w-full h-full"
                >
                    {/* Mechanical Zoom Controls */}
                    <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md border border-[var(--brass-primary)]/40 p-1 rounded-lg shadow-lg pointer-events-auto">
                        <button
                            onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
                            className="w-6 h-6 flex items-center justify-center rounded bg-gradient-to-b from-[#d4af37] to-[#8a5a00] hover:from-[#f5d08a] hover:to-[#d4af37] text-slate-950 font-bold border border-[#ffdf99] shadow active:scale-90 transition-all text-xs"
                            title="Zoom In"
                        >
                            ➕
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
                            className="w-6 h-6 flex items-center justify-center rounded bg-gradient-to-b from-[#d4af37] to-[#8a5a00] hover:from-[#f5d08a] hover:to-[#d4af37] text-slate-950 font-bold border border-[#ffdf99] shadow active:scale-90 transition-all text-xs"
                            title="Zoom Out"
                        >
                            ➖
                        </button>
                        <button
                            onClick={() => setZoom(defaultZoom)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-[8px] active:scale-90 transition-all"
                            title="Reset Zoom"
                        >
                            RST
                        </button>
                    </div>
                    {/* 2D Isometric World */}
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <SeasonalVFX season={seasonStyles.phase} />
                        <div
                            className="relative"
                            style={{
                                // Exact algebraic size of isometric grid with zero clipping and centered offsets
                                width: `${SECTOR_SIZE * TILE_W + (sectorsCount - 1) * (SECTOR_SIZE * TILE_W + SECTOR_GAP)}px`,
                                height: `${SECTOR_SIZE * TILE_H}px`
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
                                            parcel={entity.parcel}
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
                                                phase={seasonStyles.phase}
                                                role={entity.role}
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
                            <div className="w-full bg-[var(--emerald-glow)] shadow-[0_0_20px_var(--emerald-glow)] transition-all duration-1000 origin-bottom" style={{ height: `${maxCapacity > 0 ? Math.min(100, (totalCherries / maxCapacity) * 100) : 0}%` }}>
                                <div className="w-full h-full bg-gradient-to-t from-transparent to-white/30 animate-pulse"></div>
                            </div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--brass-primary)] mt-3 uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(0,0,0,1)]">Storage</span>
                        <span className="text-[8px] font-mono text-slate-400 mt-1 drop-shadow-[0_0_3px_rgba(0,0,0,1)]">{totalCherries.toLocaleString()} / {maxCapacity.toLocaleString()} kg</span>
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
                                    { id: 'harvest', icon: '🍒', label: 'Harvest', angle: 45, color: 'bg-rose-900', shadow: 'rgba(136,19,55,0.8)', phases: ['Harvest'] },
                                    { id: 'plant', icon: '🌱', label: 'Plant', angle: 180, color: 'bg-emerald-700', shadow: 'rgba(4,120,87,0.8)', phases: ['Investment'] },
                                    { id: 'organic', icon: '📜', label: 'Organic', angle: 0, color: 'bg-green-800', shadow: 'rgba(22,101,52,0.8)', phases: ['Investment'] }
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
                                                        action.id === 'fertilize' ? "text-emerald-300" :
                                                            action.id === 'plant' ? "text-emerald-300" :
                                                                action.id === 'organic' ? "text-green-300" : "text-slate-300"
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
                    @keyframes petal-fall {
                        0% { transform: translate(0, -20px) rotate(0deg) scale(1); opacity: 0; }
                        10% { opacity: 0.8; }
                        100% { transform: translate(-60px, 150px) rotate(720deg) scale(0.6); opacity: 0; }
                    }
                    @keyframes snow-fall {
                        0% { transform: translate(0, -10px) translateY(0); opacity: 0; }
                        10% { opacity: 0.9; }
                        100% { transform: translate(-20px, 160px); opacity: 0; }
                    }
                    @keyframes frost {
                        0%, 100% { transform: translate(0, 0); opacity: 0.3; }
                        50% { transform: translate(20px, 20px); opacity: 0.6; }
                    }
                    @keyframes shine {
                        0% { background-position: 200% 0%; }
                        100% { background-position: -200% 0%; }
                    }
                `}</style>
            </div>
        </div>
    );
};
