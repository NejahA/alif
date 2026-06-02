"""
 █████╗ ██╗     ██╗   ██╗ ██████╗ █████╗ ██████╗ ██████╗
██╔══██╗██║     ██║   ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗
███████║██║     ██║   ██║██║     ███████║██████╔╝██║  ██║
██╔══██║██║     ██║   ██║██║     ██╔══██║██╔══██╗██║  ██║
██║  ██║███████╗╚██████╔╝╚██████╗██║  ██║██║  ██║██████╔╝
╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝

Alucard Desktop — Scientific Calculator · Arabic Abjad · Gematria
Cross-platform: Linux & Windows (PyQt6)
"""

import sys
import math
import re
from functools import reduce

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QGridLayout, QTabWidget, QLabel, QPushButton, QTextEdit,
    QTableWidget, QTableWidgetItem, QHeaderView, QScrollArea,
    QFrame, QSizePolicy, QButtonGroup, QLineEdit, QComboBox,
    QSplitter, QGroupBox, QSpacerItem
)
from PyQt6.QtCore import Qt, QSize, QTimer, pyqtSignal
from PyQt6.QtGui import QFont, QColor, QPalette, QIcon, QFontDatabase

# ─────────────────────────────────────────────
#  GLOBAL STYLESHEET
# ─────────────────────────────────────────────
DARK_QSS = """
QMainWindow, QWidget {
    background-color: #0b0c10;
    color: #e8e9f0;
    font-family: "Segoe UI", "Inter", "Helvetica Neue", sans-serif;
    font-size: 13px;
}

QTabWidget::pane {
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    background: #13141a;
    padding: 4px;
}

QTabBar::tab {
    background: #13141a;
    color: #9a9bb5;
    padding: 10px 22px;
    border: 1px solid rgba(255,255,255,0.06);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    margin-right: 3px;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
}
QTabBar::tab:selected {
    background: qlineargradient(x1:0,y1:0,x2:1,y2:1,stop:0 #7b5ea7, stop:1 #5c3d8f);
    color: #ffffff;
    border-color: #7b5ea7;
}
QTabBar::tab:hover:!selected {
    background: #1c1d27;
    color: #e8e9f0;
}

QScrollBar:vertical {
    background: #0b0c10;
    width: 6px;
    border-radius: 3px;
}
QScrollBar::handle:vertical {
    background: #2a2b3d;
    border-radius: 3px;
    min-height: 20px;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0; }

QScrollBar:horizontal {
    background: #0b0c10;
    height: 6px;
    border-radius: 3px;
}
QScrollBar::handle:horizontal {
    background: #2a2b3d;
    border-radius: 3px;
}

QTextEdit {
    background: #0b0c10;
    color: #e8e9f0;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    selection-background-color: #7b5ea7;
}
QTextEdit:focus {
    border-color: #a37bd4;
}

QTableWidget {
    background: #0b0c10;
    color: #e8e9f0;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    gridline-color: rgba(255,255,255,0.06);
    font-size: 12px;
}
QTableWidget::item {
    padding: 5px 10px;
    border: none;
}
QTableWidget::item:selected {
    background: rgba(123,94,167,0.3);
    color: #e8e9f0;
}
QHeaderView::section {
    background: #1c1d27;
    color: #5c5d78;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

QLabel { background: transparent; }

QComboBox {
    background: #1c1d27;
    color: #e8e9f0;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
}
QComboBox::drop-down {
    border: none;
    width: 20px;
}
QComboBox QAbstractItemView {
    background: #1c1d27;
    color: #e8e9f0;
    border: 1px solid rgba(255,255,255,0.1);
    selection-background-color: #7b5ea7;
}

QFrame[frameShape="4"] {  /* HLine */
    color: rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.07);
    height: 1px;
    border: none;
}
"""

BTN_BASE = """
    QPushButton {{
        background: {bg};
        color: {fg};
        border: 1px solid {border};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        padding: 0;
    }}
    QPushButton:hover {{
        background: {hover};
        border-color: {hover_border};
    }}
    QPushButton:pressed {{
        background: {pressed};
    }}
"""

def btn_style(kind):
    styles = {
        'num':   dict(bg='#1c1d27', fg='#e8e9f0', border='rgba(255,255,255,0.07)',
                      hover='#232435', hover_border='rgba(255,255,255,0.12)', pressed='#141520'),
        'op':    dict(bg='rgba(123,94,167,0.18)', fg='#c9a8ff', border='rgba(123,94,167,0.28)',
                      hover='rgba(123,94,167,0.28)', hover_border='#a37bd4', pressed='rgba(123,94,167,0.12)'),
        'fn':    dict(bg='rgba(62,207,207,0.09)', fg='#3ecfcf', border='rgba(62,207,207,0.18)',
                      hover='rgba(62,207,207,0.16)', hover_border='#3ecfcf', pressed='rgba(62,207,207,0.06)'),
        'eq':    dict(bg='#7b5ea7', fg='#ffffff', border='#7b5ea7',
                      hover='#9170c4', hover_border='#9170c4', pressed='#5c3d8f'),
        'clear': dict(bg='rgba(224,92,106,0.12)', fg='#e05c6a', border='rgba(224,92,106,0.22)',
                      hover='rgba(224,92,106,0.2)', hover_border='#e05c6a', pressed='rgba(224,92,106,0.08)'),
        'gold':  dict(bg='rgba(212,168,75,0.1)', fg='#f0c96d', border='rgba(212,168,75,0.18)',
                      hover='rgba(212,168,75,0.18)', hover_border='#d4a84b', pressed='rgba(212,168,75,0.06)'),
    }
    d = styles.get(kind, styles['num'])
    return BTN_BASE.format(**d)


