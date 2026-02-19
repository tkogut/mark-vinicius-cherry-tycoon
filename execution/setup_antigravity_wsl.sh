#!/bin/bash
# Setup Antigravity Launcher (Fixed)

# 1. Clean up previous broken attempt from .bashrc (if any)
# Removes everything between the header and the export command
sed -i '/# Antigravity WSL Launcher/,/export -f ag/d' ~/.bashrc

AG_CMD="/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity.cmd"

echo "Configuring 'ag' command..."

# 2. Append correct function
# using simple echo to avoid heredoc complexity and quoting issues
echo "" >> ~/.bashrc
echo "# Antigravity WSL Launcher" >> ~/.bashrc
echo "ag() {" >> ~/.bashrc
echo "  local target=\"\${1:-.}\"" >> ~/.bashrc
echo "  if [ ! -e \"\$target\" ]; then" >> ~/.bashrc
echo "    echo \"Error: Path '\$target' not found\"" >> ~/.bashrc
echo "    return 1" >> ~/.bashrc
echo "  fi" >> ~/.bashrc
echo "  local win_path=\$(wslpath -w \"\$target\")" >> ~/.bashrc
echo "  \"$AG_CMD\" \"\$win_path\"" >> ~/.bashrc
echo "}" >> ~/.bashrc
echo "export -f ag" >> ~/.bashrc

echo "---------------------------------------------------"
echo "Configuration updated."
echo "Action Required:"
echo "1. Run: source ~/.bashrc"
echo "2. Try: ag ."
echo "---------------------------------------------------"
