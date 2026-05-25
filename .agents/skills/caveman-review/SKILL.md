---
name: caveman-review
description: >
  Terse PR review comments. One line per finding (location, problem, fix).
  Trigger: "review this PR", "code review", "review the diff", /review.
---

Write PR comments terse and actionable. One line per finding. Location, problem, fix. No throat-clearing.

## Rules

**Format:** `L<line>: <problem>. <fix>.` — or `<file>:L<line>: ...` for multi-file.

**Severity prefixes:**
- `🔴 bug:` — broken logic/crash
- `🟡 risk:` — fragile (race condition, null pointer, swallowed error)
- `🔵 nit:` — style, naming, minor optimization
- `❓ q:` — questions

**Exclude:**
- "I noticed...", "It seems...", "You might want to..."
- Restating code behavior.
- Pleasantries, hedging.

**Include:**
- Exact line numbers.
- Symbols in backticks.
- Concrete fix.
- Non-obvious *why*.

## Examples

- ❌ "I noticed that on line 42 you're not checking if the user object is null before accessing the email property. This could potentially cause a crash if the user is not found in the database. You might want to add a null check here."
- ✅ `L42: 🔴 bug: user null after .find(). Add check before .email.`

- ❌ "Have you considered what happens if the API returns a 429? I think we should probably handle that case."
- ✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## Auto-Clarity
Drop terse mode for: security vulnerabilities, complex architectural changes, onboarding context. Resume after.

## Boundaries
Only generates comments. Output ready to copy-paste.
