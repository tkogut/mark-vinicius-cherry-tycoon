#!/bin/bash

# Test getPlayerFarm() to investigate JSON-RPC serialization error
# This will help identify BigInt or variant type issues

echo "🔍 Testing getPlayerFarm() Serialization"
echo "========================================"
echo ""

# First, ensure we have a player initialized
echo "Step 1: Reset and Initialize Player"
dfx canister call backend debugResetPlayer '()'
dfx canister call backend initializePlayer '("test_debug", "Debug Farmer")'
echo ""

# Test getPlayerFarm
echo "Step 2: Call getPlayerFarm()"
echo "Command: dfx canister call backend getPlayerFarm '()'"
echo ""
FARM_DATA=$(dfx canister call backend getPlayerFarm '()')
echo "$FARM_DATA"
echo ""

# Test getFarmOverview (the new lightweight version)
echo "Step 3: Call getFarmOverview() (New API)"
echo "Command: dfx canister call backend getFarmOverview '()'"
echo ""
OVERVIEW_DATA=$(dfx canister call backend getFarmOverview '()')
echo "$OVERVIEW_DATA"
echo ""

echo "========================================"
echo "Analysis:"
echo "- Check for any BigInt values (should be 'nat' in Candid)"
echo "- Check variant types (Season, GameError, etc.)"
echo "- Verify all fields are properly serialized"
