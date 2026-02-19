import os
import shutil

# Path to the Windows Antigravity executable
AG_CMD = r"/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity.cmd"

# The configuration block to append
# Using a raw string to handle backslashes correctly
# We avoid using 'local' for variables to prevent any shell parsing issues
bashrc_config = f"""
# Antigravity WSL Launcher
ag() {{
  target="${{1:-.}}"
  if [ ! -e "$target" ]; then
    echo "Error: Path '$target' not found"
    return 1
  fi
  
  # Convert WSL path to Windows UNC path
  # Note: wslpath is a standard WSL utility
  win_path=$(wslpath -w "$target")
  
  # Execute Antigravity
  "{AG_CMD}" "$win_path"
}}
export -f ag
"""

# File paths
home_dir = os.path.expanduser("~")
bashrc_path = os.path.join(home_dir, ".bashrc")
skel_bashrc = "/etc/skel/.bashrc"
backup_path = bashrc_path + ".bak.repaired"

print(f"Resetting {bashrc_path}...")

# 1. Backup current broken .bashrc
if os.path.exists(bashrc_path):
    shutil.copy2(bashrc_path, backup_path)
    print(f"Backed up corrupted .bashrc to {backup_path}")

# 2. Reset from skeleton (default Ubuntu config)
if os.path.exists(skel_bashrc):
    with open(skel_bashrc, 'r') as src:
        content = src.read()
else:
    print("Warning: /etc/skel/.bashrc not found. Creating empty .bashrc.")
    content = ""

# 3. Append our configuration
# Ensure there is a newline before appending
if content and not content.endswith('\n'):
    content += '\n'

full_content = content + bashrc_config

# 4. Write new .bashrc with explicit UNIX line endings
with open(bashrc_path, 'w', newline='\n') as f:
    f.write(full_content)

print("-" * 50)
print("Configuration reset successfully using Python.")
print("Please run: source ~/.bashrc")
print("Then try: ag .")
print("-" * 50)
