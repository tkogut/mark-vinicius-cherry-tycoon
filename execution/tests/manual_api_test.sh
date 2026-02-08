#!/bin/bash

# Mark Vinicius Cherry Tycoon - Manual API Test
# Comprehensive test of all public backend functions

echo "🍒 Manual API Testing Suite"
echo "=================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_function() {
    local name=$1
    local cmd=$2
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Command: $cmd"
    eval "$cmd"
    echo ""
}

echo "=== ADMIN FUNCTIONS ==="
echo ""

test_function "Get Total Players" \
    "dfx canister call backend getTotalPlayers '()'"

test_function "Get Global Season" \
    "dfx canister call backend getGlobalSeason '()'"

echo "=== PLAYER INITIALIZATION ==="
echo ""

test_function "Debug Reset Player (Fresh State)" \
    "dfx canister call backend debugResetPlayer '()'"

test_function "Initialize Player" \
    "dfx canister call backend initializePlayer '(\"test_player\", \"Test Farmer\")'"

test_function "Initialize Player Again (Should Fail)" \
    "dfx canister call backend initializePlayer '(\"test_player\", \"Test Farmer\")'"

echo "=== PLAYER DATA QUERIES ==="
echo ""

test_function "Get Player Farm" \
    "dfx canister call backend getPlayerFarm '()'"

test_function "Get Player Stats" \
    "dfx canister call backend getPlayerStats '()'"

test_function "Get Cash Balance" \
    "dfx canister call backend getCashBalance '()'"

test_function "Get Inventory" \
    "dfx canister call backend getInventory '()'"

test_function "Get Farm Overview (NEW)" \
    "dfx canister call backend getFarmOverview '()'"

echo "=== MARKET DATA (NEW) ==="
echo ""

test_function "Get Market Prices" \
    "dfx canister call backend getMarketPrices '()'"

echo "=== PARCEL OPERATIONS ==="
echo ""

# Get the starter parcel ID first
echo -e "${YELLOW}Extracting Starter Parcel ID...${NC}"
FARM_RESP=$(dfx canister call backend getPlayerFarm '()')
PARCEL_ID=$(echo "$FARM_RESP" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)
echo "Found Parcel ID: $PARCEL_ID"
echo ""

test_function "Harvest Cherries" \
    "dfx canister call backend harvestCherries '(\"$PARCEL_ID\")'"

test_function "Harvest Again (Should Fail - Seasonal Restriction)" \
    "dfx canister call backend harvestCherries '(\"$PARCEL_ID\")'"

test_function "Water Parcel" \
    "dfx canister call backend waterParcel '(\"$PARCEL_ID\")'"

test_function "Fertilize Parcel" \
    "dfx canister call backend fertilizeParcel '(\"$PARCEL_ID\", \"organic\")'"

test_function "Plant Trees (10 trees)" \
    "dfx canister call backend plantTrees '(\"$PARCEL_ID\", 10)'"

test_function "Start Organic Conversion" \
    "dfx canister call backend startOrganicConversion '(\"$PARCEL_ID\")'"

echo "=== ECONOMIC OPERATIONS ==="
echo ""

test_function "Sell Cherries (Retail)" \
    "dfx canister call backend sellCherries '(100, \"retail\")'"

test_function "Sell Cherries (Wholesale)" \
    "dfx canister call backend sellCherries '(50, \"wholesale\")'"

echo "=== PARCEL PURCHASE ==="
echo ""

test_function "Purchase New Parcel (0.5 ha in Pomorskie)" \
    "dfx canister call backend purchaseParcel '(variant { Pomorskie }, 0.5)'"

test_function "Buy Parcel (Alternative Method)" \
    "dfx canister call backend buyParcel '(\"parcel_test_123\", 30000)'"

echo "=== INFRASTRUCTURE ==="
echo ""

test_function "Upgrade Infrastructure (Tractor)" \
    "dfx canister call backend upgradeInfrastructure '(\"Tractor\")'"

test_function "Upgrade Infrastructure (ColdStorage)" \
    "dfx canister call backend upgradeInfrastructure '(\"ColdStorage\")'"

echo "=== GAME PROGRESSION ==="
echo ""

test_function "Advance Season (to Summer)" \
    "dfx canister call backend advanceSeason '(null)'"

test_function "Get Updated Farm State" \
    "dfx canister call backend getPlayerFarm '()'"

echo "=== AUTHORIZATION TESTS ==="
echo ""

test_function "Get Caller User Role" \
    "dfx canister call backend getCallerUserRole '()'"

test_function "Is Caller Admin" \
    "dfx canister call backend isCallerAdmin '()'"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Manual API Test Complete${NC}"
echo "Review the output above to verify all functions work correctly."
echo ""
