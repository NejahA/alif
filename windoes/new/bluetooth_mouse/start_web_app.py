"""
Web App Launcher for Touch Mouse
Hosts the mobile web app and provides easy access URL
"""

import http.server
import socketserver
import socket
import os
from pathlib import Path

def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        if args[1] == '200':
            print(f"✓ {args[0]}")

def main():
    PORT = 8000
    ip = get_local_ip()
    
    # Change to the directory containing mobile_app.html
    os.chdir(Path(__file__).parent)
    
    print("=" * 60)
    print("Touchy - Web App Server")
    print("=" * 60)
    print()
    print(f"🌐 Server started at: http://{ip}:{PORT}")
    print()
    print("📱 OPEN THIS URL ON YOUR ANDROID PHONE:")
    print()
    print(f"   http://{ip}:{PORT}/mobile_app.html")
    print()
    print("=" * 60)
    print()
    print("Features:")
    print("  ✓ Auto-detects Android devices")
    print("  ✓ Auto-connects to PC server")
    print("  ✓ Optimized touch controls")
    print("  ✓ Haptic feedback (Android)")
    print("  ✓ Screen wake lock (Android)")
    print()
    print("=" * 60)
    print()
    print("Make sure:")
    print("  1. PC server is running (python pc_server.py)")
    print("  2. Phone and PC are on same WiFi")
    print("  3. Firewall allows port 5000 and 8000")
    print()
    print("Press Ctrl+C to stop")
    print("=" * 60)
    print()
    
    # Start server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down web server...")
            print("Goodbye! 👋")

if __name__ == '__main__':
    main()
