"""Screenshot history viewer"""

from PyQt6.QtWidgets import QDialog, QVBoxLayout, QLabel

class HistoryViewer(QDialog):
    """View screenshot history"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Screenshot History")
        self.setGeometry(200, 200, 600, 400)
        
        layout = QVBoxLayout()
        self.setLayout(layout)
        
        label = QLabel("History viewer coming soon...")
        layout.addWidget(label)
