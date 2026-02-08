# Browser Debugging Guide for Cherry Tycoon

## Overview
This guide helps you debug the frontend integration with the backend canister using browser DevTools.

## Prerequisites
1. Open the app in your browser: `npm run dev`
2. Open DevTools: `F12` or `Right-click → Inspect`
3. Navigate to the **Console** tab

## 🧪 Test Mode (Development Only)

**For local testing without Internet Identity:**

1. Look for the yellow **"Test Mode"** button next to "Login with II"
2. Click **Test Mode** to bypass authentication
3. This will:
   - Use anonymous identity
   - Call `initializePlayer('test_user', 'Test Player')` on backend
   - Set `isAuthenticated = true`
   - Allow you to test all farm operations

**Console Output:**
```
[AuthContext] Initializing TEST MODE (dev only)...
[AuthContext] Using anonymous identity for testing
[AuthContext] Test principal: 2vxsx-fae
[AuthContext] Creating backend actor for test mode...
[AuthContext] Test mode actor created: SUCCESS
[AuthContext] Initializing test player on backend...
[AuthContext] Test player initialized: "Player test_user initialized..."
```

> **Note:** Test Mode is only available in development (`npm run dev`). It will not appear in production builds.

## Debug Logging Structure

All logs are prefixed with their source:
- `[AuthContext]` - Authentication and actor initialization
- `[useFarm]` - Farm data queries and mutations

## Step-by-Step Debugging

### 1. Verify Actor Initialization

**On page load**, you should see:
```
[AuthContext] Initializing AuthClient...
[AuthContext] AuthClient created successfully
[AuthContext] Authentication status: false
[AuthContext] Identity principal: 2vxsx-fae
[AuthContext] Creating backend actor...
[AuthContext] Backend actor created: SUCCESS
[AuthContext] Actor methods available: getPlayerFarm, plantTrees, waterParcel, ...
```

**✅ Success**: Actor is created with available methods
**❌ Failure**: If you see `FAILED`, check:
- Is `dfx` running? (`dfx start --background`)
- Is the canister deployed? (`dfx deploy`)
- Is `VITE_BACKEND_CANISTER_ID` set correctly?

### 2. Test Login Flow

Click the **Login** button and watch for:
```
[AuthContext] Starting login flow...
[AuthContext] Login successful
[AuthContext] New identity principal: xxxxx-xxxxx-xxxxx-xxxxx-xxx
[AuthContext] Creating authenticated backend actor...
[AuthContext] Authenticated actor created: SUCCESS
```

**✅ Success**: New principal ID appears, actor recreated
**❌ Failure**: Check Internet Identity canister is running

### 3. Test Farm Data Fetch

After login, the app should automatically fetch farm data:
```
[useFarm] Fetching farm state...
[useFarm] Calling getPlayerFarm()...
[useFarm] Farm state received: {
  parcels: 3,
  cash: "10000",
  cherries: "0",
  level: "1"
}
```

**✅ Success**: Farm data appears with parcels, cash, etc.
**❌ Failure**: Check error message:
- `No backend actor available` → Actor not initialized
- `getPlayerFarm failed: { NotFound: "..." }` → Backend error

### 4. Test Mutations

#### Plant Trees
Click **Plant** on a parcel:
```
[useFarm] plantTrees called: { parcelId: "PL-001", amount: 10 }
[useFarm] plantTrees succeeded
[useFarm] Invalidating farm query after plant
[useFarm] Fetching farm state...
```

#### Water Parcel
Click **Water**:
```
[useFarm] waterParcel called: { parcelId: "PL-001" }
[useFarm] waterParcel succeeded
[useFarm] Invalidating farm query after water
```

#### Harvest Cherries
Click **Harvest**:
```
[useFarm] harvestCherries called: { parcelId: "PL-001" }
[useFarm] harvestCherries succeeded, amount: 150
[useFarm] Invalidating farm query after harvest
```

## Common Issues

### Issue: "No backend actor available"
**Cause**: Actor not initialized or authentication failed
**Fix**: 
1. Check console for `[AuthContext] Backend actor created: FAILED`
2. Verify `dfx` is running
3. Check `VITE_BACKEND_CANISTER_ID` in environment

### Issue: "getPlayerFarm failed: { NotFound: ... }"
**Cause**: Backend can't find player data
**Fix**: 
1. Ensure you're logged in with Internet Identity
2. Check backend logs: `dfx canister logs backend`
3. Verify backend has `getPlayerFarm` implemented

### Issue: Mutations fail silently
**Cause**: Backend error not surfaced
**Fix**: 
1. Look for `[useFarm] plantTrees failed:` in console
2. Check the error variant (NotFound, InsufficientFunds, etc.)
3. Verify parcel ID is correct

## Environment Variables

Check these are set correctly:

**Development (`.env.development` or inline)**:
```bash
VITE_BACKEND_CANISTER_ID=<your-backend-canister-id>
VITE_CANISTER_ID_INTERNET_IDENTITY=<ii-canister-id>
```

**To get canister IDs**:
```bash
dfx canister id backend
dfx canister id internet_identity
```

## Network Tab Debugging

1. Open **Network** tab in DevTools
2. Filter by `Fetch/XHR`
3. Look for calls to `127.0.0.1:8000` (dev) or `ic0.app` (prod)
4. Check request/response payloads for errors

## React Query DevTools (Optional)

Install React Query DevTools for visual query inspection:
```bash
npm install -D @tanstack/react-query-devtools
```

Add to `App.tsx`:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In your return:
<ReactQueryDevtools initialIsOpen={false} />
```

## Quick Checklist

- [ ] `dfx start --background` is running
- [ ] `dfx deploy` completed successfully
- [ ] `npm run dev` is running
- [ ] Browser console shows `[AuthContext] Backend actor created: SUCCESS`
- [ ] **Test Mode button** appears (yellow, next to Login with II)
- [ ] Click Test Mode → `[AuthContext] Test player initialized` appears
- [ ] `getPlayerFarm()` returns valid data
- [ ] Mutations (plant/water/harvest) succeed and trigger refetch
