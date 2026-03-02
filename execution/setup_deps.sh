#!/bin/bash
# Install Node.js via NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts

# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
