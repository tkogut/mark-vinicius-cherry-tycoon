#!/bin/bash
# Mark Vinicius Cherry Tycoon - UI Verification Entry Point

echo "🎨 Verifying Frontend UI Build for Mark Vinicius Cherry Tycoon..."

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/../frontend" || { echo "❌ Frontend directory not found."; exit 1; }

echo "⚙️ Installing dependencies..."
npm ci || npm install

echo "🛠️ Creating production build..."
npm run build || { echo "❌ UI Build failed! Check for TypeScript or linter errors."; exit 1; }

echo "✅ UI Build successful. Ready for deployment."
