# Math-Consistency Rule

> **Scope**: All backend and frontend calculations related to the game's economy and simulation.
> **Purpose**: To guarantee that Mark Vinicius Cherry Tycoon remains a deterministic, mathematically sound simulation. Agents MUST NOT invent new scaling vectors or formulas without explicitly updating this rule first.

## 1. Yield Calculation Formula
**Formula**: `Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge`
- **Base**: Standard production per hectare (e.g., 20,000 kg).
- **Modifiers**: All modifiers are multipliers (e.g., 1.1x for good pH, 0.8x for drought).
- **County Multipliers (Opole DNA)**:
  - Głubczyce: 1.10x
  - Opole: 1.08x
  - Namysłów: 1.05x

## 2. Shared Market Pricing Formula
**Formula**: `Price = Base * clamp(Demand / (Total_Supply), 0.5, 1.0)`
- **Base**: Base price for Retail (15 PLN) or Wholesale (10 PLN).
- **Total_Supply**: The combined volume of cherries sold by the Player AND all AI Competitors present in that market segment.
- **Protection**: The price CANNOT drop below 50% of the base price (the `clamp` at 0.5).

## 3. Safe Arithmetic Policy
- **Motoko Types**: Use `Nat` for all non-negative balances.
- **Underflow Protection**: You MUST NOT perform naked subtraction (`a - b`) on `Nat` types if `b` could be greater than `a`.
- **Enforcement**: Always use `Int.abs` or explicit guard statements (`if (balance < cost) return #Err(...)`).
- **Rounding**: Keep financial calculation precision high; drop remainders only at the final assignment.

> [!WARNING]
> If a task requires modifying how money or yield is calculated, you MUST verify that the changes do not break the bounds defined in this document.
