# Lessons

Mistakes that already happened here, written as rules that prevent them happening again.

**How to use this file:** read it before starting work in a subsystem it names. It is short on purpose — if it grows past ~40 entries, the oldest ones have either become conventions (move them to `.planning/codebase/CONVENTIONS.md`) or stopped mattering (delete them).

**How to add to it:** when the user corrects you, or a gate catches something you believed was fine, add an entry the same session. One entry = one mistake. Say what was believed, what was true, and the rule. No entry for "I made a typo" — only for things that cost a round trip, a wrong commit, or a false report.

Format: `### <short rule>` / **Was:** what I believed / **Actually:** what was true / **Rule:** what to do instead.

---

## Verification

### "It compiles" and "the tests pass" are not evidence the behaviour is right

**Was:** treated a green `dfx build` + green Vitest as proof that a backend change worked.
**Actually:** MAINT-01's wear logic compiled and its mirror tests passed while the real question — does upkeep actually drift when a season turns, and does repair actually charge what it says — could only be answered by reading values back off a replica. The parity suite only proves the frontend agrees with a *transcription* of Motoko, never with Motoko itself.
**Rule:** for any backend behaviour change, deploy to a local replica and read the numbers back. Put the observed sequence in the commit message (`240 -> 264 -> 288 -> 312`, `cash 33_677 -> 33_641`). If a value is too expensive to reach on a replica (MAINT-01's 200% cap needed ~10 more season transitions and risked the `InsufficientFunds` guard), pin it in a test and say in the commit that that is what happened.

### Prove a guard works by removing it

**Was:** added tests for AUTH-02 and reported them passing.
**Actually:** passing tests do not show the tests would have caught the bug. Reverting the guard made 2 of the new tests fail and name the offending combination (`network=ic, alreadyAuthenticated=true`) — that is the evidence.
**Rule:** after writing a test for a specific defect, break the fix and confirm the test fails for the right reason. Same for drift guards: the Candid contract guard was verified by renaming a backend method.

### Do not relay a recorded finding as if freshly checked

**Was:** repeated "Track B does not compile (EOP-01)" from notes across several sessions.
**Actually:** true, but I had not run it. When I finally did (`moc --check`), it gave the specific errors — `duplicate field name activeInsurance` at line 261, contract type errors at 1591 — which are what actually make a fix plannable. And re-checking surfaced something bigger the notes never had: `deploy-mainnet.yml` deploys `backend_mainnet`, a canister that is not in `dfx.json` at all.
**Rule:** when a claim is load-bearing for a decision, re-verify it and say you did. State recorded-but-unverified claims as recorded.

## Tooling traps

### Python text mode silently normalises CRLF — never scan line endings with it

**Was:** scanned `execution/tests/*.sh` for CRLF in Python and reported 0 files affected.
**Actually:** 10 of 23 files had CRLF. Python's text mode translates `\r\n` to `\n` on read, so the scan could not possibly have found any. The JS scanner in `legacyShellScripts.test.ts` caught my false report.
**Rule:** read bytes (`open(path, 'rb')`) for anything about encoding, line endings, or BOMs. More generally: if a scan returns exactly zero hits, suspect the scanner before believing the result.

### `set -o pipefail` makes `if cmd | grep` read backwards

**Was:** wrote `if moc --check file | grep "type error"; then` to detect compile failures in `validate.sh`.
**Actually:** with `pipefail` the pipeline reports the *leftmost* failure, i.e. `moc`'s non-zero exit, not `grep`'s match/no-match. The branch inverted and the script reported a file with 5 type errors as "UNEXPECTEDLY CLEAN".
**Rule:** capture into a variable, then test the variable (`out="$(cmd 2>&1 || true)"; if [[ -n "$out" ]]`). Never put the command whose exit code you are ignoring on the left of a pipe inside an `if`.

### `dfx canister call` needs method and args as separate arguments

**Was:** passed `"methodName '(args)'"` as a single string from a shell helper.
**Actually:** every call came back "Player not found" — the method name was never parsed, so it looked like a state problem rather than a call-shape problem.
**Rule:** `dfx canister call backend method '(args)'` — separate words. When a replica call fails in a way that implicates *state*, first prove the call shape is right.

### Don't add `eslint-disable` pre-emptively — the rule is probably not enabled

**Was:** wrote `// eslint-disable-next-line no-bitwise` above a `mode & 0o111` check, assuming the rule was on. Did the same thing in Phase 10 with `no-console`.
**Actually:** neither rule is enabled in `.eslintrc.cjs`, and `--report-unused-disable-directives` turns a pointless suppression into a hard **error**, so lint went red on my own new file. Twice now.
**Rule:** never add a suppression speculatively. Write the code, run `./validate.sh fast`, and only suppress what actually fires — with a reason in the comment.

### ESLint 8.57 needs legacy config here, not flat

**Was:** reached for `eslint.config.js` (flat config).
**Actually:** 8.57 only honours flat config behind `ESLINT_USE_FLAT_CONFIG`, and flat config rejects the `--ext` flag the lint script needs. `.eslintrc.cjs` is the working shape.
**Rule:** don't migrate this repo's ESLint config as a side quest.

## Isometric / Canvas work

### The isometric seam runs bottom-vertex → right-vertex, not left → right

**Was:** drew same-row path seams along the left→right diagonal. Shipped wrong twice; the user caught both on live deploys ("scieżki nadal sa źle zlokalizowane").
**Actually:** in this projection (`TILE_W=96`, `TILE_H=48`) a same-row boundary runs from the tile's *bottom* vertex to its *right* vertex.
**Rule:** before drawing anything on tile boundaries, derive the vertex pair from `projectToIso` on paper. Path lanes live on boundaries (a half-integer *lattice*), never through tile centres — the original UX-06 spec said centres and was wrong.

### Sketch canvases have a ground margin; entities need a Y offset or they levitate

**Was:** dropped the sketch's worker/machine canvases straight onto lattice coordinates.
**Actually:** the sketch draws its shadow at local y≈163 of a 200px canvas, so every entity floated a fixed distance above its own shadow and walked *beside* the path rather than on it. Needed `WORKER_Y_OFFSET` / `MACHINE_Y_OFFSET` / `TREE_Y_OFFSET`.
**Rule:** when porting art from a standalone sketch, measure where its ground line sits inside the canvas and compensate. The user reported this as "wygląda jakby lewitowali" — trust that phrasing, it means a constant offset.

### Depth must come from continuous projected Y, not tile buckets

**Was:** z-ordered entities with `(row + col) * 10` buckets.
**Actually:** workers rendered inside canopies and vanished behind trunks, because entities move continuously between tiles while the bucket jumps. Fixed with `s * 100000 + round(y * 10) + typeOffset` off the continuous projected `y`.
**Rule:** anything that moves between tiles sorts on its projected `y`, not its tile index.

### Occluders that hide gameplay must go, not be layered around

**Was:** the trees' elliptical brass base ring looked good and hid workers entirely.
**Actually:** no z-order fix helps when the sprite itself covers the tile. Removing the ring was the fix.
**Rule:** decoration that occludes an interactive entity is a bug, not a layering problem.

## Sprites and assets

### Extract sprites by connected components, not hand-tuned bounding boxes

**Was:** cut sprites from AI-generated sheets with measured pixel rectangles.
**Actually:** clipped parts of the artwork ("słabo to wyszło bo poucinałeś część grafik"). Replaced with `scipy.ndimage` connected-component labeling, taking the largest blob per quadrant, which also avoids bleed from neighbouring art.
**Rule:** label components and take the largest blob per region. Never eyeball a crop box on someone else's artwork.

## Deployed-only bugs

### Never use emoji as a UI icon — they are tofu on someone else's machine

**Was:** used emoji (🌳 📍 💧 ✂️ …) as icons in 30 places, and never saw a problem locally.
**Actually:** every developer machine has an emoji font. A bare headless Chromium does not, and neither do many Linux clients. On the 2026-08-07 Playground deploy the orchard readout said `▯ 50 trees`. It also meant the app had two parallel icon vocabularies — lucide everywhere else, emoji here.
**Rule:** icons are `lucide-react` SVGs. Pinned by `uiConventions.test.ts`. The wider point: a class of bug exists that is invisible on the machine that wrote it, so screenshot the *deployed* build, not just the dev server.

### A filesystem test can pass locally and fail on a fresh checkout

**Was:** `agentDocs.test.ts` passed on every local run, so I treated it as proven.
**Actually:** the first CI run of it failed twice. (1) `validate.sh` was committed as `100644` — I had `chmod +x`'d the working copy *after* `git add`, so my machine could run it and a fresh clone could not. (2) The test asserted every path named in `CLAUDE.md` resolves, but `.claude/settings.local.json` is untracked-by-design, so it exists here and nowhere else.
**Rule:** any test that reads the filesystem is testing *your* working copy, not the repo. For anything about file modes or presence, ask git (`git ls-files -s`), and give intentionally-untracked paths an explicit exemption with a reason. Fix modes with `git update-index --chmod=+x`, not `chmod` alone.

### Playground canister IDs change on every deploy — never reuse the URL

**Was:** deployed, screenshotted `4w6mb-…`, deployed a fix, screenshotted the same URL again, and concluded the fix had not shipped. Started digging through the built bundle for a build-cache problem that did not exist.
**Actually:** Playground canisters are ephemeral leases. Each `dfx deploy --network playground` mints a **new** canister ID for both frontend and backend, so the old URL keeps serving the old build until its lease expires. The fix was live the whole time, at `ud6i4-…`.
**Rule:** take the canister ID from *this* run's log every time — the workflow prints `canister_ids.json` at the end. Never carry a Playground URL across deploys, and never quote one to the user as if it were stable.

### A jsdom component test cannot see a click bubble into a sibling handler

**Was:** shipped 03-07 Task 2's orchard radial-menu fertilizer picker on the strength of `fertilizerPicker.test.tsx` alone (11/11 passing) plus a code-diff review, and reported it done.
**Actually:** in the real browser the picker opened and then instantly closed on the same click. `ImperialOrchard.tsx`'s outer container has `onClick={handleBackgroundClick}`, which unconditionally clears `selectedParcel` whenever a click reaches it; every other radial action's own handler already calls the same clear synchronously, so the redundant bubbled call was invisible. Fertilize's button intentionally left `onClick` `undefined` so Radix's `DropdownMenuTrigger` could open the menu instead — but the native click still bubbled past Radix, up the real DOM tree, into that backdrop handler, in the same tick. The unit test could not have caught this: it renders `FertilizerTypeMenu` standalone or through `ParcelCard`, never nested inside `ImperialOrchard`'s own backdrop `onClick`, so the handler this bug depends on simply is not present in that DOM tree. Only a real click, in a real DOM, through the real component's full render tree, reproduced it.
**Rule:** a jsdom test proves the *component under test* behaves correctly in isolation; it cannot prove the component's *events* behave correctly once nested inside a parent with its own event handlers on an ancestor. Any interactive control added inside an existing container that already has a click/pointer handler on a wrapping element needs a same-session e2e or manual real-browser check of that exact nesting — the plan's own "verify on a deployed build" task step exists for exactly this, do not treat it as a formality once the unit suite is green.

### Playwright's shared library gap is fixable per-session without root

**Was:** repeated `./validate.sh full`'s e2e gate failing on this machine with `libnspr4.so: cannot open shared object file`, across three separate plans (03-01, 03-05, this one), each time recording it as a pre-existing, out-of-scope, sudo-gated environment gap and moving on.
**Actually:** `apt-get download <pkg>` (unlike `apt-get install`) does not require root — it only fetches the `.deb` into the working directory. `dpkg-deb -x <pkg>.deb <dir>` extracts a `.deb`'s contents without installing it system-wide, also without root. Doing this for the ~15 shared libraries `chrome-headless-shell`/`chromium` need (`ldd <binary> | grep 'not found'` names them all, in waves — extracting one batch reveals the next missing library) and pointing `LD_LIBRARY_PATH` at the extraction directory made the full 38-spec (now 47) Playwright suite pass, including the `test:e2e` npm script and `./validate.sh full`'s e2e gate.
**Rule:** before recording a missing-`.so` Playwright failure as an unfixable sudo-gated environment gap, try `apt-get download` + `dpkg-deb -x` + `LD_LIBRARY_PATH` first — it costs under a minute and needs no privileges. The extraction lives outside the repo (a scratch/tmp directory) and does not persist across sessions, so this must be redone each session that needs the e2e gate; it is still faster than treating the gate as permanently out of reach. Packages needed as of this session (Ubuntu 22.04/jammy): `libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libasound2 libatspi2.0-0 libxrender1 libwayland-server0 libxcb-randr0 libxi6` (`libcups2`/`libpango-1.0-0`/`libcairo2` were also fetched but turned out unneeded by `ldd`'s "not found" list — harmless to include, not required).

### Grep is worse than a test at finding every instance

**Was:** grepped for `$` currency signs, found 6, fixed them, moved on.
**Actually:** the test I then wrote to lock the convention in found **7 more** I had missed — Marketplace costs and upkeep, RunningCosts, SellModal, PriceChart, and a Planting modal line reading `${...} PLN`, which was wrong twice over.
**Rule:** when fixing a whole class of thing, write the check first and let it enumerate. A hand-rolled grep encodes the shape you already thought of.

## Working with the user

### Read the lever before wiring it

**Was:** MAINT-01 was recorded as "the frontend never calls `inspectAndRepair`" — so the obvious task was to call it.
**Actually:** the method advertised "Degradation prevented." while no degradation existed anywhere in the backend, and its real effect was to overwrite `maintenanceCost` (a field charged every season) with an arbitrary `level * 100` — a permanent 92% upkeep discount for a Shaker. Wiring it as-found would have shipped an exploit.
**Rule:** when a requirement says "X exists but isn't called", read X first. A dead lever is often dead because it is broken.

### Balance numbers are the user's call, not mine

**Was:** picked the MAINT-02 repair coefficient (half the accrued wear) myself, with a model to justify it.
**Actually:** defensible, but it is a game-balance number, and the user had been asked about the MAINT-01 fork one step earlier. Deciding one and asking about the other is inconsistent.
**Rule:** economy constants, difficulty, and pricing get a question with options, not a recommendation applied silently. See CLAUDE.md → Ask First.

### A `head -N` sample in a script is not the full evidence

**Was:** quoted "Track B's error count is now 6" in a commit message, reusing `validate.sh`'s Track-B report, which pipes `head -5` for readability.
**Actually:** the full `moc --check` output (no `head`) had 8 lines, not 6 — the script's own truncation cut off the pre-existing `M0072 baseCapacity` error, and I repeated the truncated count as if it were the total.
**Rule:** when a number is going into a commit message, re-run the underlying command *without* whatever truncation a convenience wrapper applies (`head`, `tail`, a summary line) and count from that. Same family as "re-derive a number before repeating it" below, but the trap here is trusting a tool's own display truncation rather than a manual back-of-envelope estimate.

### Re-derive a number before repeating it

**Was:** reported that repair could never pay back for assets under 500/level upkeep, leaving Tractor (600) on the viable side.
**Actually:** the naive "excess vs cost" comparison ignored that wear restarts after a repair. Under the real model (savings ≈ 0.8 × spec per year) Tractor was negative too — 6 of 8 types, not 5.
**Rule:** if a figure is going into a requirement or a commit message, derive it once properly rather than reusing the back-of-envelope version that motivated the investigation. My own parity test caught this one.

### A pixel assertion measured on one machine is a claim about that machine's font

**Was:** the picker's e2e asserted "label on one line, menu under 260px", and passed on the machine it was written on.
**Actually:** `system-ui` is a narrow font on macOS/Windows and DejaVu Sans on Linux. The 34-character label needed ~219px on Linux and ~197px was available, so it wrapped. CI and a Linux dev box both failed for 3 days and the nightly run went red every night; nobody looked because the failure looked environmental.
**Rule:** when a layout test fails only off the author's OS, measure the real widths before calling it flaky (a throwaway spec that prints `getBoundingClientRect` is enough). Fix the component to have headroom for the widest common fallback font; do not loosen the test to the point it stops guarding.

