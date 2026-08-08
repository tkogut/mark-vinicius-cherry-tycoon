---
spike: 001
name: pocketic-for-backend-tests
question: "Can @dfinity/pic (PocketIC) replace the shell-script backend test suite, running Motoko canister logic tests inside the same Vitest runner as the frontend unit tests?"
verdict: "NO — not with the current dfx. Blocked by a hard version incompatibility. Fall back to an ephemeral dfx replica; revisit when dfx bundles a newer pocket-ic-server."
date: 2026-08-06
requirement: QUAL-08
---

# Spike 001: PocketIC for backend logic tests

## Why this was attractive

Phase 10's plan proposed [`@dfinity/pic`](https://www.npmjs.com/package/@dfinity/pic)
(PicJS, DFINITY's official TS client for PocketIC) to replace
`execution/tests/*.sh`. The pitch was strong:

- deterministic, in-process canister testing with **no `dfx start`**
- **typed actors** instead of untyped Candid string-matching
- control over the replica's **system time and timers**, which would make
  season progression testable — it currently is not, since `advanceSeason` was
  removed
- one runner for L1 (frontend units) and L3 (canister logic)

## What was actually found

**dfx 0.24.3 already bundles a `pocket-ic` binary** — a genuinely good start,
since CI installs dfx anyway, so no extra download would be needed:

```
$ ls $(dfx cache show) | grep pocket
pocket-ic
$ $(dfx cache show)/pocket-ic --version
pocket-ic-server 6.0.0
```

A spike test was written (start `PocketIcServer` with `binPath` pointing at the
dfx cache, `setupCanister` with the real `.dfx/local/canisters/backend/backend.wasm`,
then call `getGlobalSeason` and `initializePlayer`). It failed at instance
creation:

```
ServerError: PocketIC server error: Failed to deserialize the JSON body into
the target type: missing field `nonmainnet_features` at line 1 column 198
```

That is a **client/server protocol mismatch**, not a configuration mistake. Per
the pic-js CHANGELOG, each PicJS release targets one server major:

| `@dfinity/pic` | targets `pocket-ic-server` |
|---|---|
| `@hadronous/pic` 0.10.x | **6.0.0** |
| 0.12.0 | 8.0.0 |
| 0.13.0 | 9.0.0 |
| 0.17.0 | 11.0.0 |
| 0.19.0+ | 12.0.0 |
| 0.23.0 (latest) | 12.0.0 |

The only client that speaks to server **6.0.0** is `@hadronous/pic@0.10.x` —
the pre-donation scope, which is **no longer on the npm registry**:

```
$ npm view @hadronous/pic versions
npm error 404 '@hadronous/pic@*' is not in this registry
$ npm view @dfinity/pic versions   # oldest available
0.12.0-b0 ...                       # needs server 8.0.0
```

## Verdict: do not adopt (yet)

Making PocketIC work would require downloading a `pocket-ic-server` v8+ binary
separately. That is not merely inconvenient:

1. **Adds a third version to keep aligned.** The repo would carry a
   dfx ↔ pocket-ic-server ↔ PicJS coupling. This project already has documented
   drift problems (`EOP-01`, the dual entrypoint; 12 rotted shell scripts) —
   adding a hidden three-way pin is the wrong trade.
2. **Canister tests would run on a different IC version than the game deploys
   to.** dfx 0.24.3 gives server 6.0.0; the tests would run on 8+. A test suite
   that exercises a different runtime than production is a weaker signal, and
   this is a correctness concern, not a convenience one.
3. **The fallback already works.** `test-backend-logic.yml` spins up an
   ephemeral dfx replica in CI today, using the exact replica the game runs on,
   with zero new dependencies.

`@dfinity/pic` was **uninstalled** and `package.json` / `package-lock.json`
restored (verified: no `@dfinity/pic` reference remains, `npm ci` clean).

## Revisit trigger

Reopen this when **dfx bundles a `pocket-ic-server` whose major matches a
current `@dfinity/pic`**. Check with:

```bash
$(dfx cache show)/pocket-ic --version
npm view @dfinity/pic version
```

If those line up, the original argument stands and the migration becomes cheap.
Until then, backend logic tests should be written as Vitest tests against an
ephemeral dfx replica — the pattern already established in
`frontend/src/__tests__/backend_integration.test.ts` (opt-in via
`RUN_INTEGRATION`, typed actor, real assertions). That captures most of the
benefit — typed actors, one runner, real assertions instead of string-matching —
and gives up only PocketIC's determinism and time control.
