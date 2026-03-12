#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — ISOLATED AUCTION WIN TEST
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

# Helper: Advance phase and verify
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
log "PHASE 8.0: AUCTION WIN ISOLATED TEST"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Reset and Initialize
log "Resetting environment..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend initializePlayer '("p8_win", "TesterWin")' >/dev/null

log "Injecting artificial inventory for auction tests..."
dfx canister call backend debugSetInventory '(15000, 15000)' >/dev/null

# 2. Advance to Harvest SN 2
log "Advancing to Harvest Season 2..."
advance_verified "Procurement" # SN 1
advance_verified "Investment" # SN 1
advance_verified "Growth" # SN 2 (Summer)
advance_verified "Harvest" # SN 2 (Summer)

# 3. Harvest some cherries to have inventory
log "Harvesting S2 inventory..."
dfx canister call backend harvestCherries "(\"$(dfx canister call backend getPlayerFarm '()' | grep "id =" | head -1 | awk -F'\"' '{print $2}')\")" >/dev/null

# 4. Advance to Market SN 3 (Autumn)
advance_verified "Market" # SN 3

# 5. Check Market State and Bid
STATE=$(dfx canister call backend getMarketState '()')
IMP_ID=$(echo "$STATE" | grep -o 'imp_S2_1' | head -1)

if [ -z "$IMP_ID" ]; then
    log "Full Market State: $STATE"
    fail "Imperial Contract imp_S2_1 (Bio) not found in market"
fi

log "Bidding on $IMP_ID (Min price 1 PLN)..."
BID_RES=$(dfx canister call backend submitAuctionBid "(\"$IMP_ID\", 1)")
log "Bid Result: $BID_RES"

if ! echo "$BID_RES" | grep -q "Ok"; then
    fail "Bid submission failed: $BID_RES"
fi
pass "Bid Submitted"

# 6. Advance to Storage SN 3 and Resolve
advance_verified "Storage" # SN 3

log "Resolving SN 3 Auctions..."
RESOLVE_RES=$(dfx canister call backend resolveSeasonAuctions '()')
log "Resolve Result: $RESOLVE_RES"

if echo "$RESOLVE_RES" | grep -q "🏆 WON"; then
    pass "Auction Win Recorded in summary"
else
    fail "Auction Win missing from summary"
fi

# 7. Check Inventory and Cash
NEW_FARM=$(dfx canister call backend getPlayerFarm '()')
CASH=$(echo "$NEW_FARM" | grep "cash =" | awk '{print $3}' | tr -d ';' | tr -d '_')
log "Final Cash: $CASH"

if [ "$CASH" -gt 1000 ]; then
    pass "Revenue credited"
else
    fail "Revenue not credited (Cash: $CASH)"
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "ISOLATED TEST PASSED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
