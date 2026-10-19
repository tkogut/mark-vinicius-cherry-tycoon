# Changelog

This file records **releases**: an entry appears when a tag is cut, and at no
other time. The day-to-day record lives where it cannot drift from the work:

- **Commit messages**: reasoning, verification, and what was deliberately *not*
  fixed. `git log` is the changelog.
- **`.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md`**: phase and
  requirement status, with the evidence attached.

Versioning rules (when to bump, when to tag, what `0.x` means) are in
`CLAUDE.md` -> Releasing. Earlier content of this file (February 2026,
headed `[Unreleased]`) described a type system that has since been rewritten;
it is in git history.

## [0.9.0] - 2026-10-16

The first tagged release. `0.x` means V1 Parity has not shipped: the farm loop
and the football-club thread both work end to end, but Phases 4-8 (weather UI,
regional geography, Cherry Festival, crop insurance, onboarding) and most of
Phase 9 (UX/UI overhaul) are still open.

### Changed - payouts and prices a player will notice
- **Fertilizer** is a real choice and costs differ by type: `SyntheticStandard`
  500 PLN, `SyntheticIntensive` 800 PLN (+5% yield), `OrganicCompatible` 650 PLN.
  One application per parcel per season. Synthetic types are refused on organic
  or certified parcels. (ECON-01, ECON-REBALANCE)
- **Season affects the sale price**, and `getMarketPrices` reports the real
  seasonal term instead of a constant 1.0. (ECON-02)
- **Organic cherries spoil** at the same rate as conventional ones entering
  Winter; they used to be exempt. Guest mode now spoils both stocks. (ECON-12)
- **Infrastructure yield no longer depends on purchase order**: additive bonuses
  are summed first and the Golden Harvester multiplies last. A Golden Harvester
  bought before another yield asset now yields more (GH L2 + Tractor L3:
  1.2525 -> 1.267875). (ECON-PARITY-01)
- **Maintenance and repair are real**: infrastructure upkeep drifts upward each
  season and repair is priced off the accumulated wear, so servicing is worth
  doing for every asset type. (MAINT-01, MAINT-02)
- **Auctions**: the runner-up is paid instead of discarded, and the player earns
  reputation for winning an Imperial Contract. Pre-Season Future contracts can no
  longer evade shortfall checks or lock in a full contract for a token fee.
  (ECON-03, ECON-04, ECON-08, ECON-09)

### Added
- **Football clubs (Sports Patron, vertical slice)**: eight real clubs in the
  lower Opolskie pyramid, real share purchases, and a rewired Sports Center.
  Owning a club costs cash but does not yet change the orchard. (SPORTS-01..03)
- **Leaderboard**: a "Your Standing" card and a mobile layout. (LEAD-02, LEAD-03)
- **Build identity**: the badge shows `<version> · <sha>` (hover: network and
  commit time), replacing a hand-written "v3.8" that nothing produced.
- Orchard: workers on the isometric grid; fertilizer-type picker on the radial
  menu. (UX-07, ECON-01)

### Fixed
- Atomic Auth: `isAuthenticated` is set only after the actor is ready, on every
  entry path including the restored session. (AUTH-01, AUTH-02)
- Competitors panel showed `NaN%` market share and invented figures; it now
  computes from real capacity. AI archetype names are consistent. (ECON-06, ECON-07)
- One spoilage system in code, documented against what actually runs. (ECON-05)
- Sidebar header layout on all screens; emoji icons rendering as tofu without an
  emoji font; `$` shown for a game priced in PLN. (UX-01, UX-10, UX-11)
- Fertilizer-picker labels wrapped to two lines in wide fallback fonts, which had
  kept the E2E check red in CI. (QUAL-12)

### Quality infrastructure
- `npm test`, an ESLint ratchet (errors 0, warnings only go down), Playwright
  specs against the dev harnesses, TS <-> Motoko economy parity tests, a Candid
  drift guard, one ordered gate (`./validate.sh fast|full|backend`), and CI
  workflows for unit, E2E and a backend smoke test. (QUAL-01..08)

### Known gaps
- **Mainnet is not deployable**: `backend/main_mainnet.mo` does not compile and
  the mainnet workflow targets a canister that is not in `dfx.json`. (EOP-01)
- Not started: Phases 4-8. Open in Phase 9: UX-02..06, 08, 09.
- Sports Patron has no orchard impact and no league simulation yet. (SPORTS-04..06)
- Parcel yield display ignores the applied fertilizer type; two economy docs carry
  stale auction constants. (ECON-10, ECON-11)

[0.9.0]: https://github.com/tkogut/mark-vinicius-cherry-tycoon/tree/v0.9.0
