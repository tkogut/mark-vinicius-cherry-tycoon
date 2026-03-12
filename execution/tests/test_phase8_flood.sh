#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — FLOOD FACTOR TEST
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
        log "Advanced to $T_PHASE..."
    else
        fail "Failed to advance to $T_PHASE: $RES"
    fi
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "PHASE 8.0: FLOOD FACTOR DEGRADATION"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "Deploying backend upgrades (if any)..."
dfx deploy backend --mode upgrade --yes >/dev/null 2>&1

log "Resetting environment..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend initializePlayer '("p8_flood", "TesterFlood")' >/dev/null

log "Advancing to Harvest Season 2..."
advance_verified "Procurement" # SN 1
advance_verified "Investment" # SN 1
advance_verified "Growth" # SN 2 (Summer)
advance_verified "Harvest" # SN 2 (Summer)

log "Initial Spot Price should be 10 PLN"
PRICE=$(dfx canister call backend getMarketState '()' | grep 'spotPrice =' | grep -o '[0-9]\+' | head -n1 | tr -d '_')
if [ "$PRICE" -eq 10 ]; then
    pass "Starting Spot Price is 10"
else
    fail "Starting Spot Price is $PRICE (expected 10)"
fi

# We will loop 5 times (Seasons 2-6)
# Each time, we advance to Market, clear all bids (so AI doesn't win anything),
# and let the resolution engine in Storage punish the spot price.
# Planning phase will recover +1 PLN, but Storage should halve it (50k market pressure).
for i in {2..6}; do
    log "--- Season $i Degradation Cycle ---"
    
    # Check if we didn't just initialize, advance phases to get to next Harvest
    if [ "$i" -gt 2 ]; then
        advance_verified "CutAndPrune"
        advance_verified "Maintenance"
        advance_verified "Planning"
        advance_verified "Hiring"
        advance_verified "Procurement"
        advance_verified "Investment"
        advance_verified "Growth"
        advance_verified "Harvest"
    fi
    
    advance_verified "Market"
    
    # Sabotage all bids (simulating 100% market saturation/lack of fulfillment)
    log "Sabotaging market (clearing all AI bids and contracts)..."
    dfx canister call backend debugClearBidsAndContracts '()' >/dev/null
    
    advance_verified "Storage"
    
    # Check Price Drop
    PRICE=$(dfx canister call backend getMarketState '()' | grep 'spotPrice =' | grep -o '[0-9]\+' | head -n1 | tr -d '_')
    log "Spot Price plummeted to $PRICE PLN"
done

# The loop ends after pushing to Storage SN 6.
# By this point, the spot price should be severely degraded to <= 2 PLN.
if [ "$PRICE" -le 2 ]; then
    pass "Spot Price successfully degraded to near floor ($PRICE PLN)"
else
    fail "Spot Price failed to degrade sufficiently: $PRICE PLN"
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "FLOOD FACTOR TEST PASSED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
