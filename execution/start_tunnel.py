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
        res = s.connect_ex((ip, port)) == 0
        if res and port == 5173:
            # TCP port is open (netsh listening), but does it route back to Vite?
            import urllib.request
            try:
                req = urllib.request.urlopen(f"http://{ip}:5173", timeout=2)
                return req.getcode() == 200
            except Exception:
                return False
        return res

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

    # 1. Detect Gateway and WSL IP
    gw_ip = get_gateway_ip()
    wsl_ip = subprocess.check_output(['hostname', '-I']).decode('utf-8').split()[0]
    print(f"[WSL] Detected Windows Gateway: {gw_ip}")
    print(f"[WSL] Detected WSL IP: {wsl_ip}")
    
    # 2. Check Windows Port 9223 (CDP Bridge) & 5173 (Vite Proxy)
    print(f"[WSL] Verifying Windows Port 9223 (CDP Proxy)...")
    if not check_port(gw_ip, 9223) or not check_port(gw_ip, 5173):
        print(f"[WARNING] Port 9223 or 5173 on {gw_ip} is CLOSED or UNREACHABLE.")
        print("[AUTO-FIX] Uruchamianie automatycznej naprawy proxy w Windows (Wymaga UAC / Administrator)...")
        # Prepare the netsh bypass command for both ports
        ps_command = f"Start-Process cmd -ArgumentList '/c netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222 & netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress={wsl_ip} connectport=5173' -Verb RunAs"
        
        try:
            subprocess.run(["powershell.exe", "-Command", ps_command], check=True)
            print("[AUTO-FIX] ✅ Wysłano żądanie UAC. Jeśli zaakceptowałeś, proxy jest naprawione!")
            time.sleep(2) # Give Windows netsh time to apply
        except Exception as e:
            print(f"[ERROR] Auto-fix failed: {e}")
            print("[MANUAL-FIX] Please run this in Windows PowerShell (Admin):")
            print(f'netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222')
            print(f'netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress={wsl_ip} connectport=5173')
            sys.exit(1)
    else:
        print("[WSL] Windows Proxies (CDP & Vite) are ALIVE ✅")

    # 2.5 Auto-Launch Chrome
    print("[WSL] Auto-Launching Chrome on Windows (Profile: 'Default' exactly as in .bat)...")
    try:
        # Force kill chrome to ensure debug flags are accepted, then launch with full profile and url
        kill_cmd = "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"
        subprocess.run(["powershell.exe", "-Command", kill_cmd], check=False)
        
        chrome_args = "'--remote-debugging-port=9222', '--user-data-dir=\"C:\\Users\\tkogut\\AppData\\Local\\Google\\Chrome\\User Data\"', '--profile-directory=\"Default\"', '--remote-allow-origins=*', 'http://localhost:5173'"
        chrome_cmd = f"Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList {chrome_args}"
        subprocess.run(["powershell.exe", "-Command", chrome_cmd], check=True)
    except Exception as e:
        print(f"[WARNING] Could not auto-launch Chrome: {e}")

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
