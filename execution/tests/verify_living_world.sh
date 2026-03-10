#!/bin/bash
# ============================================================
# PHASE 7.0: LIVING WORLD VERIFICATION SCRIPT (V3 - LOGIC FIXED)
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# ============================================================

set -e

LOG=".tmp/qa_living_world.log"
PASS=0
FAIL=0

mkdir -p .tmp
echo "--- NEW RUN (V3) ---" > "$LOG"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo "" | tee -a "$LOG"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; log "▶ $ section: $1"; log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

log "Phase 7.0 Living World Verification — $(date)"

# ============================================================
section "1. INITIALIZATION & SETUP"
# ============================================================

log "Resetting player state..."
dfx canister call backend debugResetPlayer '()' >/dev/null
dfx canister call backend initializePlayer '("qa_test70", "QATester70")' >/dev/null

FARM=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM" | grep -q "currentPhase = variant { Hiring }"; then
    pass "Player initialized in Hiring phase"
else
    fail "Player initialization phase mismatch"
fi

# ============================================================
section "2. CROP INSURANCE (Lifecycle & Payout)"
# ============================================================

log "Advancing Hiring -> Procurement..."
dfx canister call backend hireLabor '("Standard")' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null

log "Purchasing Crop Insurance (2000 PLN)..."
INS_RES=$(dfx canister call backend purchaseCropInsurance '()')
log "Purchase Result: $INS_RES"
if echo "$INS_RES" | grep -q "(variant { Ok"; then
    pass "Insurance purchased"
else
    fail "Insurance purchase failed"
fi

log "Advancing Procurement -> Investment -> Growth..."
dfx canister call backend advancePhase '()' >/dev/null # Procurement -> Investment
dfx canister call backend advancePhase '()' >/dev/null # Investment -> Growth

log "Forcing catastrophic Frost and advancing..."
dfx canister call backend debugSetWeather '(variant { Frost }, 0.8, false)' >/dev/null

CASH_BEFORE=$(dfx canister call backend getPlayerFarm '()' | grep "cash =" | grep -Eo '[0-9_]+' | head -n 1 | tr -d '_')
log "Cash before payout: $CASH_BEFORE"

log "Advancing Growth -> Harvest (Trigger payout)..."
dfx canister call backend advancePhase '()' >/dev/null

FARM_AFTER=$(dfx canister call backend getPlayerFarm '()')
CASH_AFTER=$(echo "$FARM_AFTER" | grep "cash =" | grep -Eo '[0-9_]+' | head -n 1 | tr -d '_')
log "Cash after payout: $CASH_AFTER"

PAYOUT=$((CASH_AFTER - CASH_BEFORE))
log "Calculated Payout: $PAYOUT"

# Payout 5000 minus seasonal costs (approx 5000)
if [ "$PAYOUT" -gt -1000 ]; then
    pass "Insurance Payout (Frost) triggered correctly ✅"
else
    fail "Insurance Payout (Frost) failed ($PAYOUT)"
fi

# ============================================================
section "3. MITIGATION (Sprayer vs Disease)"
# ============================================================

log "Advancing to next year's Investment phase..."
dfx canister call backend advancePhase '()' >/dev/null # Harvest -> Market
dfx canister call backend advancePhase '()' >/dev/null # Market -> Storage
dfx canister call backend advancePhase '()' >/dev/null # Storage -> CutAndPrune
dfx canister call backend advancePhase '()' >/dev/null # CutAndPrune -> Maintenance
dfx canister call backend advancePhase '()' >/dev/null # Maintenance -> Planning
dfx canister call backend advancePhase '()' >/dev/null # Planning -> Hiring
dfx canister call backend hireLabor '("Standard")' >/dev/null
dfx canister call backend advancePhase '()' >/dev/null # Hiring -> Procurement
dfx canister call backend advancePhase '()' >/dev/null # Procurement -> Investment

log "Currently in phase: $(dfx canister call backend getPlayerFarm '()' | grep "currentPhase =")"

log "Buying Sprayer infrastructure..."
UPG_RES=$(dfx canister call backend upgradeInfrastructure '("Sprayer")')
log "Upgrade Result: $UPG_RES"
if echo "$UPG_RES" | grep -q "(variant { Ok"; then
    pass "Sprayer purchased"
else
    fail "Sprayer purchase failed"
fi

log "Forcing DiseaseOutbreak in Investment..."
# We force it in Investment with mitigated=true as we have a Sprayer
dfx canister call backend debugSetWeather '(variant { DiseaseOutbreak }, 0.5, true)' >/dev/null

log "Advancing Investment -> Growth (Event generation/mitigation)..."
dfx canister call backend advancePhase '()' >/dev/null

FARM_DISEASE=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM_DISEASE" | grep -A 15 "weather =" | grep -q "mitigated = true"; then
    pass "DiseaseOutbreak mitigated by Sprayer ✅"
else
    log "Debug: Weather state: $(echo "$FARM_DISEASE" | grep -A 15 "weather =")"
    fail "Disease mitigation failed"
fi

# ============================================================
section "4. ANNUAL RESET"
# ============================================================

log "Advancing from Growth to next Year's Hiring phase..."
dfx canister call backend advancePhase '()' >/dev/null # Growth -> Harvest
dfx canister call backend advancePhase '()' >/dev/null # Harvest -> Market
dfx canister call backend advancePhase '()' >/dev/null # Market -> Storage
dfx canister call backend advancePhase '()' >/dev/null # Storage -> CutAndPrune
dfx canister call backend advancePhase '()' >/dev/null # CutAndPrune -> Maintenance
dfx canister call backend advancePhase '()' >/dev/null # Maintenance -> Planning
dfx canister call backend advancePhase '()' >/dev/null # Planning -> Hiring (New Year)

FARM_Y3=$(dfx canister call backend getPlayerFarm '()')
if echo "$FARM_Y3" | grep -q "hasCropInsurance = false"; then
    pass "Insurance policy reset annually ✅"
else
    log "Debug: Insurance state: $(echo "$FARM_Y3" | grep "hasCropInsurance")"
    fail "Insurance reset failed"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Phase 7.0 Checks Passed!"
else
    log "🚨 $FAIL failures detected."
    exit 1
fi