# ─────────────────────────────────────────────
#  MATH ENGINE
# ─────────────────────────────────────────────
def fact(n):
    n = int(round(n))
    if n < 0: return float('nan')
    if n > 170: return float('inf')
    r = 1
    for i in range(2, n+1):
        r *= i
    return r

def ncr(n, r): return fact(n) / (fact(r) * fact(int(n)-int(r)))
def npr(n, r): return fact(n) / fact(int(n)-int(r))

def gcd(a, b):
    a, b = abs(int(round(a))), abs(int(round(b)))
    while b:
        a, b = b, a % b
    return a

def lcm(a, b): return abs(a * b) / gcd(a, b)
def mod_(a, b): return a % b
def to_bin(n): return bin(int(round(n)))
def to_oct(n): return oct(int(round(n)))
def to_hex(n): return hex(int(round(n))).upper()
def from_bin(n): return int(str(int(n)), 2)
def deg_to_rad(d): return d * math.pi / 180
def rad_to_deg(r): return r * 180 / math.pi
def km_to_mile(k): return k * 0.621371
def mile_to_km(m): return m * 1.60934
def kg_to_lb(k): return k * 2.20462
def lb_to_kg(l): return l * 0.453592
def cel_to_far(c): return c * 9/5 + 32
def far_to_cel(f): return (f - 32) * 5/9

SAFE_GLOBALS = {
    '__builtins__': {},
    'sin': lambda x: math.sin(math.radians(x)),
    'cos': lambda x: math.cos(math.radians(x)),
    'tan': lambda x: math.tan(math.radians(x)),
    'asin': lambda x: math.degrees(math.asin(x)),
    'acos': lambda x: math.degrees(math.acos(x)),
    'atan': lambda x: math.degrees(math.atan(x)),
    'sinh': math.sinh, 'cosh': math.cosh, 'tanh': math.tanh,
    'log': math.log10,
    'ln':  math.log,
    'sqrt': math.sqrt,
    'cbrt': lambda x: math.copysign(abs(x)**(1/3), x),
    'abs':  abs,
    'fact': fact,
    'nCr':  ncr, 'nPr': npr,
    'gcd':  gcd, 'lcm': lcm,
    'mod':  mod_,
    'toBin': to_bin, 'toOct': to_oct, 'toHex': to_hex, 'fromBin': from_bin,
    'degToRad': deg_to_rad, 'radToDeg': rad_to_deg,
    'kmToMile': km_to_mile, 'mileToKm': mile_to_km,
    'kgToLb': kg_to_lb, 'lbToKg': lb_to_kg,
    'celToFar': cel_to_far, 'farToCel': far_to_cel,
    'pi': math.pi, 'PI': math.pi,
    'e':  math.e,  'E':  math.e,
    'inf': float('inf'),
}

def smart_format(n):
    if isinstance(n, str): return n
    if isinstance(n, (int,)) and not isinstance(n, bool): return str(n)
    if math.isinf(n): return '∞' if n > 0 else '-∞'
    if math.isnan(n): return 'NaN'
    if abs(n) >= 1e15 or (0 < abs(n) < 1e-10):
        return f'{n:.6e}'
    r = round(n, 12)
    if r == int(r): return str(int(r))
    s = f'{r:.12f}'.rstrip('0').rstrip('.')
    return s

def evaluate(expr: str) -> str:
    expr = (expr
        .replace('×','*').replace('÷','/')
        .replace('π','pi').replace('−','-')
        .replace('^','**')
    )
    # auto-close parentheses
    opens  = expr.count('(')
    closes = expr.count(')')
    expr  += ')' * max(0, opens - closes)
    result = eval(expr, SAFE_GLOBALS)
    return smart_format(result)


# ─────────────────────────────────────────────
#  ABJAD DATA
# ─────────────────────────────────────────────
ABJAD_VALUES = {
    'ا':1,'أ':1,'إ':1,'آ':1,'ء':1,
    'ب':2,'ج':3,'د':4,'ه':5,'ة':5,
    'و':6,'ز':7,'ح':8,'ط':9,
    'ي':10,'ى':10,'ئ':10,
    'ك':20,'ل':30,'م':40,'ن':50,
    'س':60,'ع':70,'ف':80,'ص':90,
    'ق':100,'ر':200,'ش':300,'ت':400,
    'ث':500,'خ':600,'ذ':700,'ض':800,
    'ظ':900,'غ':1000
}
ABJAD_NAMES = {
    'ا':'Alif','أ':'Alif','إ':'Alif','آ':'Alif Madda','ء':'Hamza',
    'ب':'Ba','ج':'Jim','د':'Dal','ه':'Ha','ة':"Ta' Marb.",
    'و':'Waw','ز':'Zayn','ح':'Ha (ح)','ط':'Ta (ط)',
    'ي':'Ya','ى':'Alif Maqsura','ئ':'Ya (ئ)',
    'ك':'Kaf','ل':'Lam','م':'Mim','ن':'Nun',
    'س':'Sin','ع':'Ayn','ف':'Fa','ص':'Sad',
    'ق':'Qaf','ر':'Ra','ش':'Shin','ت':'Ta',
    'ث':'Tha','خ':'Kha','ذ':'Dhal','ض':'Dad',
    'ظ':'Dha (ظ)','غ':'Ghayn'
}
ABJAD_REF = [
    ('ا',1),('ب',2),('ج',3),('د',4),('ه',5),('و',6),
    ('ز',7),('ح',8),('ط',9),('ي',10),('ك',20),('ل',30),
    ('م',40),('ن',50),('س',60),('ع',70),('ف',80),('ص',90),
    ('ق',100),('ر',200),('ش',300),('ت',400),('ث',500),('خ',600),
    ('ذ',700),('ض',800),('ظ',900),('غ',1000)
]

