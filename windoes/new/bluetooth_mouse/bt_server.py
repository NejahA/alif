import bluetooth
import pyautogui
import json
import threading
from datetime import datetime

class BluetoothMouseServer:
    def __init__(self):
        self.running = False
        self.sensitivity = 2.0
        pyautogui.FAILSAFE = False
        
    def handle_client(self, client_sock, client_info):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Client connected: {client_info}")
        
        try:
            while self.running:
                data = client_sock.recv(1024).decode('utf-8')
                if not data:
                    break
                
                try:
                    command = json.loads(data)
                    self.process_command(command)
                except json.JSONDecodeError:
                    pass
                    
        except bluetooth.BluetoothError as e:
            print(f"Bluetooth error: {e}")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            client_sock.close()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Client disconnected")
    
    def process_command(self, command):
        cmd_type = command.get('type')
        
        if cmd_type == 'move':
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
            print(f"Sensitivity: {self.sensitivity}x")
    
    def start(self):
        self.running = True
        
        # Create Bluetooth RFCOMM socket
        server_sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
        
        try:
            # Bind to any available port
            server_sock.bind(("", bluetooth.PORT_ANY))
            server_sock.listen(1)
            
            port = server_sock.getsockname()[1]
            
            # Advertise service
            uuid = "94f39d29-7d6d-437d-973b-fba39e49d4ee"
            bluetooth.advertise_service(
                server_sock,
                "MICKII",
                service_id=uuid,
                service_classes=[uuid, bluetooth.SERIAL_PORT_CLASS],
                profiles=[bluetooth.SERIAL_PORT_PROFILE]
            )
            
            print("=" * 50)
            print("Bluetooth Mouse Server Started")
            print("=" * 50)
            print(f"Service Name: MICKII")
            print(f"UUID: {uuid}")
            print(f"Port: {port}")
            print("\nWaiting for connection...")
            print("Pair your phone with this PC via Bluetooth first!")
            print("Press Ctrl+C to stop")
            print("=" * 50)
            
            while self.running:
                try:
                    client_sock, client_info = server_sock.accept()
                    client_thread = threading.Thread(
                        target=self.handle_client,
                        args=(client_sock, client_info)
                    )
                    client_thread.daemon = True
                    client_thread.start()
                except KeyboardInterrupt:
                    break
                    
        except bluetooth.BluetoothError as e:
            print(f"\nBluetooth Error: {e}")
            print("\nTroubleshooting:")
            print("1. Make sure Bluetooth is enabled on your PC")
            print("2. Check if Bluetooth drivers are installed")
            print("3. Try running as Administrator")
        except KeyboardInterrupt:
            print("\nShutting down server...")
        finally:
            self.running = False
            server_sock.close()

if __name__ == '__main__':
    server = BluetoothMouseServer()
    server.start()
