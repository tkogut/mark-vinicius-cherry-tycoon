# Changelog

## Where the record actually lives

This file only records **releases** — an entry appears when a tag is cut, and at
no other time. It is deliberately thin, because the day-to-day record is kept in
two places that cannot drift from the work:

- **Commit messages.** They carry the reasoning, the verification, and what was
  deliberately *not* fixed. `git log` is the changelog.
- **`.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md`.** Phase and
  requirement status, with the evidence attached.

> **Why this file was rewritten (2026-08-09).** It previously claimed to follow
> Keep a Changelog and Semantic Versioning, and was last touched **2026-03-02**
> — five months and 95 commits earlier — still headed `[Unreleased]` with
> entries from February describing a type system that had been rewritten since.
> A third copy of the same information, maintained by discipline alone, drifts;
> this one did. The old content is in git history if it is ever wanted.

Versioning rules — when to bump, when to tag, what `0.x` means — live in
`CLAUDE.md` → Releasing.

## Releases

*None yet.* `frontend/package.json` reads `0.9.0`, tracking the in-flight
**Playable Release — V1 Parity** milestone. The first entry here will be
`1.0.0`, when that milestone's success criteria are met.

Until then the honest answer to "what version is running?" is the build badge
in the bottom-right corner: `<version> · <commit sha>`, hover for network and
build time.
