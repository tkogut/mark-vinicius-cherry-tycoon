# Development Progress Report & Handoff Checklist

> **Date**: 2026-02-19
> **Status**: **Migration to WSL Active**
> **Producer**: JaPiTo Group

## 🚨 Critical Context for New Coordinator

### 1. Environment Migration (Windows → WSL)
We have migrated development from Windows PowerShell to **WSL (Ubuntu)** to support the Internet Computer SDK (`dfx`).
- **Old Path**: `C:\Users\tkogut\.gemini\antigravity\projects\...`
- **New Path**: `\\wsl.localhost\Ubuntu\home\tkogut\projects\mark-vinicius-cherry-tycoon` (approximate)

**Key Actions Required:**
- [ ] **Fix Line Endings**: Run `sed -i 's/\r$//' execution/fix_bashrc.sh` in WSL.
- [ ] **Setup Alias**: Run `bash execution/fix_bashrc.sh` to configure `ag` command.
- [ ] **Move Project**: Run `execution/migrate.sh` to move files to Linux home `~/projects/`.
- [ ] **Install Deps**: Run `npm install` in the new location.

### 2. Architecture: Dual Entrypoint
To support both the IC Playground (ancient `dfx 0.24.3`) and Mainnet (modern `dfx`), we use two entrypoints:
- **`backend/main.mo`**: For Playground. Classic actor, stable variables.
- **`backend/main_mainnet.mo`**: For Mainnet. Enhanced Orthogonal Persistence (EOP).
- **Rule**: All new logic must go into **shared modules** (e.g., `weather_logic.mo`) and be imported by BOTH entrypoints.

### 3. Security Agent (The Gatekeeper)
A specialized **Security Agent** is now active.
- **Role**: Proactive reviewer of ALL backend commits.
- **Policy**: `directives/SECURITY_DIRECTIVE_V1.md`
- **Workflow**: No code merges without Security Agent approval in `04_security_backlog.md`.

---

## 📅 Current Status (Phase 0)

We are in **Phase 0: Close Out Phase 2.5**. This is a cleanup & verification phase before starting the "Living World" (Phase 5) features.

### Immediate Tasks (Next 24 Hours)
1. **WSL Setup**: Complete the migration steps in `SETUP_WSL.md`.
2. **Backend Verification**: Run `dfx canister call` tests on all existing functions to baseline the new environment.
3. **Caffeine Purge**: Confirm all legacy branding is removed (grep for "Caffeine").
4. **Security Audit**: Run the `test_security_audit.sh` script in WSL.

### Active Blockers
- **None**. Migration is the critical path.

---

## 📂 Key Documentation Links

- **Setup Guide**: `SETUP_WSL.md`
- **Master Plan**: `directives/00_master_plan.md`
- **Security Policy**: `directives/SECURITY_DIRECTIVE_V1.md`
- **Implementation Plan**: `../brain/.../implementation_plan.md` (Artifact)

---

**Handover Note**: The system is stable but requires careful environment setup in WSL. Do not skip the `sed` line ending fixes or the `migrate.sh` step, or `dfx` will fail with permission errors.
