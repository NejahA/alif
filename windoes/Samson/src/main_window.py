"""Main window for Galaxy application"""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QSystemTrayIcon, QMenu, QApplication
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QIcon, QAction
from .screenshot_capture import ScreenshotCapture
from .annotation_editor import AnnotationEditor
from .settings_dialog import SettingsDialog
from .history_viewer import HistoryViewer

class MainWindow(QMainWindow):
    """Main application window"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Galaxy - Screenshot Tool")
        self.setGeometry(100, 100, 900, 700)
        
        self.screenshot_capture = ScreenshotCapture()
        self.annotation_editor = None
        self.tray_icon = None
        
        self.init_ui()
        
    def init_ui(self):
        """Initialize the user interface"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout()
        central_widget.setLayout(layout)
        
        # Title
        title = QLabel("Galaxy Screenshot Tool")
        title.setStyleSheet("font-size: 24px; font-weight: bold; padding: 20px;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        # Capture buttons
        button_layout = QHBoxLayout()
        
        self.btn_fullscreen = QPushButton("📸 Capture Fullscreen")
        self.btn_fullscreen.setStyleSheet(self.get_button_style("#4CAF50"))
        self.btn_fullscreen.clicked.connect(self.capture_fullscreen)
        button_layout.addWidget(self.btn_fullscreen)
        
        self.btn_region = QPushButton("✂️ Capture Region")
        self.btn_region.setStyleSheet(self.get_button_style("#2196F3"))
        self.btn_region.clicked.connect(self.capture_region)
        button_layout.addWidget(self.btn_region)
        
        layout.addLayout(button_layout)
        
        # Quick actions
        action_layout = QHBoxLayout()
        
        self.btn_history = QPushButton("📂 History")
        self.btn_history.clicked.connect(self.show_history)
        action_layout.addWidget(self.btn_history)
        
        self.btn_settings = QPushButton("⚙️ Settings")
        self.btn_settings.clicked.connect(self.show_settings)
        action_layout.addWidget(self.btn_settings)
        
        self.btn_ocr = QPushButton("🔍 OCR Extract")
        self.btn_ocr.clicked.connect(self.extract_text_ocr)
        action_layout.addWidget(self.btn_ocr)
        
        layout.addLayout(action_layout)
        
        # Status label
        self.status_label = QLabel("Ready to capture")
        self.status_label.setStyleSheet("padding: 10px; background: #f0f0f0; border-radius: 5px;")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.status_label)
        
        # Info section
        info_text = """
        <h3>Keyboard Shortcuts:</h3>
        <ul>
            <li><b>Ctrl+Shift+S</b> - Capture region</li>
            <li><b>Ctrl+Shift+F</b> - Capture fullscreen</li>
            <li><b>Ctrl+Shift+H</b> - Show history</li>
        </ul>
        """
        info_label = QLabel(info_text)
        info_label.setStyleSheet("padding: 20px;")
        layout.addWidget(info_label)
        
        layout.addStretch()
        
    def get_button_style(self, color):
        """Get styled button CSS"""
        return f"""
            QPushButton {{
                background-color: {color};
                color: white;
                border: none;
                padding: 15px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
            }}
            QPushButton:hover {{
                background-color: {color}dd;
            }}
            QPushButton:pressed {{
                background-color: {color}aa;
            }}
        """
    
    def capture_fullscreen(self):
        """Capture entire screen"""
        self.hide()
        QTimer.singleShot(200, self._do_fullscreen_capture)
        
    def _do_fullscreen_capture(self):
        """Execute fullscreen capture"""
        image = self.screenshot_capture.capture_fullscreen()
        if image:
            self.open_annotation_editor(image)
        self.show()
        
    def capture_region(self):
        """Capture selected region"""
        self.hide()
        QTimer.singleShot(200, self._do_region_capture)
        
    def _do_region_capture(self):
        """Execute region capture"""
        image = self.screenshot_capture.capture_region()
        if image:
            self.open_annotation_editor(image)
        self.show()
        
    def open_annotation_editor(self, image):
        """Open annotation editor with captured image"""
        self.annotation_editor = AnnotationEditor(image)
        self.annotation_editor.show()
        self.update_status("Screenshot captured! Opening editor...")
        
    def show_history(self):
        """Show screenshot history"""
        history = HistoryViewer()
        history.exec()
        
    def show_settings(self):
        """Show settings dialog"""
        settings = SettingsDialog()
        settings.exec()
        
    def extract_text_ocr(self):
        """Extract text using OCR from last screenshot"""
        self.update_status("OCR feature - capture a screenshot first")
        
    def update_status(self, message):
        """Update status label"""
        self.status_label.setText(message)
        
    def show_tray_icon(self):
        """Show system tray icon"""
        self.tray_icon = QSystemTrayIcon(self)
        # Note: You'll need to create an icon file
        # self.tray_icon.setIcon(QIcon("icon.png"))
        
        tray_menu = QMenu()
        
        capture_action = QAction("Capture Region", self)
        capture_action.triggered.connect(self.capture_region)
        tray_menu.addAction(capture_action)
        
        show_action = QAction("Show Window", self)
        show_action.triggered.connect(self.show)
        tray_menu.addAction(show_action)
        
        quit_action = QAction("Quit", self)
        quit_action.triggered.connect(QApplication.quit)
        tray_menu.addAction(quit_action)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()
