import socket
import threading
import subprocess
import time
import sys

def get_gateway():
    try:
        # Get gateway from ip route
        output = subprocess.check_output("ip route show | grep default", shell=True).decode()
        # example: default via 172.20.32.1 dev eth0 proto kernel 
        parts = output.split()
        if "via" in parts:
            index = parts.index("via")
            return parts[index + 1]
    except Exception as e:
        print(f"Error detecting gateway: {e}")
    return "127.0.0.1" # fallback

def log(msg):
    try:
        with open('/tmp/bridge.log', 'a') as f:
            f.write(f'[{time.ctime()}] {msg}\n')
    except:
        pass
    print(msg)

def forward(src, dst, label):
    try:
        while True:
            data = src.recv(4096)
            if not data:
                log(f"{label}: Connection closed by source")
                break
            dst.sendall(data)
    except Exception as e:
        log(f"{label}: Error during forwarding: {e}")
    finally:
        src.close()
        dst.close()

def start(local_port, remote_port):
    remote_host = get_gateway()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('127.0.0.1', local_port))
    s.listen(5)
    log(f"Universal Bridge started: 127.0.0.1:{local_port} -> {remote_host}:{remote_port}")
    while True:
        try:
            c, addr = s.accept()
            log(f"New connection from {addr}")
            r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                r.connect((remote_host, remote_port))
                log(f"Connected to remote {remote_host}:{remote_port}")
                threading.Thread(target=forward, args=(c, r, 'local->remote'), daemon=True).start()
                threading.Thread(target=forward, args=(r, c, 'remote->local'), daemon=True).start()
            except Exception as e:
                log(f"Failed to connect to remote {remote_host}:{remote_port} - {e}")
                c.close()
        except KeyboardInterrupt:
            log("Bridge stopped by user")
            sys.exit(0)
        except Exception as e:
            log(f"Error in accept loop: {e}")

if __name__ == "__main__":
    # Ensure bridge is killed if script is restarted
    start(9222, 9222)
