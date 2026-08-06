// Unit + parity coverage for the harvest-time modifiers in gameLogic.ts that
// are NOT part of `calculateYieldPotential` (those live in economyParity.test.ts).
//
// These two mirror different backend modules:
//   getWeatherYieldImpact   <- game_logic.mo   `applyWeatherImpact`
//   getLaborYieldMultiplier <- hiring_logic.mo `applyHarvestLaborMultiplier`
// Both are applied by main.mo AFTER the base yield, so a drift here silently
// misreports the number the player is about to bank.

import { describe, it, expect } from 'vitest';
import {
    getAgeModifier,
    getSoilModifier,
    getPhModifier,
    getWaterModifier,
    getOrganicModifier,
    getCountyModifier,
    getWeatherYieldImpact,
    getLaborYieldMultiplier,
} from '@/lib/gameLogic';

describe('gameLogic: tree age modifier', () => {
    it.each([
        [0n, 0.0],
        [1n, 0.33],
        [2n, 0.66],
        [3n, 1.0],
        [20n, 1.0],
        [40n, 1.0],
    ])('age %s -> %s', (age, expected) => {
        expect(getAgeModifier(age)).toBe(expected);
    });

    it.each([[41n], [99n]])('age %s is past the 40-year cutoff -> 0 (backend returns null/dead)', (age) => {
        expect(getAgeModifier(age)).toBe(0.0);
    });
});

describe('gameLogic: soil modifier', () => {
    it.each([
        [{ SandyClay: null }, 1.0],
        [{ Clay: null }, 0.9],
        [{ Sandy: null }, 0.85],
        [{ Waterlogged: null }, 0.6],
    ])('%o -> %s', (soil, expected) => {
        expect(getSoilModifier(soil as never)).toBe(expected);
    });
});

describe('gameLogic: pH modifier (boundaries matter — backend uses >= / <=)', () => {
    it.each([
        [5.0, 0.7],
        [5.49, 0.7],
        [5.5, 0.9],  // lower edge of the 0.9 band
        [5.99, 0.9],
        [6.0, 1.0],  // lower edge of the optimum
        [6.5, 1.0],
        [7.0, 1.0],  // upper edge of the optimum (inclusive)
        [7.01, 0.9],
        [7.5, 0.9],  // upper edge of the 0.9 band (inclusive)
        [7.51, 0.7],
        [8.0, 0.7],
    ])('pH %s -> %s', (pH, expected) => {
        expect(getPhModifier(pH)).toBe(expected);
    });
});

describe('gameLogic: water modifier (boundaries matter — backend uses < and >)', () => {
    it.each([
        [0.0, 0.7],
        [0.29, 0.7],
        [0.3, 1.0],   // 0.3 is NOT "< 0.3", so it is optimal
        [0.5, 1.0],
        [0.8, 1.0],   // 0.8 is NOT "> 0.8", so still optimal
        [0.81, 0.85],
        [1.0, 0.85],
    ])('water %s -> %s', (water, expected) => {
        expect(getWaterModifier(water)).toBe(expected);
    });
});

describe('gameLogic: organic + county modifiers', () => {
    it('organic carries the GDD conversion penalty', () => {
        expect(getOrganicModifier(true)).toBe(0.8);
        expect(getOrganicModifier(false)).toBe(1.0);
    });

    it.each([
        ['Głubczyce', 1.10],
        ['Opole', 1.08],
        ['Namysłów', 1.05],
        ['Nyski', 1.0],
        ['Brzeski', 1.0],
        ['', 1.0],
    ])('county %s -> %s', (county, expected) => {
        expect(getCountyModifier(county)).toBe(expected);
    });
});

// ============================================================================
// Weather — transcription of game_logic.mo `applyWeatherImpact`
// ============================================================================

/** Motoko's impact table, verbatim. */
function refWeatherImpact(type: string, severity: number): number {
    switch (type) {
        case 'Sunny': return 1.0;
        case 'Rainy': return 0.95 - severity * 0.1;
        case 'Frost': return 0.6 - severity * 0.3;
        case 'Drought': return 0.7 - severity * 0.2;
        case 'Heatwave': return 0.8 - severity * 0.15;
        case 'Flood': return 0.4 - severity * 0.4;
        case 'PestOutbreak': return 0.8 - severity * 0.3;
        case 'DiseaseOutbreak': return 0.7 - severity * 0.25;
        default: throw new Error(`unhandled weather in reference: ${type}`);
    }
}

