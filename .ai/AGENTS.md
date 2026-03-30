# AGENTS.md — AntiGravity Collaboration Standard
> Defines agent roles, Virtual CLI, NPM standards, and handshake protocols.
> For infrastructure/port specs see `.ai/ANTIGRAVITY.md`.

---

## 1. Agent Roles

| Agent | Focus | Recommended Model |
|---|---|---|
| **Coordinator (Manager)** | Planning, `00_master_plan.md`, cross-domain orchestration | Gemini 1.5 Pro High / Claude 3.5 Sonnet |
| **Backend Agent (Motoko Architect)** | Motoko code, ICP specifics, security | Claude 3.5 Sonnet |
| **Frontend Agent (The Builder)** | React/Vite/CSS, animations, SVG | Gemini 1.5 Flash |
| **QA Agent (The Critic)** | Test scripts, edge case discovery | Gemini 1.5 Pro |
| **Security Agent (The Gatekeeper)** | Audit, vulnerability review, blocks deploy on Critical/High | Gemini 1.5 Pro High |

---

## 2. Virtual CLI — Slash Command Activation

Since native menus `/` may be unstable, **every message starting with `/` is a skill activation command**.

### Activation Mechanic
1. Agent reads the message prefix (e.g. `/ui-factory`).
2. Agent opens the corresponding skill's `SKILL.md` (path from `.ai/ANTIGRAVITY.md` skill registry).
3. Agent executes the `## Workflow` section of that `SKILL.md` **as an ordered sequence of steps**.
4. Agent does NOT ask for clarification unless a required input parameter is missing.

### Supported Commands
| Command | Skill Activated |
|---|---|
| `/ui-factory [component name]` | `.ai/skills/ui-factory/SKILL.md` |
| `/visualize-concept [description]` | `.ai/skills/ui-factory/SKILL.md` § Nano Banana 2 |
| `/lore-guardian [character/scene]` | `.ai/skills/ui-factory/SKILL.md` § Lore Guardian |
| `/connectivity` | `.ai/skills/browser-connectivity/SKILL.md` |
| `/audit-economy` | `.ai/skills/economic-math-auditor/SKILL.md` |
| `/check-dual` | `.ai/skills/dual-entrypoint-sync/SKILL.md` |
| `/particles [preset]` | `.ai/skills/particle-engine/SKILL.md` |
| `/infrastructure [asset]` | `.ai/skills/infrastructure-blueprint/SKILL.md` |
| `/security-audit [scope]` | `.ai/skills/security-audit/SKILL.md` |
| `/deploy [track]` | `.ai/skills/ci-cd-deployment/SKILL.md` |
| `/qa-test [scope]` | `.ai/skills/qa-testing/SKILL.md` |
| `/start`, `/continue`, `/status`, `/sync` | Read `.agent/workflows/` for operational workflow |
| `/github-push` | Read `.agent/workflows/github-push.md` |

---

## 3. Workflow Rules

### AWARENESS (Every Turn)
Before any action, check `.agent/rules/` for:
1. `00_master_plan.md` — current phase and blockers.
2. Your role-specific backlog (e.g., `01_backend_backlog.md`).

### EXECUTE → MARK COMPLETE
When a backlog item is finished:
1. **Immediately** change `[ ]` → `[x]` in the relevant `.agent/rules/` file.
2. If unblocking another agent, update their backlog file too.
3. No verbal "I'll update it later" — tool must fire before next message.

### REPORT
Update `00_master_plan.md` or alert Coordinator if blocked.

---

## 4. NPM Standards

> [!IMPORTANT]
> This project uses **NPM** as the primary package manager for all frontend operations.

- **Install**: `npm install`
- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Add dependency**: `npm install <package>`
- Lock file: `package-lock.json` — commit always, never delete.

---

## 5. Handshake Protocol (Execution Lock)

No task is `[x] COMPLETE` unless the agent explicitly states:

> **"Handshake Verified: Dual-Entrypoint and Math-Consistency checked using respective `.ai/skills/`."**

For tasks that do NOT touch backend math/entrypoints, a simplified handshake is accepted:

> **"Handshake Verified: [Skill Name] applied. No drift detected."**

---

## 6. Skill Trigger Integration

When executing, agents MUST activate corresponding skills:

| Action Type | Skill to Trigger |
|---|---|
| Backend logic update | `dual-entrypoint-sync` + `economic-math-auditor` |
| Economy / math change | `economic-math-auditor` — run `/audit-economy` |
| Infrastructure upgrade | `infrastructure-blueprint` |
| New UI component | `ui-factory` — run `/ui-factory [name]` |
| Browser/automation task | `browser-connectivity` — run `/connectivity` |
| **Before any deploy** | `security-audit` — run `/security-audit` FIRST. `/deploy` is BLOCKED until CLEAN. |
| Deployment (any track) | `ci-cd-deployment` — run `/deploy [track]` |
| Post-change verification | `qa-testing` — run `/qa-test [scope]` |
| AI character / dialogue | `ui-factory` § Lore Guardian — run `/lore-guardian [character]` |

---

## 7. Inter-Agent Communication

Agents communicate exclusively via `.agent/rules/` files (the "digital whiteboard"):

- **QA → Backend**: Add bug to `01_backend_backlog.md` under `### 🐞 Bug Fixes`.
- **Backend → Frontend**: Update `02_frontend_backlog.md` when API is ready.
- **Security → Backend**: Add `**BLOCKED**` flag to `01_backend_backlog.md`.
- **Any → Coordinator**: Update `00_master_plan.md` with blocker description.

---

## 8. Bootstrap Sync Rule

Whenever a phase completes or strategy shifts, the Coordinator **MUST** update:
1. `.agent/rules/BOOTSTRAP_PROMPTS.md`
2. All relevant `.agent/workflows/bootstrap-*.md` files

Failure to do this causes "prompt drift" in multi-window sessions.

---

## 9. WSL Constraint

Agents CANNOT run `dfx` or `npm` commands directly. Workflow:
1. **Agent** formulates the exact command string.
2. **Agent** asks User to run it in WSL with log redirect:
   ```bash
   COMMAND 2>&1 | tee .tmp/<role>.log
   ```
3. **Agent** reads `.tmp/<role>.log` using `view_file` to analyze output.