def digit_root(n):
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n


# ─────────────────────────────────────────────
#  GEMATRIA DATA
# ─────────────────────────────────────────────
PRIMES_26 = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101]

HEBREW_VALS = {
    'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
    'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,
    'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,
    'ק':100,'ר':200,'ש':300,'ת':400
}
HEBREW_GADOL = {
    'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
    'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,
    'ק':100,'ר':200,'ש':300,'ת':400,
    'ך':500,'ם':600,'ן':700,'ף':800,'ץ':900
}

GREEK_VALS = {
    'α':1,'Α':1,'β':2,'Β':2,'γ':3,'Γ':3,'δ':4,'Δ':4,'ε':5,'Ε':5,
    'ζ':7,'Ζ':7,'η':8,'Η':8,'θ':9,'Θ':9,
    'ι':10,'Ι':10,'κ':20,'Κ':20,'λ':30,'Λ':30,'μ':40,'Μ':40,
    'ν':50,'Ν':50,'ξ':60,'Ξ':60,'ο':70,'Ο':70,'π':80,'Π':80,
    'ρ':100,'Ρ':100,'σ':200,'Σ':200,'ς':200,'τ':300,'Τ':300,
    'υ':400,'Υ':400,'φ':500,'Φ':500,'χ':600,'Χ':600,
    'ψ':700,'Ψ':700,'ω':800,'Ω':800
}

LATIN_CLASSICAL = {
    'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7,'H':8,'I':9,'J':9,
    'K':10,'L':11,'M':12,'N':13,'O':14,'P':15,'Q':16,'R':17,
    'S':18,'T':19,'V':20,'U':20,'X':21,'Y':22,'Z':23
}


# ─────────────────────────────────────────────
#  REUSABLE WIDGETS
# ─────────────────────────────────────────────
class SectionLabel(QLabel):
    def __init__(self, text, color='#9a9bb5', size=11, bold=False, parent=None):
        super().__init__(text, parent)
        self.setStyleSheet(
            f"color: {color}; font-size: {size}px; "
            f"font-weight: {'700' if bold else '500'}; "
            f"text-transform: uppercase; letter-spacing: 1px;"
        )

class BigLabel(QLabel):
    def __init__(self, text, color='#e8e9f0', size=24, parent=None):
        super().__init__(text, parent)
        self.setStyleSheet(
            f"color: {color}; font-size: {size}px; font-weight: 700; "
            f"font-family: 'JetBrains Mono', 'Consolas', monospace;"
        )
        self.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

