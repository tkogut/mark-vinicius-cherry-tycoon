#!/bin/bash

# Mark Vinicius Cherry Tycoon - E2E Backend Tests
# This script performs a full walkthrough of the game's core logic.

echo "🍒 Starting E2E Backend Tests..."
echo "=============================="

# Helper to check if a command succeeded and contains "Ok"
check_ok() {
    if [[ "$1" == *"Ok"* ]]; then
        echo "✅ SUCCESS: $2"
    else
        echo "❌ FAILED: $2"
        echo "Response: $1"
        exit 1
    fi
}

# 1. Initialize Player
echo "Test 1: Initialize Player"
# Use a random player ID to ensure fresh state if possible, or just ignore "already initialized"
RESP=$(dfx canister call backend initializePlayer '("player_e2e", "E2E Farmer")')
if [[ "$RESP" == *"AlreadyExists"* ]]; then
    echo "⚠️  Player already initialized, continuing with existing state."
else
    check_ok "$RESP" "Initialize Player"
fi

# 2. Get Player Farm to find starter parcel ID
echo "Test 2: Retrieving Starter Parcel ID"
FARM_RESP=$(dfx canister call backend getPlayerFarm '()')
# Extract parcel ID using a simple grep/sed (since it's Candid format)
PARCEL_ID=$(echo "$FARM_RESP" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)

if [ -z "$PARCEL_ID" ]; then
    echo "❌ FAILED: Could not retrieve parcel ID"
    exit 1
fi
echo "✅ Found Parcel ID: $PARCEL_ID"

# 3. Harvest Starter Parcel
echo "Test 3: Harvest Starter Parcel"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"SeasonalRestriction"* ]]; then
    echo "✅ SUCCESS: Parcel already harvested (skipping to next step)"
else
    check_ok "$RESP" "Harvest Starter Parcel"
fi

# 4. Try to harvest again (should fail)
echo "Test 4: Harvest Again (expected to fail)"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"SeasonalRestriction"* ]]; then
    echo "✅ SUCCESS: Harvest Again failed as expected"
else
    echo "❌ FAILED: Harvest Again should have failed"
    echo "Response: $RESP"
    exit 1
fi

# 5. Advance Season
echo "Test 5: Advance to Summer"
RESP=$(dfx canister call backend advanceSeason '(null)')
check_ok "$RESP" "Advance Season"

# 6. Water Parcel
echo "Test 6: Water Parcel"
RESP=$(dfx canister call backend waterParcel "(\"$PARCEL_ID\")")
check_ok "$RESP" "Water Parcel"

# 7. Plant Trees
echo "Test 7: Plant 10 Trees"
RESP=$(dfx canister call backend plantTrees "(\"$PARCEL_ID\", 10)")
check_ok "$RESP" "Plant Trees"

# 8. Purchase New Parcel
echo "Test 8: Purchase New Parcel (0.2 ha in Pomorskie)"
RESP=$(dfx canister call backend purchaseParcel '(variant { Pomorskie }, 0.2)')
check_ok "$RESP" "Purchase New Parcel"
NEW_PARCEL_ID=$(echo "$RESP" | grep -o 'Ok = "[^"]*"' | cut -d'"' -f2)

# 9. Organic Conversion
echo "Test 9: Start Organic Conversion"
RESP=$(dfx canister call backend startOrganicConversion "(\"$PARCEL_ID\")")
check_ok "$RESP" "Start Organic Conversion"

# 10. Sell Cherries
echo "Test 10: Sell Cherries (Retail)"
# Ensure we have cherries (harvest in test 3 should have added some)
RESP=$(dfx canister call backend sellCherries '(100, "retail")')
check_ok "$RESP" "Sell Cherries"

# 11. Final Stats
echo "Test 11: Get Player Stats"
RESP=$(dfx canister call backend getPlayerStats '()')
check_ok "$RESP" "Get Player Stats"

echo "=============================="
echo "✅ All E2E tests finished successfully!"
