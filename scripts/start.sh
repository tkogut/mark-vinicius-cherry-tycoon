#!/bin/bash
# Mark Vinicius Cherry Tycoon - Main Entry Point

echo "🍒 Starting Mark Vinicius Cherry Tycoon Environment..."

# Ensure we're in the project root
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.." || exit 1

# Start Local Replica (Background)
echo "🚀 Starting ICP Local Replica (dfx)..."
dfx start --background --clean || echo "Replica may already be running."

# Deploy Backend
echo "🏗️ Deploying Backend Canister..."
dfx deploy backend_mainnet || { echo "❌ Backend deployment failed."; exit 1; }

# Start Frontend Dev Server
echo "🌐 Starting Frontend Dev Server..."
cd frontend || exit 1
npm install
npm run dev
