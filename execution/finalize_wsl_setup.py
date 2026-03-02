import os
import shutil
import stat

# Hardcoded paths
AG_CMD = r"/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity.cmd"
launcher_path = os.path.expanduser("~/launch_antigravity.sh")
bashrc_path = os.path.expanduser("~/.bashrc")
skel_bashrc = "/etc/skel/.bashrc"

print("Starting definitive fix...")

# 1. Create a robust, standalone launcher script (avoiding inline functions in .bashrc)
# This script handles the path conversion logic cleanly
launcher_content = f"""#!/bin/bash
# Antigravity WSL Launcher (Standalone)

TARGET="${{1:-.}}"

if [ ! -e "$TARGET" ]; then
  echo "Error: Path '$TARGET' not found"
  exit 1
fi

# Convert WSL path to Windows path for Antigravity
WIN_PATH=$(wslpath -w "$TARGET")

# Execute Antigravity
"{AG_CMD}" "$WIN_PATH"
"""

try:
    with open(launcher_path, 'w', newline='\n') as f:
        f.write(launcher_content)
    
    # Make executable
    st = os.stat(launcher_path)
    os.chmod(launcher_path, st.st_mode | stat.S_IEXEC)
    print(f"Created executable launcher: {launcher_path}")
    
except Exception as e:
    print(f"Error creating launcher: {e}")
    exit(1)

# 2. Reset .bashrc to system default to remove ALL corruption
if os.path.exists(skel_bashrc):
    try:
        shutil.copy2(skel_bashrc, bashrc_path)
        print("Reset .bashrc from Ubuntu default skeleton.")
    except Exception as e:
        print(f"Error resetting .bashrc: {e}")
else:
    print("Warning: /etc/skel/.bashrc missing. Leaving current .bashrc (might be corrupted).")

# 3. Add a simple alias to the launcher
# This avoids complex syntax in .bashrc entirely
alias_line = f"\n# Antigravity Alias\nalias ag='{launcher_path}'\n"

try:
    with open(bashrc_path, 'a', newline='\n') as f:
        f.write(alias_line)
    print("Added 'ag' alias to .bashrc.")
except Exception as e:
    print(f"Error updating .bashrc: {e}")

print("-" * 50)
print("Fix complete.")
print("1. Run: source ~/.bashrc")
print("2. Try: ag .")
print("-" * 50)
