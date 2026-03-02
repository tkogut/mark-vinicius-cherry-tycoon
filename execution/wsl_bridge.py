import socket, threading
import sys
import time

def log(msg):
    try:
        with open('/tmp/wsl_bridge.log', 'a') as f:
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

def start(local_port, remote_host, remote_port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('127.0.0.1', local_port))
    s.listen(5)
    log(f"Bridge started: 127.0.0.1:{local_port} -> {remote_host}:{remote_port}")
    while True:
        c, addr = s.accept()
        log(f"New connection from {addr}")
        r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            r.connect((remote_host, remote_port))
            log(f"Connected to remote {remote_host}:{remote_port}")
            threading.Thread(target=forward, args=(c, r, 'local->remote'), daemon=True).start()
            threading.Thread(target=forward, args=(r, c, 'remote->local'), daemon=True).start()
        except Exception as e:
            log(f"Failed to connect to remote: {e}")
            c.close()

if __name__ == "__main__":
    # Corrected Gateway IP
    start(9222, '172.20.32.1', 9222)
