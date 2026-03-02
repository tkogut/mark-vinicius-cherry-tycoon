#!/bin/bash
# Configure ~/.bashrc for Antigravity

# Create .bashrc.d if it doesn't exist
mkdir -p ~/.bashrc.d

# Create the antigravity config
cat << 'EOF' > ~/.bashrc.d/antigravity
# Antigravity launch function
agy() {
    /mnt/c/Users/admin_tk/AppData/Local/Programs/Antigravity/bin/antigravity.cmd --remote wsl+Ubuntu "$(pwd)"
}
export HOME=/home/tkogut
EOF

# Source it from ~/.bashrc
if ! grep -q 'source ~/.bashrc.d/antigravity' ~/.bashrc; then
    echo 'source ~/.bashrc.d/antigravity' >> ~/.bashrc
fi
