#!/bin/bash

# Test Seasonal Harvest Restriction
# Verify that cherries can only be harvested in Summer

echo "🍒 Testing Seasonal Harvest Restriction"
echo "========================================"
echo ""

# Reset and initialize
echo "Step 1: Reset and Initialize Player"
dfx canister call backend debugResetPlayer '()'
dfx canister call backend initializePlayer '("test_season", "Season Tester")'
echo ""

# Get parcel ID
echo "Step 2: Get Parcel ID"
FARM_RESP=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM_RESP" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)
echo "Parcel ID: $PARCEL_ID"
echo ""

# Test 1: Try to harvest in Spring (should FAIL)
echo "Test 1: Try to Harvest in Spring (Initial Season)"
echo "Expected: SeasonalRestriction error"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"SeasonalRestriction"* ]] && [[ "$RESP" == *"Summer"* ]]; then
    echo "✅ PASS: Correctly blocked harvest in Spring"
else
    echo "❌ FAIL: Should have blocked harvest in Spring"
    echo "Response: $RESP"
fi
echo ""

# Test 2: Advance to Summer and harvest (should SUCCEED)
echo "Test 2: Advance to Summer"
dfx canister call backend advanceSeason '(null)'
echo ""

echo "Test 3: Try to Harvest in Summer"
echo "Expected: Success"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"Ok"* ]]; then
    echo "✅ PASS: Successfully harvested in Summer"
else
    echo "❌ FAIL: Should have allowed harvest in Summer"
    echo "Response: $RESP"
fi
echo ""

# Test 3: Advance to Autumn and try to harvest (should FAIL)
echo "Test 4: Advance to Autumn"
dfx canister call backend advanceSeason '(null)'
echo ""

echo "Test 5: Try to Harvest in Autumn"
echo "Expected: SeasonalRestriction error"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"SeasonalRestriction"* ]] && [[ "$RESP" == *"Summer"* ]]; then
    echo "✅ PASS: Correctly blocked harvest in Autumn"
else
    echo "❌ FAIL: Should have blocked harvest in Autumn"
    echo "Response: $RESP"
fi
echo ""

# Test 4: Advance to Winter and try to harvest (should FAIL)
echo "Test 6: Advance to Winter"
dfx canister call backend advanceSeason '(null)'
echo ""

echo "Test 7: Try to Harvest in Winter"
echo "Expected: SeasonalRestriction error"
RESP=$(dfx canister call backend harvestCherries "(\"$PARCEL_ID\")")
if [[ "$RESP" == *"SeasonalRestriction"* ]] && [[ "$RESP" == *"Summer"* ]]; then
    echo "✅ PASS: Correctly blocked harvest in Winter"
else
    echo "❌ FAIL: Should have blocked harvest in Winter"
    echo "Response: $RESP"
fi
echo ""

echo "========================================"
echo "✅ Seasonal Restriction Test Complete"
