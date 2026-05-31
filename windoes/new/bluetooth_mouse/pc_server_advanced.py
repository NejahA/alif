import socket
import threading
import pyautogui
import json
from datetime import datetime
from advanced_features import AdvancedMouseController, execute_shortcut

class AdvancedMouseServer:
    def __init__(self, port=5000):
        self.port = port
        self.running = False
        self.controller = AdvancedMouseController()
        
    def handle_client(self, client_socket, address):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Client connected: {address}")
        
        try:
            while self.running:
                data = client_socket.recv(1024).decode('utf-8')
                if not data:
                    break
                
                try:
                    command = json.loads(data)
                    self.process_command(command)
                except json.JSONDecodeError:
                    print(f"Invalid data: {data}")
                    
        except Exception as e:
            print(f"Error: {e}")
        finally:
            client_socket.close()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Client disconnected")
    
    def process_command(self, command):
        """Process incoming commands"""
        cmd_type = command.get('type')
        
        # Handle keyboard shortcuts
        if cmd_type == 'keyboard' and command.get('action') == 'shortcut':
            shortcut = command.get('shortcut')
            if execute_shortcut(shortcut):
                print(f"Executed shortcut: {shortcut}")
            return
        
        # Handle other commands through advanced controller
        self.controller.process_command(command)
    
    def start(self):
        self.running = True
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            server_socket.bind(('0.0.0.0', self.port))
            server_socket.listen(5)
            
            print("=" * 60)
            print("Advanced Touch Mouse Server Started")
            print("=" * 60)
            print(f"Port: {self.port}")
            print(f"IP: {self.get_local_ip()}:{self.port}")
            print("\nFeatures:")
            print("  • Mouse control (move, click, scroll)")
            print("  • Keyboard shortcuts (copy, paste, etc.)")
            print("  • Advanced gestures")
            print("  • Double-click support")
            print("\nUse mobile_client_advanced.html for full features")
            print("Press Ctrl+C to stop")
            print("=" * 60)
            
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
            print("\nShutting down...")
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
    server = AdvancedMouseServer(port=5000)
    server.start()
