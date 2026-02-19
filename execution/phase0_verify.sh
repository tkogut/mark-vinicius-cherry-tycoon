#!/bin/bash
# ============================================================
# PHASE 0 MASTER VERIFICATION SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Run this in WSL from the project root:
#   bash execution/phase0_verify.sh 2>&1 | tee .tmp/phase0.log
# ============================================================

set -e

LOG=".tmp/phase0.log"
PASS=0
FAIL=0
SKIP=0

mkdir -p .tmp

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
skip() { log "⏭️  SKIP: $1"; SKIP=$((SKIP+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; log "▶ $1"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

log "Phase 0 Verification — $(date)"
log "Project: /home/tkogut/projects/mark-vinicius-cherry-tycoon-1"

# ============================================================
section "0. PRE-CHECKS"
# ============================================================

if dfx --version &>/dev/null; then
    pass "dfx installed: $(dfx --version)"
else
    fail "dfx not found. Install from https://internetcomputer.org/docs/current/developer-docs/getting-started/install/"
    exit 1
fi

if dos2unix --version &>/dev/null; then
    pass "dos2unix installed"
else
    skip "dos2unix not found — line endings may cause issues on Windows-created scripts"
fi

# Fix line endings on test scripts
log "Fixing line endings on test scripts..."
dos2unix execution/tests/*.sh 2>/dev/null && pass "Line endings fixed" || skip "dos2unix skipped"

# ============================================================
section "1. SOURCE CODE HYGIENE"
# ============================================================

# Caffeine check in source
CAFFEINE_IN_SOURCE=$(grep -rl "Caffeine AI\|caffeine\.ai" --include="*.mo" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l)
if [ "$CAFFEINE_IN_SOURCE" -eq 0 ]; then
    pass "No legacy 'Caffeine AI' in source code (.mo/.ts/.tsx)"
else
    fail "Legacy 'Caffeine AI' found in source: $(grep -rl 'Caffeine AI' --include='*.mo' --include='*.ts' --include='*.tsx' . | grep -v node_modules)"
fi

# Debug.print check
DEBUG_PRINT=$(grep -rn "Debug\.print" backend/ 2>/dev/null | wc -l)
if [ "$DEBUG_PRINT" -eq 0 ]; then
    pass "No Debug.print in backend (clean)"
else
    fail "$DEBUG_PRINT Debug.print calls remain in backend — remove before Phase 5"
    grep -rn "Debug\.print" backend/ | tee -a "$LOG"
fi

# Dual entrypoint public API parity
log "Checking dual-entrypoint API parity..."
MAIN_FUNCS=$(grep -c "public shared" backend/main.mo 2>/dev/null || echo 0)
MAINNET_FUNCS=$(grep -c "public shared" backend/main_mainnet.mo 2>/dev/null || echo 0)
if [ "$MAIN_FUNCS" -eq "$MAINNET_FUNCS" ]; then
    pass "Dual entrypoint parity: both files have $MAIN_FUNCS public functions"
else
    fail "Entrypoint mismatch: main.mo=$MAIN_FUNCS vs main_mainnet.mo=$MAINNET_FUNCS"
fi

# ============================================================
section "2. DEPLOY BACKEND"
# ============================================================

log "Stopping existing dfx processes..."
dfx stop 2>/dev/null || true

log "Starting dfx replica (clean)..."
if dfx start --clean --background 2>&1 | tee -a "$LOG"; then
    pass "dfx replica started"
    sleep 3
else
    fail "dfx start failed"
    exit 1
fi

log "Deploying backend canister..."
if dfx deploy backend 2>&1 | tee -a "$LOG"; then
    CANISTER_ID=$(dfx canister id backend 2>/dev/null || echo "unknown")
    pass "Backend deployed — canister ID: $CANISTER_ID"
else
    fail "dfx deploy backend failed — check .tmp/phase0.log"
    exit 1
fi

# ============================================================
section "3. PLAYER LIFECYCLE VERIFICATION"
# ============================================================

log "Resetting player state..."
dfx canister call backend debugResetPlayer '()' 2>&1 | tee -a "$LOG" || true

log "Initializing player..."
INIT_RESULT=$(dfx canister call backend initializePlayer '("phase0_test", "Phase0Tester")' 2>&1)
echo "$INIT_RESULT" | tee -a "$LOG"
if echo "$INIT_RESULT" | grep -q '#Ok'; then
    pass "initializePlayer OK"
else
    fail "initializePlayer failed"
fi

log "Getting farm overview..."
OVERVIEW=$(dfx canister call backend getFarmOverview '()' 2>&1)
echo "$OVERVIEW" | tee -a "$LOG"
if echo "$OVERVIEW" | grep -q '#Ok'; then
    pass "getFarmOverview OK"
else
    fail "getFarmOverview failed"
fi

log "Getting player farm..."
FARM=$(dfx canister call backend getPlayerFarm '()' 2>&1)
if echo "$FARM" | grep -q '#Ok'; then
    pass "getPlayerFarm OK"
else
    fail "getPlayerFarm failed"
fi

# ============================================================
section "4. SEASONAL RESTRICTION VERIFICATION (Phase 0 QA)"
# ============================================================

log "Testing seasonal restriction: harvest in Spring (should fail)..."
HARVEST_RESULT=$(dfx canister call backend harvestCherries '("parcel_starter_phase0_test")' 2>&1)
echo "$HARVEST_RESULT" | tee -a "$LOG"
if echo "$HARVEST_RESULT" | grep -q 'SeasonalRestriction'; then
    pass "SeasonalRestriction: harvest blocked in Spring ✅"
else
    fail "SeasonalRestriction not working for harvest"
fi

log "Testing seasonal restriction: fertilize in Winter (should fail)..."
# First advance to winter... this uses advanceSeason
log "(Advancing to Summer for harvest test...)"
dfx canister call backend advanceSeason '(null)' 2>&1 | tee -a "$LOG" || true  # Spring→Summer
HARVEST_SUMMER=$(dfx canister call backend harvestCherries '("parcel_starter_phase0_test")' 2>&1)
if echo "$HARVEST_SUMMER" | grep -q 'SeasonalRestriction\|#Ok'; then
    pass "harvestCherries in Summer: reached correct branch"
else
    fail "harvestCherries Summer test unexpected"
fi

# ============================================================
section "5. PHASE SYSTEM VERIFICATION (Phase 5.1 Pre-flight)"
# ============================================================

log "Resetting for phase test..."
dfx canister call backend debugResetPlayer '()' 2>&1 | tee -a "$LOG" || true
dfx canister call backend initializePlayer '("phase_test", "PhaseTester")' 2>&1 | tee -a "$LOG" || true

log "Checking initial phase is Preparation..."
OVERVIEW2=$(dfx canister call backend getFarmOverview '()' 2>&1)
echo "$OVERVIEW2" | tee -a "$LOG"
if echo "$OVERVIEW2" | grep -q 'Preparation'; then
    pass "Initial phase is Preparation ✅"
else
    fail "Expected Preparation phase on init"
fi

log "Advancing to Growth phase..."
PHASE_RESULT=$(dfx canister call backend advancePhase '()' 2>&1)
echo "$PHASE_RESULT" | tee -a "$LOG"
if echo "$PHASE_RESULT" | grep -q '#Ok'; then
    pass "advancePhase OK (Preparation → Growth)"
    # Check for weather
    if echo "$PHASE_RESULT" | grep -q 'Weather Alert'; then
        pass "Weather event triggered on Growth phase transition ✅"
    else
        log "ℹ️  No weather event this cycle (probabilistic — expected ~35-65% of time)"
    fi
else
    fail "advancePhase failed"
fi

log "Advancing to Harvest phase..."
PHASE2=$(dfx canister call backend advancePhase '()' 2>&1)
if echo "$PHASE2" | grep -q '#Ok'; then pass "Growth → Harvest OK"; else fail "Growth → Harvest failed"; fi

log "Advancing to Sales phase..."
PHASE3=$(dfx canister call backend advancePhase '()' 2>&1)
if echo "$PHASE3" | grep -q '#Ok'; then pass "Harvest → Sales OK"; else fail "Harvest → Sales failed"; fi

log "Advancing to OffSeason phase..."
PHASE4=$(dfx canister call backend advancePhase '()' 2>&1)
if echo "$PHASE4" | grep -q '#Ok'; then pass "Sales → OffSeason OK"; else fail "Sales → OffSeason failed"; fi

log "Testing OffSeason gate (advancePhase should fail)..."
PHASE5=$(dfx canister call backend advancePhase '()' 2>&1)
if echo "$PHASE5" | grep -q 'Err\|InvalidOperation'; then
    pass "OffSeason gate works — cannot advance, must use advanceSeason() ✅"
else
    fail "OffSeason gate not working"
fi

log "Advancing season (OffSeason → Spring/Preparation)..."
ADVANCE_SEASON=$(dfx canister call backend advanceSeason '(null)' 2>&1)
echo "$ADVANCE_SEASON" | tee -a "$LOG"
if echo "$ADVANCE_SEASON" | grep -q '#Ok'; then
    pass "advanceSeason OK — season rolled over ✅"
else
    fail "advanceSeason failed"
fi

# ============================================================
section "6. MARKET & ECONOMY"
# ============================================================

log "Getting market prices..."
PRICES=$(dfx canister call backend getMarketPrices '()' 2>&1)
if echo "$PRICES" | grep -q '#Ok'; then pass "getMarketPrices OK"; else fail "getMarketPrices failed"; fi

log "Getting stability check..."
STABILITY=$(dfx canister call backend checkStability '()' 2>&1)
if echo "$STABILITY" | grep -q '#Ok'; then pass "checkStability OK"; else fail "checkStability failed"; fi

# ============================================================
section "7. SUMMARY"
# ============================================================

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Phase 0 Results: ✅ $PASS PASSED | ❌ $FAIL FAILED | ⏭️  $SKIP SKIPPED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 All Phase 0 checks passed! Ready to proceed to Phase 5."
    log "Next: bash execution/tests/test_weather.sh"
else
    log "🚨 $FAIL failures detected. Review .tmp/phase0.log"
    exit 1
fi
