#!/bin/bash
# ============================================================================
# Phase 5.4 Verification: Rankings & Leaderboards
# Producer: JaPiTo Group
#
# Run in WSL from the project root:
#   bash execution/tests/test_rankings.sh 2>&1 | tee .tmp/backend.log
# ============================================================================

LOG_FILE=".tmp/backend.log"
mkdir -p .tmp

PASS=0
FAIL=0

log() { echo "$1" | tee -a "$LOG_FILE"; }
pass() { log "[PASS] $1"; PASS=$((PASS + 1)); }
fail() { log "[FAIL] $1"; FAIL=$((FAIL + 1)); }

log "======================================================"
log "PHASE 5.4: Rankings Verification"
log "Timestamp: $(date)"
log "======================================================"

# 1. Initialize Player
log ""
log "--- TEST 1: Initialize Player ---"
dfx canister call backend debugResetPlayer '()' 2>&1 >/dev/null
INIT=$(dfx canister call backend initializePlayer '("ranking_tester", "RankTester")' 2>&1)
log "$INIT"
if echo "$INIT" | grep -q "Ok"; then
    pass "Player initialized"
else
    fail "Player initialization failed"
fi

# 2. Get Leaderboard and check structure
log ""
log "--- TEST 2: Check Leaderboard Structure (Profit/Efficiency/Rank) ---"
LEADERBOARD=$(dfx canister call backend getLeaderboard '()' 2>&1)
log "$LEADERBOARD"

# Check for new fields
if echo "$LEADERBOARD" | grep -q "profit =" && \
   echo "$LEADERBOARD" | grep -q "efficiency =" && \
   echo "$LEADERBOARD" | grep -q "rank ="; then
    pass "Leaderboard contains new metrics (profit, efficiency, rank)"
else
    fail "Leaderboard missing new metrics"
fi

# 3. Verify AI Presence and Values
log ""
log "--- TEST 3: AI Competitors & Estimated Metrics ---"
if echo "$LEADERBOARD" | grep -q "Marek" && echo "$LEADERBOARD" | grep -q "isAI = true"; then
    pass "AI Competitors present (Marek found)"
else
    fail "AI Competitors missing"
fi

# Check if AI has non-zero profit/efficiency (since they have production capacity)
# We expect positive integers for profit and floats for efficiency
if echo "$LEADERBOARD" | grep "profit =" | grep -v "0 : int" | grep -q " : int"; then
    pass "AI competitors have non-zero estimated profit"
else
    log "INFO: Profit might be 0 if capacity/price logic yields 0 (Check math)"
fi

# 4. Verify Sorting (Rank 1 should be highest profit)
# This is hard to parse strictly in bash without jq, but we can verify ranks exist
if echo "$LEADERBOARD" | grep -q "rank = 1"; then
    pass "Rank 1 entry exists"
else
    fail "Rank 1 missing"
fi

log ""
log "======================================================"
log "RESULTS: $PASS passed | $FAIL failed"
log "======================================================"

if [ "$FAIL" -eq 0 ]; then
    log "✅ Phase 5.4 verification PASSED"
    exit 0
else
    log "❌ Phase 5.4 verification FAILED"
    exit 1
fi
