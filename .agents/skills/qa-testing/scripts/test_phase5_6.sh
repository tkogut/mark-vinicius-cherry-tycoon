#!/bin/bash
# ============================================================
# PHASE 5.6 QA VERIFICATION SCRIPT (Activity-Based Actions)
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Run this in WSL from the project root:
#   bash execution/tests/test_phase5_6.sh 2>&1 | tee .tmp/qa_phase5_6.log
# ============================================================

set -e

LOG=".tmp/qa_phase5_6.log"
PASS=0
FAIL=0

mkdir -p .tmp

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; log "▶ $1"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

log "Phase 5.6 QA Verification — $(date)"

# ============================================================
section "1. START & LINEAR PROGRESSION"
# ============================================================

log "Resetting player state..."
dfx canister call backend debugResetPlayer '()' 2>&1 | tee -a "$LOG" || true
dfx canister call backend initializePlayer '("qa_test56", "QATester56")' 2>&1 | tee -a "$LOG" || true

OVERVIEW=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$OVERVIEW" | grep -o 'id = "[^"]*"' | head -n 1 | cut -d'"' -f2)

log "1. Phase: Hiring"
dfx canister call backend hireLabor '("Standard")' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null

log "2. Phase: Procurement"
dfx canister call backend purchaseSupplies '("fertilizer", 10)' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null

log "3. Phase: Investment"
# Plant some trees
dfx canister call backend plantTrees '("'$PARCEL_ID'", 10)' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null

log "4. Phase: Growth (Summer)"
dfx canister call backend advancePhase '()' >/dev/null

log "5. Phase: Harvest"
log "Testing: Correct phase for harvestCherries"
dfx canister call backend harvestCherries '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "Harvest successful in Harvest phase" || fail "Harvest in Harvest phase"

dfx canister call backend advancePhase '()' >/dev/null

log "6. Phase: Market (Autumn)"
dfx canister call backend harvestCherries '("'$PARCEL_ID'")' 2>&1 | grep -q 'SeasonalRestriction' && pass "Harvest blocked in Market phase" || fail "Harvest blocked in Market phase"
dfx canister call backend advancePhase '()' >/dev/null

log "7. Phase: Storage"
dfx canister call backend cutAndPrune '("'$PARCEL_ID'")' 2>&1 | grep -q 'SeasonalRestriction' && pass "CutAndPrune blocked in Storage phase" || fail "CutAndPrune blocked"
dfx canister call backend advancePhase '()' >/dev/null

log "8. Phase: CutAndPrune (Winter)"
log "Testing: Correct phase for CutAndPrune"
dfx canister call backend cutAndPrune '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "CutAndPrune successful in CutAndPrune phase" || fail "CutAndPrune phase"
dfx canister call backend advancePhase '()' >/dev/null

log "9. Phase: Maintenance"
dfx canister call backend advancePhase '()' >/dev/null

log "10. Phase: Planning"
log "Advancing back to Hiring (Year 2)..."
dfx canister call backend advancePhase '()' >/dev/null

FARM=$(dfx canister call backend getFarmOverview '()')
if echo "$FARM" | grep -q 'seasonNumber = 5'; then
    pass "Successfully completed 10-turn linear sequence and reached Year 2 (Season 5) ✅"
else
    fail "Linear sequence overflow or error"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Phase 5.6 Checks Passed!"
else
    log "🚨 $FAIL failures detected."
    exit 1
fi
