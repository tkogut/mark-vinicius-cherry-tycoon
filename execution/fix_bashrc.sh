#!/bin/bash
# Clean up and fix .bashrc Antigravity configuration

echo "Backing up .bashrc to .bashrc.bak..."
cp ~/.bashrc ~/.bashrc.bak

echo "Removing previous Antigravity configuration..."
sed -i '/Antigravity/d' ~/.bashrc
sed -i '/antigravity.cmd/d' ~/.bashrc
sed -i '/export -f ag/d' ~/.bashrc
sed -i '/wslpath/d' ~/.bashrc
sed -i '/ag() {/d' ~/.bashrc
sed -i '/target=/d' ~/.bashrc

echo "Appending correct configuration..."
# Use printf to write clean lines without implicit newlines that might carry CR content
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
echo ".bashrc has been cleaned and updated."
echo "CRITICAL: Run 'source ~/.bashrc' now to apply changes."
echo "---------------------------------------------------"
