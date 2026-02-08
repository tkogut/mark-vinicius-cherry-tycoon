# Mark Vinicius Cherry Tycoon - Enhanced Backend Test Script
# Tests both original and new Caffeine AI features

Write-Host "🍒 Mark Vinicius Cherry Tycoon - Enhanced Backend Tests" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""

# Check if dfx is installed
Write-Host "Checking for dfx installation..." -ForegroundColor Yellow
$dfxVersion = dfx --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ dfx not found. Please install ICP SDK first:" -ForegroundColor Red
    Write-Host "   sh -ci `"$(curl -fsSL https://sdk.dfinity.org/install.sh)`"" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ dfx found: $dfxVersion" -ForegroundColor Green
Write-Host ""

# Start local replica
Write-Host "Starting local ICP replica..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "dfx" -ArgumentList "start", "--background", "--clean"
Start-Sleep -Seconds 5
Write-Host "✅ Local replica started" -ForegroundColor Green
Write-Host ""

# Deploy canister
Write-Host "Deploying backend canister..." -ForegroundColor Yellow
dfx deploy backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend deployed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "PART 1: ORIGINAL FEATURES" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""

# Test 1: Initialize Player
Write-Host "Test 1: Initialize Player" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend initializePlayer '(""player1"", ""Jan Kowalski"")'..." -ForegroundColor Gray
$result1 = dfx canister call backend initializePlayer '("player1", "Jan Kowalski")'
Write-Host $result1 -ForegroundColor White
Write-Host ""

# Test 2: Get Player Farm
Write-Host "Test 2: Get Player Farm (should have starter parcel)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getPlayerFarm '()'..." -ForegroundColor Gray
$result2 = dfx canister call backend getPlayerFarm '()'
Write-Host $result2 -ForegroundColor White
Write-Host ""

# Test 3: Get Cash Balance
Write-Host "Test 3: Get Cash Balance (should be 50,000 PLN)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getCashBalance '()'..." -ForegroundColor Gray
$result3 = dfx canister call backend getCashBalance '()'
Write-Host $result3 -ForegroundColor White
Write-Host ""

# Test 4: Get Inventory
Write-Host "Test 4: Get Inventory (initial state)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getInventory '()'..." -ForegroundColor Gray
$result4 = dfx canister call backend getInventory '()'
Write-Host $result4 -ForegroundColor White
Write-Host ""

# Test 5: Harvest Cherries
Write-Host "Test 5: Harvest Cherries from Starter Parcel" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend harvestCherries '(""parcel_starter_player1"")'..." -ForegroundColor Gray
$result5 = dfx canister call backend harvestCherries '("parcel_starter_player1")'
Write-Host $result5 -ForegroundColor White
Write-Host ""

# Test 6: Get Inventory After Harvest
Write-Host "Test 6: Get Inventory (should have cherries now)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getInventory '()'..." -ForegroundColor Gray
$result6 = dfx canister call backend getInventory '()'
Write-Host $result6 -ForegroundColor White
Write-Host ""

# Test 7: Sell Cherries
Write-Host "Test 7: Sell Cherries (retail)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend sellCherries '(1000, ""retail"")'..." -ForegroundColor Gray
$result7 = dfx canister call backend sellCherries '(1000, "retail")'
Write-Host $result7 -ForegroundColor White
Write-Host ""

# Test 8: Water Parcel
Write-Host "Test 8: Water Parcel" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend waterParcel '(""parcel_starter_player1"")'..." -ForegroundColor Gray
$result8 = dfx canister call backend waterParcel '("parcel_starter_player1")'
Write-Host $result8 -ForegroundColor White
Write-Host ""

# Test 9: Plant Trees (with density check)
Write-Host "Test 9: Plant 10 New Trees (tests density limit)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend plantTrees '(""parcel_starter_player1"", 10)'..." -ForegroundColor Gray
$result9 = dfx canister call backend plantTrees '("parcel_starter_player1", 10)'
Write-Host $result9 -ForegroundColor White
Write-Host ""

# Test 10: Get Player Stats
Write-Host "Test 10: Get Player Statistics" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getPlayerStats '()'..." -ForegroundColor Gray
$result10 = dfx canister call backend getPlayerStats '()'
Write-Host $result10 -ForegroundColor White
Write-Host ""

Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "PART 2: NEW CAFFEINE AI FEATURES" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""

# Test 11: Purchase New Parcel
Write-Host "Test 11: Purchase New Parcel (0.5 ha in Opolskie)" -ForegroundColor Cyan
Write-Host "Cost: 30,000 PLN (0.5 × 60,000)" -ForegroundColor Gray
Write-Host "Running: dfx canister call backend purchaseParcel '(variant { Opolskie }, 0.5)'..." -ForegroundColor Gray
$result11 = dfx canister call backend purchaseParcel '(variant { Opolskie }, 0.5)'
Write-Host $result11 -ForegroundColor White
Write-Host ""

# Test 12: Get Cash After Purchase
Write-Host "Test 12: Get Cash Balance (should be reduced by 30,000)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getCashBalance '()'..." -ForegroundColor Gray
$result12 = dfx canister call backend getCashBalance '()'
Write-Host $result12 -ForegroundColor White
Write-Host ""

# Test 13: Start Organic Conversion
Write-Host "Test 13: Start Organic Conversion on Starter Parcel" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend startOrganicConversion '(""parcel_starter_player1"")'..." -ForegroundColor Gray
$result13 = dfx canister call backend startOrganicConversion '("parcel_starter_player1")'
Write-Host $result13 -ForegroundColor White
Write-Host ""

# Test 14: Try to Harvest Again (should fail - already harvested)
Write-Host "Test 14: Try to Harvest Again (should fail)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend harvestCherries '(""parcel_starter_player1"")'..." -ForegroundColor Gray
$result14 = dfx canister call backend harvestCherries '("parcel_starter_player1")'
Write-Host $result14 -ForegroundColor White
Write-Host ""

# Test 15: Advance Season
Write-Host "Test 15: Advance to Next Season" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend advanceSeason '(null)'..." -ForegroundColor Gray
$result15 = dfx canister call backend advanceSeason '(null)'
Write-Host $result15 -ForegroundColor White
Write-Host ""

# Test 16: Harvest After Season Advance
Write-Host "Test 16: Harvest After Season Advance (should work now)" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend harvestCherries '(""parcel_starter_player1"")'..." -ForegroundColor Gray
$result16 = dfx canister call backend harvestCherries '("parcel_starter_player1")'
Write-Host $result16 -ForegroundColor White
Write-Host ""

# Test 17: Check Inventory for Organic Cherries
Write-Host "Test 17: Get Inventory (check organic vs regular)" -ForegroundColor Cyan
Write-Host "Should show organicCherries if conversion completed" -ForegroundColor Gray
Write-Host "Running: dfx canister call backend getInventory '()'..." -ForegroundColor Gray
$result17 = dfx canister call backend getInventory '()'
Write-Host $result17 -ForegroundColor White
Write-Host ""

# Test 18: Try to Exceed Tree Density
Write-Host "Test 18: Try to Exceed Tree Density (should fail)" -ForegroundColor Cyan
Write-Host "Starter parcel: 0.5 ha = max 200 trees, currently has 60" -ForegroundColor Gray
Write-Host "Trying to plant 150 more (would be 210 total)" -ForegroundColor Gray
Write-Host "Running: dfx canister call backend plantTrees '(""parcel_starter_player1"", 150)'..." -ForegroundColor Gray
$result18 = dfx canister call backend plantTrees '("parcel_starter_player1", 150)'
Write-Host $result18 -ForegroundColor White
Write-Host ""

# Test 19: Get Final Farm State
Write-Host "Test 19: Get Final Farm State" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getPlayerFarm '()'..." -ForegroundColor Gray
$result19 = dfx canister call backend getPlayerFarm '()'
Write-Host $result19 -ForegroundColor White
Write-Host ""

# Test 20: Get Total Players (admin function)
Write-Host "Test 20: Get Total Players" -ForegroundColor Cyan
Write-Host "Running: dfx canister call backend getTotalPlayers '()'..." -ForegroundColor Gray
$result20 = dfx canister call backend getTotalPlayers '()'
Write-Host $result20 -ForegroundColor White
Write-Host ""

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "✅ All 20 tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of New Features Tested:" -ForegroundColor Yellow
Write-Host "  ✅ Purchase parcel (60,000 PLN/ha)" -ForegroundColor White
Write-Host "  ✅ Organic conversion system" -ForegroundColor White
Write-Host "  ✅ Tree density limits (400/ha)" -ForegroundColor White
Write-Host "  ✅ Organic/regular cherry separation" -ForegroundColor White
Write-Host "  ✅ Tree age modifier (implicit in harvest)" -ForegroundColor White
Write-Host ""
Write-Host "To stop the local replica, run: dfx stop" -ForegroundColor Yellow
Write-Host "To view canister logs, run: dfx canister logs backend" -ForegroundColor Yellow
