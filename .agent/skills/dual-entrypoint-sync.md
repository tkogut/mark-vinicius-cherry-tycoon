---
description: Migration to Dual Entrypoint Sync v2.0 (Math Parity)
---
# Dual-Entrypoint Sync Protocol v2.0

## Core Principle: Mathematical Identity
All cost constants (e.g., Injector prices), scaling formulas, and spoilage rates MUST be identical across all environments (Track A and Track B).

## No Playground Discounts
The previous 10% testing discount is officially **DEPRECATED**. 
- 100,000 PLN on Mainnet = 100,000 PLN on Playground.

## Testing Strategy
To accelerate testing, adjust **Starting Liquidity** (initial wallet balance) during test-mode initialization instead of modifying item costs. Business logic remains untouched.

## Dual-Write Enforcement
Every logic update in `main.mo` MUST be instantly mirrored in `main_mainnet.mo`, preserving the Motoko syntax rules defined in `.agent/rules/motoko-playground-mainnet-directive.md` and `INFRASTRUCTURE.md`.

## Handshake Verification
When syncing branches, the agent must verify:
> "Handshake Verified: Dual-Entrypoint and Math-Consistency checked using respective .agent/skills/."