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

🎯 **Purpose**: 
Standardize all deployment procedures from local development to Playground and Mainnet. Enforces security gate and validates yarn.lock before push.

🛠️ **Implementation Logic**:
- **Gate**: Run `/security-audit` FIRST. If status is `BLOCKED`, abort.
- **Tracks**: A (Local/Playground), B (Mainnet).
- **Checks**: Frontend build validation, port cleanup (5173-5175), backend integrity.

🗣️ **Usage Rule**:
Activate via `/deploy [track]`. 
Handshake: `"Handshake Verified: [Skill Name] applied. No drift detected."`

## Workflow:

1. **Security gate**: Run `/security-audit` first. Abort if BLOCKED.
2. **Frontend build check**: `cd frontend && yarn build 2>&1 | tee ../.tmp/build.log`.
3. **Port cleanup**: `fuser -k 5173/tcp 5174/tcp 5175/tcp 2>/dev/null || true`.
4. **Deploy**: `dfx deploy --network [target] 2>&1 | tee .tmp/deploy.log`.
5. **Verify**: Check `cat .dfx/[target]/canister_ids.json` for live URLs.

## § Git Commit & Push
**Usage**: `/git-commit-push "[message]"`

1. **Stage**: `git add .`
2. **Commit**: `git commit -m "[standardized message]"`
3. **Push**: `git push origin [current-branch]`
4. **Link**: Provide GitHub URL to the user.

## References
- `references/deploy_logic.md` — Full automated-deploy guide
- `../../security-audit/SKILL.md` — Mandatory pre-deploy gate
- `assets/.github/workflows/` — Reference Actions workflows
