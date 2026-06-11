#!/bin/bash
# ============================================================
# PHASE 5.7 QA VERIFICATION SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Run this in WSL from the project root:
#   bash execution/tests/test_phase5_7.sh 2>&1 | tee .tmp/qa.log
# ============================================================

set -e

LOG=".tmp/qa_phase5_7.log"
PASS=0
FAIL=0

mkdir -p .tmp

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; log "▶ $1"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

log "Phase 5.7 QA Verification — $(date)"

# ============================================================
section "1. INITIALIZATION & SETUP"
# ============================================================

log "Resetting player state..."
dfx canister call backend debugResetPlayer '()' 2>&1 | tee -a "$LOG" || true

log "Initializing player for Phase 5.7 test..."
dfx canister call backend initializePlayer '("qa_test57", "QATester")' 2>&1 | grep -q 'Ok' && pass "Player Initialized" || fail "Player Init"

# Fetch parcel ID
OVERVIEW=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$OVERVIEW" | grep -o 'id = "[^"]*"' | head -n 1 | cut -d'"' -f2)
log "Found Starter Parcel ID: $PARCEL_ID"

# ============================================================
section "2. PHASE GATING: WATERING & HIRING"
# ============================================================

log "Phase: Hiring (Spring)"
dfx canister call backend waterParcel '("'$PARCEL_ID'")' 2>&1 | grep -q 'SeasonalRestriction' && pass "Watering correctly blocked in Hiring phase" || fail "Watering blocked in Hiring"

log "Executing Hire Labor (Standard)..."
dfx canister call backend hireLabor '("Standard")' 2>&1 | grep -q 'Ok' && pass "Labor hired successfully" || fail "Labor hiring"

log "Advancing to Procurement phase..."
dfx canister call backend advancePhase '()' 2>&1 | grep -q 'Ok' && pass "Advanced to Procurement" || fail "Advance to Procurement"

# ============================================================
section "3. SPRING WATERING & BULK SUPPLIES (#Procurement)"
# ============================================================

log "Testing Spring Watering in Procurement phase..."
dfx canister call backend waterParcel '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "Watering allowed in Procurement (Early Drought Combat)" || fail "Watering failed in Procurement"

log "Testing Bulk Supplies (20 units = 10% discount)..."
dfx canister call backend purchaseSupplies '("fertilizer", 20)' 2>&1 | grep -q 'Ok' && pass "Bulk Supplies purchased successfully" || fail "Bulk Supplies"

# ============================================================
section "4. FURTHER WATERING CHECKS (#Investment & #Growth)"
# ============================================================

log "Advancing to Investment phase..."
dfx canister call backend advancePhase '()' 2>&1 | grep -q 'Ok' || fail "Advance Phase error"
dfx canister call backend waterParcel '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "Watering allowed in Investment" || fail "Watering Investment"

log "Advancing to Growth phase..."
dfx canister call backend advancePhase '()' 2>&1 | grep -q 'Ok' || fail "Advance Phase error"
dfx canister call backend waterParcel '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "Watering allowed in Growth" || fail "Watering Growth"

# ============================================================
section "5. ATOMIC STATE TRANSITION & PHASE LOCKS"
# ============================================================

log "Advancing to Harvest phase..."
dfx canister call backend advancePhase '()' 2>&1 | grep -q 'Ok' || fail "Advance Phase error"

log "Testing Watering in Harvest phase (Should be blocked)..."
dfx canister call backend waterParcel '("'$PARCEL_ID'")' 2>&1 | grep -q 'SeasonalRestriction' && pass "Watering correctly blocked in Harvest phase" || fail "Watering block in Harvest"

log "Harvesting Cherries..."
dfx canister call backend harvestCherries '("'$PARCEL_ID'")' 2>&1 | grep -q 'Ok' && pass "Harvest successful" || fail "Harvest"

# ============================================================
section "6. NEW MECHANICS: FORWARD CONTRACTS (#Market)"
# ============================================================

log "Advancing to Market phase..."
dfx canister call backend advancePhase '()' 2>&1 | grep -q 'Ok' || fail "Advance Phase error"

log "Testing Forward Contract (Marek, 50kg)..."
dfx canister call backend negotiateForwardContract '("Marek", 50)' 2>&1 | grep -q 'Ok' && pass "Forward Contract negotiated successfully" || fail "Forward Contract check"

# ============================================================
section "7. MAINTENANCE & PLANNING (#Maintenance, #Planning)"
# ============================================================

log "Advancing to Storage -> CutAndPrune -> Maintenance..."
dfx canister call backend advancePhase '()' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null

log "Executing Inspect and Repair..."
dfx canister call backend inspectAndRepair '()' 2>&1 | grep -q 'Ok' && pass "Inspect and Repair functional" || fail "Inspect and Repair"

log "Advancing to Planning phase..."
dfx canister call backend advancePhase '()' >/dev/null

log "Purchasing Market Forecast..."
dfx canister call backend purchaseMarketForecast '()' 2>&1 | grep -q 'targetSeason' && pass "Market Forecast purchased" || fail "Market Forecast"

# ============================================================
section "8. ATOMIC FALLBACK CHECK (#Hiring -> #Procurement skipped)"
# ============================================================

log "Advancing to Hiring (Year 2)..."
dfx canister call backend advancePhase '()' >/dev/null

log "Skipping Hiring directly to Procurement (Should auto-assign Emergency labor)..."
dfx canister call backend advancePhase '()' >/dev/null

FARM=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM" | grep -q 'Emergency'; then
    pass "Emergency Labor auto-assigned as atomic fallback ✅"
else
    fail "Emergency Labor fallback failed"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Phase 5.7 QA Checks Passed!"
else
    log "🚨 $FAIL failures detected."
    exit 1
fi
