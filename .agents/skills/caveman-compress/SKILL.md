---
name: caveman-compress
description: >
  Compress natural language files (.md, .txt) to caveman format to save input tokens.
  Keep all code, URLs, syntax. Human backup FILE.original.md.
  Trigger: /caveman:compress <filepath> or "compress memory file".
---

# Caveman Compress

## Purpose
Compress natural language files (CLAUDE.md, todos, preferences) to caveman-speak. Save input tokens. Overwrite original. Original backup -> `<filename>.original.md`.

## Trigger
`/caveman:compress <filepath>` or request to compress memory file.

## Process
1. Locate skill directory (lives with `scripts/`).
2. Run: `python3 -m scripts <absolute_filepath>`
3. CLI:
   - Detect file type (no tokens used).
   - Call Claude to compress.
   - Validate output (no tokens used).
   - If error: target fix with Claude (max 2 retries, no full recompress).
   - If fail 2x: report error, leave original file untouched.
4. Return result.

## Compression Rules

### Remove
- Articles: a, an, the
- Filler: just, really, basically, actually, simply, essentially, generally, however, furthermore, additionally, in addition
- Pleasantries: sure, certainly, of course, happy to, I'd recommend
- Hedging: it might be worth, you could consider, it would be good to
- Redundancies: in order to -> to, make sure to -> ensure, reason is because -> because
- "you should", "remember to"

### Preserve EXACTLY (do not modify)
- Code blocks (fenced ``` and indented)
- Inline code (`backtick content`)
- URLs and links
- File paths
- CLI commands (`npm install`, etc.)
- Technical terms (APIs, libraries, protocols)
- Proper nouns, dates, versions, numeric values
- Env variables (`$HOME`, etc.)

### Preserve Structure
- All Markdown headings (exact text)
- List hierarchy (nesting, numbering)
- Tables (compress text inside cells, keep structure)
- Frontmatter/YAML headers

### Compress
- Short synonyms: big -> large, fix -> resolve, use -> utilize
- Fragments OK: "Run tests before push"
- State actions directly
- Merge redundant bullets
- Keep max 1 example per pattern

### Critical Rule
- Fenced code blocks ```...``` read-only. Do not remove comments, space, lines, or simplify.
- Backtick content `...` read-only.
- Compress prose only. If mixed, isolate prose. If unsure, do not touch.
- Original backed up as `FILE.original.md`. Never compress backup file.

## Pattern
Original:
> You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.
Compressed:
> Run tests before push to main. Catch bugs early, prevent broken prod deploys.

Original:
> The application uses a microservices architecture with the following components. The API gateway handles all incoming requests and routes them to the appropriate service. The authentication service is responsible for managing user sessions and JWT tokens.
Compressed:
> Microservices architecture. API gateway routes requests to services. Auth service manages user sessions + JWT tokens.

## Boundaries
- Only compress prose (.md, .txt, extensionless).
- NEVER touch code files (.py, .js, .ts, .json, .yaml, .yml, .toml, .env, .lock, .css, .html, .xml, .sql, .sh).
