#!/bin/bash
# ============================================================
# FERTILIZATION FIX QA VERIFICATION SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# ============================================================

set -e

LOG=".tmp/qa_fertilization.log"
PASS=0
FAIL=0

mkdir -p .tmp
rm -f "$LOG"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }

log "Fertilization Fix QA Verification — $(date)"

# 1. Setup
log "Resetting player..."
dfx canister call backend debugResetPlayer '()' >/dev/null 2>&1 || true
log "Initializing player..."
dfx canister call backend initializePlayer '("qa_fert", "QATester")' >/dev/null

# 2. Get Initial State
FARM=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM" | grep -o 'id = "[^"]*"' | head -n 1 | cut -d'"' -f2)
INITIAL_CASH=$(echo "$FARM" | grep -o 'cash = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')
INITIAL_FERT=$(echo "$FARM" | grep -o 'fertilizers = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')

PARCEL=$(dfx canister call backend getParcelDetails "(\"$PARCEL_ID\")")
INITIAL_FERTILITY=$(echo "$PARCEL" | grep -o 'fertility = [0-9]*\.[0-9]*' | head -n 1 | cut -d' ' -f3)

log "Initial Cash: $INITIAL_CASH PLN"
log "Initial Fertilizers: $INITIAL_FERT"
log "Initial Fertility: $INITIAL_FERTILITY"

# 4. Advance to Growth Phase
log "Advancing to Growth phase..."
dfx canister call backend advancePhase '()' >/dev/null # Procurement
dfx canister call backend advancePhase '()' >/dev/null # Investment
dfx canister call backend advancePhase '()' >/dev/null # Growth

# 5. Capture mid-state (after phase transitions, before fertilization)
FARM_MID=$(dfx canister call backend getPlayerFarm '()')
MID_CASH=$(echo "$FARM_MID" | grep -o 'cash = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')
MID_FERT=$(echo "$FARM_MID" | grep -o 'fertilizers = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')

PARCEL_MID=$(dfx canister call backend getParcelDetails "(\"$PARCEL_ID\")")
MID_FERTILITY=$(echo "$PARCEL_MID" | grep -o 'fertility = [0-9]*\.[0-9]*' | head -n 1 | cut -d' ' -f3)

log "Mid-state Cash: $MID_CASH PLN"
log "Mid-state Fertilizers: $MID_FERT"
log "Mid-state Fertility: $MID_FERTILITY"

# 6. Execute Fertilization
log "Calling fertilizeParcel..."
RESULT=$(dfx canister call backend fertilizeParcel "(\"$PARCEL_ID\", \"Standard\")")

if echo "$RESULT" | grep -q 'Ok'; then
    pass "fertilizeParcel call returned Ok"
else
    fail "fertilizeParcel call failed: $RESULT"
    exit 1
fi

# 7. Verify State Changes
FARM_POST=$(dfx canister call backend getPlayerFarm '()')
POST_CASH=$(echo "$FARM_POST" | grep -o 'cash = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')
POST_FERT=$(echo "$FARM_POST" | grep -o 'fertilizers = [0-9_]*' | head -n 1 | cut -d' ' -f3 | tr -d '_')

PARCEL_POST=$(dfx canister call backend getParcelDetails "(\"$PARCEL_ID\")")
POST_FERTILITY=$(echo "$PARCEL_POST" | grep -o 'fertility = [0-9]*\.[0-9]*' | head -n 1 | cut -d' ' -f3)

log "Post Cash: $POST_CASH PLN"
log "Post Fertilizers: $POST_FERT"
log "Post Fertility: $POST_FERTILITY"

# Verification logic (Checking Deltas from Mid-state)
# Cash: -500 PLN
EXPECTED_CASH=$((MID_CASH - 500))
if [ "$POST_CASH" -eq "$EXPECTED_CASH" ]; then
    pass "Cash correctly decremented by 500 PLN (Delta Verified)"
else
    fail "Cash mismatch: Expected $EXPECTED_CASH, got $POST_CASH"
fi

# Inventory: -1
EXPECTED_FERT=$((MID_FERT - 1))
if [ "$POST_FERT" -eq "$EXPECTED_FERT" ]; then
    pass "Fertilizers correctly decremented by 1 (Delta Verified)"
else
    fail "Inventory mismatch: Expected $EXPECTED_FERT, got $POST_FERT"
fi

# Fertility: +0.1
INCREASE=$(echo "$POST_FERTILITY - $MID_FERTILITY" | bc -l)
if (( $(echo "$INCREASE > 0.09 && $INCREASE < 0.11" | bc -l) )); then
    pass "Fertility correctly increased by 0.1 (Delta Verified)"
else
    fail "Fertility increase mismatch: Got $INCREASE"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Fertilization Fix Verified!"
else
    exit 1
fi
