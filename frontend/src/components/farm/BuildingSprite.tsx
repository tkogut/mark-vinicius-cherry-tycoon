import React from 'react';
import { buildingSpriteSrc, type BuildingSpriteType } from '@/lib/buildingSprites';

/** Real seasonal (and, for buildings with more than one art tier, level-aware) raster sprite — same pre-rendered art in every season the game recognizes, swapped by an <img> src change rather than redrawn. */
export const BuildingSprite: React.FC<{ buildingType: BuildingSpriteType; season: unknown; level: number }> = ({ buildingType, season, level }) => (
    <img
        src={buildingSpriteSrc(buildingType, season, level)}
        alt=""
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
    />
);
