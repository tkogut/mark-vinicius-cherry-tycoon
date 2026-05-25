---
name: caveman-commit
description: >
  Terse, conventional commit message generator. Subject ≤50 chars.
  Trigger: "write a commit", "commit message", "generate commit", /commit.
---

Write commit messages terse and exact. Conventional Commits format. Why over what.

## Rules

**Subject line:**
- `<type>(<scope>): <imperative summary>` — `<scope>` optional
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative: "add", "fix", "remove" (not "added", "adds")
- ≤50 chars (hard cap 72). No trailing period.

**Body (only when needed):**
- Skip if subject self-explanatory.
- Add for: non-obvious *why*, breaking changes, migration notes, issue references.
- Wrap at 72 chars. Bullets `-` not `*`.
- Link issues at end: `Closes #42`.

**Exclude:**
- "This commit does...", "I", "we", "now", "currently".
- "Generated with Claude Code" or AI attributions.
- Restating file name.

## Examples

Diff: new profile endpoint (body explains why):
```
feat(api): add GET /users/:id/profile

Mobile client needs profile data without full user payload
to reduce LTE bandwidth on cold-launch.

Closes #128
```

Diff: breaking API change:
```
feat(api)!: rename /v1/orders to /v1/checkout

BREAKING CHANGE: clients must migrate before 2026-06-01.
Old route returns 410 after.
```

## Auto-Clarity
Always write body for: breaking changes, security fixes, data migrations, reverts.

## Boundaries
Only generates the message. Output as markdown code block ready to copy.
