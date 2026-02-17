#!/bin/bash

# Verification Script for Phase 5.1: Weather System
# Run this in your WSL terminal.
# Output is logged to .tmp/weather_test.log

LOG_FILE=".tmp/weather_test.log"
mkdir -p .tmp

echo "Starting Weather System Verification..." | tee $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE

# 1. Re-Initialize Player (to reset state)
echo "1. Re-Initializing Player..." | tee -a $LOG_FILE
dfx canister call backend initializePlayer '("weather_test", "WeatherTester")' 2>&1 | tee -a $LOG_FILE

# 2. Check Initial Phase (Should be Preparation)
echo "2. Checking Initial Phase (Expect Preparation)..." | tee -a $LOG_FILE
dfx canister call backend getFarmOverview '()' 2>&1 | tee -a $LOG_FILE

# 3. Advance to Growth (Should Trigger Weather)
echo "3. Advancing to Growth Phase (Expect Weather Event?)..." | tee -a $LOG_FILE
dfx canister call backend advancePhase '()' 2>&1 | tee -a $LOG_FILE

# 4. Check Farm State for Weather
echo "4. Checking Farm State for Weather..." | tee -a $LOG_FILE
dfx canister call backend getPlayerFarm '()' | grep "weather" -A 5 2>&1 | tee -a $LOG_FILE

# 5. Advance to Harvest
echo "5. Advancing to Harvest Phase..." | tee -a $LOG_FILE
dfx canister call backend advancePhase '()' 2>&1 | tee -a $LOG_FILE

# 6. Advance to Sales
echo "6. Advancing to Sales Phase..." | tee -a $LOG_FILE
dfx canister call backend advancePhase '()' 2>&1 | tee -a $LOG_FILE

# 7. Advance to OffSeason
echo "7. Advancing to OffSeason Phase..." | tee -a $LOG_FILE
dfx canister call backend advancePhase '()' 2>&1 | tee -a $LOG_FILE

# 8. Try to Advance Phase from OffSeason (Should Fail)
echo "8. Trying to Advance Phase from OffSeason (Expect Error)..." | tee -a $LOG_FILE
dfx canister call backend advancePhase '()' 2>&1 | tee -a $LOG_FILE

# 9. Advance Season (Should Reset to Preparation)
echo "9. Advancing Season (Expect Reset to Spring/Preparation)..." | tee -a $LOG_FILE
dfx canister call backend advanceSeason '(null)' 2>&1 | tee -a $LOG_FILE

# 10. Check Reset State
echo "10. Checking Reset State..." | tee -a $LOG_FILE
dfx canister call backend getFarmOverview '()' 2>&1 | tee -a $LOG_FILE

echo "Weather Verification Complete." | tee -a $LOG_FILE
