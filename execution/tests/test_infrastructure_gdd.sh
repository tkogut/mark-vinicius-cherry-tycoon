#!/bin/bash

# Mark Vinicius Cherry Tycoon - Infrastructure GDD Verification
# Tests: Purchasing, Spoilage Logic, and Cost Reductions

echo "🏭 Starting Infrastructure GDD Verification..."
echo "=============================================="

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

check_inventory() {
    # Extract "cherries = X" from response
    local RESP=$1
    local EXPECTED_MIN=$2
    local MSG=$3
    
    # Grep cherries count
    # Output format: { cherries = 123; ... }
    # We clean it up
    local CHERRIES=$(echo "$RESP" | grep -o 'cherries = [0-9_]*' | cut -d'=' -f2 | tr -d ' _')
    
    if [ -z "$CHERRIES" ]; then
        echo "❌ FAILED: Could not read inventory (Response: $RESP)"
        exit 1
    fi
    
    echo "   -> Current Cherries: $CHERRIES (Expected > $EXPECTED_MIN)"
    
    if [ "$CHERRIES" -gt "$EXPECTED_MIN" ]; then
        echo "✅ SUCCESS: $MSG"
    else
        echo "❌ FAILED: $MSG (Found $CHERRIES, expected > $EXPECTED_MIN)"
        exit 1
    fi
}

check_zeros() {
    local RESP=$1
    local MSG=$2
    local CHERRIES=$(echo "$RESP" | grep -o 'cherries = [0-9_]*' | cut -d'=' -f2 | tr -d ' _')
    if [ "$CHERRIES" -eq "0" ]; then
        echo "✅ SUCCESS: $MSG (Inventory is 0 as expected)"
    else
        echo "❌ FAILED: $MSG (Found $CHERRIES, expected 0)"
        exit 1
    fi
}

# 0. Reset
echo "Test 0: Reset Player"
dfx canister call backend debugResetPlayer '()'

# 1. Init
echo "Test 1: Initialize"
check_ok "$(dfx canister call backend initializePlayer '("infra_tester", "Infra Tester")')" "Initialize"

# 2. Get Parcel ID
FARM=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)

# --- CYCLE 1: No Infrastructure (Testing Spoilage) ---

# 3. Advance to Summer
echo "Test 3: Advance to Summer (Cycle 1)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Spring->Summer"

# 4. Harvest
echo "Test 4: Harvest (Cycle 1)"
check_ok "$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")" "Harvest"

# Check we have cherries
INV=$(dfx canister call backend getInventory '()')
check_inventory "$INV" 100 "Harvested Cherries"

# 5. Advance to Autumn
echo "Test 5: Advance to Autumn (Cycle 1)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Summer->Autumn"

# 6. Advance to Winter (Should trigger SPOILAGE)
echo "Test 6: Advance to Winter (Trigger Spoilage)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Autumn->Winter"

# 7. Verify Spoilage (Should be 0)
echo "Test 7: Verify Spoilage (No Infra)"
INV=$(dfx canister call backend getInventory '()')
check_zeros "$INV" "Inventory Rot Check"


# --- CYCLE 2: With Warehouse (Testing Preservation) ---

echo "--- Starting Cycle 2 ---"

# 8. Advance to Spring (Year 2)
# Winter->Spring
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Winter->Spring"

# 9. Advance to Summer
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Spring->Summer"

# 10. Harvest
echo "Test 10: Harvest (Cycle 2)"
check_ok "$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")" "Harvest"
INV=$(dfx canister call backend getInventory '()')
check_inventory "$INV" 1000 "Harvested Cycle 2"

# 11. Advance to Autumn
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Summer->Autumn"

# 12. Sell to buy Warehouse
# Yield is now ~25,000kg/ha * 0.5ha * 0.66 (Year 2) = ~8,250kg.
# Sell 6,000kg. Retain ~2,000kg.
# 6000 * 6 = 36,000 PLN. (Warehouse = 25,000)
echo "Test 12: Sell Cherries for Cash"
check_ok "$(dfx canister call backend sellCherries '(6000, "wholesale")')" "Sell 6000kg"

# 13. Buy Warehouse
echo "Test 13: Buy Warehouse (25k)"
check_ok "$(dfx canister call backend upgradeInfrastructure '("Warehouse")')" "Buy Warehouse"

# 14. Advance to Winter (Should trigger Spoilage - BUT RETAIN 80%)
echo "Test 14: Advance to Winter (With Warehouse)"
check_ok "$(dfx canister call backend advanceSeason '(null)')" "Advance Autumn->Winter"

# 15. Verify Preservation
# We had ~200kg remaining (Harvest - 1800).
# Spoilage 20% -> Retain 80% = ~160kg.
echo "Test 15: Verify Preservation"
INV=$(dfx canister call backend getInventory '()')
check_inventory "$INV" 10 "Inventory Preservation Check"

echo "=============================================="
echo "✅ Infrastructure GDD Verification Passed!"
