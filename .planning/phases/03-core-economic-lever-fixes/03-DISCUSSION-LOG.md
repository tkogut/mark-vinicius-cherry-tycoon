# Phase 3: Core Economic Lever Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-16
**Phase:** 3-core-economic-lever-fixes
**Areas discussed:** Typy nawozu (ECON-01), Mnożnik sezonowy (ECON-02), Trickle-down (ECON-03), Prestiż gracza (ECON-04)

---

## Typy nawozu (ECON-01)

| Option | Description | Selected |
|--------|-------------|----------|
| A: Standard/Premium (+0.1/+0.15) | 2 types, reuses existing fertility mechanic, smallest change | |
| B: 3 types z mnożnikiem plonu | Organic-Compatible / Synthetic-Standard / Synthetic-Intensive, new term in `calculateYieldPotential` | ✓ |
| C: Slow-Release/Fast-Acting | Same fertility mechanic, different duration instead of a yield-formula change | |

**User's choice:** B — 3 typy z mnożnikiem plonu.

**Follow-up: organic-parcel interaction**

| Option | Description | Selected |
|--------|-------------|----------|
| Reject the action | Canister rejects Synthetic-Intensive on an organic parcel | |
| Auto-flip `isOrganic` to false | Silent side effect on apply | |
| Allow, UI warns only | Backend does not block or mutate `isOrganic`; frontend warns before confirm | ✓ |

**User's choice:** Allow, UI warns only.
**Notes:** Backend never mutates `isOrganic` as a side effect of fertilizing in this phase — organic-status change mechanics (if wanted) are out of scope.

---

## Mnożnik sezonowy (ECON-02)

| Option | Description | Selected |
|--------|-------------|----------|
| A: Proporcjonalny do popytu AI | Spring 0.9x / Summer 1.15x / Autumn 1.0x / Winter 0.75x, anchored to `getSeasonDemand` | ✓ |
| B: Minimalny (tylko Lato) | Summer 1.1x, rest 1.0x | |
| C: Symetryczny | Summer 1.15x / Winter 0.85x, Spring/Autumn 1.0x | |

**User's choice:** A.

**Follow-up: composition order vs. Flood Factor**

Claude initially asked whether the season multiplier should apply before or after the Flood Factor (`stableSpotPrice`)-driven `marketMult` adjustment in `calculateWholesalePrice`. The user asked for help deciding ("nie wiem co wybrać - pomóż mi"). Claude read the actual `main.mo`/`competitor_logic.mo` code before answering, found the question was based on a wrong premise — `marketMult` is computed and capped ([0.50, 1.0]) *before* entering the revenue formula, so the season multiplier is just one more commutative factor in the same product; order does not change the result. Also found `computeMarketMultiplier` is capped at 1.0 (can never express a premium, only ever neutral-or-penalize), confirming Option A's summer premium is additive, not redundant. No further decision was needed — Claude corrected course rather than forcing a choice on a non-decision.

---

## Trickle-down (ECON-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Dodatkowa premia (recommended) | Runner-up gets 20% of full `requiredVolumeKg` × their own price as an ADDITIONAL payout; winner's payout unchanged | ✓ |
| Realny podział wolumenu | Winner's payout reduced by 20%, that volume redirected to runner-up at their price | |

**User's choice:** Dodatkowa premia (matches `03-RESEARCH.md`'s lowest-risk recommendation).
**Notes:** Both the player-as-runner-up and AI-as-runner-up branches in `main.mo` need wiring — this was noted as an implementation-completeness requirement, not something needing a separate user decision.

---

## Prestiż gracza (ECON-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Płaskie +5 (dosłownie) | Player reputation (0-100) gets +5, same literal number as AI's prestige (0-1000) +5 | ✓ (final) |
| Przeskalowane proporcjonalnie (~+0.5) | Credit scaled to the player's smaller range for equal relative impact | |

**User's choice (initial framing):** neither yet — user asked "a nie lepiej ustawić dla obu skale 0-1000?" (why not just give both the same 0-1000 scale?).

**Claude's response:** Investigated `types.mo` directly rather than answering from assumption. Found AI actually has TWO separate fields — `prestige: Nat // 0-1000` (what gets +5 on auction win) and `reputation: Nat // 0-100 local trust` (already the same scale as the player's field). Rescaling `PlayerFarm.reputation` (stable state, every existing player already has a persisted 0-100 value) to 0-1000 would require a data migration and an audit of every other consumer of that field ("affects contracts and club deals") — and would only fix the mismatch against `prestige` while breaking the existing match against `reputation`. Presented this finding plus a third explicit option (go ahead with the migration anyway, despite the risk) back to the user.

**User's final choice:** Płaskie +5, no scale migration — explicitly rejecting the 0-1000 migration option after seeing the tradeoff.

---

## Claude's Discretion

- Exact fertilizer-type display copy/labels within the 3 locked role names (Organic-Compatible / Synthetic-Standard / Synthetic-Intensive)
- Exact wording/placement of the organic-status UI warning
- ECON-05/06/07 — no discussion needed, mechanical fixes per `03-RESEARCH.md`

## Deferred Ideas

- Reputation/prestige scale unification (`PlayerFarm.reputation` 0-100 → 0-1000, with migration) — raised by the user during ECON-04 discussion, explicitly deferred as a possible future phase rather than bundled into Phase 3.
- Real live bidding status for `BidModal.tsx`'s `RivalryDeck` — flagged by `03-UI-SPEC.md`, not this phase's scope.
