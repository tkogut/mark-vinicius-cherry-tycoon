# Migrating to WSL (Antigravity Edition)

## IMPORTANT: Fix Line Endings First!
Since this file was created on Windows, it may have line endings that confuse Linux.
Run this command **inside WSL** before anything else:

```bash
sed -i 's/\r$//' execution/fix_bashrc.sh
```

## 1. Configure Antigravity Alias
Now run the fix script to clean up your `.bashrc` and set up the `ag` command cleanly:

```bash
bash execution/fix_bashrc.sh
source ~/.bashrc
```

## 2. Open Project in WSL
Navigate to your new project location in Linux and launch Antigravity:

```bash
cd ~/projects/mark-vinicius-cherry-tycoon
ag .
```

## 3. Development Commands
In the new window:
```bash
npm install
dfx start --clean --background
dfx deploy backend
```
