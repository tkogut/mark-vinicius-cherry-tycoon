/**
 * Game Balance Constants
 * Single source of truth for UI display values.
 * Keep in sync with math_consistency.md and backend/game_logic.mo.
 */

// ── Storage & Spoilage (math_consistency.md §1) ────────────────────
export const WAREHOUSE_SPOILAGE_RATE = 0.80; // 80% lost
export const WAREHOUSE_SPOILAGE_ARMOR = 20;  // 20% protected

export const COLD_STORAGE_SPOILAGE_RATE = 0.20; // 20% lost
export const COLD_STORAGE_SPOILAGE_ARMOR = 80;  // 80% protected

// ── Quality Score Impacts (math_consistency.md §2) ─────────────────
export const COLD_STORAGE_QUALITY_PER_LEVEL = 3.0;
export const SPRAYER_QUALITY_PER_LEVEL = 5.0;
export const SHAKER_QUALITY_PER_LEVEL = -2.0;
