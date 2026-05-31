"""Annotation editor for screenshots"""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QColorDialog, QSpinBox, QFileDialog
)
from PyQt6.QtCore import Qt, QPoint
from PyQt6.QtGui import QPainter, QPen, QPixmap, QImage, QColor
from PIL import Image
import pyperclip
from datetime import datetime
import os

class AnnotationEditor(QMainWindow):
    """Editor for annotating screenshots"""
    
    def __init__(self, image):
        super().__init__()
        self.image = image
        self.setWindowTitle("Galaxy - Annotation Editor")
        
        # Convert PIL image to QPixmap
        self.pixmap = self.pil_to_qpixmap(image)
        self.drawing = False
        self.last_point = QPoint()
        self.pen_color = QColor(255, 0, 0)
        self.pen_width = 3
        
        self.init_ui()
        
    def init_ui(self):
        """Initialize UI"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout()
        central_widget.setLayout(layout)
        
        # Toolbar
        toolbar = QHBoxLayout()
        
        self.btn_pen = QPushButton("✏️ Pen")
        self.btn_pen.clicked.connect(self.select_pen)
        toolbar.addWidget(self.btn_pen)
        
        self.btn_color = QPushButton("🎨 Color")
        self.btn_color.clicked.connect(self.select_color)
        toolbar.addWidget(self.btn_color)
        
        self.spin_width = QSpinBox()
        self.spin_width.setRange(1, 20)
        self.spin_width.setValue(3)
        self.spin_width.valueChanged.connect(self.change_pen_width)
        toolbar.addWidget(QLabel("Width:"))
        toolbar.addWidget(self.spin_width)
        
        toolbar.addStretch()
        
        self.btn_save = QPushButton("💾 Save")
        self.btn_save.clicked.connect(self.save_image)
        toolbar.addWidget(self.btn_save)
        
        self.btn_copy = QPushButton("📋 Copy")
        self.btn_copy.clicked.connect(self.copy_to_clipboard)
        toolbar.addWidget(self.btn_copy)
        
        self.btn_close = QPushButton("❌ Close")
        self.btn_close.clicked.connect(self.close)
        toolbar.addWidget(self.btn_close)
        
        layout.addLayout(toolbar)
        
        # Canvas
        self.canvas = QLabel()
        self.canvas.setPixmap(self.pixmap)
        self.canvas.setMouseTracking(True)
        layout.addWidget(self.canvas)
        
        self.resize(self.pixmap.width() + 50, self.pixmap.height() + 100)
        
    def pil_to_qpixmap(self, pil_image):
        """Convert PIL Image to QPixmap"""
        img_data = pil_image.convert("RGBA").tobytes("raw", "RGBA")
        qimage = QImage(img_data, pil_image.width, pil_image.height, QImage.Format.Format_RGBA8888)
        return QPixmap.fromImage(qimage)
        
    def select_pen(self):
        """Select pen tool"""
        pass
        
    def select_color(self):
        """Select pen color"""
        color = QColorDialog.getColor()
        if color.isValid():
            self.pen_color = color
            
    def change_pen_width(self, value):
        """Change pen width"""
        self.pen_width = value
        
    def save_image(self):
        """Save annotated image"""
        # Create screenshots directory
        screenshots_dir = os.path.join(os.path.expanduser("~"), "Galaxy_Screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"screenshot_{timestamp}.png"
        filepath = os.path.join(screenshots_dir, filename)
        
        # Save
        self.pixmap.save(filepath)
        print(f"Saved to: {filepath}")
        
    def copy_to_clipboard(self):
        """Copy image to clipboard"""
        # Save to temp file and copy path
        temp_path = os.path.join(os.path.expanduser("~"), "temp_screenshot.png")
        self.pixmap.save(temp_path)
        pyperclip.copy(temp_path)
        print("Copied to clipboard!")
        
    def mousePressEvent(self, event):
        """Handle mouse press for drawing"""
        if event.button() == Qt.MouseButton.LeftButton:
            self.drawing = True
            self.last_point = event.pos()
            
    def mouseMoveEvent(self, event):
        """Handle mouse move for drawing"""
        if self.drawing:
            painter = QPainter(self.pixmap)
            pen = QPen(self.pen_color, self.pen_width, Qt.PenStyle.SolidLine)
            painter.setPen(pen)
            painter.drawLine(self.last_point, event.pos())
            self.last_point = event.pos()
            self.canvas.setPixmap(self.pixmap)
            
    def mouseReleaseEvent(self, event):
        """Handle mouse release"""
        if event.button() == Qt.MouseButton.LeftButton:
            self.drawing = False
