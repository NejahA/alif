"""
Touch Mouse - Android App (WiFi Only)
Native Android app built with Kivy
"""

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.slider import Slider
from kivy.uix.widget import Widget
from kivy.graphics import Color, Rectangle, Line
from kivy.clock import Clock
from kivy.core.window import Window
import socket
import json
import threading

# Set window size for testing
Window.size = (360, 640)

class TouchPad(Widget):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.last_touch = None
        self.app = None
        self.touch_start_y = 0
        self.touch_count = 0
        
        with self.canvas.before:
            Color(0.16, 0.16, 0.16, 1)
            self.rect = Rectangle(pos=self.pos, size=self.size)
        
        self.bind(pos=self.update_rect, size=self.update_rect)
    
    def update_rect(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size
    
    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.last_touch = touch.pos
            self.touch_start_y = touch.pos[1]
            self.touch_count = len([t for t in Window.touches if self.collide_point(*t.pos)])
            return True
        return super().on_touch_down(touch)
    
    def on_touch_move(self, touch):
        if self.collide_point(*touch.pos) and self.last_touch:
            current_touches = len([t for t in Window.touches if self.collide_point(*t.pos)])
            
            # Two-finger scroll
            if current_touches >= 2:
                dy = self.touch_start_y - touch.pos[1]
                if abs(dy) > 10:
                    if self.app and self.app.connected:
                        self.app.send_command({'type': 'scroll', 'amount': 1 if dy > 0 else -1})
                    self.touch_start_y = touch.pos[1]
            else:
                # Single finger move
                dx = touch.pos[0] - self.last_touch[0]
                dy = -(touch.pos[1] - self.last_touch[1])  # Invert Y
                
                if self.app and self.app.connected:
                    self.app.send_command({'type': 'move', 'dx': dx, 'dy': dy})
                
                self.last_touch = touch.pos
            return True
        return super().on_touch_move(touch)
    
    def on_touch_up(self, touch):
        if self.collide_point(*touch.pos):
            self.last_touch = None
            return True
        return super().on_touch_up(touch)


class TouchMouseApp(App):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.socket = None
        self.connected = False
        self.sensitivity = 2.0
        self.server_ip = "192.168.1.100"
        self.server_port = 5000
        
    def build(self):
        self.title = "MICKII"
        
        # Main layout
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Connection section
        conn_layout = BoxLayout(orientation='vertical', size_hint=(1, 0.25), spacing=5)
        
        # IP input
        ip_layout = BoxLayout(size_hint=(1, None), height=40, spacing=5)
        ip_layout.add_widget(Label(text='PC IP:', size_hint=(0.25, 1)))
        self.ip_input = TextInput(
            text=self.server_ip,
            multiline=False,
            size_hint=(0.75, 1)
        )
        ip_layout.add_widget(self.ip_input)
        conn_layout.add_widget(ip_layout)
        
        # Port input
        port_layout = BoxLayout(size_hint=(1, None), height=40, spacing=5)
        port_layout.add_widget(Label(text='Port:', size_hint=(0.25, 1)))
        self.port_input = TextInput(
            text=str(self.server_port),
            multiline=False,
            input_filter='int',
            size_hint=(0.75, 1)
        )
        port_layout.add_widget(self.port_input)
        conn_layout.add_widget(port_layout)
        
        # Connect button
        self.connect_btn = Button(
            text='Connect',
            size_hint=(1, None),
            height=50,
            background_color=(0.29, 0.56, 0.89, 1)
        )
        self.connect_btn.bind(on_press=self.toggle_connection)
        conn_layout.add_widget(self.connect_btn)
        
        # Status label
        self.status_label = Label(
            text='Not connected',
            size_hint=(1, None),
            height=30,
            color=(0.5, 0.5, 0.5, 1)
        )
        conn_layout.add_widget(self.status_label)
        
        layout.add_widget(conn_layout)
        
        # Sensitivity control
        sens_layout = BoxLayout(size_hint=(1, 0.08), spacing=10)
        sens_layout.add_widget(Label(text='Sensitivity:', size_hint=(0.3, 1)))
        
        self.sens_slider = Slider(min=0.5, max=5, value=2, step=0.5)
        self.sens_slider.bind(value=self.on_sensitivity_change)
        sens_layout.add_widget(self.sens_slider)
        
        self.sens_label = Label(text='2.0x', size_hint=(0.2, 1))
        sens_layout.add_widget(self.sens_label)
        layout.add_widget(sens_layout)
        
        # Touchpad
        self.touchpad = TouchPad(size_hint=(1, 0.5))
        self.touchpad.app = self
        layout.add_widget(self.touchpad)
        
        # Click buttons
        btn_layout = BoxLayout(size_hint=(1, 0.17), spacing=10)
        
        left_btn = Button(
            text='LEFT',
            background_color=(0.23, 0.23, 0.23, 1)
        )
        left_btn.bind(on_press=lambda x: self.send_click('left'))
        btn_layout.add_widget(left_btn)
        
        right_btn = Button(
            text='RIGHT',
            background_color=(0.23, 0.23, 0.23, 1)
        )
        right_btn.bind(on_press=lambda x: self.send_click('right'))
        btn_layout.add_widget(right_btn)
        
        layout.add_widget(btn_layout)
        
        return layout
    
    def toggle_connection(self, instance):
        if self.connected:
            self.disconnect()
        else:
            self.connect()
    
    def connect(self):
        self.server_ip = self.ip_input.text
        self.server_port = int(self.port_input.text)
        
        def connect_thread():
            try:
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.socket.settimeout(5)
                self.socket.connect((self.server_ip, self.server_port))
                self.socket.settimeout(None)
                
                self.connected = True
                Clock.schedule_once(lambda dt: self.update_connection_status(True))
                
            except Exception as e:
                self.connected = False
                Clock.schedule_once(lambda dt: self.update_connection_status(False, str(e)))
        
        threading.Thread(target=connect_thread, daemon=True).start()
    
    def update_connection_status(self, success, error=None):
        if success:
            self.status_label.text = f'Connected to {self.server_ip}:{self.server_port}'
            self.status_label.color = (0.15, 0.68, 0.38, 1)
            self.connect_btn.text = 'Disconnect'
            self.connect_btn.background_color = (0.15, 0.68, 0.38, 1)
        else:
            self.status_label.text = f'Connection failed: {error if error else "Unknown error"}'
            self.status_label.color = (0.9, 0.3, 0.3, 1)
            self.connected = False
    
    def disconnect(self):
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
        
        self.connected = False
        self.status_label.text = 'Disconnected'
        self.status_label.color = (0.5, 0.5, 0.5, 1)
        self.connect_btn.text = 'Connect'
        self.connect_btn.background_color = (0.29, 0.56, 0.89, 1)
    
    def send_command(self, command):
        if not self.connected or not self.socket:
            return
        
        try:
            data = json.dumps(command).encode('utf-8') + b'\n'
            self.socket.sendall(data)
        except Exception as e:
            print(f"Send error: {e}")
            Clock.schedule_once(lambda dt: self.disconnect())
    
    def send_click(self, button):
        self.send_command({'type': 'click', 'button': button})
    
    def on_sensitivity_change(self, instance, value):
        self.sensitivity = value
        self.sens_label.text = f'{value:.1f}x'
        self.send_command({'type': 'sensitivity', 'value': value})
    
    def on_stop(self):
        self.disconnect()
        return True


if __name__ == '__main__':
    TouchMouseApp().run()
