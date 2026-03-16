import socket
import threading
import subprocess
import sys

def get_gateway():
    try:
        output = subprocess.check_output("ip route show | grep default", shell=True).decode()
        parts = output.split()
        if "via" in parts:
            return parts[parts.index("via") + 1]
    except:
        pass
    return "172.20.32.1" # Twoje wykryte IP

def forward(src, dst, label):
    try:
        while True:
            data = src.recv(4096)
            if not data:
                break
            dst.sendall(data)
    except:
        pass
    finally:
        src.close()
        dst.close()

def start(local_port, remote_port):
    remote_host = get_gateway()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        s.bind(('0.0.0.0', local_port))
    except OSError:
        print(f"❌ Port {local_port} zajęty. Użyj: sudo fuser -k {local_port}/tcp")
        return

    s.listen(10)
    print(f"🚀 MOST DIAGNOSTYCZNY: WSL:{local_port} -> Windows:{remote_host}:{remote_port}")
    
    while True:
        c, addr = s.accept()
        print(f"---")
        print(f"1. [WSL] Odebrano zapytanie od Agenta/Curl z adresu: {addr}")
        
        r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        r.settimeout(3.0) # Nie czekaj wiecznie
        
        try:
            print(f"2. [MOST] Próbuję połączyć się z Windowsem pod IP: {remote_host} port: {remote_port}...")
            r.connect((remote_host, remote_port))
            print(f"3. [WINDOWS] ✅ POŁĄCZONO! Przesyłam dane...")
            
            threading.Thread(target=forward, args=(c, r, 'L2R'), daemon=True).start()
            threading.Thread(target=forward, args=(r, c, 'R2L'), daemon=True).start()
        except socket.timeout:
            print(f"3. [BŁĄD] ❌ TIMEOUT: Windows nie odpowiedział w ciągu 3s. AVG/Firewall blokuje!")
            c.close()
        except Exception as e:
            print(f"3. [BŁĄD] ❌ POŁĄCZENIE ODRZUCONE: {e}")
            c.close()

if __name__ == "__main__":
    start(9222, 9223)