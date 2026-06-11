#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — AI ARCHETYPE GATE TEST
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
log "PHASE 8.0: AI ARCHETYPE GATE TEST"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "Deploying backend upgrades (if any)..."
dfx deploy backend --mode upgrade --yes >/dev/null 2>&1

log "Resetting environment..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend debugSetHansStorage '(0)' >/dev/null
dfx canister call backend initializePlayer '("p8_ai", "TesterAI")' >/dev/null

log "Advancing to Harvest Season 2 (Hans Storage = 0)..."
advance_verified "Procurement" # SN 1
advance_verified "Investment" # SN 1
advance_verified "Growth" # SN 2 (Summer)
advance_verified "Harvest" # SN 2 (Summer)

log "Fetching active bids..."
BIDS_S2=$(dfx canister call backend debugGetBids '()')

# 1. Verify Kasia and Marek made bids
if echo "$BIDS_S2" | grep -q "ai_marek"; then
    pass "Marek placed bids"
else
    fail "Marek missing from bids"
fi

if echo "$BIDS_S2" | grep -q "ai_kasia"; then
    pass "Kasia placed bids (Bio/Pre-Season Bio)"
else
    fail "Kasia missing from bids"
fi

# 2. Verify Hans DID NOT bid because storage = 0
if echo "$BIDS_S2" | grep -q "ai_hans"; then
    fail "Hans placed a bid despite 0 storage! (Gate failed)"
else
    pass "Hans restricted from bidding (Storage Gate working)"
fi

# 3. Give Hans a massive amount of storage
log "Granting Hans 500,000 kg and advancing to Harvest SN 3..."
dfx canister call backend debugSetHansStorage '(500000)' >/dev/null

advance_verified "Market" # SN 2
advance_verified "Storage" # SN 2
advance_verified "CutAndPrune" # SN 2
advance_verified "Maintenance" # SN 2
advance_verified "Planning" # SN 2
advance_verified "Hiring" # SN 3
advance_verified "Procurement" # SN 3
advance_verified "Investment" # SN 3
advance_verified "Growth" # SN 3
advance_verified "Harvest" # SN 3

log "Fetching active bids for SN 3..."
BIDS_S3=$(dfx canister call backend debugGetBids '()')

# 4. Verify Hans DID bid now
if echo "$BIDS_S3" | grep -q "ai_hans"; then
    pass "Hans placed a bid with sufficient storage!"
else
    log "$BIDS_S3"
    fail "Hans failed to bid despite 500,000 kg storage! (Gate failed)"
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "AI ARCHETYPE GATE TEST PASSED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