class Divider(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFrameShape(QFrame.Shape.HLine)
        self.setStyleSheet("color: rgba(255,255,255,0.07); background: rgba(255,255,255,0.07); max-height: 1px;")

class StatCard(QFrame):
    def __init__(self, label, value_color='#f0c96d', parent=None):
        super().__init__(parent)
        self.setStyleSheet("""
            QFrame { background: #1c1d27; border: 1px solid rgba(255,255,255,0.07);
                     border-radius: 8px; }
        """)
        lay = QVBoxLayout(self)
        lay.setContentsMargins(12, 10, 12, 10)
        lay.setSpacing(4)
        self.lbl = SectionLabel(label)
        self.val = QLabel('—')
        self.val.setStyleSheet(
            f"color: {value_color}; font-size: 22px; font-weight: 700; "
            f"font-family: 'JetBrains Mono','Consolas',monospace; background: transparent;"
        )
        self.val.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(self.lbl)
        lay.addWidget(self.val)

    def set_value(self, v): self.val.setText(str(v))


def make_btn(text, kind='num', min_h=52, font_size=14, parent=None):
    b = QPushButton(text, parent)
    b.setMinimumHeight(min_h)
    b.setStyleSheet(btn_style(kind) + f"QPushButton {{ font-size: {font_size}px; }}")
    b.setCursor(Qt.CursorShape.PointingHandCursor)
    return b


# ─────────────────────────────────────────────
#  TAB 1: CALCULATOR
# ─────────────────────────────────────────────
class CalculatorTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.expr = ''
        self.history = ''
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(14, 14, 14, 14)
        root.setSpacing(10)

        # Display
        disp_frame = QFrame()
        disp_frame.setStyleSheet("""
            QFrame { background: #0b0c10; border: 1px solid rgba(255,255,255,0.1);
                     border-radius: 10px; }
        """)
        disp_lay = QVBoxLayout(disp_frame)
        disp_lay.setContentsMargins(16, 12, 16, 12)
        disp_lay.setSpacing(4)

        self.hist_lbl = QLabel('')
        self.hist_lbl.setStyleSheet("color: #3d3e55; font-size: 11px; font-family: 'Consolas','monospace'; background: transparent;")
        self.hist_lbl.setAlignment(Qt.AlignmentFlag.AlignRight)

        self.expr_lbl = QLabel('')
        self.expr_lbl.setStyleSheet("color: #9a9bb5; font-size: 13px; font-family: 'Consolas','monospace'; background: transparent;")
        self.expr_lbl.setAlignment(Qt.AlignmentFlag.AlignRight)

        self.res_lbl = QLabel('0')
        self.res_lbl.setStyleSheet("color: #e8e9f0; font-size: 28px; font-weight: 700; font-family: 'Consolas','monospace'; background: transparent;")
        self.res_lbl.setAlignment(Qt.AlignmentFlag.AlignRight)
        self.res_lbl.setWordWrap(True)

        disp_lay.addWidget(self.hist_lbl)
        disp_lay.addWidget(self.expr_lbl)
        disp_lay.addWidget(self.res_lbl)
        root.addWidget(disp_frame)

        # Mode buttons
        mode_lay = QHBoxLayout()
        mode_lay.setSpacing(6)
        self.mode_btns = {}
        for m in ['Basic','Scientific','Conversion']:
            b = QPushButton(m)
            b.setCheckable(True)
            b.setCursor(Qt.CursorShape.PointingHandCursor)
            b.setMinimumHeight(32)
            b.setStyleSheet("""
                QPushButton { background:#1c1d27; color:#9a9bb5; border:1px solid rgba(255,255,255,0.07);
                              border-radius:6px; font-size:11px; font-weight:700; letter-spacing:0.5px; }
                QPushButton:checked { background:rgba(62,207,207,0.12); color:#3ecfcf; border-color:#3ecfcf; }
                QPushButton:hover:!checked { background:#232435; color:#e8e9f0; }
            """)
            b.clicked.connect(lambda _, name=m: self._set_mode(name))
            mode_lay.addWidget(b)
            self.mode_btns[m] = b
        self.mode_btns['Basic'].setChecked(True)
        root.addLayout(mode_lay)

        # Scientific panel
        self.sci_frame = QFrame()
        self.sci_frame.setVisible(False)
        self.sci_frame.setStyleSheet("QFrame { background: #0f1016; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); }")
        sci_lay = QGridLayout(self.sci_frame)
        sci_lay.setSpacing(5)
        sci_lay.setContentsMargins(8,8,8,8)
        sci_btns = [
            ('sin','fn'),('cos','fn'),('tan','fn'),('asin','fn'),('acos','fn'),
            ('atan','fn'),('log','fn'),('ln','fn'),('√','fn'),('∛','fn'),
            ('|x|','fn'),('n!','fn'),('π','fn'),('e','fn'),('xⁿ','fn'),
            ('nCr','fn'),('nPr','fn'),('GCD','fn'),('LCM','fn'),('mod','fn'),
        ]
        SCI_MAP = {
            'sin':'sin(','cos':'cos(','tan':'tan(','asin':'asin(',
            'acos':'acos(','atan':'atan(','log':'log(','ln':'ln(',
            '√':'sqrt(','∛':'cbrt(','|x|':'abs(','n!':'fact(',
            'π':'pi','e':'e','xⁿ':'**','nCr':'nCr(','nPr':'nPr(',
            'GCD':'gcd(','LCM':'lcm(','mod':'mod('
        }
        for i,(txt,kind) in enumerate(sci_btns):
            b = make_btn(txt, kind, min_h=36, font_size=12)
            b.clicked.connect(lambda _, t=SCI_MAP[txt]: self._append(t))
            sci_lay.addWidget(b, i//5, i%5)
        root.addWidget(self.sci_frame)

        # Conversion panel
        self.conv_frame = QFrame()
        self.conv_frame.setVisible(False)
        self.conv_frame.setStyleSheet("QFrame { background: #0f1016; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); }")
        conv_lay = QGridLayout(self.conv_frame)
        conv_lay.setSpacing(5)
        conv_lay.setContentsMargins(8,8,8,8)
        conv_btns = [
            ('°→rad','degToRad('), ('rad→°','radToDeg('),
            ('km→mi','kmToMile('), ('mi→km','mileToKm('),
            ('kg→lb','kgToLb('),  ('lb→kg','lbToKg('),
            ('°C→°F','celToFar('), ('°F→°C','farToCel('),
            ('→Bin','toBin('),    ('→Oct','toOct('),
            ('→Hex','toHex('),    ('Bin→','fromBin('),
        ]
        for i,(txt,fn) in enumerate(conv_btns):
            b = make_btn(txt,'fn',min_h=36,font_size=11)
            b.clicked.connect(lambda _, f=fn: self._append(f))
            conv_lay.addWidget(b, i//4, i%4)
        root.addWidget(self.conv_frame)

        # Main button grid
        grid = QGridLayout()
        grid.setSpacing(7)
        main_btns = [
            [('AC','clear'),('⌫','gold'),('(','gold'),(')','gold')],
            [('7','num'),('8','num'),('9','num'),('÷','op')],
            [('4','num'),('5','num'),('6','num'),('×','op')],
            [('1','num'),('2','num'),('3','num'),('−','op')],
            [('0','num'),('.','num'),('%','gold'),('+','op')],
            [('x²','gold'),('1/x','gold'),('',''),('=','eq')],
        ]
        MAIN_MAP = {
            '÷':'/','×':'*','−':'-','+':'+','%':'%',
            'x²':'**2','1/x':'1/(',
            'AC':'AC','⌫':'DEL','(':'(',')':"),'=':'='
        }
        for row,btns in enumerate(main_btns):
            col_offset = 0
            for col,( txt,kind) in enumerate(btns):
                if not txt: continue
                b = make_btn(txt,kind,min_h=54)
                if txt == '=':
                    b.clicked.connect(self._calculate)
                elif txt == 'AC':
                    b.clicked.connect(self._clear)
                elif txt == '⌫':
                    b.clicked.connect(self._delete)
                elif txt in MAIN_MAP:
                    v = MAIN_MAP[txt]
                    b.clicked.connect(lambda _, val=v: self._append(val))
                else:
                    b.clicked.connect(lambda _, val=txt: self._append(val))
                grid.addWidget(b, row, col)
        root.addLayout(grid)

    def _set_mode(self, name):
        for m,b in self.mode_btns.items():
            b.setChecked(m == name)
        self.sci_frame.setVisible(name == 'Scientific')
        self.conv_frame.setVisible(name == 'Conversion')

    def _append(self, v):
        self.expr += v
        self.expr_lbl.setText(self.expr)

    def _delete(self):
        self.expr = self.expr[:-1]
        self.expr_lbl.setText(self.expr)

    def _clear(self):
        self.expr = ''
        self.hist_lbl.setText('')
        self.expr_lbl.setText('')
        self.res_lbl.setText('0')
        self.res_lbl.setStyleSheet("color: #e8e9f0; font-size: 28px; font-weight: 700; font-family: 'Consolas','monospace'; background: transparent;")

    def _calculate(self):
        if not self.expr.strip(): return
        try:
            result = evaluate(self.expr)
            self.hist_lbl.setText(self.expr + ' =')
            self.res_lbl.setStyleSheet("color: #e8e9f0; font-size: 28px; font-weight: 700; font-family: 'Consolas','monospace'; background: transparent;")
            self.res_lbl.setText(result)
            self.expr = result if not any(c in result for c in ['0b','0o','0x','∞']) else ''
            self.expr_lbl.setText('')
        except Exception as ex:
            self.res_lbl.setStyleSheet("color: #e05c6a; font-size: 20px; font-weight: 700; font-family: 'Consolas','monospace'; background: transparent;")
            self.res_lbl.setText('Syntax Error')

    def keyPressEvent(self, event):
        key = event.key()
        text = event.text()
        if text in '0123456789.+-*/(). ':
            self._append(text)
        elif text == '/':
            self._append('/')
        elif key == Qt.Key.Key_Return or key == Qt.Key.Key_Enter:
            self._calculate()
        elif key == Qt.Key.Key_Backspace:
            self._delete()
        elif key == Qt.Key.Key_Escape:
            self._clear()
        else:
            super().keyPressEvent(event)


# ─────────────────────────────────────────────
#  TAB 2: ARABIC ABJAD
# ─────────────────────────────────────────────
class AbjadTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(14, 14, 14, 14)
        root.setSpacing(12)

        # Header
        title = QLabel('حساب الجُمَّل — Arabic Abjad')
        title.setStyleSheet("color: #f0c96d; font-size: 16px; font-weight: 700; background: transparent;")
        title.setAlignment(Qt.AlignmentFlag.AlignRight)
        root.addWidget(title)

        sub = QLabel('The ancient Arabic numerological system assigning numerical values to each letter.\nType Arabic text below to calculate its Abjad value.')
        sub.setStyleSheet("color: #5c5d78; font-size: 11px; background: transparent;")
        sub.setWordWrap(True)
        root.addWidget(sub)

        # Input
        self.text_input = QTextEdit()
        self.text_input.setPlaceholderText('اكتب النص العربي هنا...')
        self.text_input.setLayoutDirection(Qt.LayoutDirection.RightToLeft)
        self.text_input.setMaximumHeight(100)
        font = QFont()
        font.setFamily('Noto Naskh Arabic')
        font.setPointSize(16)
        self.text_input.setFont(font)
        self.text_input.textChanged.connect(self._compute)
        root.addWidget(self.text_input)

        # Action row
        btn_row = QHBoxLayout()
        clear_btn = QPushButton('Clear')
        clear_btn.setStyleSheet(btn_style('clear') + "QPushButton { min-height: 36px; font-size: 12px; font-weight: 600; }")
        clear_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        clear_btn.clicked.connect(lambda: (self.text_input.clear(), self._compute()))
        calc_btn = QPushButton('Calculate Abjad')
        calc_btn.setStyleSheet(btn_style('eq').replace('#7b5ea7','#d4a84b').replace('#9170c4','#b89040').replace('#5c3d8f','#9a7530') + "QPushButton { min-height: 36px; font-size: 12px; font-weight: 700; }")
        calc_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        calc_btn.clicked.connect(self._compute)
        btn_row.addWidget(clear_btn)
        btn_row.addWidget(calc_btn)
        root.addLayout(btn_row)

        # Result cards
        cards_lay = QHBoxLayout()
        cards_lay.setSpacing(8)
        self.card_total = StatCard('Total Abjad Value', '#f0c96d')
        self.card_count = StatCard('Letter Count', '#c9a8ff')
        self.card_root  = StatCard('Digit Root', '#72e8e8')
        cards_lay.addWidget(self.card_total)
        cards_lay.addWidget(self.card_count)
        cards_lay.addWidget(self.card_root)
        root.addLayout(cards_lay)

        root.addWidget(Divider())

        # Breakdown label
        lbl = SectionLabel('Letter Breakdown', '#5c5d78', bold=True)
        root.addWidget(lbl)

        # Breakdown table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(['Letter','Name','Value','Count','Subtotal'])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        self.table.setAlternatingRowColors(False)
        self.table.setMaximumHeight(180)
        root.addWidget(self.table)

        root.addWidget(Divider())

        # Reference grid
        ref_lbl = SectionLabel('Reference — Click to Insert', '#5c5d78', bold=True)
        root.addWidget(ref_lbl)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setMaximumHeight(130)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        ref_container = QWidget()
        ref_container.setStyleSheet("background: transparent;")
        ref_grid = QGridLayout(ref_container)
        ref_grid.setSpacing(5)
        ref_grid.setContentsMargins(0,0,0,0)
        for idx,(ch,val) in enumerate(ABJAD_REF):
            btn = QPushButton(f"{ch}\n{val}")
            btn.setStyleSheet("""
                QPushButton { background:#1c1d27; color:#f0c96d; border:1px solid rgba(255,255,255,0.07);
                              border-radius:7px; font-size:14px; font-weight:700; min-height:44px; }
                QPushButton:hover { background:#232435; border-color:#d4a84b; }
                QPushButton:pressed { background:#141520; }
            """)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.clicked.connect(lambda _, c=ch: self._insert_char(c))
            ref_grid.addWidget(btn, idx//7, idx%7)
        scroll.setWidget(ref_container)
        root.addWidget(scroll)

    def _insert_char(self, ch):
        cursor = self.text_input.textCursor()
        cursor.insertText(ch)

    def _compute(self):
        text = self.text_input.toPlainText()
        total = 0
        letter_count = 0
        counts = {}
        for ch in text:
            if ch in ABJAD_VALUES:
                total += ABJAD_VALUES[ch]
                letter_count += 1
                counts[ch] = counts.get(ch, 0) + 1

        self.card_total.set_value(f'{total:,}')
        self.card_count.set_value(str(letter_count))
        self.card_root.set_value(str(digit_root(total)) if total > 0 else '—')

        # Populate table
        self.table.setRowCount(0)
        for ch, cnt in counts.items():
            val = ABJAD_VALUES[ch]
            row = self.table.rowCount()
            self.table.insertRow(row)
            ch_item = QTableWidgetItem(ch)
            ch_item.setFont(QFont('Noto Naskh Arabic', 14))
            ch_item.setForeground(QColor('#f0c96d'))
            ch_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            self.table.setItem(row, 0, ch_item)

            name_item = QTableWidgetItem(ABJAD_NAMES.get(ch,''))
            name_item.setForeground(QColor('#9a9bb5'))
            name_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            self.table.setItem(row, 1, name_item)

            for col, (v, color) in enumerate([(val,'#c9a8ff'),(cnt,'#e8e9f0'),(val*cnt,'#72e8e8')], 2):
                item = QTableWidgetItem(str(v))
                item.setForeground(QColor(color))
                item.setFont(QFont('Consolas', 12))
                item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                self.table.setItem(row, col, item)


# ─────────────────────────────────────────────
#  TAB 3: GEMATRIA
# ─────────────────────────────────────────────
class GematriaTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_system = 'English'
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(14, 14, 14, 14)
        root.setSpacing(10)

        title = QLabel('Gematria & Alphabet Numerology')
        title.setStyleSheet("color: #72e8e8; font-size: 16px; font-weight: 700; background: transparent;")
        root.addWidget(title)

        sub = QLabel('Compute numerical values across multiple ancient and modern alphabet systems.')
        sub.setStyleSheet("color: #5c5d78; font-size: 11px; background: transparent;")
        root.addWidget(sub)

        # System selector
        sys_row = QHBoxLayout()
        sys_row.setSpacing(6)
        self.sys_btns = {}
        for sys in ['English','Hebrew','Greek','Latin']:
            b = QPushButton(sys)
            b.setCheckable(True)
            b.setCursor(Qt.CursorShape.PointingHandCursor)
            b.setMinimumHeight(34)
            b.setStyleSheet("""
                QPushButton { background:#1c1d27; color:#9a9bb5; border:1px solid rgba(255,255,255,0.07);
                              border-radius:7px; font-size:11px; font-weight:700; }
                QPushButton:checked { background:rgba(62,207,207,0.12); color:#72e8e8; border-color:#3ecfcf; }
                QPushButton:hover:!checked { background:#232435; color:#e8e9f0; }
            """)
            b.clicked.connect(lambda _, s=sys: self._select_system(s))
            sys_row.addWidget(b)
            self.sys_btns[sys] = b
        self.sys_btns['English'].setChecked(True)
        root.addLayout(sys_row)

        # Hint bar
        self.hint_lbl = QLabel()
        self.hint_lbl.setStyleSheet("""
            QLabel { background: #1c1d27; color: #5c5d78; border-left: 3px solid #3ecfcf;
                     border-radius: 5px; padding: 7px 10px; font-size: 11px; }
        """)
        self.hint_lbl.setWordWrap(True)
        root.addWidget(self.hint_lbl)

        # Input
        self.text_input = QTextEdit()
        self.text_input.setPlaceholderText('Type your text here...')
        self.text_input.setMaximumHeight(90)
        self.text_input.textChanged.connect(self._compute)
        root.addWidget(self.text_input)

        # Action row
        btn_row = QHBoxLayout()
        clear_btn = QPushButton('Clear')
        clear_btn.setStyleSheet(btn_style('clear') + "QPushButton { min-height: 34px; font-size: 12px; font-weight: 600; }")
        clear_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        clear_btn.clicked.connect(lambda: (self.text_input.clear(), self._compute()))
        calc_btn = QPushButton('Calculate')
        calc_btn.setStyleSheet(btn_style('fn') + "QPushButton { min-height: 34px; font-size: 12px; font-weight: 700; }")
        calc_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        calc_btn.clicked.connect(self._compute)
        btn_row.addWidget(clear_btn)
        btn_row.addWidget(calc_btn)
        root.addLayout(btn_row)

        # Result cards grid
        self.result_frame = QWidget()
        self.result_lay = QGridLayout(self.result_frame)
        self.result_lay.setSpacing(7)
        self.result_lay.setContentsMargins(0,0,0,0)
        root.addWidget(self.result_frame)

        root.addWidget(Divider())

        # Breakdown
        breakdown_lbl = SectionLabel('Letter Breakdown', '#5c5d78', bold=True)
        root.addWidget(breakdown_lbl)

        self.table = QTableWidget()
        self.table.setColumnCount(2)
        self.table.setHorizontalHeaderLabels(['Character','Value'])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setMaximumHeight(150)
        root.addWidget(self.table)

        root.addWidget(Divider())

        # Reference table
        ref_lbl = SectionLabel('Reference Table', '#5c5d78', bold=True)
        root.addWidget(ref_lbl)
        self.ref_table = QTableWidget()
        self.ref_table.verticalHeader().setVisible(False)
        self.ref_table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.ref_table.setMaximumHeight(150)
        root.addWidget(self.ref_table)

        self._select_system('English')

    def _select_system(self, sys):
        self.current_system = sys
        for s,b in self.sys_btns.items():
            b.setChecked(s == sys)

        hints = {
            'English': 'English Gematria — A=1…Z=26. Modes: Ordinal, Reduction (digit root), Primes, Reverse (Z=1).',
            'Hebrew':  'Hebrew Gematria (גִּימַטְרִיָּה) — Standard values per letter. Type Hebrew characters.',
            'Greek':   'Greek Isopsephy (Ἰσοψηφία) — Classical numerical values. Type Greek characters.',
            'Latin':   'Latin/Roman Numerology — Classical (A=1…Z=23, no J/U/W distinction) and Modern (A=1…Z=26).',
        }
        self.hint_lbl.setText(hints.get(sys,''))

        dirs = {'Hebrew': Qt.LayoutDirection.RightToLeft}
        self.text_input.setLayoutDirection(dirs.get(sys, Qt.LayoutDirection.LeftToRight))

        self._build_ref_table(sys)
        self._compute()

    def _build_ref_table(self, sys):
        if sys == 'English':
            cols = ['Letter','Value']
            data = [(chr(65+i), i+1) for i in range(26)]
        elif sys == 'Hebrew':
            cols = ['Letter','Standard','Mispar Gadol']
            data = [(k, HEBREW_VALS.get(k,''), HEBREW_GADOL.get(k,'')) for k in sorted(HEBREW_VALS, key=lambda x: HEBREW_VALS[x])]
        elif sys == 'Greek':
            cols = ['Letter','Value']
            data = [('α',1),('β',2),('γ',3),('δ',4),('ε',5),('ζ',7),('η',8),('θ',9),
                    ('ι',10),('κ',20),('λ',30),('μ',40),('ν',50),('ξ',60),('ο',70),('π',80),
                    ('ρ',100),('σ',200),('τ',300),('υ',400),('φ',500),('χ',600),('ψ',700),('ω',800)]
        else:  # Latin
            cols = ['Letter','Classical','Modern']
            data = [(k, LATIN_CLASSICAL[k], ord(k)-64) for k in sorted(LATIN_CLASSICAL.keys())]

        self.ref_table.setColumnCount(len(cols))
        self.ref_table.setHorizontalHeaderLabels(cols)
        self.ref_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.ref_table.setRowCount(len(data))
        colors = ['#c9a8ff','#72e8e8','#f0c96d','#4ecb8d']
        for row, d in enumerate(data):
            for col, v in enumerate(d):
                item = QTableWidgetItem(str(v))
                item.setForeground(QColor(colors[col % len(colors)]))
                item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                if col == 0:
                    fnt = QFont()
                    fnt.setFamily('Noto Naskh Arabic' if sys == 'Hebrew' else '')
                    fnt.setPointSize(12 if sys in ('Hebrew','Greek') else 11)
                    item.setFont(fnt)
                self.ref_table.setItem(row, col, item)

    def _compute(self):
        text = self.text_input.toPlainText()

        # Clear result cards
        for i in reversed(range(self.result_lay.count())):
            self.result_lay.itemAt(i).widget().setParent(None)

        if not text.strip():
            self.table.setRowCount(0)
            return

        sys = self.current_system
        chars = []
        modes = []

        if sys == 'English':
            ord_t=0; red_t=0; prime_t=0; rev_t=0
            for ch in text.upper():
                code = ord(ch) - 64
                if 1 <= code <= 26:
                    ord_t   += code
                    rev_t   += (27 - code)
                    prime_t += PRIMES_26[code-1]
                    chars.append((ch, code))
            red_t = digit_root(ord_t)
            modes = [('Ordinal',ord_t,'#c9a8ff'),('Reduction',red_t,'#72e8e8'),
                     ('Primes',prime_t,'#f0c96d'),('Reverse',rev_t,'#4ecb8d')]

        elif sys == 'Hebrew':
            std=0; mgad=0; atb=0
            letters = list('אבגדהוזחטיכלמנסעפצקרשת')
            atb_map = {}
            for i,l in enumerate(letters):
                atb_map[l] = HEBREW_VALS.get(letters[-1-i], 0)
            for ch in text:
                if ch in HEBREW_VALS:
                    std  += HEBREW_VALS[ch]
                    mgad += HEBREW_GADOL.get(ch, HEBREW_VALS[ch])
                    atb  += atb_map.get(ch, 0)
                    chars.append((ch, HEBREW_VALS[ch]))
            modes = [('Standard',std,'#c9a8ff'),('Mispar Gadol',mgad,'#72e8e8'),
                     ('Atbash',atb,'#f0c96d'),('Digit Root',digit_root(std),'#4ecb8d')]

        elif sys == 'Greek':
            total = 0
            for ch in text:
                if ch in GREEK_VALS:
                    total += GREEK_VALS[ch]
                    chars.append((ch, GREEK_VALS[ch]))
            modes = [('Isopsephy',total,'#72e8e8'),('Digit Root',digit_root(total),'#c9a8ff')]

        else:  # Latin
            cls_t=0; mod_t=0
            for ch in text.upper():
                if ch in LATIN_CLASSICAL:
                    cls_t += LATIN_CLASSICAL[ch]
                    code = ord(ch)-64
                    if 1 <= code <= 26: mod_t += code
                    chars.append((ch, LATIN_CLASSICAL[ch]))
            modes = [('Classical',cls_t,'#c9a8ff'),('Modern',mod_t,'#72e8e8'),
                     ('Digit Root',digit_root(cls_t),'#f0c96d')]

        # Build result cards
        for i,(label,val,color) in enumerate(modes):
            card = StatCard(label, color)
            card.set_value(f'{val:,}' if isinstance(val,int) else str(val))
            self.result_lay.addWidget(card, i//2, i%2)

        # Breakdown table
        self.table.setRowCount(len(chars))
        for row,(ch,val) in enumerate(chars):
            ch_item = QTableWidgetItem(ch)
            ch_item.setForeground(QColor('#c9a8ff'))
            ch_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            if sys in ('Hebrew','Greek','Arabic'):
                fnt = QFont(); fnt.setPointSize(13); ch_item.setFont(fnt)
            self.table.setItem(row, 0, ch_item)
            val_item = QTableWidgetItem(str(val))
            val_item.setForeground(QColor('#72e8e8'))
            val_item.setFont(QFont('Consolas', 11))
            val_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            self.table.setItem(row, 1, val_item)


# ─────────────────────────────────────────────
#  MAIN WINDOW
# ─────────────────────────────────────────────
class AlucardWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('⚡ Alucard — Calculator · Abjad · Gematria')
        self.setMinimumSize(520, 760)
        self.resize(560, 820)
        self._apply_dark_palette()
        self.setStyleSheet(DARK_QSS)
        self._build_ui()

    def _apply_dark_palette(self):
        p = QPalette()
        p.setColor(QPalette.ColorRole.Window,          QColor('#0b0c10'))
        p.setColor(QPalette.ColorRole.WindowText,      QColor('#e8e9f0'))
        p.setColor(QPalette.ColorRole.Base,            QColor('#13141a'))
        p.setColor(QPalette.ColorRole.AlternateBase,   QColor('#1c1d27'))
        p.setColor(QPalette.ColorRole.Text,            QColor('#e8e9f0'))
        p.setColor(QPalette.ColorRole.Button,          QColor('#1c1d27'))
        p.setColor(QPalette.ColorRole.ButtonText,      QColor('#e8e9f0'))
        p.setColor(QPalette.ColorRole.Highlight,       QColor('#7b5ea7'))
        p.setColor(QPalette.ColorRole.HighlightedText, QColor('#ffffff'))
        p.setColor(QPalette.ColorRole.ToolTipBase,     QColor('#1c1d27'))
        p.setColor(QPalette.ColorRole.ToolTipText,     QColor('#e8e9f0'))
        QApplication.setPalette(p)

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(14, 14, 14, 14)
        layout.setSpacing(12)

        # Header
        header = QLabel('⚡ ALUCARD')
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header.setStyleSheet("""
            QLabel {
                color: transparent;
                font-size: 28px;
                font-weight: 900;
                letter-spacing: 0.1em;
                background: qlineargradient(x1:0,y1:0,x2:1,y2:0,
                    stop:0 #c9a8ff, stop:0.45 #f0c96d, stop:1 #72e8e8);
                -webkit-background-clip: text;
                padding: 6px 0;
            }
        """)
        # Fallback gradient text using font color
        header.setStyleSheet("color: #c9a8ff; font-size: 28px; font-weight: 900; letter-spacing: 0.1em; background: transparent;")

        sub = QLabel('Scientific Calculator  ·  Arabic Abjad  ·  Gematria')
        sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sub.setStyleSheet("color: #3d3e55; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; background: transparent;")

        layout.addWidget(header)
        layout.addWidget(sub)

        # Tabs
        tabs = QTabWidget()
        tabs.setDocumentMode(False)
        tabs.addTab(self._wrap(CalculatorTab()), '🧮  Calculator')
        tabs.addTab(self._wrap(AbjadTab()),      '🌙  Abjad العربي')
        tabs.addTab(self._wrap(GematriaTab()),   '🔮  Gematria')
        layout.addWidget(tabs)

        # Footer
        footer = QLabel('Alucard v1.0  ·  Linux & Windows  ·  PyQt6')
        footer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        footer.setStyleSheet("color: #2a2b3d; font-size: 10px; background: transparent;")
        layout.addWidget(footer)

    def _wrap(self, widget):
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setWidget(widget)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        return scroll


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setApplicationName('Alucard')
    app.setApplicationVersion('1.0')
    app.setOrganizationName('Alucard Project')

    # High-DPI support
    try:
        app.setAttribute(Qt.ApplicationAttribute.AA_UseHighDpiPixmaps)
    except AttributeError:
        pass

    window = AlucardWindow()
    window.show()
    sys.exit(app.exec())
