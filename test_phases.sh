#!/bin/bash
echo "Starting 10-phase sequence test"
dfx deploy backend

dfx canister call backend initializePlayer '("user_1", "PhaseTester")'

echo "--- Current Phase (Should be Hiring) ---"
dfx canister call backend getFarmOverview

echo "--- Trying to plant in Hiring (expect REJECT) ---"
dfx canister call backend plantTrees '("parcel_1", 10)'

echo "--- Advance Phase from Hiring to Procurement ---"
dfx canister call backend advancePhase

echo "--- Advance Phase from Procurement to Investment ---"
dfx canister call backend advancePhase

echo "--- Trying to plant in Investment (expect insufficient funds/OK) ---"
dfx canister call backend plantTrees '("parcel_1", 10)'

echo "--- Advance Phase from Investment to Growth ---"
dfx canister call backend advancePhase

echo "--- Trying to water in Growth (expect OK) ---"
dfx canister call backend waterParcel '("parcel_1")'

echo "--- Advance Phase from Growth to Harvest ---"
dfx canister call backend advancePhase

echo "--- Trying to harvest in Harvest (expect OK/Season restriction) ---"
dfx canister call backend harvestCherries '("parcel_1")'

echo "--- Advance Phase from Harvest to Market ---"
dfx canister call backend advancePhase

echo "--- Trying to sell in Market (expect OK/Inv err) ---"
dfx canister call backend sellCherries '(10)'

echo "--- Advance Phase from Market to Storage ---"
dfx canister call backend advancePhase

echo "--- Advance Phase from Storage to CutAndPrune ---"
dfx canister call backend advancePhase

echo "--- Trying to prune in CutAndPrune (expect OK/Inv err) ---"
dfx canister call backend cutAndPrune '("parcel_1")'

echo "--- Advance Phase from CutAndPrune to Maintenance ---"
dfx canister call backend advancePhase

echo "--- Advance Phase from Maintenance to Planning ---"
dfx canister call backend advancePhase

echo "--- Advance Phase from Planning (expect Season switch to Summer and Phase to Hiring) ---"
dfx canister call backend advancePhase

echo "--- Current Phase (Should be Hiring, Summer) ---"
dfx canister call backend getFarmOverview
