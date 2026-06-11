# GitHub Actions — Deployment Workflows Reference

> **Canonical files**: `.github/workflows/` in project root.
> This document summarizes their structure for quick reference.

## deploy-playground.yml
- **Trigger**: Push to `master` branch + `workflow_dispatch`
- **dfx Version**: `0.24.3` (via `aviate-labs/setup-dfx@v0.3.2`)
- **Target**: ICP Playground
- **Critical env**: `CI: 'false'` — mandatory to bypass Playground CI block
- **Deploy cmd**: `dfx deploy --network playground --with-cycles 10000000000`
- **Canister URL**: Found in Actions log or `.dfx/playground/canister_ids.json`

## deploy-mainnet.yml
- **Trigger**: `workflow_dispatch` (manual only)
- **Target**: ICP Mainnet
- **Track**: B (`main_mainnet.mo`, dfx 0.30.x+)
- **Auth**: Uses `DFX_IDENTITY_PEM` GitHub secret

## Checking Failed Runs
See `.agent/workflows/check-git-logs.md` for the `/check-git-logs` procedure.
Trigger: `python3 execution/start_tunnel.py` → navigate to GitHub Actions tab via browser.

## Secrets Required
| Secret Name | Purpose |
|---|---|
| `DFX_IDENTITY_PEM` | Deploy identity for both Playground (GitHub identity) and Mainnet |
