#!/bin/bash
echo "Comprehensive Phase & Season Logic Test"

# Clean start
dfx canister call backend initializePlayer '("tester", "TestPlayer")' > /dev/null 2>&1

# Function to test all actions in the current phase
test_actions() {
  phase=$1
  season=$2
  echo "================================================="
  echo "TESTING ACTIONS IN PHASE: $phase ($season)"
  echo "================================================="
  
  echo "[plantTrees] (Expect OK in Investment, REJECT otherwise)"
  dfx canister call backend plantTrees '("parcel_1", 10)'
  
  echo "[waterParcel] (Expect OK in Growth, REJECT otherwise)"
  dfx canister call backend waterParcel '("parcel_1")'
  
  echo "[fertilizeParcel] (Expect OK in Spring/Autumn, REJECT in Summer/Winter)"
  dfx canister call backend fertilizeParcel '("parcel_1", "basic")'
  
  echo "[harvestCherries] (Expect OK in Harvest, REJECT otherwise)"
  dfx canister call backend harvestCherries '("parcel_1")'
  
  echo "[sellCherries] (Expect Insufficient Inventory OK in ANY phase)"
  dfx canister call backend sellCherries '(10, "retail")'
  
  echo "[cutAndPrune] (Expect OK in CutAndPrune, REJECT otherwise)"
  dfx canister call backend cutAndPrune '("parcel_1")'
  
  echo "[startOrganicConversion] (Expect OK in Planning/Investment, REJECT otherwise)"
  dfx canister call backend startOrganicConversion '("parcel_1")'
  
  echo ""
}

# Spring
test_actions "Hiring" "Spring"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Procurement" "Spring"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Investment" "Spring"
dfx canister call backend advancePhase > /dev/null 2>&1

# Summer
test_actions "Growth" "Summer"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Harvest" "Summer"
dfx canister call backend advancePhase > /dev/null 2>&1

# Autumn
test_actions "Market" "Autumn"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Storage" "Autumn"
dfx canister call backend advancePhase > /dev/null 2>&1

# Winter
test_actions "CutAndPrune" "Winter"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Maintenance" "Winter"
dfx canister call backend advancePhase > /dev/null 2>&1

test_actions "Planning" "Winter"
dfx canister call backend advancePhase > /dev/null 2>&1

# Year 2 Spring
test_actions "Hiring (Year 2)" "Spring"

echo "DONE"
