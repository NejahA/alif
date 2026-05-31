import http.server
import socketserver
import json
import pyautogui
from datetime import datetime
import socket

class MouseControlHandler(http.server.BaseHTTPRequestHandler):
    sensitivity = 2.0
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests with mouse commands"""
        try:
            # Read content
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                command = json.loads(post_data.decode('utf-8'))
                
                # Process command
                self.process_command(command)
            
            # Send response
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
    
    def do_GET(self):
        """Handle GET requests (for connection testing)"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ready'}).encode())
    
    def process_command(self, command):
        """Process mouse control commands"""
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
            MouseControlHandler.sensitivity = command.get('value', 2.0)
            print(f"Sensitivity: {MouseControlHandler.sensitivity}x")
        
        elif cmd_type == 'type':
            # Type text
            text = command.get('text', '')
            if text:
                pyautogui.write(text, interval=0.01)
                print(f"Typed: {text[:50]}...")
        
        elif cmd_type == 'keyboard':
            # Handle keyboard shortcuts
            shortcut = command.get('shortcut', '')
            self.handle_keyboard_shortcut(shortcut)
        
        elif cmd_type == 'ping':
            # Just acknowledge
            pass
    
    def handle_keyboard_shortcut(self, shortcut):
        """Handle keyboard shortcuts"""
        shortcuts = {
            'copy': ['ctrl', 'c'],
            'paste': ['ctrl', 'v'],
            'cut': ['ctrl', 'x'],
            'undo': ['ctrl', 'z'],
            'redo': ['ctrl', 'y'],
            'save': ['ctrl', 's'],
            'find': ['ctrl', 'f'],
            'select_all': ['ctrl', 'a'],
            'enter': ['enter'],
            'backspace': ['backspace'],
            'delete': ['delete'],
            'escape': ['escape'],
            'tab': ['tab'],
            'space': ['space'],
        }
        
        if shortcut in shortcuts:
            keys = shortcuts[shortcut]
            if len(keys) == 1:
                pyautogui.press(keys[0])
            else:
                pyautogui.hotkey(*keys)
            print(f"Shortcut: {shortcut}")
    
    def log_message(self, format, *args):
        """Custom logging"""
        if args[1] == '200':
            # Only log non-ping requests
            if 'ping' not in str(args[0]):
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def main():
    PORT = 5000
    ip = get_local_ip()
    
    # Disable PyAutoGUI failsafe
    pyautogui.FAILSAFE = False
    
    print("=" * 60)
    print("Touchy Server (HTTP Mode)")
    print("=" * 60)
    print(f"Listening on: {ip}:{PORT}")
    print()
    print("This server works with:")
    print("  • mobile_app.html (Android optimized)")
    print("  • mobile_client.html (basic version)")
    print("  • mobile_client_advanced.html (advanced version)")
    print()
    print("=" * 60)
    print()
    print("📱 On your phone, open:")
    print(f"   http://{ip}:8000/mobile_app.html")
    print()
    print("Or start web server:")
    print("   python start_web_app.py")
    print()
    print("=" * 60)
    print()
    print("Press Ctrl+C to stop")
    print("=" * 60)
    print()
    
    # Start server
    with socketserver.TCPServer(("", PORT), MouseControlHandler) as httpd:
        httpd.allow_reuse_address = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server...")
            print("Goodbye! 👋")

if __name__ == '__main__':
    main()
