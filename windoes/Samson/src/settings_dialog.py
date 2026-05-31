"""Settings dialog"""

from PyQt6.QtWidgets import QDialog, QVBoxLayout, QLabel

class SettingsDialog(QDialog):
    """Settings configuration dialog"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Settings")
        self.setGeometry(200, 200, 400, 300)
        
        layout = QVBoxLayout()
        self.setLayout(layout)
        
        label = QLabel("Settings coming soon...")
        layout.addWidget(label)
