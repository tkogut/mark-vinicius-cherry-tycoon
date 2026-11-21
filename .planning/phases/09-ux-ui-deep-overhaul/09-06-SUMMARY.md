---
phase: 09-ux-ui-deep-overhaul
plan: 06
requirements: [UX-09]
status: built, awaiting the owner's merge
date: 2026-11-21
---

# 09-06 Summary: shared building-sprite resolver (UX-09, resolver half)

## What changed

- `frontend/src/lib/buildingSprites.ts` (new): `BuildingSpriteType`, `BUILDING_SPRITE_SEASONS`,
  `LEVELED_BUILDING_FOLDERS`, `SINGLE_TIER_BUILDING_FOLDERS`, `buildingSpriteFolder()`, `seasonKeyFromBackend()`,
  and a new `buildingSpriteSrc(type, season, level)`, the one place the path is built. The explanatory comment
  on the two art tiers moved with the code.
- `frontend/src/components/farm/BuildingSprite.tsx` (new): the `<img>` component, calling `buildingSpriteSrc()`.
- `frontend/src/components/farm/Marketplace.tsx`: the local definitions are gone; it imports the two above.
  Card rendering is untouched.
- `frontend/src/__tests__/buildingSprites.test.ts` (new, 9 tests).
- `frontend/package.json`: lint ceiling `182 -> 180` (see below).
- No asset was added, moved or modified.

## Decisions and deviations from the plan

- **JSX placement:** no file in `lib/` contains JSX, so the resolver stays JSX-free and the component lives in
  `components/farm/BuildingSprite.tsx`, a fourth file the plan's `files_modified` did not list. The orchard
  (09-09) needs the path, not the Marketplace's `<img>`, so the split also matches how it will be used.
- **No snapshot file.** The plan asks for a "snapshot-stable" 96-case matrix. A snapshot generated from the new
  code would only restate it, so the matrix compares the resolver with an independent hand-written table
  (folder per type and tier) instead.
- **`season` is typed `unknown`** in the new files (it was `any`). That removed two `any` warnings, and the
  lint ceiling went from 182 to 180 (actual count 180, 0 errors). Lowering it is consistent with the ratchet
  in CLAUDE.md; any other open branch that adds warnings will now hit it earlier.

## Evidence

- Tests written first; red because the module did not exist (import error), green after the extraction.
- Guards proved by breaking them, then restored:
  - renamed `warehouse-l2/winter.png`: "every reachable path is a file" fails and names
    `/assets/buildings/warehouse-l2/winter.png`;
  - tier threshold changed to `level >= 3`: the 96-case matrix and the threshold test fail;
  - a second `const LEVELED_BUILDING_FOLDERS` in `Marketplace.tsx`: the single-definition scan fails;
  - an empty folder `zz-orphan` in `public/assets/buildings/`: the orphan check fails and names it.
- `grep` for the folder maps outside `__tests__` finds the declaration only in `lib/buildingSprites.ts`; the
  Marketplace no longer declares `buildingSpriteFolder`.
- `./validate.sh full`: unit, lint (180 warnings, 0 errors), typecheck, build, 61 e2e, declarations, all green.
- Orphaned sprite folders found by the scan: none (6 folders, 24 files, all reachable).

## Not verified

- **The Marketplace in a browser.** The rendered cards were not looked at; "no change" rests on the matrix
  against the hand-written table and on the e2e suite, which does not assert sprite paths.
- The matrix covers the resolver, not `<BuildingSprite>` itself; no test renders it.
- Whether 09-09's orchard will want anything else from the module (for example a size or anchor per type) is
  not decided here.
