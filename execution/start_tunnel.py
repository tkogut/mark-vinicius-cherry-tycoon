import os
import subprocess
import socket
import time
import sys

def get_gateway_ip():
    try:
        output = subprocess.check_output("ip route show | grep default", shell=True).decode()
        return output.split()[2]
    except Exception:
        return "127.0.0.1"

def check_port(ip, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(2)
        return s.connect_ex((ip, port)) == 0

def start_bridge():
    bridge_path = "/home/tkogut/projects/mark-vinicius-cherry-tycoon/execution/wsl_bridge_universal.py"
    cmd = f"nohup python3 {bridge_path} > /tmp/wsl_bridge.log 2>&1 &"
    print(f"[WSL] Starting bridge: {cmd}")
    subprocess.Popen(cmd, shell=True)
    time.sleep(2)

def main():
    print("--- 🦾 BROWSER BRIDGE AUTO-RECOVERY ---")
    
    # 0. Ghost Clean (Port Lockdown)
    print("[WSL] Performing Ghost Clean on Vite ports (5173-5175)...")
    subprocess.run("fuser -k 5173/tcp 5174/tcp 5175/tcp || true", shell=True)

    # 1. Detect Gateway
    gw_ip = get_gateway_ip()
    print(f"[WSL] Detected Windows Gateway: {gw_ip}")
    
    # 2. Check Windows Port 9223
    print(f"[WSL] Verifying Windows Port 9223 (Proxy)...")
    if not check_port(gw_ip, 9223):
        print(f"[ERROR] Port 9223 on {gw_ip} is CLOSED or UNREACHABLE.")
        print("[FIX] Please run this in Windows PowerShell (Admin):")
        print(f'netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222')
        sys.exit(1)
    
    print("[WSL] Windows Proxy is ALIVE ✅")

    # 3. Check for existing bridge
    try:
        subprocess.check_output("pgrep -f wsl_bridge_universal.py", shell=True)
        print("[WSL] Bridge is already running. Restarting for fresh session...")
        subprocess.run("pkill -f wsl_bridge_universal.py", shell=True)
    except subprocess.CalledProcessError:
        pass

    # 4. Start Bridge
    start_bridge()
    
    # 5. Final Verification
    print("[WSL] Verifying local CDP endpoint (127.0.0.1:9222)...")
    time.sleep(1)
    try:
        res = subprocess.check_output("curl -s http://127.0.0.1:9222/json/version", shell=True).decode()
        if "Browser" in res:
            print("[SUCCESS] Chrome CDP Connection established! 🚀")
            print(res)
        else:
            print("[ERROR] Received invalid response from bridge. Check /tmp/wsl_bridge.log")
    except Exception as e:
        print(f"[ERROR] Final verification failed: {e}")

if __name__ == "__main__":
    main()
