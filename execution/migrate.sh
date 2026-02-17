#!/bin/bash

# Migration Script: Move Project to Linux Home
# This script copies the current project from the mounted Windows drive (/mnt/c/...)
# to the user's Linux home directory (~/) to fix permission issues with dfx.

# Define target directory
TARGET_DIR="$HOME/projects/mark-vinicius-cherry-tycoon"

echo "Comparing source and destination..."
echo "Source: $(pwd)"
echo "Target: $TARGET_DIR"

if [ -d "$TARGET_DIR" ]; then
    echo "Warning: Target directory already exists."
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 1
    fi
    rm -rf "$TARGET_DIR"
fi

mkdir -p "$HOME/projects"

echo "Copying project files... (this may take a moment)"
# Exclude node_modules and .dfx to save time/space and avoid issues
rsync -av --progress --exclude 'node_modules' --exclude '.dfx' . "$TARGET_DIR"

echo "---------------------------------------------------"
echo "Migration Complete!"
echo "---------------------------------------------------"
echo "Action Required:"
echo "1. Run: code $TARGET_DIR"
echo "   (This opens the new location in VS Code)"
echo "2. In the new window, open the integrated terminal."
echo "3. Run: npm install"
echo "4. Run: dfx start --clean --background"
echo "5. Run: dfx deploy backend"
echo ""
echo "Good luck in the new home!"
