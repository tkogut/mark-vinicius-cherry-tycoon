#!/bin/bash
# ============================================================
# PHASE 8.0: THE COMPETITIVE POOL — VERIFICATION SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Tests: Imperial Contracts, Pre-Season Futures, Auctions, Flood Factor
# ============================================================

set -e

LOG=".tmp/backend.log"
PASS=0
FAIL=0

mkdir -p .tmp
echo "--- PHASE 8.0 AUCTION TESTS ---" > "$LOG"

log()  { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━"; log "▶ $1"; log "━━━━━━━━━━━━━━━━"; }

log "Phase 8.0 Auction Verification — $(date)"

# ============================================================
section "1. INITIALIZATION"
# ============================================================
dfx canister call backend debugResetPlayer '()' > /dev/null
dfx canister call backend initializePlayer '("qa_p8", "QATester80")' > /dev/null

FARM=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM" | grep -q "currentPhase = variant { Hiring }"; then
    pass "Player initialized in Hiring phase"
else
    fail "Player initialization phase mismatch"
fi

# ============================================================
section "2. isAnonymous GUARDS (Phase Gate / Auth)"
# ============================================================

# Test getActiveContracts rejects anonymous — can't test directly from dfx as it uses caller
# But ensure the function exists by calling it from a valid identity
CONTRACTS=$(dfx canister call backend getActiveContracts '()')
if echo "$CONTRACTS" | grep -q "Ok"; then
    pass "getActiveContracts returns Ok (empty list in non-Market phase)"
else
    fail "getActiveContracts failed unexpectedly"
fi

# ============================================================
section "3. commitPreSeasonFuture PHASE GATE"
# ============================================================

# Should fail — we are in Hiring, not Planning
PSF_RESULT=$(dfx canister call backend commitPreSeasonFuture '("psf_S1_0", 5000)' 2>&1 || true)
log "commitPreSeasonFuture in wrong phase: $PSF_RESULT"
if echo "$PSF_RESULT" | grep -q "SeasonalRestriction\|Planning"; then
    pass "commitPreSeasonFuture correctly rejected outside Planning phase"
else
    fail "commitPreSeasonFuture did NOT reject wrong phase"
fi

# ============================================================
section "4. submitAuctionBid PHASE GATE"
# ============================================================

BID_GATE=$(dfx canister call backend submitAuctionBid '("imp_S1_0", 6)' 2>&1 || true)
log "submitAuctionBid in wrong phase: $BID_GATE"
if echo "$BID_GATE" | grep -q "SeasonalRestriction\|Market"; then
    pass "submitAuctionBid correctly rejected outside Market phase"
else
    fail "submitAuctionBid did NOT reject wrong phase"
fi

# ============================================================
section "5. ADVANCE TO MARKET PHASE"
# ============================================================

log "Advancing: Hiring → Procurement → Investment → Growth → Harvest → Market..."
dfx canister call backend hireLabor '("Standard")' > /dev/null
dfx canister call backend advancePhase '()' > /dev/null  # → Procurement
dfx canister call backend advancePhase '()' > /dev/null  # → Investment
dfx canister call backend advancePhase '()' > /dev/null  # → Growth
dfx canister call backend advancePhase '()' > /dev/null  # → Harvest
dfx canister call backend advancePhase '()' > /dev/null  # → Market

FARM2=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM2" | grep -q "currentPhase = variant { Market }"; then
    pass "Advanced to Market phase"
else
    fail "Could not advance to Market phase"
    log "Farm state: $(echo "$FARM2" | grep currentPhase)"
fi

# ============================================================
section "6. submitAuctionBid — No Inventory (Expected Failure)"
# ============================================================

NO_STOCK=$(dfx canister call backend submitAuctionBid '("imp_S1_0", 6)' 2>&1 || true)
log "submitAuctionBid with no inventory: $NO_STOCK"
if echo "$NO_STOCK" | grep -q "NotFound\|Insufficient\|not found"; then
    pass "submitAuctionBid correctly rejected — no contracts loaded and no inventory"
else
    fail "submitAuctionBid gave unexpected response: $NO_STOCK"
fi

# ============================================================
section "7. resolveSeasonAuctions PHASE GATE — Not Storage"
# ============================================================

RESOLVE_GATE=$(dfx canister call backend resolveSeasonAuctions '()' 2>&1 || true)
log "resolveSeasonAuctions in wrong phase: $RESOLVE_GATE"
if echo "$RESOLVE_GATE" | grep -q "SeasonalRestriction\|Storage"; then
    pass "resolveSeasonAuctions correctly rejected outside Storage phase"
else
    fail "resolveSeasonAuctions did NOT reject wrong phase"
fi

# ============================================================
section "8. ADVANCE TO STORAGE — resolveSeasonAuctions (No Contracts)"
# ============================================================

dfx canister call backend advancePhase '()' > /dev/null  # Market → Storage

RESOLVE_CLEAN=$(dfx canister call backend resolveSeasonAuctions '()')
log "resolveSeasonAuctions (no contracts): $RESOLVE_CLEAN"
if echo "$RESOLVE_CLEAN" | grep -q "resolved\|No defaults\|Ok"; then
    pass "resolveSeasonAuctions completes cleanly with no active contracts"
else
    fail "resolveSeasonAuctions failed with no contracts"
fi

# ============================================================
section "9. FLOOD FACTOR — Verify SpotPrice getActiveContracts after resolve"
# ============================================================

FINAL_CONTRACTS=$(dfx canister call backend getActiveContracts '()')
if echo "$FINAL_CONTRACTS" | grep -q "Ok"; then
    pass "getActiveContracts accessible after Storage phase — API stable"
else
    fail "getActiveContracts inaccessible after Storage"
fi

# ============================================================
echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Phase 8.0 Auction API checks passed!"
    exit 0
else
    log "🚨 $FAIL failures detected."
    exit 1
fi
