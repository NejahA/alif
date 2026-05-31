"""Region selection overlay"""

from PyQt6.QtWidgets import QDialog, QApplication
from PyQt6.QtCore import Qt, QRect, QPoint
from PyQt6.QtGui import QPainter, QColor, QPen

class RegionSelector(QDialog):
    """Overlay for selecting screen region"""
    
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setWindowOpacity(0.3)
        
        # Get screen geometry
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
        
        self.start_point = None
        self.end_point = None
        self.selected_rect = None
        
    def mousePressEvent(self, event):
        """Handle mouse press"""
        self.start_point = event.pos()
        
    def mouseMoveEvent(self, event):
        """Handle mouse move"""
        if self.start_point:
            self.end_point = event.pos()
            self.update()
            
    def mouseReleaseEvent(self, event):
        """Handle mouse release"""
        if self.start_point and self.end_point:
            self.selected_rect = QRect(self.start_point, self.end_point).normalized()
            self.accept()
            
    def paintEvent(self, event):
        """Paint the selection rectangle"""
        painter = QPainter(self)
        
        # Draw semi-transparent overlay
        painter.fillRect(self.rect(), QColor(0, 0, 0, 100))
        
        # Draw selection rectangle
        if self.start_point and self.end_point:
            rect = QRect(self.start_point, self.end_point).normalized()
            
            # Clear selected area
            painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_Clear)
            painter.fillRect(rect, Qt.GlobalColor.transparent)
            
            # Draw border
            painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_SourceOver)
            pen = QPen(QColor(0, 120, 215), 2)
            painter.setPen(pen)
            painter.drawRect(rect)
            
            # Draw dimensions
            painter.setPen(QColor(255, 255, 255))
            text = f"{rect.width()} x {rect.height()}"
            painter.drawText(rect.bottomRight() + QPoint(5, 5), text)
            
    def get_selected_region(self):
        """Get the selected region"""
        return self.selected_rect
