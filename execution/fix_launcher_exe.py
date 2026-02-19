import os
import stat

# Use the direct path to the executable to bypass cmd script issues
# Previous attempt used bin/antigravity.cmd which caused batch parsing errors in bash
AG_EXE = r"/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/Antigravity.exe"
launcher_path = os.path.expanduser("~/launch_antigravity.sh")

print("Updating launcher to use Antigravity.exe directly...")

# Create the shell script content
# Note: When calling Windows .exe from WSL, we still need to pass Windows paths
launcher_content = f"""#!/bin/bash
# Antigravity WSL Launcher (Direct Binary)

TARGET="${{1:-.}}"

if [ ! -e "$TARGET" ]; then
  echo "Error: Path '$TARGET' not found"
  exit 1
fi

# Convert WSL path to Windows path for Antigravity
WIN_PATH=$(wslpath -w "$TARGET")

# Execute Antigravity.exe directly
"{AG_EXE}" "$WIN_PATH" &> /dev/null &
# Using '&' to detach process so terminal isn't blocked
"""

try:
    with open(launcher_path, 'w', newline='\n') as f:
        f.write(launcher_content)
    
    # Make executable
    st = os.stat(launcher_path)
    os.chmod(launcher_path, st.st_mode | stat.S_IEXEC)
    print(f"Updated executable launcher: {launcher_path}")
    print("Launcher now points directly to Antigravity.exe")
    
except Exception as e:
    print(f"Error updating launcher: {e}")
    exit(1)

print("-" * 50)
print("Launcher updated.")
print("Try running: ag .")
print("-" * 50)
