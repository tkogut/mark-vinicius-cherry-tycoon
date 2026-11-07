# Second brain — milestone digests

The owner keeps a private Obsidian vault (`sejf_tk`, an LLM Wiki) as a "second brain". This folder is the **staging area** for what this repo sends there: short, dated digests of how the game's development is going. The repo keeps processes and the record of what was sent; the vault keeps the knowledge. Do not copy `.planning/` or `docs/` into the vault — link to them.

The knowledge is **public** by owner decision (2026-11-07), so digests carry no `confidential` flag. If a digest would need one, do not publish it — ask.

## When to write a digest

When a roadmap milestone or phase closes and `.planning/STATE.md` / `.planning/ROADMAP.md` have been updated for it, or when a decision that changes direction is recorded in `STATE.md` → Decisions. Not per commit, not per deploy (the same cadence as version bumps in `CLAUDE.md` → Releasing).

## What goes in a digest

One file per event: `digests/YYYY-MM-DD-mark-vinicius-cherry-tycoon-<slug>.md`, Polish, own words, roughly 3–6 KB. Sections:

1. **Gdzie jesteśmy** — phases/plans done vs total, what just closed, what is next.
2. **Kluczowe decyzje i ich uzasadnienie** — new since the previous digest, with dates.
3. **Zrobione od ostatniego digestu** — outcomes, not a commit list.
4. **Wnioski z błędów** — new entries from `.planning/LESSONS.md`, as rules.
5. **Otwarte kwestie i ryzyka** — blockers, deferred items, contradictions between documents.
6. **Źródła** — repo paths **with the commit SHA** (`.planning/STATE.md@<sha>`), never pasted content.

The frontmatter keys are `title`, `type: project-digest`, `domain: programowanie`, `project: mark-vinicius-cherry-tycoon`, `tags`, `created_by: claude`. The publisher adds `source`, `source_path`, `sha256`, `published` and `status: new`.

Never include: secrets, tokens, keys, credentials, personal data, source code, per-deploy canister URLs. A digest is immutable once published — to correct or extend it, write a new one.

## How to publish

```bash
os-publish-knowledge --source docs/second-brain/digests          # dry-run, writes nothing
os-publish-knowledge --apply --source docs/second-brain/digests  # copies to <vault>/raw/notes/
```

`os-publish-knowledge` is installed globally by AGENTS-OS (`~/.local/bin`). Its secret/PII scanner runs on every file and reports only the rule name.

Rules:

- Run the dry-run first. If it reports `Zablokowano` or `Konflikty` above 0, **stop** and tell the owner which file and which rule — do not edit around the scanner.
- **Never pass `--ingest`.** INGEST (wiki pages, `index.md`, `log.md`) belongs to the vault's editor session, which discusses it with the owner first.
- Do not run git in the vault, do not edit anything in it by hand, do not create symlinks to it.
- Commit the digest to this repo in the same PR as the milestone's documentation changes.
- Tell the owner what was published (file name, scanner result) and that a vault INGEST is pending.
