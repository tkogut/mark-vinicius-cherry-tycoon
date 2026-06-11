#!/bin/bash
# ==============================================================================
# AGENTS-OS chmod-ops safety script
# ==============================================================================
set -e

TARGET="$1"
MODE="$2"

if [ -z "$TARGET" ] || [ -z "$MODE" ]; then
    echo "Usage: $0 <target_path> <mode>"
    echo "Example: $0 scripts/deploy.sh +x"
    exit 1
fi

ABS_TARGET=$(realpath "$TARGET" 2>/dev/null || echo "$TARGET")

# Ochrona przed niebezpiecznymi operacjami
if [[ "$ABS_TARGET" == "/" ]] || [[ "$ABS_TARGET" == "/home" ]] || [[ "$ABS_TARGET" == "/home/tkogut" ]]; then
    echo "Error: Bezpośrednia zmiana uprawnień dla /, /home lub /home/tkogut jest zabroniona."
    exit 1
fi

if [ ! -e "$ABS_TARGET" ]; then
    echo "Error: Target path '$ABS_TARGET' does not exist."
    exit 1
fi

chmod "$MODE" "$ABS_TARGET"
echo "✓ Uprawnienia dla $ABS_TARGET zostały zmienione na $MODE."
