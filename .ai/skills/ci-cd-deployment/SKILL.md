---
name: ci-cd-deployment
description: >
  [Trigger Words: "deploy", "deployment", "github actions", "dfx deploy", "playground",
  "mainnet", "push to master", "CI", "canister url", "yarn build", "wdrożenie"]
  [Domain: GitHub Actions, dfx 0.24.3, Track A/B deploy, yarn.lock, canister IDs]
  [Outcomes: standardizes Local/Playground/Mainnet deployment procedures,
  enforces security gate, validates yarn.lock before push]
---

# CI/CD Deployment Skill

## Purpose
Standardize all deployment procedures from local development to Playground and Mainnet.
**Security gate**: `/deploy` must not start until `/security-audit` returns CLEAN.

> [!IMPORTANT]
> **Pre-Deploy Gate**: Run `/security-audit` FIRST. If status is `BLOCKED`, abort immediately.

## Deployment Tracks

| Track | Target | dfx Version | Actor File | Trigger |
|---|---|---|---|---|
| **A — Local** | Local replica | `0.24.3` | `backend/main.mo` | Manual: `dfx deploy` |
| **A — Playground** | ICP Playground | `0.24.3` | `backend/main.mo` | Manual or GitHub Actions on `master` push |
| **B — Mainnet** | ICP Mainnet | `0.30.x+` | `backend/main_mainnet.mo` | Manual: `dfx deploy --network ic` |

## GitHub Actions Workflows

| Workflow File | Trigger | Target |
|---|---|---|
| `.github/workflows/deploy-playground.yml` | Push to `master` | Playground (dfx 0.24.3) |
| `.github/workflows/deploy-mainnet.yml` | Manual `workflow_dispatch` | Mainnet |

### Key GitHub Actions Config
```yaml
- uses: aviate-labs/setup-dfx@v0.3.2
  with: { dfx-version: '0.24.3' }

# CRITICAL: bypass CI=true block on Playground
env:
  CI: 'false'
  DFX_NETWORK: playground

# Deploy command
run: dfx deploy --network playground --with-cycles 10000000000
```

> [!WARNING]
> Setting `CI: 'false'` is **intentional and mandatory** — dfx blocks Playground reservations when `CI=true`.

### Canister URL — How to Find
After deploy, check the Actions tab → "Deploy to Playground" step logs:
```bash
cat .dfx/playground/canister_ids.json
# Then construct: https://<frontend-canister-id>.icp0.io
```

## Pre-Deploy Checklist

- [ ] **Security gate**: `/security-audit` returned CLEAN (no 🔴/🟠 findings)
- [ ] **Branch**: `feature/antigravity-v2` merged to `master` via PR (or direct push)
- [ ] **Frontend build**: `yarn build` passes with 0 errors
- [ ] **`yarn.lock` committed**: `git status` shows no unstaged `yarn.lock`
- [ ] **`dfx.json`** untouched / correct canister names
- [ ] **Ghost clean ports**: `fuser -k 5173/tcp 5174/tcp 5175/tcp` (prevent Vite ghost processes)
- [ ] **Backend integrity** (structural changes only): `dfx stop && dfx start --clean --background && dfx deploy`

## Workflow (`/deploy [track]` activation)

### Track A — Playground (standard)
```bash
# 1. Security gate (MANDATORY)
# → Run /security-audit first. Abort if BLOCKED.

# 2. Frontend build validation
cd frontend && yarn build 2>&1 | tee ../.tmp/build.log

# 3. Port clean
fuser -k 5173/tcp 5174/tcp 5175/tcp 2>/dev/null || true

# 4. Deploy (local/playground)
dfx deploy --network playground --with-cycles 10000000000 2>&1 | tee .tmp/deploy.log

# 5. Verify canister URL
cat .dfx/playground/canister_ids.json
```

### Push to master → GitHub Actions auto-deploy
```bash
git push origin feature/antigravity-v2
# Then open PR → merge to master
# GitHub Actions triggers deploy-playground.yml automatically
# Check: GitHub → Actions tab → latest run logs → "Canister URL" in output
```

### `/check-git-logs` (diagnose failed Actions run)
Read `.agent/workflows/check-git-logs.md` for the log-fetching procedure.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot reserve playground canister in CI` | `CI=true` not overridden | Set `CI: 'false'` in workflow env |
| `yarn.lock conflict` | Lockfile diverged | `yarn install` then commit |
| `dfx: command not found` | dfx not in PATH | `source ~/.local/share/dfx/env` |
| Canister ID mismatch | Old `.dfx/` cache | `dfx stop && dfx start --clean --background` |

## References
- `references/deploy_logic.md` — full automated-deploy guide
- `references/github_actions_spec.md` — Actions workflow documentation
- `.ai/skills/security-audit/SKILL.md` — mandatory pre-deploy gate
