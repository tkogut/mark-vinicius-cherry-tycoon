#!/bin/bash
# Mark Vinicius Cherry Tycoon - Testing Entry Point

echo "🧪 Running Test Suites for Mark Vinicius Cherry Tycoon..."

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.." || exit 1

echo "---------------------------------"
echo "1. Running Backend Verification Script"
echo "---------------------------------"
if [ -f "execution/test-backend.ps1" ]; then
    # We try to use pwsh if available in WSL, otherwise warn 
    if command -v pwsh &> /dev/null; then
        pwsh ./execution/test-backend.ps1
    else
        echo "⚠️  PowerShell (pwsh) not found in WSL. Cannot run powershell test scripts directly."
        echo "Please execute: ./execution/test-backend.ps1 from Windows."
    fi
else
    echo "⚠️  Backend tests not found."
fi

echo "---------------------------------"
echo "2. Running Security Audit Script"
echo "---------------------------------"
if [ -f "execution/scripts/test_security_audit.sh" ]; then
    bash ./execution/scripts/test_security_audit.sh
else
    echo "⚠️  Security audit script not found."
fi

echo "✅ Testing workflow completed."
