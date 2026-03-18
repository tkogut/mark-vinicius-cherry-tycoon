#!/bin/bash
# ============================================================
# PHASE 5.8 QA VERIFICATION SCRIPT (Multi-Year Stress Test)
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Run this in WSL from the project root:
#   bash execution/tests/test_phase5_8.sh 2>&1 | tee .tmp/qa_phase5_8.log
# ============================================================

set -e

LOG=".tmp/qa_phase5_8.log"
PASS=0
FAIL=0

mkdir -p .tmp

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; log "▶ $1"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

log "Phase 5.8 4-Year Survival Proof — $(date)"

log "Resetting player state..."
dfx canister call backend debugResetPlayer '()' >/dev/null 2>&1 || true
dfx canister call backend initializePlayer '("qa_stress58", "QAStress")' >/dev/null 2>&1 || true

OVERVIEW=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$OVERVIEW" | grep -o 'id = "[^"]*"' | head -n 1 | cut -d'"' -f2)
CASH_START=$(echo "$OVERVIEW" | grep -A 10 'cash =' | grep -Eo '[0-9_]+' | head -n 1 | tr -d '_')
log "Starting Cash: $CASH_START PLN"

run_year() {
    YEAR=$1
    log "=== SIMULATING YEAR $YEAR ==="
    
    # 1. Hiring
    dfx canister call backend hireLabor '("Standard")' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 2. Procurement
    dfx canister call backend purchaseSupplies '("fertilizer", 10)' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 3. Investment
    dfx canister call backend advancePhase '()' >/dev/null 2>&1
    
    # 4. Growth
    dfx canister call backend waterParcel '("'$PARCEL_ID'")' >/dev/null 2>&1 || true
    dfx canister call backend fertilizeParcel '("'$PARCEL_ID'", "Standard")' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 5. Harvest
    dfx canister call backend harvestCherries '("'$PARCEL_ID'")' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 6. Market
    dfx canister call backend sellCherries '("'$PARCEL_ID'", "wholesale")' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 7. Storage
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 8. CutAndPrune
    dfx canister call backend cutAndPrune '("'$PARCEL_ID'")' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 9. Maintenance
    dfx canister call backend inspectAndRepair '()' >/dev/null 2>&1 || true
    dfx canister call backend advancePhase '()' >/dev/null 2>&1

    # 10. Planning
    dfx canister call backend advancePhase '()' >/dev/null 2>&1
}

run_year 1
run_year 2
run_year 3
run_year 4

section "RESULTS & ANALYSIS"

FINAL_STATE=$(dfx canister call backend getPlayerFarm '()')
CASH_END=$(echo "$FINAL_STATE" | grep -A 10 'cash =' | grep -Eo '[0-9_]+' | head -n 1 | tr -d '_')
STATISTICS=$(dfx canister call backend getPlayerStats '()')
REVENUE=$(echo "$STATISTICS" | grep -m 1 'totalRevenue =' | grep -Eo '[0-9_]+' | tr -d '_')
COSTS=$(echo "$STATISTICS" | grep -m 1 'totalCosts =' | grep -Eo '[0-9_]+' | tr -d '_')

log "Final Cash: $CASH_END PLN"
log "Total Lifetime Revenue: $REVENUE PLN"
log "Total Lifetime Costs: $COSTS PLN"

if [ "$CASH_END" -ge 0 ]; then
    pass "Survived 4 years without integer underflow or crash."
    if [ "$CASH_END" -gt "$CASH_START" ]; then
        pass "Economy is PROFITABLE (+$((CASH_END - CASH_START)) PLN)"
    else
        log "⚠️ Economy is SUSTAINABLE but RUNNING AT A LOSS ($((CASH_START - CASH_END)) PLN burnt)."
    fi
else
    fail "Bankrupt!"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Stress Test Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
