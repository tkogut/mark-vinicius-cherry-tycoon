#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — 10-YEAR STRESS TEST
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# ============================================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date +%T)]${NC} $1"; }
pass() { echo -e "${GREEN}[$(date +%T)]${NC} ✅ PASS: $1"; }
fail() { echo -e "${RED}[$(date +%T)]${NC} ❌ FAIL: $1"; exit 1; }

advance_verified() {
    T_PHASE=$1
    RES=$(dfx canister call backend advancePhase '()')
    if echo "$RES" | grep -q "Ok"; then
        echo -n "."
    else
        echo ""
        fail "Failed to advance to $T_PHASE (Year $Y): $RES"
    fi
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "PHASE 8.0: 10-YEAR ECONOMIC STRESS TEST"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "Deploying backend upgrades (if any)..."
dfx deploy backend --mode upgrade --yes >/dev/null 2>&1

log "Resetting environment..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend debugSetHansStorage '(100000)' >/dev/null
dfx canister call backend initializePlayer '("p8_stress", "AgentTest")' >/dev/null

log "Starting 10-Year Simulation (100 phase transitions)..."

for Y in {1..10}; do
    log "--- Simulating Year $Y ---"
    
    # Hiring (Season starts in Spring)
    if [ "$Y" -gt 1 ]; then
        advance_verified "Hiring"
    fi
    dfx canister call backend hireLabor '("Standard")' >/dev/null
    
    advance_verified "Procurement"
    advance_verified "Investment"
    advance_verified "Growth"
    advance_verified "Harvest"
    
    # Harvest taking place
    dfx canister call backend harvestCherries "(\"parcel_starter_p8_stress\")" >/dev/null
    
    advance_verified "Market"
    
    # Player submits a random lowball bid to ensure bid processing runs every year
    STATE=$(dfx canister call backend getMarketState '()')
    IMP_ID=$(echo "$STATE" | grep -o 'imp_S[0-9]_[0-9]' | head -1)
    if [ -n "$IMP_ID" ]; then
        dfx canister call backend submitAuctionBid "(\"$IMP_ID\", 1)" >/dev/null 2>&1 || true
    fi
    
    advance_verified "Storage"
    advance_verified "CutAndPrune"
    advance_verified "Maintenance"
    advance_verified "Planning"
    
    # Log progress end of year
    FARM=$(dfx canister call backend getPlayerFarm '()')
    CASH=$(echo "$FARM" | grep -o -P 'cash = \K[0-9_]+' | tr -d '_')
    DEBT=$(echo "$FARM" | grep -o -P 'debt = \K[0-9_]+' | tr -d '_')
    
    log "End Year $Y -> Cash: $CASH PLN | Debt: $DEBT PLN"
done

log "Simulation complete. Checking final stability..."

if [ "$CASH" -ge 0 ]; then
    pass "Simulation completed without crashes or trap errors over 10 years!"
else
    fail "Simulation resulted in invalid state."
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "10-YEAR ECONOMIC STRESS TEST PASSED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
