#!/bin/bash
# Verify Environment
source $HOME/.nvm/nvm.sh
source $HOME/.local/share/dfx/env

echo "--- VERSIONS ---"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "DFX: $(dfx --version)"

echo "--- DIRECTORIES ---"
PROJECT_DIR="$HOME/projects/mark-vinicius-cherry-tycoon"
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory exists: $PROJECT_DIR"
    ls -F "$PROJECT_DIR" | head -n 10
else
    echo "ERROR: Project directory not found at $PROJECT_DIR"
fi

echo "--- BASHRC ---"
if grep -q "source ~/.bashrc.d/antigravity" ~/.bashrc; then
    echo "Antigravity source found in .bashrc"
    cat ~/.bashrc.d/antigravity
else
    echo "Antigravity source NOT found in .bashrc"
fi
