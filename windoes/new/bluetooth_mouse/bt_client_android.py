"""
Android Bluetooth Client (Kivy-based)
This needs to be packaged as an APK using buildozer
"""

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.slider import Slider
from kivy.uix.widget import Widget
from kivy.graphics import Color, Rectangle
from kivy.clock import Clock
import json

try:
    from jnius import autoclass
    BluetoothAdapter = autoclass('android.bluetooth.BluetoothAdapter')
    BluetoothDevice = autoclass('android.bluetooth.BluetoothDevice')
    BluetoothSocket = autoclass('android.bluetooth.BluetoothSocket')
    UUID = autoclass('java.util.UUID')
except:
    print("Running on non-Android platform")

class TouchPad(Widget):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.last_touch = None
        self.app = None
        
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
            return True
        return super().on_touch_down(touch)
    
    def on_touch_move(self, touch):
        if self.collide_point(*touch.pos) and self.last_touch:
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
        self.uuid = "94f39d29-7d6d-437d-973b-fba39e49d4ee"
        self.sensitivity = 2.0
    
    def build(self):
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Status label
        self.status_label = Label(
            text='Not connected',
            size_hint=(1, 0.1),
            color=(0.5, 0.5, 0.5, 1)
        )
        layout.add_widget(self.status_label)
        
        # Connect button
        self.connect_btn = Button(
            text='Connect to PC',
            size_hint=(1, 0.1),
            background_color=(0.29, 0.56, 0.89, 1)
        )
        self.connect_btn.bind(on_press=self.toggle_connection)
        layout.add_widget(self.connect_btn)
        
        # Sensitivity control
        sens_layout = BoxLayout(size_hint=(1, 0.1), spacing=10)
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
        btn_layout = BoxLayout(size_hint=(1, 0.2), spacing=10)
        
        left_btn = Button(text='LEFT', background_color=(0.23, 0.23, 0.23, 1))
        left_btn.bind(on_press=lambda x: self.send_click('left'))
        btn_layout.add_widget(left_btn)
        
        right_btn = Button(text='RIGHT', background_color=(0.23, 0.23, 0.23, 1))
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
        try:
            adapter = BluetoothAdapter.getDefaultAdapter()
            if not adapter:
                self.status_label.text = 'Bluetooth not available'
                return
            
            if not adapter.isEnabled():
                self.status_label.text = 'Please enable Bluetooth'
                return
            
            # Find paired device named "TouchMouse" or similar
            paired_devices = adapter.getBondedDevices().toArray()
            target_device = None
            
            for device in paired_devices:
                if 'PC' in device.getName() or 'DESKTOP' in device.getName():
                    target_device = device
                    break
            
            if not target_device:
                self.status_label.text = 'PC not found. Pair via Bluetooth first.'
                return
            
            # Connect via RFCOMM
            uuid_obj = UUID.fromString(self.uuid)
            self.socket = target_device.createRfcommSocketToServiceRecord(uuid_obj)
            self.socket.connect()
            
            self.connected = True
            self.status_label.text = f'Connected to {target_device.getName()}'
            self.connect_btn.text = 'Disconnect'
            self.connect_btn.background_color = (0.15, 0.68, 0.38, 1)
            
        except Exception as e:
            self.status_label.text = f'Connection failed: {str(e)}'
            self.connected = False
    
    def disconnect(self):
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
        
        self.connected = False
        self.status_label.text = 'Disconnected'
        self.connect_btn.text = 'Connect to PC'
        self.connect_btn.background_color = (0.29, 0.56, 0.89, 1)
    
    def send_command(self, command):
        if not self.connected or not self.socket:
            return
        
        try:
            data = json.dumps(command).encode('utf-8')
            output_stream = self.socket.getOutputStream()
            output_stream.write(data)
            output_stream.flush()
        except Exception as e:
            print(f"Send error: {e}")
            self.disconnect()
    
    def send_click(self, button):
        self.send_command({'type': 'click', 'button': button})
    
    def on_sensitivity_change(self, instance, value):
        self.sensitivity = value
        self.sens_label.text = f'{value:.1f}x'
        self.send_command({'type': 'sensitivity', 'value': value})

if __name__ == '__main__':
    TouchMouseApp().run()
