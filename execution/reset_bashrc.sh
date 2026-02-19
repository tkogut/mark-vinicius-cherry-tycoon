#!/bin/bash
# Reset .bashrc to default and add Antigravity config

echo "Resetting .bashrc from Ubuntu default skeleton..."
cp /etc/skel/.bashrc ~/.bashrc

echo "Appending Antigravity configuration..."
# Using clean printf to avoid syntax issues
printf "\n# Antigravity WSL Launcher\n" >> ~/.bashrc
printf "ag() {\n" >> ~/.bashrc
printf "  local target=\"\${1:-.}\"\n" >> ~/.bashrc
printf "  if [ ! -e \"\$target\" ]; then\n" >> ~/.bashrc
printf "    echo \"Error: Path '\$target' not found\"\n" >> ~/.bashrc
printf "    return 1\n" >> ~/.bashrc
printf "  fi\n" >> ~/.bashrc
printf "  local win_path=\$(wslpath -w \"\$target\")\n" >> ~/.bashrc
printf "  \"/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity.cmd\" \"\$win_path\"\n" >> ~/.bashrc
printf "}\n" >> ~/.bashrc
printf "export -f ag\n" >> ~/.bashrc

echo "---------------------------------------------------"
echo ".bashrc has been reset and configured."
echo "Action Required:"
echo "1. Run: source ~/.bashrc"
echo "2. Run: ag ."
echo "---------------------------------------------------"
