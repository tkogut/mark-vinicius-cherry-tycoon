
import os
import re

# Use absolute path to ensure we target the correct file in WSL via Python
bashrc_path = os.path.expanduser("~/.bashrc")
backup_path = bashrc_path + ".bak"

# 1. Backup existing .bashrc if it exists
if os.path.exists(bashrc_path):
    with open(bashrc_path, 'rb') as source:
        with open(backup_path, 'wb') as dest:
            dest.write(source.read())
    print(f"Backed up .bashrc to {backup_path}")

# 2. Read existing content
with open(bashrc_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []
skip = False

# 3. Filter out any corrupted or previous Antigravity configuration
# We aggressively remove anything that looks like our previous attempts
for line in lines:
    clean_line = line.strip()
    
    # Skip clearly related lines
    if "Antigravity" in line:
        continue
    if "antigravity.cmd" in line:
        continue
    if "export -f ag" in clean_line:
        continue
    if "wslpath" in clean_line:
        continue
        
    # Skip partial function definitions if they match our pattern
    if clean_line == "ag() {":
        skip = True
        continue
    if clean_line == "}" and skip:
        skip = False
        continue
    if skip:
        continue
        
    # Skip trailing garbage lines that often causes syntax errors
    if clean_line in ["fi", "return 1", "echo"]:
        # Only preserve these if they are indented correctly or part of other logic
        # But for .bashrc, stray lines like this at root level are usually errors
        if not line.startswith(" ") and not line.startswith("\t"):
            continue

    new_lines.append(line)

# Ensure the file ends with a newline
if new_lines and not new_lines[-1].endswith('\n'):
    new_lines[-1] += '\n'

# 4. Define the clean configuration block with explicit UNIX newlines
ag_block = """
# Antigravity WSL Launcher
ag() {
  local target="${1:-.}"
  if [ ! -e "$target" ]; then
    echo "Error: Path '$target' not found"
    return 1
  fi
  local win_path=$(wslpath -w "$target")
  "/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity.cmd" "$win_path"
}
export -f ag
"""

# 5. Write clean content
with open(bashrc_path, 'w', newline='\n', encoding='utf-8') as f:
    f.writelines(new_lines)
    f.write(ag_block)

print("Successfully cleaned and updated .bashrc with correct line endings.")
