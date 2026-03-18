#!/bin/bash
# =============================================================================
# SECURITY AUDIT TEST SCRIPT
# Mark Vinicius Cherry Tycoon — JaPiTo Group
# Tests: Principal Auth, Balance Drain, Cycle Exhaust, State Persistence
# =============================================================================

set -e

CANISTER="backend"
LOG_FILE=".tmp/security.log"

echo "========================================" | tee $LOG_FILE
echo "🔐 SECURITY AUDIT TEST SUITE" | tee -a $LOG_FILE
echo "Date: $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# -----------------------------------------------
# TEST 1: Unauthorized Principal Access
# Try to harvest from a parcel owned by another player
# Expected: Error (NotOwner or Unauthorized)
# -----------------------------------------------
echo "" | tee -a $LOG_FILE
echo "--- TEST 1: Unauthorized Principal Access ---" | tee -a $LOG_FILE

# Create a test identity (attacker)
dfx identity new test_attacker --storage-mode plaintext 2>/dev/null || true
dfx identity use test_attacker

# Try to harvest (should fail with unauthorized/not owner)
RESULT=$(dfx canister call $CANISTER harvestCherries '("parcel_0")' 2>&1 || true)
echo "Result: $RESULT" | tee -a $LOG_FILE

if echo "$RESULT" | grep -qi "err\|unauthorized\|not.*owner\|not.*found"; then
    echo "✅ TEST 1 PASSED: Unauthorized access correctly rejected" | tee -a $LOG_FILE
else
    echo "🔴 TEST 1 FAILED: Unauthorized access was NOT rejected — CRITICAL" | tee -a $LOG_FILE
fi

# Switch back to default identity
dfx identity use default

# -----------------------------------------------
# TEST 2: Balance Drain Attack
# Try to buy a parcel with insufficient funds
# Expected: Error (InsufficientFunds) with no state mutation
# -----------------------------------------------
echo "" | tee -a $LOG_FILE
echo "--- TEST 2: Balance Drain Attack ---" | tee -a $LOG_FILE

# Get current balance
BALANCE_BEFORE=$(dfx canister call $CANISTER getCashBalance '()' 2>&1)
echo "Balance Before: $BALANCE_BEFORE" | tee -a $LOG_FILE

# Try to buy an expensive parcel (should fail)
RESULT=$(dfx canister call $CANISTER buyParcel '("expensive_parcel", 999_999_999)' 2>&1 || true)
echo "Buy Result: $RESULT" | tee -a $LOG_FILE

# Check balance unchanged
BALANCE_AFTER=$(dfx canister call $CANISTER getCashBalance '()' 2>&1)
echo "Balance After: $BALANCE_AFTER" | tee -a $LOG_FILE

if [ "$BALANCE_BEFORE" = "$BALANCE_AFTER" ]; then
    echo "✅ TEST 2 PASSED: Balance unchanged after failed purchase" | tee -a $LOG_FILE
else
    echo "🔴 TEST 2 FAILED: Balance changed after failed purchase — CRITICAL" | tee -a $LOG_FILE
fi

# -----------------------------------------------
# TEST 3: Cycle Exhaustion Simulation
# Call advanceSeason and verify canister stays responsive
# -----------------------------------------------
echo "" | tee -a $LOG_FILE
echo "--- TEST 3: Cycle Exhaustion Simulation ---" | tee -a $LOG_FILE

RESULT=$(dfx canister call $CANISTER advanceSeason '()' 2>&1 || true)
echo "advanceSeason Result: $RESULT" | tee -a $LOG_FILE

# Verify canister is still responsive
HEALTH_CHECK=$(dfx canister call $CANISTER getPlayerFarm '()' 2>&1 || true)
if echo "$HEALTH_CHECK" | grep -qi "ok\|record\|variant"; then
    echo "✅ TEST 3 PASSED: Canister responsive after heavy computation" | tee -a $LOG_FILE
else
    echo "🟠 TEST 3 WARNING: Canister may be unresponsive after advanceSeason" | tee -a $LOG_FILE
fi

# -----------------------------------------------
# TEST 4: State Persistence Under Upgrade
# Deploy -> Verify state -> Upgrade -> Verify state persists
# -----------------------------------------------
echo "" | tee -a $LOG_FILE
echo "--- TEST 4: State Persistence Under Upgrade ---" | tee -a $LOG_FILE

# Get state snapshot before upgrade
STATE_BEFORE=$(dfx canister call $CANISTER getPlayerFarm '()' 2>&1 || true)
echo "State Before Upgrade: (captured)" | tee -a $LOG_FILE

# Upgrade canister
UPGRADE_RESULT=$(dfx deploy $CANISTER --upgrade-unchanged 2>&1 || true)
echo "Upgrade Result: $UPGRADE_RESULT" | tee -a $LOG_FILE

# Get state after upgrade
STATE_AFTER=$(dfx canister call $CANISTER getPlayerFarm '()' 2>&1 || true)
echo "State After Upgrade: (captured)" | tee -a $LOG_FILE

if [ "$STATE_BEFORE" = "$STATE_AFTER" ]; then
    echo "✅ TEST 4 PASSED: State persisted through upgrade" | tee -a $LOG_FILE
else
    echo "🔴 TEST 4 FAILED: State lost during upgrade — CRITICAL" | tee -a $LOG_FILE
fi

# -----------------------------------------------
# SUMMARY
# -----------------------------------------------
echo "" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE
echo "🔐 SECURITY AUDIT COMPLETE" | tee -a $LOG_FILE
echo "See full log: $LOG_FILE" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# Cleanup test identity
dfx identity use default
dfx identity remove test_attacker 2>/dev/null || true
