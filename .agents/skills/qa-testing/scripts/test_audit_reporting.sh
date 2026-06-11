#!/bin/bash
# ============================================================
# ECONOMIC REPORTING FIX VERIFICATION SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# ============================================================

set -e

LOG=".tmp/qa_audit_reporting.log"
PASS=0
FAIL=0

mkdir -p .tmp
rm -f "$LOG"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }
pass() { log "✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { log "❌ FAIL: $1"; FAIL=$((FAIL+1)); }

log "Economic Reporting Fix QA Verification — $(date)"

# 1. Setup
log "Resetting player..."
dfx canister call backend debugResetPlayer '()' >/dev/null 2>&1 || true
log "Initializing player (5ha starter)..."
dfx canister call backend initializePlayer '("qa_audit", "QATester")' >/dev/null

# 2. Advance through Year 1 (4 Seasons)
# Each transition should now add (AnnualCost / 4) to the report.
# Total Annual Labor for 5ha standard: 5 * 8000 * 1.0 (efficiency) = 40,000 PLN
# Per season: 10,000 PLN labor.

log "Advancing through a full year to generate Yearly Report..."

# Helper to advance 1 phase
advance() { dfx canister call backend advancePhase '()' >/dev/null; }

# Spring (4 phases)
for i in {1..4}; do advance; done
log "Spring completed (advanced to Summer)."

# Summer (3 phases - Harvest done)
# Let's harvest to add some volume to the report
FARM=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM" | grep -o 'id = "[^"]*"' | head -n 1 | cut -d'"' -f2)
log "Harvesting parcel $PARCEL_ID..."
dfx canister call backend harvestCherries "(\"$PARCEL_ID\")" >/dev/null
for i in {1..2}; do advance; done
log "Summer completed (advanced to Autumn)."

# Autumn (2 phases)
for i in {1..2}; do advance; done
log "Autumn completed (advanced to Winter)."

# Winter (3 phases -> Spring transition triggers Yearly Report)
for i in {1..3}; do advance; done
log "Year 1 completed. Triggering Spring transition..."
advance

# 3. Verify Yearly Report Math
log "Fetching final farm state..."
REPORT=$(dfx canister call backend getPlayerFarm '()')

# Extract Labor Cost from the first Yearly Report
# Yearly reports are stored in a list: yearlyReports = Array [ record { laborCost = 40_000 : nat; ... } ]
YEARLY_LABOR=$(echo "$REPORT" | grep -A 25 "yearlyReports =" | grep "laborCost =" | head -n 1 | grep -o "[0-9_]*" | head -n 1 | tr -d '_')

log "Yearly Labor Cost in Report: $YEARLY_LABOR PLN"

# Calculation check: 5 hectares * 8000 PLN/ha = 40,000 PLN expected.
# Formula was adding 40,000 per season (TOTAL 160,000). Now it should be 40,000 total.

if [ "$YEARLY_LABOR" -eq 40000 ]; then
    pass "Yearly Labor Cost is 40,000 PLN (Baseline Verified)"
elif [ "$YEARLY_LABOR" -eq 160000 ]; then
    fail "BUG DETECTED: Yearly Labor Cost is still 160,000 PLN (4x Overcharge)"
else
    fail "Unexpected Labor Cost: $YEARLY_LABOR PLN (Expected 40,000)"
fi

# Verify Net P&L logic
REVENUE=$(echo "$REPORT" | grep -A 20 "yearlyReports =" | grep "totalRevenue =" | head -n 1 | grep -o "[0-9_]*" | head -n 1 | tr -d '_')
COSTS=$(echo "$REPORT" | grep -A 20 "yearlyReports =" | grep "totalCosts =" | head -n 1 | grep -o "[0-9_]*" | head -n 1 | tr -d '_')
PROFIT=$(echo "$REPORT" | grep -A 20 "yearlyReports =" | grep "netProfit =" | head -n 1 | cut -d'=' -f2 | tr -d ' ;_')

log "Yearly Revenue: $REVENUE"
log "Yearly Costs: $COSTS"
log "Yearly Net Profit: $PROFIT"

EXPECTED_PROFIT=$(($REVENUE - $COSTS))
if [ "$PROFIT" -eq "$EXPECTED_PROFIT" ]; then
    pass "Net Profit calculation in report is consistent with Revenue - Costs"
else
    fail "Profit inconsistency: Expected $EXPECTED_PROFIT, got $PROFIT"
fi

echo "" | tee -a "$LOG"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Results: ✅ $PASS PASSED | ❌ $FAIL FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -eq 0 ]; then
    log "🎉 Economic Reporting Fix Verified!"
else
    exit 1
fi
