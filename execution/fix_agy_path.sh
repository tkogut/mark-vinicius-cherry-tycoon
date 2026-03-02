#!/bin/bash
# Fix Antigravity Launcher path

cat << 'EOF' > ~/.bashrc.d/antigravity
# Antigravity launch function
agy() {
    /mnt/c/Users/admin_tk/AppData/Local/Programs/Antigravity/bin/antigravity --remote wsl+Ubuntu "$(pwd)"
}
export HOME=/home/tkogut
EOF

echo "Antigravity launcher updated. Please run 'source ~/.bashrc' or restart your terminal."
