#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — INTEGRATION TESTS (V3)
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# ============================================================

set -e

LOG=".tmp/qa_phase8_integration_v3.log"
PASS=0
FAIL=0

mkdir -p .tmp
echo "--- PHASE 8.0 INTEGRATION RUN (V3) ---" > "$LOG"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }

get_phase() {
    dfx canister call backend getPlayerFarm '()' | grep "currentPhase =" | awk -F'[{}]' '{print $2}' | xargs
}

advance_verified() {
    local TARGET_PHASE=$1
    log "Advancing to $TARGET_PHASE..."
    dfx canister call backend advancePhase '()' >/dev/null
    local ACTUAL=$(get_phase)
    if [ "$ACTUAL" != "$TARGET_PHASE" ]; then
        fail "Advancement mismatch: Expected $TARGET_PHASE, got $ACTUAL"
        exit 1
    fi
}

log "Phase 8.0 Integration Verification V3 — $(date)"

# ============================================================
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "▶ SECTION: 1. PSF SHORTFALL"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend initializePlayer '("p8_v3", "TesterV3")' >/dev/null

log "Initial Phase: $(get_phase)"

# Hiring -> Procurement -> Investment -> Growth -> Harvest -> Market -> Storage -> CutAndPrune -> Maintenance -> Planning
advance_verified "Procurement"
advance_verified "Investment"
advance_verified "Growth"
advance_verified "Harvest"
advance_verified "Market"
advance_verified "Storage"
advance_verified "CutAndPrune"
advance_verified "Maintenance"
advance_verified "Planning"

# At Planning (SN 4), commit to PSF for SN 5
log "Market State at Planning: $(dfx canister call backend getMarketState '()' | grep -o 'psf_S[0-9]_[0-9]' | xargs)"

log "Committing to Export PSF (10,000kg) for Season 5..."
COMMIT_RES=$(dfx canister call backend commitPreSeasonFuture '("psf_S5_0", 10000)')
log "Commit Result: $COMMIT_RES"
if [[ "$COMMIT_RES" == *"Ok"* ]]; then
    pass "PSF Committed"
else
    fail "PSF Commitment failed"
    exit 1
fi

# We need to reach S5 Storage (Autumn) to resolve S5 PSF.
# Now at Planning SN 4.
advance_verified "Hiring" # Starts SN 5
dfx canister call backend hireLabor '("Standard")' >/dev/null
advance_verified "Procurement"
advance_verified "Investment"
advance_verified "Growth"
advance_verified "Harvest"
advance_verified "Market"
advance_verified "Storage" # End of SN 5

log "Resolving Season 5 Auctions..."
RESOLVE_RES=$(dfx canister call backend resolveSeasonAuctions '()')
log "Resolution Result: $RESOLVE_RES"

if [[ "$RESOLVE_RES" == *"Ok"* ]]; then
    pass "PSF Resolution processed"
else
    fail "PSF Resolution error"
fi

FARM_FINAL=$(dfx canister call backend getPlayerFarm '()')
DEBT=$(echo "$FARM_FINAL" | grep "debt =" | grep -Eo '[0-9_]+' | head -n 1 | tr -d '_')
log "Final Debt: $DEBT"

if [ "$DEBT" -gt 0 ]; then
    pass "Shortfall debt recorded ✅"
else
    fail "Shortfall debt missing"
fi

# ============================================================
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "▶ SECTION: 2. AUCTION WIN"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "Resetting environment for Section 2..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend debugClearMarket '()' >/dev/null
dfx canister call backend initializePlayer '("p8_win", "TesterWin")' >/dev/null

log "Injecting artificial inventory for auction tests..."
dfx canister call backend debugSetInventory '(15000, 15000)' >/dev/null

advance_verified "Procurement" # SN 1
advance_verified "Investment" # SN 1
advance_verified "Growth" # SN 2 (Summer)
advance_verified "Harvest" # SN 2 (Summer)

log "Harvesting S2 inventory..."
dfx canister call backend harvestCherries "(\"$(dfx canister call backend getPlayerFarm '()' | grep "id =" | head -1 | awk -F'\"' '{print $2}')\")" >/dev/null

advance_verified "Market" # SN 3 (Autumn)

STATE=$(dfx canister call backend getMarketState '()')
IMP_ID=$(echo "$STATE" | grep -o 'imp_S[0-9]_[0-9]' | head -1)

if [ -z "$IMP_ID" ]; then
    log "Full Market State: $STATE"
    fail "Imperial Contract not found in market"
    exit 1
fi

log "Bidding on $IMP_ID (Min price 1 PLN)..."
BID_RES=$(dfx canister call backend submitAuctionBid "(\"$IMP_ID\", 1)")
log "Bid Result: $BID_RES"

if echo "$BID_RES" | grep -q "Ok"; then
    pass "Bid Submitted"
else
    fail "Bid submission failed: $BID_RES"
    exit 1
fi

advance_verified "Storage" # SN 3

log "Resolving SN 3 Auctions..."
RESOLVE_RES=$(dfx canister call backend resolveSeasonAuctions '()')
log "Resolve Result: $RESOLVE_RES"

if echo "$RESOLVE_RES" | grep -q "🏆 WON"; then
    pass "Auction Win Recorded in summary"
else
    fail "Auction Win missing from summary"
fi

NEW_FARM=$(dfx canister call backend getPlayerFarm '()')
CASH=$(echo "$NEW_FARM" | grep "cash =" | awk '{print $3}' | tr -d ';' | tr -d '_')
log "Final Cash: $CASH"

if [ "$CASH" -gt 1000 ]; then
    pass "Revenue credited ✅"
else
    fail "Revenue not credited (Cash: $CASH)"
fi

# ============================================================
echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Phase 8.0 All Checks Passed!"
else
    exit 1
fi