const WEATHER_TYPES = [
    'Sunny', 'Rainy', 'Frost', 'Drought',
    'Heatwave', 'Flood', 'PestOutbreak', 'DiseaseOutbreak',
] as const;

describe('gameLogic: weather impact mirrors game_logic.mo applyWeatherImpact', () => {
    const severities = [0.0, 0.25, 0.5, 0.75, 1.0];

    it.each(
        WEATHER_TYPES.flatMap((type) => severities.map((s) => [type, s] as const))
    )('%s @ severity %s', (type, severity) => {
        expect(getWeatherYieldImpact({ [type]: null }, severity)).toBeCloseTo(
            refWeatherImpact(type, severity), 12
        );
    });

    it('covers every Weather variant the Candid interface declares', () => {
        // If the backend adds a weather type, this count must be updated AND
        // the mirror extended — otherwise the new type silently falls through
        // to 1.0 (no impact) in the UI.
        expect(WEATHER_TYPES).toHaveLength(8);
    });

    it('falls back to neutral when there is no weather event', () => {
        expect(getWeatherYieldImpact(null, 0.5)).toBe(1.0);
    });

    it('is neutral for an unknown weather type (defensive default)', () => {
        expect(getWeatherYieldImpact({ Blizzard: null }, 0.9)).toBe(1.0);
    });
});

// ============================================================================
// Labor — hiring_logic.mo `applyHarvestLaborMultiplier`
// ============================================================================

/**
 * The backend does INTEGER maths here, not float:
 *   case (?#Village)   { Int.abs((baseAmount * 9) / 10) }
 *   case (?#Standard)  { Int.abs(baseAmount) }
 *   case (?#City)      { Int.abs((baseAmount * 11) / 10) }
 *   case (?#Emergency) { Int.abs((baseAmount * 8) / 10) }
 *   case null          { Int.abs((baseAmount * 8) / 10) }  // Emergency penalty
 * Nat division truncates, so the backend result is a floor, while the frontend
 * multiplies by a float ratio for its display estimate.
 */
function refLaborAmount(baseAmount: number, type: string | null): number {
    switch (type) {
        case 'Village': return Math.floor((baseAmount * 9) / 10);
        case 'Standard': return baseAmount;
        case 'City': return Math.floor((baseAmount * 11) / 10);
        case 'Emergency': return Math.floor((baseAmount * 8) / 10);
        default: return Math.floor((baseAmount * 8) / 10);
    }
}

describe('gameLogic: labor multiplier mirrors hiring_logic.mo', () => {
    it.each([
        ['Village', 0.9],
        ['Standard', 1.0],
        ['City', 1.1],
        ['Emergency', 0.8],
    ])('%s -> ratio %s', (type, expected) => {
        expect(getLaborYieldMultiplier({ [type]: null })).toBe(expected);
    });

    it('unhired labour takes the Emergency penalty, matching the backend null case', () => {
        expect(getLaborYieldMultiplier(null)).toBe(0.8);
    });

    it('is neutral-safe for an unknown labour type', () => {
        expect(getLaborYieldMultiplier({ Robots: null })).toBe(0.8);
    });

    // The frontend ratio is a display approximation of the backend's integer
    // arithmetic. Pin the size of that approximation so it stays sub-kilogram
    // and can never silently grow into a real discrepancy.
    it.each([
        ['Village', 'Village'],
        ['Standard', 'Standard'],
        ['City', 'City'],
        ['Emergency', 'Emergency'],
        ['unhired', null],
    ])('float estimate stays within 1 kg of the backend integer result (%s)', (_label, type) => {
        const laborArg = type === null ? null : { [type]: null };
        for (const baseAmount of [0, 1, 7, 999, 53_743, 1_234_567]) {
            const estimate = baseAmount * getLaborYieldMultiplier(laborArg);
            const authoritative = refLaborAmount(baseAmount, type);
            expect(Math.abs(estimate - authoritative)).toBeLessThan(1);
        }
    });
});
