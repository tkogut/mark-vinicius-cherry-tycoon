#!/bin/bash
set -e

dfx identity new --disable-encryption tester_sell_5 || true
dfx identity use tester_sell_5

echo "=== INITIALIZING ==="
dfx canister call backend initializePlayer '("tester_sell_5", "TesterSell5")' > /dev/null 2>&1 || true

echo "=== HIRING ==="
dfx canister call backend hireLabor '("Standard")'

echo "=== ADVANCING TO PROCUREMENT ==="
dfx canister call backend advancePhase > /dev/null

echo "=== ADVANCING TO INVESTMENT ==="
dfx canister call backend advancePhase > /dev/null

echo "=== ADVANCING TO GROWTH ==="
dfx canister call backend advancePhase > /dev/null

echo "=== WATERING ==="
dfx canister call backend waterParcel '("parcel_starter_tester_sell_5")'

echo "=== ADVANCING TO HARVEST ==="
dfx canister call backend advancePhase > /dev/null

echo "=== HARVESTING ==="
dfx canister call backend harvestCherries '("parcel_starter_tester_sell_5")'

echo "=== ADVANCING TO MARKET ==="
dfx canister call backend advancePhase > /dev/null

echo "=== GETTING INVENTORY ==="
FARM=$(dfx canister call backend getPlayerFarm)
echo "$FARM" | grep -A 5 "inventory"
echo "$FARM" | grep "cash"

echo "=== SELLING 1000 CHERRIES RETAIL ==="
dfx canister call backend sellCherries '(1000, "retail")'

echo "=== SELLING 1000 CHERRIES WHOLESALE ==="
dfx canister call backend sellCherries '(1000, "wholesale")'

echo "=== GETTING FINAL FARM STATE ==="
FARM2=$(dfx canister call backend getPlayerFarm)
echo "$FARM2" | grep -A 5 "inventory"
echo "$FARM2" | grep "cash"

dfx identity use default
