# Motoko Playground & Mainnet Setup Directive

## Goal

Ensure Motoko canisters build and deploy both:

- To **Motoko Playground** (strict 0.5T cycles limit, no EOP).
- To **mainnet / modern dfx** (with Enhanced Orthogonal Persistence – EOP).

Key requirement: **one codebase**, different **dfx/Motoko configurations** per target.

---

## Requirements

1. **dfx versions**
   - Playground: use **dfx 0.24.3** (classic Motoko, no `persistent` / `transient`).
   - Mainnet / local modern dev: use **latest dfx** (Motoko ≥ 0.30 with EOP).

2. **Code constraints**
   - For Playground builds (compatible with dfx 0.24.3):
     - `actor { ... }`
     - `stable var` for state
     - `system func preupgrade` / `system func postupgrade`
     - No `persistent` / `transient`.
   - For mainnet builds (modern Motoko with EOP):
     - `persistent actor { ... }` allowed
     - `var` for state (EOP provides persistence).

3. **No manual code switching**
   - Use configuration and build-time separation.
   - Avoid separate long‑lived branches with divergent logic.

---

## Version Management (dfxvm)

Use **dfxvm** to manage multiple dfx versions on the same machine.

### Install and configure

1. Install `dfxvm` (follow official docs).

2. Install required versions:

```bash
dfxvm install 0.24.3
dfxvm install latest
```

3. Usage patterns:

- For **Playground** workflows:

  ```bash
  dfxvm use 0.24.3
  ```

- For **mainnet / modern local dev**:

  ```bash
  dfxvm use latest
  ```

Document these commands in the project README for other developers.

---

## CI Configuration

### Playground CI

In `.github/workflows/deploy-playground.yml` (or equivalent), pin dfx to 0.24.3:

```yaml
- name: Setup dfx
  uses: aviate-labs/setup-dfx@v0.3.2
  with:
    dfx-version: 0.24.3

- name: Deploy to Playground
  run: dfx deploy --playground
```

This job must build and deploy the **Playground-compatible** entrypoint (classic Motoko actor).

### Mainnet / Staging CI

For mainnet/staging pipelines:

```yaml
- name: Setup dfx (latest)
  run: dfxvm use latest

- name: Deploy to mainnet
  run: dfx deploy --network ic
```

This job must build and deploy the **EOP-based** entrypoint with sufficient cycles.

---

## Code Structure: One Codebase, Two Entrypoints

Use one shared logic layer and two thin entry files.

### Recommended file layout

```text
src/
  Logic.mo           # shared business logic (no env-specific code)
  Types.mo           # shared types
  Main_playground.mo # classic Motoko actor for Playground
  Main_mainnet.mo    # EOP-based persistent actor for mainnet
dfx.json
```

### `Main_playground.mo` (classic pattern, no EOP)

```motoko
import Logic "Logic";

actor {
  stable var state : Logic.State = Logic.initialState;

  public shared ({ caller }) func doSomething(args : Logic.Args) : async Logic.Result {
    let (newState, result) = Logic.doSomething(state, args, caller);
    state := newState;
    return result;
  };

  system func preupgrade() {
    // state already stable; add extra if needed
  };

  system func postupgrade() {
    // restore invariants if needed
  };
};
```

### `Main_mainnet.mo` (EOP, persistent actor)

```motoko
import Logic "Logic";

persistent actor {
  var state : Logic.State = Logic.initialState;

  public shared ({ caller }) func doSomething(args : Logic.Args) : async Logic.Result {
    let (newState, result) = Logic.doSomething(state, args, caller);
    state := newState;
    return result;
  };

  // No preupgrade/postupgrade required for main state with EOP
};
```

All business rules live in `Logic.mo`, so changes are applied to both environments automatically.

---

## dfx.json Configuration

Configure separate canisters or profiles to map to each entrypoint.

### Option A – Two canisters (clear separation)

```json
{
  "canisters": {
    "app_playground": {
      "type": "motoko",
      "main": "src/Main_playground.mo"
    },
    "app_mainnet": {
      "type": "motoko",
      "main": "src/Main_mainnet.mo"
    }
  }
}
```

Usage:

- Playground CI: build & deploy `app_playground` with `dfx 0.24.3` and `dfx deploy --playground`.
- Mainnet: build & deploy `app_mainnet` with latest dfx and `dfx deploy --network ic`.

### Option B – Single canister, scripted swap (only if necessary)

If two canisters are not desired, you can:

- Keep a single canister entry in `dfx.json`.
- Use scripts to temporarily change `"main"` between `Main_playground.mo` and `Main_mainnet.mo` **in CI**.
- This must be fully scripted; no manual editing.

---

## NPM / Yarn Scripts (Example)

Add convenience scripts to `package.json`:

```json
{
  "scripts": {
    "deploy:playground": "dfxvm use 0.24.3 && dfx deploy --playground app_playground",
    "deploy:ic": "dfxvm use latest && dfx deploy --network ic app_mainnet"
  }
}
```

Adjust canister names and network names to match your project.

---

## EOP Settings for Mainnet

For the mainnet build:

- Use a Motoko/dfx version where Enhanced Orthogonal Persistence is enabled and supported.
- Verify that:
  - State persists correctly across upgrades **without** manual `preupgrade/postupgrade` for the main state.
  - The canister has enough cycles to cover the fixed EOP initialization overhead (no Playground-like 0.5T limit).

If EOP requires explicit flags or dfx.json settings in your toolchain version, configure them accordingly and document them.

---

## Acceptance Criteria

1. `npm run deploy:playground` (or equivalent):
   - Uses `dfx 0.24.3`.
   - Deploys `Main_playground.mo` (classic Motoko) to Playground.
   - No "50B cycles short" or similar cycle-limit error.

2. `npm run deploy:ic` (or equivalent):
   - Uses latest dfx.
   - Deploys `Main_mainnet.mo` (EOP-based persistent actor) to mainnet.
   - State persists across upgrades without manual serialization for main state.

3. Single shared codebase:
   - Core logic is centralized in shared modules (e.g. `Logic.mo`).
   - Only the thin "main" files differ between Playground and mainnet.
   - No manual code editing is required to switch environments.

4. Documentation:
   - README section describing:
     - How to switch dfx versions locally with `dfxvm`.
     - How to deploy to Playground vs mainnet.
     - Which entry file corresponds to which environment.
