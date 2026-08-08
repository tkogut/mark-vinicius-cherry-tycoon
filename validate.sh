#!/usr/bin/env bash
#
# The one ordered validation gate. Mirrors what CI runs, in CI's order, so a
# green run here means a green run there.
#
#   ./validate.sh fast      unit + lint + typecheck        (~15s, no browser, no replica)
#   ./validate.sh full      fast + build + e2e + declaration drift  (~60s)
#   ./validate.sh backend   Motoko type-check of BOTH tracks (no replica needed)
#   ./validate.sh           == fast
#
# Why this file exists: the gate sequence used to be reconstructed from memory
# every time, which meant it varied. Pick the smallest tier that covers the
# change, and say in your report which tier you ran.
#
# Tier guidance:
#   frontend logic / hooks / tests only ......... fast
#   anything rendering (.tsx), or before commit . full
#   backend/*.mo ................................ backend, then a live replica check
#
# NOTE: neither tier starts a dfx replica. Backend behaviour changes are not
# proven by this script — run them against `dfx deploy backend` and read the
# actual values back. Compiling is not verifying.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$REPO_ROOT/frontend"
TIER="${1:-fast}"

FAILED=()
PASSED=()
SKIPPED=()

step() {
    local name="$1"; shift
    printf '\n\033[1m── %s\033[0m\n' "$name"
    if "$@"; then
        PASSED+=("$name")
    else
        FAILED+=("$name")
    fi
}

# ── individual gates ────────────────────────────────────────────────────────

unit()      { (cd "$FRONTEND" && npm run --silent test); }
lint()      { (cd "$FRONTEND" && npm run --silent lint); }
typecheck() { (cd "$FRONTEND" && npm run --silent typecheck); }
build()     { (cd "$FRONTEND" && npm run --silent build); }
e2e()       { (cd "$FRONTEND" && npx playwright test); }

# Candid drift: the generated declarations are committed, so a changed public
# canister interface must show up as a diff here. A dirty tree means the
# frontend's view of the backend just changed — see CLAUDE.md "Contract surfaces".
declarations() {
    local dirty
    dirty="$(cd "$REPO_ROOT" && git status --porcelain frontend/src/declarations/)"
    if [[ -n "$dirty" ]]; then
        echo "declarations/ is dirty — the canister interface changed:"
        echo "$dirty"
        return 1
    fi
    echo "declarations/ clean (no public interface drift)"
}

# Both Motoko tracks, type-check only. Track B is EXPECTED to fail today
# (EOP-01) — it is reported, not counted as a regression, so this gate stays
# usable. If Track B ever goes green, that is news: update EOP-01.
motoko() {
    local moc base rc=0 errors
    moc="$(dfx cache show)/moc"
    base="$(ls -d "$HOME"/.cache/dfinity/versions/*/base 2>/dev/null | head -1)"
    [[ -x "$moc" ]] || { echo "moc not found — is dfx installed?"; return 1; }

    # Capture, then inspect. Do NOT pipe moc into grep inside an `if`: under
    # `set -o pipefail` the pipeline reports moc's exit code, not grep's, so the
    # test reads backwards. (Learned the hard way — see .planning/LESSONS.md.)
    check_track() {
        local file="$1"
        errors="$("$moc" --package base "$base" --check "$file" 2>&1 || true)"
        errors="$(printf '%s\n' "$errors" | grep -E "type error|syntax error" || true)"
    }

    echo "Track A (backend/main.mo):"
    check_track "$REPO_ROOT/backend/main.mo"
    if [[ -n "$errors" ]]; then
        printf '%s\n' "$errors"
        rc=1
    else
        echo "  ok"
    fi

    echo "Track B (backend/main_mainnet.mo) — known broken, EOP-01:"
    check_track "$REPO_ROOT/backend/main_mainnet.mo"
    if [[ -n "$errors" ]]; then
        printf '%s\n' "$errors" | head -5
        echo "  ^ expected while EOP-01 is open; not counted as a failure"
    else
        echo "  UNEXPECTEDLY CLEAN — Track B compiles now. Update EOP-01."
    fi
    return $rc
}

# ── tiers ───────────────────────────────────────────────────────────────────

case "$TIER" in
    fast)
        step "unit tests"   unit
        step "lint"         lint
        step "typecheck"    typecheck
        ;;
    full)
        step "unit tests"   unit
        step "lint"         lint
        step "typecheck"    typecheck
        step "build"        build
        step "e2e"          e2e
        step "declarations" declarations
        ;;
    backend)
        step "motoko"       motoko
        ;;
    *)
        echo "usage: ./validate.sh [fast|full|backend]" >&2
        exit 2
        ;;
esac

# ── report ──────────────────────────────────────────────────────────────────

printf '\n\033[1m═══ %s tier ═══\033[0m\n' "$TIER"
for name in "${PASSED[@]:-}";  do [[ -n "$name" ]] && printf '  \033[32mpass\033[0m  %s\n' "$name"; done
for name in "${SKIPPED[@]:-}"; do [[ -n "$name" ]] && printf '  \033[33mskip\033[0m  %s\n' "$name"; done
for name in "${FAILED[@]:-}";  do [[ -n "$name" ]] && printf '  \033[31mFAIL\033[0m  %s\n' "$name"; done

if [[ ${#FAILED[@]} -gt 0 ]]; then
    printf '\n%d gate(s) failed.\n' "${#FAILED[@]}"
    exit 1
fi
printf '\nAll %s-tier gates green.\n' "$TIER"
