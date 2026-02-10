#!/bin/bash

# Mark Vinicius Cherry Tycoon - Organic Workflow Verification
# Tests: Start Conversion, 2-Season Waiting Period, Certification, Price Bonus

echo "🌿 Starting Organic Workflow Verification..."
echo "============================================="

# Enable logging to file
mkdir -p .tmp
LOG_FILE=".tmp/backend.log"
exec > >(tee -a "$LOG_FILE") 2>&1

check_ok() {
    if [[ "$1" == *"Ok"* ]]; then
        echo "✅ SUCCESS: $2"
    else
        echo "❌ FAILED: $2"
        echo "Response: $1"
        exit 1
    fi
}

check_bool() {
    local RESP=$1
    local FIELD=$2
    local EXPECTED=$3
    local MSG=$4
    
    local ACTUAL=$(echo "$RESP" | grep -o "$FIELD = \(true\|false\)" | cut -d'=' -f2 | tr -d ' ;')
    
    if [ "$ACTUAL" == "$EXPECTED" ]; then
        echo "   -> $FIELD is $ACTUAL (Correct)"
        echo "✅ SUCCESS: $MSG"
    else
        echo "   -> $FIELD is $ACTUAL (Expected $EXPECTED)"
        echo "❌ FAILED: $MSG"
        exit 1
    fi
}

# 0. Reset
echo "Test 0: Reset Player"
dfx canister call backend debugResetPlayer '()'

# 1. Init
echo "Test 1: Initialize"
check_ok "$(dfx canister call backend initializePlayer '("organic_tester", "Organic Tester")')" "Initialize"

# 2. Get Parcel ID
FARM=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)

# 3. Start Organic Conversion
echo "Test 3: Start Organic Conversion"
check_ok "$(dfx canister call backend startOrganicConversion "(\"$PARCEL_ID\")")" "Start Conversion"

# Verify Initial State
FARM=$(dfx canister call backend getPlayerFarm '()')
check_bool "$FARM" "isOrganic" "true" "Initial isOrganic Check"
check_bool "$FARM" "organicCertified" "false" "Initial Certified Check (should be false)"

# 4. Advance 1 Season (Spring -> Summer)
echo "Test 4: Advance to Summer (1 Season Passed)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance 1"
FARM=$(dfx canister call backend getPlayerFarm '()')
check_bool "$FARM" "organicCertified" "false" "Certified Check after 1 season (should still be false)"

# 5. Advance 1 Season (Summer -> Autumn)
echo "Test 5: Advance to Autumn (2 Seasons Passed)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance 2"
FARM=$(dfx canister call backend getPlayerFarm '()')
check_bool "$FARM" "organicCertified" "true" "Certified Check after 2 seasons (should be TRUE)"

# 6. Harvest and Sell (Retail) to verify bonus
echo "Test 6: Harvest & Retail Sale with Organic Bonus"
# Note: Harvest only in Summer, so we missed Summer. Let's go through the cycle.
# Autumn -> Winter -> Spring -> Summer (Harvest year 2)
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance to Winter"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance to Spring"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance to Summer"

HARVEST_RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
check_ok "$HARVEST_RESP" "Harvest"
echo "   -> Harvest result: $HARVEST_RESP"

# Sell 100kg retail and wholesale to compare? 
# Base Retail = 15. Base Wholesale = 10.
# Organic Retail Bonus = quality_bonus * 1.4 premium.
REVENUE=$(dfx canister call backend sellCherries '(100, "retail")')
check_ok "$REVENUE" "Sell Organic Retail"
echo "   -> Retail Revenue for 100kg: $REVENUE"

# If 100kg retail > 1500 (15 * 100 * 1.0), then organic bonus (1.4) is working.
# (Wait, saturation might affect it too, but on fresh player it's 1.0)
VAL=$(echo "$REVENUE" | grep -o 'Ok = [0-9_]*' | cut -d'=' -f2 | tr -d ' _')
if [ "$VAL" -gt 1500 ]; then
    echo "✅ SUCCESS: Organic Price Bonus Verified ($VAL > 1500)"
else
    echo "❌ FAILED: Organic Price Bonus Not Detected ($VAL <= 1500)"
    exit 1
fi

echo "============================================="
echo "✅ Organic Workflow Verification Passed!"
