import socket
import threading
import pyautogui
import json
from datetime import datetime

class BluetoothMouseServer:
    def __init__(self, port=5000):
        self.port = port
        self.running = False
        self.last_x = 0
        self.last_y = 0
        self.sensitivity = 2.0
        
        # Disable pyautogui failsafe
        pyautogui.FAILSAFE = False
        
    def handle_client(self, client_socket, address):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Client connected: {address}")
        
        try:
            while self.running:
                data = client_socket.recv(1024).decode('utf-8')
                if not data:
                    break
                
                # Parse JSON command
                try:
                    command = json.loads(data)
                    self.process_command(command)
                except json.JSONDecodeError:
                    print(f"Invalid data received: {data}")
                    
        except Exception as e:
            print(f"Error handling client: {e}")
        finally:
            client_socket.close()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Client disconnected: {address}")
    
    def process_command(self, command):
        cmd_type = command.get('type')
        
        if cmd_type == 'move':
            # Relative mouse movement
            dx = command.get('dx', 0) * self.sensitivity
            dy = command.get('dy', 0) * self.sensitivity
            pyautogui.moveRel(dx, dy)
            
        elif cmd_type == 'click':
            button = command.get('button', 'left')
            pyautogui.click(button=button)
            
        elif cmd_type == 'scroll':
            amount = command.get('amount', 0)
            pyautogui.scroll(int(amount))
            
        elif cmd_type == 'sensitivity':
            self.sensitivity = command.get('value', 2.0)
            print(f"Sensitivity changed to: {self.sensitivity}")
    
    def start(self):
        self.running = True
        
        # Create TCP socket (easier than Bluetooth for cross-platform)
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            server_socket.bind(('0.0.0.0', self.port))
            server_socket.listen(5)
            
            print("=" * 50)
            print("Bluetooth Mouse Server Started")
            print("=" * 50)
            print(f"Listening on port: {self.port}")
            print(f"Connect your phone to: {self.get_local_ip()}:{self.port}")
            print("Press Ctrl+C to stop")
            print("=" * 50)
            
            while self.running:
                try:
                    server_socket.settimeout(1.0)
                    client_socket, address = server_socket.accept()
                    client_thread = threading.Thread(
                        target=self.handle_client,
                        args=(client_socket, address)
                    )
                    client_thread.daemon = True
                    client_thread.start()
                except socket.timeout:
                    continue
                    
        except KeyboardInterrupt:
            print("\nShutting down server...")
        finally:
            self.running = False
            server_socket.close()
    
    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "localhost"

if __name__ == '__main__':
    server = BluetoothMouseServer(port=5000)
    server.start()
