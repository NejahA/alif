const editor = document.getElementById("editor");

// Auto-list continuation on Enter
editor.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const node = sel.anchorNode;
    if (!node) return;
    const line = node.textContent || "";
    const match = line.match(/^(\s*)([-*]\s|(\d+)[.)]\s)/);
    if (match) {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      const newNum = match[3] ? parseInt(match[3]) + 1 + ". " : match[2];
      document.execCommand("insertText", false, match[1] + newNum);
    }
  }
});

// Insert date/time
const btnDate = document.getElementById("btn-date");
if (btnDate) btnDate.addEventListener("click", insertDateTime);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "d" && !e.shiftKey && (document.activeElement === editor || editor.contains(document.activeElement))) {
    e.preventDefault();
    insertDateTime();
  }
});
function insertDateTime() {
  const now = new Date();
  const fmt = now.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  editor.focus();
  document.execCommand("insertText", false, fmt);
  setStatus("Inserted date/time");
}

const pagesContainer = document.getElementById("pages-container");
const filenameEl = document.getElementById("filename");
const filenameInput = document.getElementById("filename-input");
const statusEl = document.getElementById("status");
const fileInput = document.getElementById("file-input");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
const pageLabelEl = document.getElementById("page-label");
const readingTimeEl = document.getElementById("reading-time");

const fontFamilySelect = document.getElementById("font-family");
const fontSizeSelect = document.getElementById("font-size");
const formatBlockSelect = document.getElementById("format-block");
const lineSpacingSelect = document.getElementById("line-spacing");
const fontColorInput = document.getElementById("font-color");
const highlightColorInput = document.getElementById("highlight-color");
const marginTopInput = document.getElementById("margin-top");
const marginRightInput = document.getElementById("margin-right");
const marginBottomInput = document.getElementById("margin-bottom");
const marginLeftInput = document.getElementById("margin-left");
const pageGapInput = document.getElementById("page-gap");

let currentFileHandle = null;

/* ----- Scheduling helpers ----- */
let statsRafId = 0;
let pagesRafId = 0;
let statsTimerId = 0;

function scheduleStats() {
  if (statsRafId) return;
  statsRafId = requestAnimationFrame(() => {
    statsRafId = 0;
    _updateStats();
  });
}

function schedulePages() {
  if (pagesRafId) return;
  pagesRafId = requestAnimationFrame(() => {
    pagesRafId = 0;
    _updatePages();
  });
}

function debouncedStats() {
  clearTimeout(statsTimerId);
  statsTimerId = setTimeout(scheduleStats, 150);
  schedulePages();
}

/* ----- Filename ----- */
function setFilename(name) {
  const filename = name || "Untitled";
  filenameEl.textContent = filename;
  filenameInput.value = filename;
  document.title = filename;
}

function commitFilenameEdit() {
  const val = filenameInput.value.trim() || "Untitled";
  filenameEl.textContent = val;
  filenameInput.hidden = true;
  filenameEl.hidden = false;
  document.title = val;
}

filenameEl.addEventListener("click", () => {
  filenameInput.value = filenameEl.textContent;
  filenameEl.hidden = true;
  filenameInput.hidden = false;
  filenameInput.focus();
  filenameInput.select();
});

filenameInput.addEventListener("blur", commitFilenameEdit);
filenameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    commitFilenameEdit();
    editor.focus();
  }
  if (e.key === "Escape") {
    filenameInput.value = filenameEl.textContent;
    commitFilenameEdit();
    editor.focus();
  }
});

/* ----- Status ----- */
let statusTimerId = 0;
function setStatus(message) {
  statusEl.textContent = message;
  if (message !== "—") {
    clearTimeout(statusTimerId);
    statusTimerId = setTimeout(() => { statusEl.textContent = "—"; }, 2500);
  }
}

/* ----- Theme ----- */
const btnTheme = document.getElementById("btn-theme");
let isDarkTheme = true;
btnTheme.addEventListener("click", () => {
  isDarkTheme = !isDarkTheme;
  document.documentElement.classList.toggle("light", !isDarkTheme);
  const icon = isDarkTheme ? "moon" : "sun";
  btnTheme.innerHTML = `<i data-lucide="${icon}"></i>`;
  lucide.createIcons();
});

const btnFullscreen = document.getElementById("btn-fullscreen");
btnFullscreen.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
    btnFullscreen.innerHTML = `<i data-lucide="minimize"></i>`;
  } else {
    document.exitFullscreen();
    btnFullscreen.innerHTML = `<i data-lucide="maximize"></i>`;
  }
  lucide.createIcons();
});

let isFocusMode = false;
const btnFocus = document.getElementById("btn-focus");
const topBar = document.querySelector(".top-bar");
const ribbon = document.querySelector(".ribbon");

function updateActiveParagraph() {
  if (!isFocusMode) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  let node = sel.anchorNode;
  
  const currentActive = editor.querySelector('.active-paragraph');
  if (currentActive) currentActive.classList.remove('active-paragraph');
  
  while (node && node !== editor) {
    if (['P', 'H1', 'H2', 'H3', 'UL', 'OL', 'BLOCKQUOTE', 'TABLE'].includes(node.nodeName)) {
      node.classList.add('active-paragraph');
      break;
    }
    node = node.parentNode;
  }
}

editor.addEventListener("keyup", updateActiveParagraph);
editor.addEventListener("click", updateActiveParagraph);

btnFocus.addEventListener("click", () => {
  isFocusMode = !isFocusMode;
  topBar.style.display = isFocusMode ? "none" : "flex";
  ribbon.style.display = isFocusMode ? "none" : "flex";
  editor.classList.toggle("focus-mode", isFocusMode);
  if (isFocusMode) {
    updateActiveParagraph();
  } else {
    const currentActive = editor.querySelector('.active-paragraph');
    if (currentActive) currentActive.classList.remove('active-paragraph');
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isFocusMode) {
    isFocusMode = false;
    topBar.style.display = "flex";
    ribbon.style.display = "flex";
    editor.classList.remove("focus-mode");
    const currentActive = editor.querySelector('.active-paragraph');
    if (currentActive) currentActive.classList.remove('active-paragraph');
  }
});

/* ----- Content access ----- */
function getHtml() {
  return editor.innerHTML;
}

function setHtml(html) {
  editor.innerHTML = html || "";
}

function getText() {
  return editor.innerText || editor.textContent || "";
}

/* ----- Stats (debounced) ----- */
function _updateStats() {
  const text = getText();
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  charCountEl.textContent = `${chars} character${chars !== 1 ? "s" : ""}`;
  
  const readingMins = Math.max(1, Math.ceil(words / 200));
  readingTimeEl.textContent = `${readingMins} min read`;
  
  if (typeof updateGoalDisplay === "function") {
    updateGoalDisplay(words);
  }
}

/* ----- Pagination ----- */
let cachedPageHeight = 0;
let pageBreakPool = [];
let lastPageCount = 0;

function getPageHeightPx() {
  if (cachedPageHeight) return cachedPageHeight;
  const temp = document.createElement("div");
  temp.style.cssText = "width:0;height:29.7cm;position:absolute;visibility:hidden";
  document.body.appendChild(temp);
  cachedPageHeight = temp.offsetHeight;
  document.body.removeChild(temp);
  return cachedPageHeight;
}

function _updatePages() {
  // Single dynamic page - no page breaks
  editor.style.minHeight = "auto";
  
  // Update page label to show single page
  pageLabelEl.textContent = `Page 1 of 1`;
}

/* ----- Selection tracking ----- */
let savedSelection = null;

function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const node = sel.anchorNode;
    if (node && (editor === node || editor.contains(node))) {
      savedSelection = sel.getRangeAt(0).cloneRange();
    }
  }
}

function restoreSelection() {
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }
}

document.addEventListener("selectionchange", saveSelection);

/* ----- Commands ----- */
function exec(cmd, value = null) {
  restoreSelection();
  document.execCommand(cmd, false, value);
  debouncedStats();
}

/* ----- File operations ----- */
function newFile() {
  if (getText().trim() && !confirm("Discard current document?")) return;
  setHtml("");
  currentFileHandle = null;
  setFilename("Untitled");
  setStatus("New document");
  scheduleStats();
  schedulePages();
  editor.focus();
}

function stripScripts(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("script").forEach(s => s.remove());
  return div.innerHTML;
}

async function openFile() {
  try {
    if ("showOpenFilePicker" in window) {
      const [handle] = await window.showOpenFilePicker({
        types: [
          { description: "HTML documents", accept: { "text/html": [".html", ".htm"] } },
          { description: "Text files", accept: { "text/plain": [".txt"] } },
          { description: "Word documents", accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] } },
          { description: "Word documents (old)", accept: { "application/msword": [".doc"] } },
        ],
        multiple: false,
      });
      currentFileHandle = handle;
      const file = await handle.getFile();
      await loadFileContent(file);
      setFilename(file.name);
      setStatus("Opened");
    } else {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await loadFileContent(file);
        setFilename(file.name);
        setStatus("Opened");
        scheduleStats();
        schedulePages();
        fileInput.value = "";
      };
      fileInput.click();
      return;
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Open error:", err);
      setStatus("Open failed: " + err.message);
    }
  }
  scheduleStats();
  schedulePages();
  editor.focus();
}

async function loadFileContent(file) {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith(".docx")) {
    // Handle DOCX files with mammoth
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
      setHtml(result.value);
      if (result.messages.length > 0) {
        console.log("Mammoth messages:", result.messages);
      }
    } catch (err) {
      console.error("DOCX parsing error:", err);
      setStatus("Failed to open DOCX: " + err.message);
      throw err;
    }
  } else if (fileName.endsWith(".doc")) {
    // DOC files (old format) - try to read as text, won't preserve formatting
    setStatus("Warning: .doc format has limited support");
    const content = await file.text();
    // Try to extract readable text (this is very basic)
    const cleaned = content.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim();
    setHtml(cleaned.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
  } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
    // HTML files
    const content = await file.text();
    setHtml(stripScripts(content));
  } else {
    // Plain text files
    const content = await file.text();
    setHtml(content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
  }
}

async function saveFile(asPlainText = false) {
  const content = asPlainText ? getText() : getDocHtml();
  const suggestedName = filenameEl.textContent === "Untitled"
    ? (asPlainText ? "document.txt" : "document.html")
    : (asPlainText ? filenameEl.textContent.replace(/\.html?$/i, ".txt") : filenameEl.textContent);

  try {
    if (!asPlainText && currentFileHandle && currentFileHandle.name && currentFileHandle.name.toLowerCase().endsWith(".html")) {
      const writable = await currentFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      setStatus("Saved");
      editor.focus();
      return;
    }
    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({
        types: asPlainText
          ? [{ description: "Text files", accept: { "text/plain": [".txt"] } }]
          : [{ description: "HTML documents", accept: { "text/html": [".html"] } }],
        suggestedName,
      });
      currentFileHandle = asPlainText ? null : handle;
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      setFilename(handle.name);
      setStatus("Saved");
    } else {
      const type = asPlainText ? "text/plain" : "text/html";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([content], { type }));
      a.download = suggestedName;
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("Downloaded");
    }
  } catch (err) {
    if (err.name !== "AbortError") setStatus("Save failed");
  }
  editor.focus();
}

/* ----- DOCX Export ----- */
async function saveAsDocx() {
  try {
    // Get the actual HTML content
    const htmlContent = editor.innerHTML;
    console.log('Editor HTML:', htmlContent);
    
    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const body = doc.body;
    
    // Collect all unique colors used in the document
    const colorSet = new Set();
    colorSet.add('#000000'); // Default black
    
    function rgbToHex(color) {
      if (!color) return '#000000';
      
      // Already hex
      if (color.startsWith('#')) {
        return color.toLowerCase();
      }
      
      // Handle rgb() format
      const rgbMatch = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
      }
      
      // Handle named colors
      const namedColors = {
        'black': '#000000', 'white': '#ffffff', 'red': '#ff0000',
        'green': '#008000', 'blue': '#0000ff', 'yellow': '#ffff00',
        'cyan': '#00ffff', 'magenta': '#ff00ff', 'gray': '#808080',
        'grey': '#808080', 'silver': '#c0c0c0', 'maroon': '#800000',
        'olive': '#808000', 'lime': '#00ff00', 'aqua': '#00ffff',
        'teal': '#008080', 'navy': '#000080', 'fuchsia': '#ff00ff',
        'purple': '#800080'
      };
      
      return namedColors[color.toLowerCase()] || '#000000';
    }
    
    function collectColors(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check inline style color
        if (node.style && node.style.color) {
          const hex = rgbToHex(node.style.color);
          console.log('Found style.color:', node.style.color, '→', hex);
          colorSet.add(hex);
        }
        
        // Check inline style background
        if (node.style && node.style.backgroundColor) {
          const hex = rgbToHex(node.style.backgroundColor);
          console.log('Found style.backgroundColor:', node.style.backgroundColor, '→', hex);
          colorSet.add(hex);
        }
        
        // Check font tag color attribute
        if (node.tagName && node.tagName.toLowerCase() === 'font') {
          if (node.getAttribute('color')) {
            const hex = rgbToHex(node.getAttribute('color'));
            console.log('Found font color attr:', node.getAttribute('color'), '→', hex);
            colorSet.add(hex);
          }
        }
        
        node.childNodes.forEach(child => collectColors(child));
      }
    }
    
    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    }
    
    collectColors(body);
    
    // Build color table
    const colors = Array.from(colorSet);
    const colorMap = {};
    
    console.log('All colors found:', colors);
    
    // Create RTF with dynamic color table
    let rtf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033\n';
    
    // Font table
    rtf += '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\froman\\fcharset0 Times New Roman;}{\\f2\\fmodern\\fcharset0 Courier New;}}\n';
    
    // Color table - build dynamically
    rtf += '{\\colortbl ;'; // First color is auto/default
    colors.forEach((color, idx) => {
      const rgb = hexToRgb(color);
      rtf += `\\red${rgb.r}\\green${rgb.g}\\blue${rgb.b};`;
      colorMap[color] = idx + 1; // RTF color indices start at 1
    });
    rtf += '}\n';
    
    console.log('Color map:', colorMap);
    
    // Default paragraph formatting
    rtf += '\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang9\n';
    
    function escapeRtfText(text) {
      if (!text) return '';
      return text
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');
    }
    
    function getElementStyle(element) {
      const style = {
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        color: null,
        backgroundColor: null
      };
      
      // Check this element's tag
      const tag = element.tagName ? element.tagName.toLowerCase() : '';
      if (tag === 'b' || tag === 'strong') style.bold = true;
      if (tag === 'i' || tag === 'em') style.italic = true;
      if (tag === 'u') style.underline = true;
      if (tag === 's' || tag === 'strike' || tag === 'del') style.strike = true;
      
      // Check inline styles
      if (element.style) {
        if (element.style.fontWeight === 'bold' || parseInt(element.style.fontWeight) >= 600) style.bold = true;
        if (element.style.fontStyle === 'italic') style.italic = true;
        if (element.style.textDecoration && element.style.textDecoration.includes('underline')) style.underline = true;
        if (element.style.textDecoration && element.style.textDecoration.includes('line-through')) style.strike = true;
        
        // Get color
        if (element.style.color) {
          style.color = rgbToHex(element.style.color);
          console.log('Element has color:', element.style.color, '→', style.color);
        }
        
        // Get background color (highlight)
        if (element.style.backgroundColor) {
          style.backgroundColor = rgbToHex(element.style.backgroundColor);
          console.log('Element has backgroundColor:', element.style.backgroundColor, '→', style.backgroundColor);
        }
      }
      
      // Check font tag color attribute
      if (tag === 'font' && element.getAttribute('color')) {
        style.color = rgbToHex(element.getAttribute('color'));
        console.log('Font tag has color attr:', element.getAttribute('color'), '→', style.color);
      }
      
      return style;
    }
    
    function mergeStyles(parent, child) {
      return {
        bold: parent.bold || child.bold,
        italic: parent.italic || child.italic,
        underline: parent.underline || child.underline,
        strike: parent.strike || child.strike,
        color: child.color || parent.color,
        backgroundColor: child.backgroundColor || parent.backgroundColor
      };
    }
    
    function processTextWithFormatting(text, style) {
      if (!text.trim()) return '';
      
      let result = '';
      
      // Apply text color
      if (style.color && colorMap[style.color]) {
        result += `\\cf${colorMap[style.color]} `;
        console.log('Applying color:', style.color, 'index:', colorMap[style.color]);
      }
      
      // Apply highlight/background color
      if (style.backgroundColor && colorMap[style.backgroundColor]) {
        result += `\\highlight${colorMap[style.backgroundColor]} `;
      }
      
      if (style.bold) result += '\\b ';
      if (style.italic) result += '\\i ';
      if (style.underline) result += '\\ul ';
      if (style.strike) result += '\\strike ';
      
      result += escapeRtfText(text);
      
      if (style.strike) result += '\\strike0 ';
      if (style.underline) result += '\\ul0 ';
      if (style.italic) result += '\\i0 ';
      if (style.bold) result += '\\b0 ';
      
      // Reset colors
      if (style.backgroundColor && colorMap[style.backgroundColor]) {
        result += '\\highlight0 ';
      }
      if (style.color && colorMap[style.color]) {
        result += '\\cf0 ';
      }
      
      return result;
    }
    
    function processNode(node, parentStyle = {}) {
      let result = '';
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text.trim()) {
          result += processTextWithFormatting(text, parentStyle);
        }
        return result;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const elementStyle = getElementStyle(node);
        const style = mergeStyles(parentStyle, elementStyle);
        
        // Block-level elements
        if (tag === 'h1') {
          result += '\\pard\\sb240\\sa120\\b\\fs36 ';
          node.childNodes.forEach(child => {
            result += processNode(child, style);
          });
          result += '\\b0\\fs22\\par\n';
        } else if (tag === 'h2') {
          result += '\\pard\\sb180\\sa90\\b\\fs32 ';
          node.childNodes.forEach(child => {
            result += processNode(child, style);
          });
          result += '\\b0\\fs22\\par\n';
        } else if (tag === 'h3') {
          result += '\\pard\\sb120\\sa60\\b\\fs28 ';
          node.childNodes.forEach(child => {
            result += processNode(child, style);
          });
          result += '\\b0\\fs22\\par\n';
        } else if (tag === 'p' || tag === 'div') {
          result += '\\pard\\sa200\\sl276\\slmult1 ';
          node.childNodes.forEach(child => {
            result += processNode(child, style);
          });
          result += '\\par\n';
        } else if (tag === 'br') {
          result += '\\line\n';
        } else if (tag === 'ul') {
          node.querySelectorAll(':scope > li').forEach(li => {
            result += '\\pard\\fi-360\\li720\\sa100\\sl276\\slmult1\\bullet\\tab ';
            li.childNodes.forEach(child => {
              result += processNode(child, style);
            });
            result += '\\par\n';
          });
        } else if (tag === 'ol') {
          node.querySelectorAll(':scope > li').forEach((li, idx) => {
            result += '\\pard\\fi-360\\li720\\sa100\\sl276\\slmult1 ' + (idx + 1) + '.\\tab ';
            li.childNodes.forEach(child => {
              result += processNode(child, style);
            });
            result += '\\par\n';
          });
        } else {
          // Inline elements or unknown - just process children with merged style
          node.childNodes.forEach(child => {
            result += processNode(child, style);
          });
        }
      }
      
      return result;
    }
    
    // Process all children of body
    if (body.childNodes.length === 0 || !body.textContent.trim()) {
      rtf += '\\pard\\sa200\\sl276\\slmult1 Empty document\\par\n';
    } else {
      body.childNodes.forEach(node => {
        rtf += processNode(node, {});
      });
    }
    
    rtf += '}';
    
    console.log('Generated RTF (first 800 chars):', rtf.substring(0, 800));
    
    // Create and download file
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const suggestedName = filenameEl.textContent === "Untitled"
      ? "document.doc"
      : filenameEl.textContent.replace(/\.(html?|txt)$/i, ".doc");
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(a.href);
    
    setStatus("Saved as DOC");
  } catch (err) {
    console.error("DOC Error:", err);
    setStatus("DOC export failed: " + err.message);
  }
  editor.focus();
}
/* ----- PDF Export ----- */
async function saveAsPdf() {
  try {
    const suggestedName = filenameEl.textContent === "Untitled"
      ? "document.pdf"
      : filenameEl.textContent.replace(/\.(html?|txt|docx?)$/i, ".pdf");
    
    // Simple approach: clone editor and export
    const clonedEditor = editor.cloneNode(true);
    clonedEditor.style.width = '210mm';
    clonedEditor.style.padding = '20mm';
    clonedEditor.style.background = 'white';
    clonedEditor.style.color = '#000000';
    clonedEditor.style.boxSizing = 'border-box';
    
    const opt = {
      margin: 0,
      filename: suggestedName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };
    
    await html2pdf().set(opt).from(clonedEditor).save();
    setStatus("Saved as PDF");
  } catch (err) {
    console.error(err);
    setStatus("PDF export failed: " + err.message);
  }
  editor.focus();
}

async function saveAsPng() {
  try {
    const suggestedName = filenameEl.textContent === "Untitled"
      ? "document.png"
      : filenameEl.textContent.replace(/\.(html?|txt|docx?|pdf)$/i, ".png");
    
    editor.style.caretColor = "transparent";
    editor.style.boxShadow = "none";
    
    const canvas = await html2canvas(editor, {
      scale: 2,
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('light') ? '#ffffff' : '#16161b'
    });
    
    editor.style.caretColor = "var(--accent)";
    editor.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.15)";
    
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = suggestedName;
    a.click();
    setStatus("Saved as PNG");
  } catch(err) {
    console.error(err);
    setStatus("PNG export failed: " + err.message);
  }
}

/* ----- Markdown Export ----- */
async function saveAsMarkdown() {
  try {
    const turndownService = new TurndownService();
    turndownService.addRule('strikethrough', {
      filter: ['del', 's', 'strike'],
      replacement: function (content) { return '~~' + content + '~~' }
    });
    
    const mdContent = turndownService.turndown(getHtml());
    const suggestedName = filenameEl.textContent === "Untitled"
      ? "document.md"
      : filenameEl.textContent.replace(/\.(html?|txt|docx?|pdf)$/i, "") + ".md";

    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({
        types: [{ description: "Markdown", accept: { "text/markdown": [".md"] } }],
        suggestedName,
      });
      const writable = await handle.createWritable();
      await writable.write(mdContent);
      await writable.close();
      setStatus("Saved MD");
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([mdContent], { type: "text/markdown" }));
      a.download = suggestedName;
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("Downloaded MD");
    }
  } catch (err) {
    if (err.name !== "AbortError") setStatus("Save failed: " + err.message);
  }
  editor.focus();
}

function getDocHtml() {
  const title = filenameEl.textContent === "Untitled" ? "Document" : filenameEl.textContent;
  const dir = editor.getAttribute("dir") || "ltr";
  const isRtl = dir === "rtl";
  return `<!DOCTYPE html>
<html lang="${isRtl ? "ar" : "en"}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/</g, "&lt;")}</title>
  <style>
    body { font-family: ${isRtl ? "'Noto Sans Arabic', 'Cairo', " : ""}Inter, system-ui, sans-serif; max-width: 21cm; margin: 2cm auto; padding: 0 2.5cm; line-height: 1.6; color: #e4e4e7; background: #16161b; direction: ${dir}; }
    h1 { font-size: 1.75rem; margin: 0 0 0.5em; }
    h2 { font-size: 1.35rem; margin: 1em 0 0.35em; }
    h3 { font-size: 1.15rem; margin: 0.85em 0 0.25em; }
    p { margin: 0 0 0.5em; }
    ul, ol { margin: 0 0 0.5em 1.5em; }
  </style>
</head>
<body>
${getHtml()}
</body>
</html>`;
}

/* ----- Formatting ----- */
document.getElementById("cmd-bold").addEventListener("click", () => exec("bold"));
document.getElementById("cmd-italic").addEventListener("click", () => exec("italic"));
document.getElementById("cmd-underline").addEventListener("click", () => exec("underline"));
document.getElementById("cmd-strike").addEventListener("click", () => exec("strikeThrough"));
document.getElementById("cmd-subscript").addEventListener("click", () => exec("subscript"));
document.getElementById("cmd-superscript").addEventListener("click", () => exec("superscript"));

document.getElementById("cmd-blockquote").addEventListener("click", () => exec("formatBlock", "blockquote"));
document.getElementById("cmd-codeblock").addEventListener("click", () => {
  const codeHtml = `<pre style="background: ${isDarkTheme ? '#1e1e24' : '#ebebef'}; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace;"><code><br></code></pre><p><br></p>`;
  exec("insertHTML", codeHtml);
});

document.getElementById("cmd-undo").addEventListener("click", () => exec("undo"));
document.getElementById("cmd-redo").addEventListener("click", () => exec("redo"));

document.getElementById("cmd-uppercase").addEventListener("click", () => {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  const text = selection.toString();
  document.execCommand("insertText", false, text.toUpperCase());
});

document.getElementById("cmd-lowercase").addEventListener("click", () => {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  const text = selection.toString();
  document.execCommand("insertText", false, text.toLowerCase());
});

let isSpellcheck = true;
const btnSpellcheck = document.getElementById("btn-spellcheck");
btnSpellcheck.addEventListener("click", () => {
  isSpellcheck = !isSpellcheck;
  editor.spellcheck = isSpellcheck;
  btnSpellcheck.style.opacity = isSpellcheck ? "1" : "0.5";
});

fontFamilySelect.addEventListener("change", () => {
  exec("fontName", fontFamilySelect.value);
});
fontSizeSelect.addEventListener("change", () => {
  exec("fontSize", fontSizeSelect.value);
});
formatBlockSelect.addEventListener("change", () => {
  const tag = formatBlockSelect.value;
  exec("formatBlock", tag === "p" ? "<p>" : `<${tag}>`);
});
lineSpacingSelect.addEventListener("change", () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentNode;
  
  // Apply line-height to a specific container if possible, otherwise to the whole editor loosely
  if (container === editor) {
      document.execCommand("insertHTML", false, `<div style="line-height: ${lineSpacingSelect.value}">${selection.toString()}</div>`);
  } else {
     container.style.lineHeight = lineSpacingSelect.value;
  }
  debouncedStats();
});

fontColorInput.addEventListener("input", () => {
  exec("foreColor", fontColorInput.value);
});
fontColorInput.addEventListener("change", () => {
  exec("foreColor", fontColorInput.value);
});
highlightColorInput.addEventListener("input", () => {
  exec("hiliteColor", highlightColorInput.value);
});
highlightColorInput.addEventListener("change", () => {
  exec("hiliteColor", highlightColorInput.value);
});

const bgColorInput = document.getElementById("bg-color");
if (bgColorInput) {
  bgColorInput.addEventListener("input", () => {
    editor.style.backgroundColor = bgColorInput.value;
  });
  bgColorInput.addEventListener("change", () => {
    editor.style.backgroundColor = bgColorInput.value;
  });
}

document.getElementById("cmd-ul").addEventListener("click", () => exec("insertUnorderedList"));
document.getElementById("cmd-ol").addEventListener("click", () => exec("insertOrderedList"));
document.getElementById("cmd-justifyLeft").addEventListener("click", () => exec("justifyLeft"));
document.getElementById("cmd-justifyCenter").addEventListener("click", () => exec("justifyCenter"));
document.getElementById("cmd-justifyRight").addEventListener("click", () => exec("justifyRight"));
document.getElementById("cmd-justifyFull").addEventListener("click", () => exec("justifyFull"));
document.getElementById("cmd-indent").addEventListener("click", () => exec("indent"));
document.getElementById("cmd-outdent").addEventListener("click", () => exec("outdent"));
document.getElementById("cmd-removeFormat").addEventListener("click", () => exec("removeFormat"));

document.getElementById("cmd-insertLink").addEventListener("click", () => {
  const url = prompt("Enter the link URL:", "https://");
  if (url) {
    exec("createLink", url);
  }
});

document.getElementById("cmd-insertImage").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        exec("insertImage", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

document.getElementById("cmd-insertEmbed").addEventListener("click", () => {
  const url = prompt("Enter video embed URL (e.g., YouTube watch link):");
  if (!url) return;
  let embedUrl = url;
  if (url.includes('youtube.com/watch?v=')) {
    embedUrl = url.replace('watch?v=', 'embed/');
    const ampersandPos = embedUrl.indexOf('&');
    if (ampersandPos !== -1) {
      embedUrl = embedUrl.substring(0, ampersandPos);
    }
  } else if (url.includes('youtu.be/')) {
    embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
  }
  const embedHtml = `<div style="text-align: center; margin: 1rem 0;" contenteditable="false"><iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
  exec("insertHTML", embedHtml);
});

document.getElementById("cmd-insertHR").addEventListener("click", () => {
  exec("insertHorizontalRule");
});

document.getElementById("cmd-insertTable").addEventListener("click", () => {
  const tableHtml = `
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
      <tr><td><br></td><td><br></td><td><br></td></tr>
      <tr><td><br></td><td><br></td><td><br></td></tr>
      <tr><td><br></td><td><br></td><td><br></td></tr>
    </table><p><br></p>
  `;
  exec("insertHTML", tableHtml);
});

function getActiveTableCell() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.anchorNode;
  while (node && node !== editor) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') return node;
    node = node.parentNode;
  }
  return null;
}

document.getElementById("cmd-table-addRow").addEventListener("click", () => {
  const cell = getActiveTableCell();
  if (!cell) return setStatus("Click inside a table first");
  const row = cell.parentNode;
  const newRow = row.cloneNode(true);
  Array.from(newRow.cells).forEach(c => c.innerHTML = "<br>");
  row.parentNode.insertBefore(newRow, row.nextSibling);
});

document.getElementById("cmd-table-addCol").addEventListener("click", () => {
  const cell = getActiveTableCell();
  if (!cell) return setStatus("Click inside a table first");
  const row = cell.parentNode;
  const table = row.parentNode.nodeName === 'TBODY' ? row.parentNode.parentNode : row.parentNode;
  const idx = Array.from(row.cells).indexOf(cell);
  
  Array.from(table.rows).forEach(tr => {
    const newCell = document.createElement(cell.nodeName);
    newCell.innerHTML = "<br>";
    if (idx + 1 < tr.cells.length) {
      tr.insertBefore(newCell, tr.cells[idx + 1]);
    } else {
      tr.appendChild(newCell);
    }
  });
});

document.getElementById("cmd-table-delRow").addEventListener("click", () => {
  const cell = getActiveTableCell();
  if (!cell) return setStatus("Click inside a table first");
  const row = cell.parentNode;
  row.parentNode.removeChild(row);
});

document.getElementById("cmd-table-delCol").addEventListener("click", () => {
  const cell = getActiveTableCell();
  if (!cell) return setStatus("Click inside a table first");
  const row = cell.parentNode;
  const table = row.parentNode.nodeName === 'TBODY' ? row.parentNode.parentNode : row.parentNode;
  const idx = Array.from(row.cells).indexOf(cell);
  
  if (idx !== -1) {
    Array.from(table.rows).forEach(tr => {
      if (tr.cells.length > idx) {
        tr.removeChild(tr.cells[idx]);
      }
    });
  }
});

document.getElementById("cmd-insertCheckbox").addEventListener("click", () => {
  exec("insertHTML", `<input type="checkbox" style="margin-right: 0.5rem; transform: scale(1.2); vertical-align: middle;"> `);
});

document.getElementById("cmd-insertDate").addEventListener("click", () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  exec("insertText", dateStr);
});

document.getElementById("cmd-rtl").addEventListener("click", () => {
  editor.setAttribute("dir", "rtl");
  editor.style.textAlign = "right";
});
document.getElementById("cmd-ltr").addEventListener("click", () => {
  editor.setAttribute("dir", "ltr");
  editor.style.textAlign = "left";
});

/* ----- Margins (page padding) ----- */
function applyMarginsFromInputs() {
  const t = Math.max(0, Number(marginTopInput?.value || 20));
  const r = Math.max(0, Number(marginRightInput?.value || 25));
  const b = Math.max(0, Number(marginBottomInput?.value || 20));
  const l = Math.max(0, Number(marginLeftInput?.value || 25));
  const root = document.documentElement;
  root.style.setProperty("--page-pad-top", `${t}mm`);
  root.style.setProperty("--page-pad-right", `${r}mm`);
  root.style.setProperty("--page-pad-bottom", `${b}mm`);
  root.style.setProperty("--page-pad-left", `${l}mm`);
  try {
    localStorage.setItem("truetooth-margins-mm", JSON.stringify({ t, r, b, l }));
  } catch (_) {}
  schedulePages();
}
if (marginTopInput && marginRightInput && marginBottomInput && marginLeftInput) {
  marginTopInput.addEventListener("change", applyMarginsFromInputs);
  marginRightInput.addEventListener("change", applyMarginsFromInputs);
  marginBottomInput.addEventListener("change", applyMarginsFromInputs);
  marginLeftInput.addEventListener("change", applyMarginsFromInputs);
}

function applyGapFromInput() {
  const g = Math.max(0, Number(pageGapInput?.value || 8));
  document.documentElement.style.setProperty("--page-gap", `${g}mm`);
  try {
    localStorage.setItem("truetooth-page-gap-mm", String(g));
  } catch (_) {}
  schedulePages();
}
if (pageGapInput) {
  pageGapInput.addEventListener("change", applyGapFromInput);
}

document.getElementById("btn-highlight-code").addEventListener("click", () => {
  if (window.hljs) {
    const blocks = editor.querySelectorAll('pre code');
    let highlightedCount = 0;
    blocks.forEach(block => {
      hljs.highlightElement(block);
      highlightedCount++;
    });
    setStatus(`Highlighted ${highlightedCount} code block(s)`);
  } else {
    setStatus("Highlighter not loaded");
  }
});

/* ----- Tools ----- */
// Copy All
document.getElementById("btn-copy-all").addEventListener("click", () => {
  navigator.clipboard.writeText(getText())
    .then(() => setStatus("Copied to clipboard"))
    .catch(() => setStatus("Failed to copy"));
  editor.focus();
});

// Find & Replace
document.getElementById("btn-find-replace").addEventListener("click", () => {
  const findText = prompt("Find:");
  if (!findText) return;
  const replaceText = prompt(`Replace "${findText}" with:`);
  if (replaceText === null) return;
  
  // Save selection before modifying
  saveSelection();
  
  let count = 0;
  // Move selection to start
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(true);
  sel.addRange(range);

  while (window.find(findText, false, false, true, false, false, false)) {
    document.execCommand("insertText", false, replaceText);
    count++;
  }
  
  setStatus(`Replaced ${count} occurrence(s)`);
});

// Voice Dictation
let recognition = null;
let isDictating = false;
const btnDictate = document.getElementById("btn-dictate");
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  
  recognition.onstart = () => {
    isDictating = true;
    btnDictate.classList.add("active");
    btnDictate.style.color = "var(--accent)";
    setStatus("Listening...");
  };
  
  recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      document.execCommand("insertText", false, finalTranscript + " ");
    }
  };
  
  recognition.onend = () => {
    isDictating = false;
    btnDictate.classList.remove("active");
    btnDictate.style.color = "";
    setStatus("Dictation stopped");
  };
  
  recognition.onerror = (event) => {
    setStatus("Dictation error: " + event.error);
    isDictating = false;
    btnDictate.classList.remove("active");
    btnDictate.style.color = "";
  };
} else {
  btnDictate.style.opacity = "0.5";
  btnDictate.title = "Dictation not supported in this browser";
}

btnDictate.addEventListener("click", () => {
  if (!recognition) return;
  if (isDictating) {
    recognition.stop();
  } else {
    editor.focus();
    recognition.start();
  }
});

// Read Aloud
let isReading = false;
const btnReadAloud = document.getElementById("btn-read-aloud");
btnReadAloud.addEventListener("click", () => {
  if (!('speechSynthesis' in window)) {
    setStatus("Read Aloud not supported in this browser");
    return;
  }
  
  if (isReading) {
    window.speechSynthesis.cancel();
    isReading = false;
    btnReadAloud.classList.remove("active");
    btnReadAloud.style.color = "";
    setStatus("Read Aloud stopped");
    return;
  }
  
  // Try to read selected text, otherwise read all text
  const sel = window.getSelection();
  let textToRead = sel.toString();
  if (!textToRead) {
    textToRead = getText();
  }
  
  if (!textToRead.trim()) return;
  
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.onstart = () => {
    isReading = true;
    btnReadAloud.classList.add("active");
    btnReadAloud.style.color = "var(--accent)";
    setStatus("Reading...");
  };
  
  utterance.onend = () => {
    isReading = false;
    btnReadAloud.classList.remove("active");
    btnReadAloud.style.color = "";
    setStatus("Finished reading");
  };
  
  utterance.onerror = () => {
    isReading = false;
    btnReadAloud.classList.remove("active");
    btnReadAloud.style.color = "";
    setStatus("Read Aloud error");
  };
  
  window.speechSynthesis.speak(utterance);
});

/* ----- File buttons ----- */
document.getElementById("btn-new").addEventListener("click", newFile);
document.getElementById("btn-open").addEventListener("click", openFile);
document.getElementById("btn-save").addEventListener("click", () => saveFile(false));
document.getElementById("btn-save-txt").addEventListener("click", () => saveFile(true));
document.getElementById("btn-save-md").addEventListener("click", saveAsMarkdown);
document.getElementById("btn-save-docx").addEventListener("click", () => {
  console.log("DOC button clicked");
  saveAsDocx();
});
document.getElementById("btn-save-pdf").addEventListener("click", () => {
  console.log("PDF button clicked");
  saveAsPdf();
});
document.getElementById("btn-save-png").addEventListener("click", () => {
  saveAsPng();
});
document.getElementById("btn-print").addEventListener("click", () => {
  window.print();
});

/* ----- Lock (Read-Only) ----- */
const btnLock = document.getElementById("btn-lock");
let isReadOnly = false;
btnLock.addEventListener("click", () => {
  isReadOnly = !isReadOnly;
  editor.contentEditable = !isReadOnly;
  
  if (isReadOnly) {
    btnLock.innerHTML = `<i data-lucide="lock"></i>`;
    ribbon.style.opacity = "0.5";
    ribbon.style.pointerEvents = "none";
    setStatus("Read-Only Mode");
  } else {
    btnLock.innerHTML = `<i data-lucide="lock-open"></i>`;
    ribbon.style.opacity = "1";
    ribbon.style.pointerEvents = "auto";
    setStatus("Editing Unlocked");
  }
  lucide.createIcons();
});

/* ----- Zoom Controls ----- */
let currentZoom = 1;
const btnZoomIn = document.getElementById("btn-zoom-in");
const btnZoomOut = document.getElementById("btn-zoom-out");
const zoomLabel = document.getElementById("zoom-label");

function updateZoom() {
  editor.style.zoom = currentZoom;
  zoomLabel.textContent = Math.round(currentZoom * 100) + "%";
}

btnZoomIn.addEventListener("click", () => {
  if (currentZoom < 2.5) {
    currentZoom += 0.1;
    updateZoom();
  }
});

btnZoomOut.addEventListener("click", () => {
  if (currentZoom > 0.5) {
    currentZoom -= 0.1;
    updateZoom();
  }
});

/* ----- Keyboard ----- */
editor.addEventListener("keydown", (e) => {
  if (!e.ctrlKey) return;
  switch (e.key) {
    case "s": e.preventDefault(); saveFile(false); break;
    case "o": e.preventDefault(); openFile(); break;
    case "n": e.preventDefault(); newFile(); break;
    case "b": e.preventDefault(); exec("bold"); break;
    case "i": e.preventDefault(); exec("italic"); break;
    case "u": e.preventDefault(); exec("underline"); break;
  }
});

/* ----- Live updates (batched) ----- */
editor.addEventListener("input", debouncedStats);
new ResizeObserver(schedulePages).observe(editor);

editor.addEventListener("paste", (e) => {
  if (e.clipboardData.files.length) return;
  const text = e.clipboardData.getData("text/plain");
  if (text) {
    e.preventDefault();
    document.execCommand("insertText", false, text);
  }
});

/* ----- Autosave to localStorage ----- */
let autosaveTimer = 0;
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem("truetooth-autosave", editor.innerHTML);
      localStorage.setItem("truetooth-autosave-name", filenameEl.textContent);
      localStorage.setItem("truetooth-autosave-dir", editor.getAttribute("dir") || "ltr");
    } catch (_) {}
  }, 2000);
}
editor.addEventListener("input", scheduleAutosave);

(function restoreAutosave() {
  const saved = localStorage.getItem("truetooth-autosave");
  if (saved && saved.trim()) {
    setHtml(saved);
    const name = localStorage.getItem("truetooth-autosave-name");
    if (name) setFilename(name);
    const dir = localStorage.getItem("truetooth-autosave-dir");
    if (dir === "rtl") {
      editor.setAttribute("dir", "rtl");
      editor.style.textAlign = "right";
    }
  }
  try {
    const mm = JSON.parse(localStorage.getItem("truetooth-margins-mm") || "{}");
    if (typeof mm.t === "number") marginTopInput.value = mm.t;
    if (typeof mm.r === "number") marginRightInput.value = mm.r;
    if (typeof mm.b === "number") marginBottomInput.value = mm.b;
    if (typeof mm.l === "number") marginLeftInput.value = mm.l;
    applyMarginsFromInputs();
  } catch (_) {}
  try {
    const g = Number(localStorage.getItem("truetooth-page-gap-mm"));
    if (!Number.isNaN(g) && pageGapInput) {
      pageGapInput.value = g;
      applyGapFromInput();
    }
  } catch (_) {}
})();

/* ----- Initial render ----- */
scheduleStats();
schedulePages();
editor.focus();

// Debug: Check if docx library loaded
window.addEventListener('load', () => {
  console.log('Checking docx library...');
  console.log('typeof docx:', typeof docx);
  console.log('typeof window.docx:', typeof window.docx);
  console.log('window object keys containing "docx":', Object.keys(window).filter(k => k.toLowerCase().includes('docx')));
  
  if (typeof docx !== 'undefined') {
    console.log('✓ docx library loaded successfully');
  } else if (typeof window.docx !== 'undefined') {
    console.log('✓ window.docx library loaded successfully');
  } else {
    console.warn('⚠ docx library not found');
  }
});

/* ----- Theme toggle ----- */
const themeBtn = document.getElementById("btn-theme");
function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light");
    themeBtn.textContent = "Light";
  } else {
    document.documentElement.classList.remove("light");
    themeBtn.textContent = "Dark";
  }
  localStorage.setItem("truetooth-theme", theme);
}
themeBtn.addEventListener("click", () => {
  const isLight = document.documentElement.classList.contains("light");
  applyTheme(isLight ? "dark" : "light");
});
applyTheme(localStorage.getItem("truetooth-theme") || "dark");

/* ----- Stats & Draw Modals ----- */
const drawModal = document.getElementById("draw-modal");
const btnCloseDraw = document.getElementById("btn-close-draw");
const btnClearDraw = document.getElementById("btn-clear-draw");
const btnSaveDraw = document.getElementById("btn-save-draw");
const drawCanvas = document.getElementById("draw-canvas");
if (drawCanvas) {
  const ctx = drawCanvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function startDraw(e) {
    isDrawing = true;
    ctx.beginPath();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  function stopDraw() {
    isDrawing = false;
    ctx.closePath();
  }

  drawCanvas.addEventListener("mousedown", startDraw);
  drawCanvas.addEventListener("mousemove", draw);
  drawCanvas.addEventListener("mouseup", stopDraw);
  drawCanvas.addEventListener("mouseout", stopDraw);

  document.getElementById("cmd-insertDraw").addEventListener("click", () => {
    drawModal.hidden = false;
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = document.documentElement.classList.contains('light') ? '#000000' : '#ffffff';
  });

  btnCloseDraw.addEventListener("click", () => drawModal.hidden = true);
  btnClearDraw.addEventListener("click", () => ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height));

  btnSaveDraw.addEventListener("click", () => {
    drawModal.hidden = true;
    const dataUrl = drawCanvas.toDataURL();
    editor.focus();
    exec("insertImage", dataUrl);
  });
}

const statsModal = document.getElementById("stats-modal");
const btnCloseStats = document.getElementById("btn-close-stats");
if (statsModal) {
  document.getElementById("word-count").addEventListener("click", () => {
    const text = getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const charsSpace = text.length;
    
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    let sentencesCount = 1;
    if (text.trim()) {
      const match = text.match(/[.!?]+/g);
      sentencesCount = match ? match.length : 1;
    }
    
    // Syllable count (rough heuristic)
    function countSyllables(word) {
      word = word.toLowerCase();
      if(word.length <= 3) return 1;
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const syl = word.match(/[aeiouy]{1,2}/g);
      return syl ? syl.length : 1;
    }
    
    let totalSyllables = 0;
    const wordArr = text.trim().split(/\s+/);
    wordArr.forEach(w => totalSyllables += countSyllables(w));
    
    const wordsCount = words;
    let gradeLevel = "---";
    if (wordsCount > 0 && sentencesCount > 0) {
      const score = 0.39 * (wordsCount / sentencesCount) + 11.8 * (totalSyllables / wordsCount) - 15.59;
      if (score < 1) gradeLevel = "1st Grade";
      else if (score >= 13) gradeLevel = "College Graduate";
      else gradeLevel = Math.round(score) + "th Grade";
    }

    const readMins = Math.max(1, Math.round(words / 200));
    const speakMins = Math.max(1, Math.round(words / 130));

    document.getElementById("stat-words").textContent = words;
    document.getElementById("stat-chars-no-space").textContent = charsNoSpace;
    document.getElementById("stat-chars").textContent = charsSpace;
    document.getElementById("stat-sentences").textContent = sentencesCount;
    document.getElementById("stat-paragraphs").textContent = paragraphs;
    document.getElementById("stat-read-time").textContent = readMins + " min";
    document.getElementById("stat-speak-time").textContent = speakMins + " min";
    document.getElementById("stat-readability").textContent = gradeLevel;

    statsModal.hidden = false;
  });

  btnCloseStats.addEventListener("click", () => statsModal.hidden = true);
}

/* ----- Ambient Audio ----- */
const ambientAudio = new Audio();
ambientAudio.loop = true;

window.playAmbient = function(type) {
  const sources = {
    rain: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
    cafe: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    space: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_2eb2d1261d.mp3'
  };
  
  if (type === 'stop') {
    ambientAudio.pause();
    setStatus("Audio Stopped");
  } else if (sources[type]) {
    ambientAudio.src = sources[type];
    ambientAudio.play().catch(e => setStatus("Audio error: " + e.message));
    setStatus(`Playing: ${type}`);
  }
  
  document.getElementById("ambient-dropdown").hidden = true;
};

document.getElementById("btn-ambient").addEventListener("click", () => {
  const dd = document.getElementById("ambient-dropdown");
  dd.hidden = !dd.hidden;
});

/* ----- Sidebar Outline ----- */
const btnSidebar = document.getElementById("btn-sidebar");
const sidebarNav = document.getElementById("sidebar-nav");
const btnCloseSidebar = document.getElementById("btn-close-sidebar");
const sidebarContent = document.getElementById("sidebar-content");

function updateOutline() {
  if (sidebarNav.hidden) return;
  
  const headings = editor.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) {
    sidebarContent.innerHTML = "<p style='color:var(--text); opacity:0.5;'>No headings found.</p>";
    return;
  }
  
  let html = "<ul style='list-style:none; padding:0; margin:0;'>";
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = "heading-" + Date.now() + "-" + index;
    const level = parseInt(heading.nodeName.substring(1));
    const padding = (level - 1) * 1;
    html += `<li style="padding-left: ${padding}rem; margin-bottom: 0.5rem;">
               <a href="#" onclick="document.getElementById('${heading.id}').scrollIntoView({behavior:'smooth'}); return false;" style="color:var(--text); text-decoration:none;">${heading.textContent}</a>
             </li>`;
  });
  html += "</ul>";
  sidebarContent.innerHTML = html;
}

btnSidebar.addEventListener("click", () => {
  sidebarNav.hidden = !sidebarNav.hidden;
  if (!sidebarNav.hidden) updateOutline();
});
if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", () => sidebarNav.hidden = true);

editor.addEventListener("input", () => {
  if (!sidebarNav.hidden) updateOutline();
});

/* ----- Insert ToC ----- */
document.getElementById("cmd-insertToC").addEventListener("click", () => {
  const headings = editor.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) {
    setStatus("Add headings first");
    return;
  }
  
  let tocHtml = `<div class="toc-block" contenteditable="false" style="border:1px solid var(--border); padding:1rem; border-radius:var(--radius); margin:1rem 0; background:var(--bg-ribbon);">`;
  tocHtml += `<h2 style="margin-top:0;">Table of Contents</h2>`;
  tocHtml += `<ul style="list-style:none; padding:0;">`;
  
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = "heading-" + Date.now() + "-" + index;
    const level = parseInt(heading.nodeName.substring(1));
    const padding = (level - 1) * 1.5;
    tocHtml += `<li style="margin-left: ${padding}rem; margin-bottom: 0.25rem;">
      <a href="#${heading.id}" style="color:var(--text); text-decoration:underline;">${heading.textContent}</a>
    </li>`;
  });
  
  tocHtml += `</ul></div><p><br></p>`;
  exec("insertHTML", tocHtml);
});

/* ----- Pomodoro Timer ----- */
const pomoWidget = document.getElementById("pomodoro-widget");
const pomoTime = document.getElementById("pomo-time");
let pomoInterval = null;
let pomoSeconds = 25 * 60;
let isPomoRunning = false;
let isPomoBreak = false;

function updatePomoDisplay() {
  if (!pomoTime) return;
  const m = Math.floor(pomoSeconds / 60).toString().padStart(2, '0');
  const s = (pomoSeconds % 60).toString().padStart(2, '0');
  pomoTime.textContent = `${m}:${s}`;
  if (isPomoBreak) {
    pomoWidget.style.color = "#4ade80";
  } else if (isPomoRunning) {
    pomoWidget.style.color = "#f87171";
  } else {
    pomoWidget.style.color = "var(--text)";
  }
}

function stopPomo() {
  clearInterval(pomoInterval);
  pomoInterval = null;
  isPomoRunning = false;
  updatePomoDisplay();
}

function startPomo() {
  if (pomoInterval) return stopPomo();
  
  isPomoRunning = true;
  updatePomoDisplay();
  
  pomoInterval = setInterval(() => {
    pomoSeconds--;
    if (pomoSeconds <= 0) {
      if (!isPomoBreak) {
        isPomoBreak = true;
        pomoSeconds = 5 * 60;
        if (Notification.permission === "granted") {
          new Notification("Pomodoro complete! Take a 5 minute break.");
        }
      } else {
        isPomoBreak = false;
        pomoSeconds = 25 * 60;
        if (Notification.permission === "granted") {
          new Notification("Break over! Time to focus.");
        }
      }
    }
    updatePomoDisplay();
  }, 1000);
}

if (pomoWidget) {
  pomoWidget.addEventListener("click", () => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    startPomo();
  });
}

/* ----- Version History ----- */
const historyModal = document.getElementById("history-modal");
const btnHistory = document.getElementById("btn-history");
const btnCloseHistory = document.getElementById("btn-close-history");
const historyList = document.getElementById("history-list");

let autoSaveTimer = null;
const saveIntervalMs = 5 * 60 * 1000;

function saveVersion() {
  const content = getHtml();
  if (!content.trim() || content === '<p><br></p>') return;
  
  const v = {
    timestamp: Date.now(),
    dateStr: new Date().toLocaleString(),
    html: content
  };
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('texter-history')) || JSON.parse(localStorage.getItem('truetooth-history')) || [];
  } catch(e) {}
  
  history.unshift(v);
  if (history.length > 20) history = history.slice(0, 20);
  
  localStorage.setItem('texter-history', JSON.stringify(history));
}

autoSaveTimer = setInterval(saveVersion, saveIntervalMs);

if (btnHistory) {
  btnHistory.addEventListener("click", () => {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('texter-history')) || [];
    } catch(e) {}
    
    if (history.length === 0) {
      historyList.innerHTML = '<p style="color:var(--text); opacity:0.5; padding:1rem;">No history recorded yet. Edits auto-save every 5 mins.</p>';
    } else {
      historyList.innerHTML = history.map((v, i) => `
        <div style="border-bottom:1px solid var(--border); padding:0.5rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:bold;">${v.dateStr}</div>
            <div style="font-size:0.8rem; opacity:0.7;">Version ${history.length - i}</div>
          </div>
          <button class="btn-top" onclick="restoreVersion(${v.timestamp})" style="padding:0.25rem 0.5rem; border:1px solid var(--border); cursor:pointer;">Restore</button>
        </div>
      `).join('');
    }
    historyModal.hidden = false;
  });
}

if (btnCloseHistory) {
  btnCloseHistory.addEventListener("click", () => historyModal.hidden = true);
}

window.restoreVersion = function(ts) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('texter-history')) || [];
  } catch(e) {}
  
  const v = history.find(h => h.timestamp === ts);
  if (v) {
    if (confirm("Are you sure you want to restore this version? Current changes will be overwritten!")) {
      saveVersion();
      setHtml(v.html);
      historyModal.hidden = true;
      setStatus("Restored version");
    }
  }
};

/* ----- Sticky Notes ----- */
const btnInsertSticky = document.getElementById("cmd-insertSticky");

if (btnInsertSticky) {
  btnInsertSticky.addEventListener("click", () => {
    const sticky = document.createElement("div");
    sticky.className = "sticky-note";
    
    const rx = Math.random() * 50;
    const ry = Math.random() * 50;
    sticky.style.left = `calc(50% + ${rx}px)`;
    sticky.style.top = `calc(30% + ${ry}px)`;
    
    sticky.innerHTML = `
      <div class="sticky-header">
        <button class="sticky-close">&times;</button>
      </div>
      <div class="sticky-content" contenteditable="true" spellcheck="false" data-placeholder="Note..."></div>
    `;
    
    document.body.appendChild(sticky);
    
    const header = sticky.querySelector(".sticky-header");
    const closeBtn = sticky.querySelector(".sticky-close");
    
    closeBtn.addEventListener("click", () => sticky.remove());
    
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = sticky.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      // bring to front
      document.querySelectorAll('.sticky-note').forEach(n => n.style.zIndex = "100");
      sticky.style.zIndex = "101";
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      sticky.style.left = (e.clientX - offsetX) + "px";
      sticky.style.top = (e.clientY - offsetY) + "px";
    });
    
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  });
}

/* ----- Highlihgter Pen ----- */
const cmdHighlight = document.getElementById("cmd-highlight");

if (cmdHighlight && highlightColorInput) {
  cmdHighlight.addEventListener("click", () => {
    const color = highlightColorInput.value;
    document.execCommand("backColor", false, color);
    editor.focus();
  });
}

/* ----- To-Do Checklists Progress ----- */
function _updateChecklists() {
  const checkboxes = editor.querySelectorAll('input[type="checkbox"]');
  const todoWidget = document.getElementById("todo-widget");
  if (!checkboxes || checkboxes.length === 0) {
    if (todoWidget) todoWidget.style.display = "none";
    return;
  }
  
  if (todoWidget) todoWidget.style.display = "flex";
  
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  
  const pct = Math.round((checked / total) * 100);
  const todoText = document.getElementById("todo-text");
  const todoBar = document.getElementById("todo-progress-bar");
  
  if (todoText) todoText.textContent = `${checked}/${total}`;
  if (todoBar) todoBar.style.width = `${pct}%`;
}

editor.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    _updateChecklists();
  }
});
// Need to trigger it manually occasionally like when a new block is inserted or content typed
editor.addEventListener("input", () => {
  _updateChecklists();
});


/* ----- Command Palette ----- */
const cmdPaletteModal = document.getElementById("cmd-palette-modal");
const cmdPaletteInput = document.getElementById("cmd-palette-input");
const cmdPaletteList = document.getElementById("cmd-palette-list");

const commands = [
  { name: "Save HTML", icon: "save", action: () => document.getElementById("btn-save").click() },
  { name: "Save as PDF", icon: "file-text", action: () => document.getElementById("btn-save-pdf").click() },
  { name: "Save as PNG", icon: "image", action: () => document.getElementById("btn-save-png").click() },
  { name: "Save as DOCX", icon: "file", action: () => document.getElementById("btn-save-docx").click() },
  { name: "Save as Markdown", icon: "code", action: () => document.getElementById("btn-save-md").click() },
  { name: "Save as Text", icon: "align-left", action: () => document.getElementById("btn-save-txt").click() },
  { name: "Print Document", icon: "printer", action: () => document.getElementById("btn-print").click() },
  { name: "Toggle Focus Mode", icon: "eye", action: () => document.getElementById("btn-focus").click() },
  { name: "Toggle Fullscreen", icon: "maximize", action: () => document.getElementById("btn-fullscreen").click() },
  { name: "Toggle Theme", icon: "moon", action: () => document.getElementById("btn-theme").click() },
  { name: "Open Sidebar Outline", icon: "list", action: () => document.getElementById("btn-sidebar").click() },
  { name: "Start Pomodoro Timer", icon: "timer", action: () => startPomo() },
  { name: "Stop Pomodoro Timer", icon: "timer-off", action: () => stopPomo() },
  { name: "Play Rain Sounds", icon: "cloud-rain", action: () => playAmbient("rain") },
  { name: "Play Cafe Sounds", icon: "coffee", action: () => playAmbient("cafe") },
  { name: "Play Space Sounds", icon: "moon", action: () => playAmbient("space") },
  { name: "Stop Ambient Sounds", icon: "volume-x", action: () => playAmbient("stop") },
  { name: "Insert Table of Contents", icon: "list-ordered", action: () => document.getElementById("cmd-insertToC").click() },
  { name: "Insert Sticky Note", icon: "sticky-note", action: () => document.getElementById("cmd-insertSticky").click() },
  { name: "View Version History", icon: "history", action: () => document.getElementById("btn-history").click() },
  { name: "Drawing Pad", icon: "pen-tool", action: () => document.getElementById("cmd-insertDraw").click() },
  { name: "Highlight Code Blocks", icon: "code", action: () => document.getElementById("btn-highlight-code").click() }
];

let filteredCommands = [];
let cmdSelectedIndex = 0;

function renderCmdPalette() {
  if (!cmdPaletteInput) return;
  const query = cmdPaletteInput.value.toLowerCase();
  filteredCommands = commands.filter(c => c.name.toLowerCase().includes(query));
  
  if (filteredCommands.length === 0) {
    cmdPaletteList.innerHTML = `<p style="padding:1rem; opacity:0.5; color:var(--text); text-align:center;">No commands found.</p>`;
    return;
  }
  
  cmdPaletteList.innerHTML = filteredCommands.map((c, i) => `
    <div class="cmd-item ${i === cmdSelectedIndex ? 'active' : ''}" data-index="${i}">
      <i data-lucide="${c.icon}" style="width:1.2rem; height:1.2rem;"></i>
      <span>${c.name}</span>
    </div>
  `).join('');
  
  lucide.createIcons();
  
  const items = cmdPaletteList.querySelectorAll('.cmd-item');
  items.forEach(item => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.getAttribute("data-index"));
      executeCommand(idx);
    });
    item.addEventListener("mouseenter", () => {
      cmdSelectedIndex = parseInt(item.getAttribute("data-index"));
      renderCmdPalette();
    });
  });
}

function executeCommand(index) {
  if (filteredCommands[index]) {
    cmdPaletteModal.hidden = true;
    filteredCommands[index].action();
  }
}

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    if (cmdPaletteModal.hidden) {
      cmdPaletteModal.hidden = false;
      if (cmdPaletteInput) {
        cmdPaletteInput.value = "";
        cmdSelectedIndex = 0;
        renderCmdPalette();
        setTimeout(() => cmdPaletteInput.focus(), 10);
      }
    } else {
      cmdPaletteModal.hidden = true;
    }
  }
});

if (cmdPaletteInput) {
  cmdPaletteInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cmdSelectedIndex = (cmdSelectedIndex + 1) % filteredCommands.length;
      renderCmdPalette();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cmdSelectedIndex = (cmdSelectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderCmdPalette();
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(cmdSelectedIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cmdPaletteModal.hidden = true;
    }
  });

  cmdPaletteInput.addEventListener("input", () => {
    cmdSelectedIndex = 0;
    renderCmdPalette();
  });
}

if (cmdPaletteModal) {
  cmdPaletteModal.addEventListener("click", (e) => {
    if (e.target === cmdPaletteModal) {
      cmdPaletteModal.hidden = true;
    }
  });
}

/* ----- Typewriter Auto-Scrolling ----- */
const btnTypewriter = document.getElementById("btn-typewriter");
let isTypewriterMode = false;

if (btnTypewriter) {
  btnTypewriter.addEventListener("click", () => {
    isTypewriterMode = !isTypewriterMode;
    if (isTypewriterMode) {
      btnTypewriter.style.color = "var(--accent)";
      setStatus("Typewriter Mode Enabled");
    } else {
      btnTypewriter.style.color = "";
      setStatus("Typewriter Mode Disabled");
    }
  });

  editor.addEventListener("keyup", (e) => {
    if (!isTypewriterMode) return;
    if (e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      keepCaretCentered();
    }
  });
  
  editor.addEventListener("click", () => {
    if (isTypewriterMode) keepCaretCentered();
  });
}

function keepCaretCentered() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  
  const span = document.createElement("span");
  span.appendChild(document.createTextNode("\u200b"));
  range.insertNode(span);
  const rect = span.getBoundingClientRect();
  span.parentNode.removeChild(span);
  
  if (rect.top === 0 && rect.bottom === 0) return;
  
  const targetY = window.innerHeight / 2;
  const diff = rect.top - targetY;
  
  if (Math.abs(diff) > 20) {
    const docWrap = document.querySelector(".doc-wrap");
    if (docWrap) {
      docWrap.scrollBy({ top: diff, behavior: 'smooth' });
    }
  }
}

/* ----- Gamified Writing Goals ----- */
const goalTracker = document.getElementById("goal-tracker");
let targetWords = parseInt(localStorage.getItem('truetooth-goal')) || 0;
let goalAchieved = false;

window.updateGoalDisplay = function(currentWords) {
  if (!goalTracker) return;
  if (targetWords <= 0) {
    goalTracker.textContent = "🎯 Goal: ---";
    return;
  }
  goalTracker.textContent = `🎯 Goal: ${currentWords} / ${targetWords}`;
  
  if (currentWords >= targetWords && !goalAchieved) {
    goalAchieved = true;
    goalTracker.style.color = "#4ade80";
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 },
        zIndex: 9999
      });
    }
  } else if (currentWords < targetWords) {
    goalAchieved = false;
    goalTracker.style.color = "var(--text)";
  }
};

if (goalTracker) {
  goalTracker.addEventListener("click", () => {
    const val = prompt("Set a target word count (enter 0 to remove):", targetWords);
    if (val !== null) {
      const parsed = parseInt(val);
      if (!isNaN(parsed) && parsed >= 0) {
        targetWords = parsed;
        localStorage.setItem('truetooth-goal', targetWords);
        goalAchieved = false;
        
        const text = getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        updateGoalDisplay(words);
      }
    }
  });
  
  // initialize
  setTimeout(() => {
    const text = getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    updateGoalDisplay(words);
  }, 500);
}

/* ----- Find & Replace ----- */
const findModal = document.getElementById("find-modal");
const btnFindReplace = document.getElementById("btn-find-replace");
const btnCloseFind = document.getElementById("btn-close-find");
const findInput = document.getElementById("find-input");
const replaceInput = document.getElementById("replace-input");
const btnFindNext = document.getElementById("btn-find-next");
const btnReplace = document.getElementById("btn-replace");

if (btnFindReplace) btnFindReplace.addEventListener("click", () => findModal.hidden = false);
if (btnCloseFind) btnCloseFind.addEventListener("click", () => findModal.hidden = true);

if (btnFindNext) {
  btnFindNext.addEventListener("click", () => {
    if (!findInput.value) return;
    editor.focus();
    const found = window.find(findInput.value, false, false, true, false, false, false);
    if (!found) setStatus("No more matches.");
  });
}

if (btnReplace) {
  btnReplace.addEventListener("click", () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && sel.toString().toLowerCase() === findInput.value.toLowerCase()) {
      document.execCommand("insertText", false, replaceInput.value);
    }
    if (findInput.value) {
      window.find(findInput.value, false, false, true, false, false, false);
    }
  });
}

/* ----- Background Texture ----- */
const bgImageInput = document.getElementById("bg-image-input");
if (bgImageInput) {
  bgImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        editor.style.backgroundImage = `url(${ev.target.result})`;
        editor.style.backgroundRepeat = "repeat";
        editor.style.backgroundSize = "auto";
        setStatus("Background texture applied.");
      };
      reader.readAsDataURL(file);
    }
  });
}

/* ----- Writer's Dictionary (Datamuse) ----- */
const dictModal = document.getElementById("dict-modal");
const btnDictionary = document.getElementById("btn-dictionary");
const btnCloseDict = document.getElementById("btn-close-dict");
const dictForm = document.getElementById("dict-form");
const dictInput = document.getElementById("dict-input");
const dictResults = document.getElementById("dict-results");

if (btnDictionary) btnDictionary.addEventListener("click", () => dictModal.hidden = false);
if (btnCloseDict) btnCloseDict.addEventListener("click", () => dictModal.hidden = true);

if (dictForm) {
  dictForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const word = dictInput.value.trim();
    if (!word) return;

    dictResults.innerHTML = "<p>Searching...</p>";

    try {
      // Synonyms (rel_syn), Antonyms (rel_ant), Rhymes (rel_rhy)
      const [syns, ants, rhys] = await Promise.all([
        fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=10`).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=10`).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_rhy=${word}&max=10`).then(r => r.json())
      ]);

      let html = "";
      
      html += `<div><strong>Synonyms:</strong> ${syns.length ? syns.map(w => w.word).join(", ") : "None found"}</div>`;
      html += `<div style="margin-top:0.5rem;"><strong>Antonyms:</strong> ${ants.length ? ants.map(w => w.word).join(", ") : "None found"}</div>`;
      html += `<div style="margin-top:0.5rem;"><strong>Rhymes:</strong> ${rhys.length ? rhys.map(w => w.word).join(", ") : "None found"}</div>`;
      
      dictResults.innerHTML = html;
    } catch (err) {
      dictResults.innerHTML = `<p style="color:red;">Error fetching data: ${err.message}</p>`;
    }
  });
}

/* ----- Phase 9: Precision & Productivity ----- */

/* 1. Smart Snippets */
let snippets = JSON.parse(localStorage.getItem('texter-snippets')) || {
  ";sig": "Sincerely,\n[Your Name]",
  ";date": new Date().toLocaleDateString(),
  ";h1": "<h1>New Section</h1>"
};

const snippetsModal = document.getElementById("snippets-modal");
const btnSnippets = document.getElementById("btn-snippets");
const btnCloseSnippets = document.getElementById("btn-close-snippets");
const snippetsList = document.getElementById("snippets-list");
const snippetTrigger = document.getElementById("snippet-trigger");
const snippetExpansion = document.getElementById("snippet-expansion");
const btnAddSnippet = document.getElementById("btn-add-snippet");

function renderSnippets() {
  if (!snippetsList) return;
  snippetsList.innerHTML = Object.entries(snippets).map(([trig, exp]) => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; padding:0.25rem; border-bottom:1px solid var(--border);">
      <span style="font-family:monospace; color:var(--accent);">${trig}</span>
      <div style="flex:1; margin:0 1rem; opacity:0.7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${exp}</div>
      <button onclick="deleteSnippet('${trig}')" class="icon-btn" style="color:red; padding:0.1rem;"><i data-lucide="trash-2" style="width:0.8rem; height:0.8rem;"></i></button>
    </div>
  `).join("") || "<p style='opacity:0.5;'>No snippets added.</p>";
  lucide.createIcons();
}

window.deleteSnippet = (trig) => {
  delete snippets[trig];
  localStorage.setItem('texter-snippets', JSON.stringify(snippets));
  renderSnippets();
};

if (btnSnippets) btnSnippets.addEventListener("click", () => {
  snippetsModal.hidden = false;
  renderSnippets();
});
if (btnCloseSnippets) btnCloseSnippets.addEventListener("click", () => snippetsModal.hidden = true);

if (btnAddSnippet) {
  btnAddSnippet.addEventListener("click", () => {
    const trig = snippetTrigger.value.trim();
    const exp = snippetExpansion.value.trim();
    if (trig && exp) {
      snippets[trig] = exp;
      localStorage.setItem('texter-snippets', JSON.stringify(snippets));
      snippetTrigger.value = "";
      snippetExpansion.value = "";
      renderSnippets();
    }
  });
}

// Text expansion logic
editor.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const textBefore = range.startContainer.textContent.substring(0, range.startOffset);
    const lastWord = textBefore.split(/\s+/).pop();
    
    if (snippets[lastWord]) {
      e.preventDefault();
      // Backspace the trigger
      for (let i = 0; i < lastWord.length; i++) {
        document.execCommand("delete", false, null);
      }
      // Insert expansion
      document.execCommand("insertHTML", false, snippets[lastWord]);
      // Add the space back
      document.execCommand("insertText", false, " ");
    }
  }
});

/* 2. Layout Templates */
const templatesModal = document.getElementById("templates-modal");
const btnTemplates = document.getElementById("btn-templates");
const btnCloseTemplates = document.getElementById("btn-close-templates");

if (btnTemplates) btnTemplates.addEventListener("click", () => templatesModal.hidden = false);
if (btnCloseTemplates) btnCloseTemplates.addEventListener("click", () => templatesModal.hidden = true);

window.loadTemplate = (type) => {
  templatesModal.hidden = true;
  if (!confirm("Loading a template will clear your current document. Continue?")) return;
  
  let content = "";
  if (type === 'letter') {
    content = `
      <p style="text-align:right;">[Your Name]<br>[Your Address]<br>[Date]</p>
      <p>[Recipient Name]<br>[Recipient Address]</p>
      <p>Dear [Recipient Name],</p>
      <p>Start writing your formal letter here...</p>
      <p>Sincerely,<br><br><br>[Your Name]</p>
    `;
  } else if (type === 'minutes') {
    content = `
      <h1 style="text-align:center;">Meeting Minutes</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}<br><strong>Attendees:</strong> [Names]</p>
      <hr>
      <h3>Agenda</h3>
      <ol><li>Item 1</li><li>Item 2</li></ol>
      <h3>Discussion Points</h3>
      <ul><li>Point A</li><li>Point B</li></ul>
      <h3>Action Items</h3>
      <table border="1" style="width:100%; border-collapse:collapse;">
        <tr><th>Action</th><th>Owner</th><th>Deadline</th></tr>
        <tr><td>[Task]</td><td>[Name]</td><td>[Date]</td></tr>
      </table>
    `;
  } else if (type === 'essay') {
    content = `
      <h1 style="text-align:center;">[Essay Title]</h1>
      <p style="text-align:center;">[Your Name]</p>
      <p style="text-indent: 2rem;">Introduction paragraph starts here. Hook the reader and present your thesis statement clearly.</p>
      <h3>Body Paragraph 1</h3>
      <p style="text-indent: 2rem;">Discuss your first major supporting point here. Provide evidence and analysis.</p>
      <h3>Conclusion</h3>
      <p style="text-indent: 2rem;">Summarize your main arguments and provide a final thought or call to action.</p>
    `;
  }
  
  editor.innerHTML = content;
  _updateStats();
  _updatePages();
  setStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} template loaded.`);
};

/* 3. Line Focus Mode */
const btnLineFocus = document.getElementById("btn-line-focus");
let isLineFocus = false;

if (btnLineFocus) {
  btnLineFocus.addEventListener("click", () => {
    isLineFocus = !isLineFocus;
    document.body.classList.toggle("line-focus-active", isLineFocus);
    btnLineFocus.style.color = isLineFocus ? "var(--accent)" : "";
    if (isLineFocus) {
      updateLineFocus();
      setStatus("Line Focus Mode Enabled");
    } else {
      const focused = editor.querySelectorAll(".focus-current-line");
      focused.forEach(f => f.classList.remove("focus-current-line"));
      setStatus("Line Focus Mode Disabled");
    }
  });
}

function updateLineFocus() {
  if (!isLineFocus) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  let node = sel.anchorNode;
  if (node.nodeType === 3) node = node.parentNode;
  
  // Find top level block inside editor
  while (node && node.parentNode !== editor && node !== editor) {
    node = node.parentNode;
  }
  
  if (node && node.parentNode === editor) {
    const active = editor.querySelectorAll(".focus-current-line");
    active.forEach(a => { if (a !== node) a.classList.remove("focus-current-line"); });
    node.classList.add("focus-current-line");
  }
}

document.addEventListener("selectionchange", updateLineFocus);
editor.addEventListener("input", updateLineFocus);

/* Add to command palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Toggle Line Focus", icon: "eye-off", action: () => btnLineFocus.click() });
  commands.push({ name: "Layout Templates", icon: "layout", action: () => templatesModal.hidden = false });
  commands.push({ name: "Edit Snippets", icon: "cpu", action: () => snippetsModal.hidden = false });
}

/* ----- Phase 10: The Masterpiece Upgrade ----- */

/* 1. Integrated Watermarking */
const watermarkModal = document.getElementById("watermark-modal");
const btnWatermark = document.getElementById("btn-watermark");
const btnCloseWatermark = document.getElementById("btn-close-watermark");
const btnApplyWatermark = document.getElementById("btn-apply-watermark");
const btnRemoveWatermark = document.getElementById("btn-remove-watermark");
const watermarkTextInput = document.getElementById("watermark-text-input");
const watermarkOpacityInput = document.getElementById("watermark-opacity");

if (btnWatermark) btnWatermark.addEventListener("click", () => watermarkModal.hidden = false);
if (btnCloseWatermark) btnCloseWatermark.addEventListener("click", () => watermarkModal.hidden = true);

if (btnApplyWatermark) {
  btnApplyWatermark.addEventListener("click", () => {
    const text = watermarkTextInput.value.trim() || "DRAFT";
    const opacity = watermarkOpacityInput.value;
    
    // Remove existing
    document.querySelectorAll(".watermark-overlay").forEach(el => el.remove());
    
    const overlay = document.createElement("div");
    overlay.className = "watermark-overlay";
    overlay.innerHTML = `<div class="watermark-text" style="opacity: ${opacity}">${text}</div>`;
    
    editor.appendChild(overlay);
    watermarkModal.hidden = true;
    setStatus(`Watermark "${text}" applied.`);
  });
}

if (btnRemoveWatermark) {
  btnRemoveWatermark.addEventListener("click", () => {
    document.querySelectorAll(".watermark-overlay").forEach(el => el.remove());
    watermarkModal.hidden = true;
    setStatus("Watermark removed.");
  });
}

/* 2. Version Comparison (Time Machine Diff) */
const historyDiffContainer = document.getElementById("history-diff-container");
const historyListContainer = document.getElementById("history-list");
const diffPast = document.getElementById("diff-past");
const diffCurrent = document.getElementById("diff-current");
const btnExitDiff = document.getElementById("btn-exit-diff");

window.compareVersion = (index) => {
  const history = JSON.parse(localStorage.getItem('texter-history')) || [];
  const snapshot = history[index];
  if (!snapshot) return;

  historyListContainer.hidden = true;
  historyDiffContainer.hidden = false;
  
  const currentText = editor.innerText;
  const pastText = snapshot.content.replace(/<[^>]*>/g, ''); // Crude strip for comparison
  
  diffPast.innerText = pastText;
  
  // Simple word-by-word diff simulation
  const currentWords = currentText.split(/\s+/);
  const pastWords = pastText.split(/\s+/);
  
  let diffHtml = "";
  currentWords.forEach(word => {
    if (pastWords.includes(word)) {
      diffHtml += word + " ";
    } else {
      diffHtml += `<span class="diff-added">${word}</span> `;
    }
  });
  
  diffCurrent.innerHTML = diffHtml;
  document.getElementById("diff-meta").innerText = `Comparing with ${snapshot.timestamp}`;
};

if (btnExitDiff) {
  btnExitDiff.addEventListener("click", () => {
    historyDiffContainer.hidden = true;
    historyListContainer.hidden = false;
  });
}

// Intercept original history rendering to add Compare button
const originalRenderHistory = window.renderHistory;
window.renderHistory = function() {
  const history = JSON.parse(localStorage.getItem('texter-history')) || [];
  const list = document.getElementById("history-list");
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML = `<p style="color:var(--text); opacity:0.5;">No history recorded yet.</p>`;
    return;
  }
  
  list.innerHTML = history.map((item, i) => `
    <div style="padding:0.75rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:0.8rem;">
        <div style="font-weight:bold; color:var(--text);">${item.timestamp}</div>
        <div style="opacity:0.6;">${item.content.length} chars</div>
      </div>
      <div style="display:flex; gap:0.25rem;">
        <button onclick="compareVersion(${i})" class="btn-top" style="font-size:0.7rem; padding:0.2rem 0.4rem;">Diff</button>
        <button onclick="restoreHistory(${i})" class="btn-top" style="font-size:0.7rem; padding:0.2rem 0.4rem; background:var(--accent); color:#fff;">Restore</button>
      </div>
    </div>
  `).join("");
};

/* 3. Custom Local Font Loader */
const btnLoadFont = document.getElementById("btn-load-font");
const fontLoaderInput = document.getElementById("font-loader-input");

if (btnLoadFont) btnLoadFont.addEventListener("click", () => fontLoaderInput.click());
if (fontLoaderInput) {
  fontLoaderInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fontName = file.name.split('.')[0].replace(/\s+/g, '-');
      const fontData = ev.target.result;
      
      const newStyle = document.createElement('style');
      newStyle.appendChild(document.createTextNode(`
        @font-face {
          font-family: '${fontName}';
          src: url('${fontData}');
        }
      `));
      document.head.appendChild(newStyle);
      
      const option = document.createElement("option");
      option.value = `'${fontName}', sans-serif`;
      option.text = `Custom: ${fontName}`;
      document.getElementById("font-family").add(option, 0);
      document.getElementById("font-family").value = option.value;
      editor.style.fontFamily = option.value;
      
      setStatus(`Custom font "${fontName}" loaded.`);
    };
    reader.readAsDataURL(file);
  });
}

/* 4. Mechanical Keyboard Sound Simulation */
const btnSounds = document.getElementById("btn-sounds");
let typingSoundsEnabled = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
  if (!typingSoundsEnabled) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

if (btnSounds) {
  btnSounds.addEventListener("click", () => {
    typingSoundsEnabled = !typingSoundsEnabled;
    btnSounds.style.color = typingSoundsEnabled ? "var(--accent)" : "";
    if (typingSoundsEnabled && audioCtx.state === 'suspended') audioCtx.resume();
    setStatus(typingSoundsEnabled ? "Typewriter sounds ON" : "Typewriter sounds OFF");
  });
  editor.addEventListener("keydown", playClickSound);
}

/* 5. Mood Themes Palette */
const moodThemeSelect = document.getElementById("mood-theme");
if (moodThemeSelect) {
  moodThemeSelect.addEventListener("change", () => {
    const mood = moodThemeSelect.value;
    document.body.className = mood === 'default' ? "" : `mood-${mood}`;
    setStatus(`Mood theme: ${mood}`);
    if (window.lucide) lucide.createIcons();
  });
}

/* 6. AI Toolkit: Rewrite, Summarize, Outline */
const btnAiRewrite = document.getElementById("btn-ai-rewrite");
const btnAiSummarize = document.getElementById("btn-ai-summarize");
const btnAiOutline = document.getElementById("btn-ai-outline");

if (btnAiRewrite) {
  btnAiRewrite.addEventListener("click", () => {
    const sel = window.getSelection().toString().trim();
    if (!sel) { setStatus("Highlight a sentence to rewrite!"); return; }
    
    const variations = [
      `[Concise]: ${sel.substring(0, sel.length/2)}...`,
      `[Poetic]: A dance of words: ${sel}`,
      `[Professional]: It is observed that ${sel.toLowerCase()}`
    ];
    
    const choice = prompt(`Rewrite Suggestions:\n1. ${variations[0]}\n2. ${variations[1]}\n3. ${variations[2]}\n\nEnter Number to replace:`);
    if (choice >= 1 && choice <= 3) {
      document.execCommand("insertText", false, variations[choice-1]);
    }
  });
}

if (btnAiSummarize) {
  btnAiSummarize.addEventListener("click", () => {
    const text = getText();
    if (text.length < 50) { setStatus("Too short to summarize!"); return; }
    alert(`Document Summary:\n- Main focus: [Detected Topics]\n- Sentiment: [Positive/Neutral]\n- Conclusion: [AI Summary Placeholder]`);
  });
}

if (btnAiOutline) {
  btnAiOutline.addEventListener("click", () => {
    const text = getText();
    const headers = text.match(/#+ .*/g) || ["Introduction", "Main Body", "Conclusion"];
    let outline = "<h3>AI Generated Outline</h3><ul>";
    headers.forEach(h => outline += `<li>${h}</li>`);
    outline += "</ul>";
    document.execCommand("insertHTML", false, outline);
    setStatus("Outline generated in place.");
  });
}

/* 7. Analytics: Word Cloud & Vibe */
const statSentiment = document.getElementById("stat-sentiment");
const wordCloudContainer = document.getElementById("word-cloud-container");

// Enhance original stats update
const originalUpdateStats = window._updateStats;
window._updateStats = function() {
  if (originalUpdateStats) originalUpdateStats();
  
  const text = getText().toLowerCase();
  const words = text.match(/\b\w{4,}\b/g) || [];
  
  // Word Cloud logic
  const counts = {};
  words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
  
  if (wordCloudContainer) {
    wordCloudContainer.innerHTML = sorted.map(([w, c]) => 
      `<span style="font-size:${0.8 + c*0.2}rem; margin:0.3rem; color:var(--accent); font-weight:bold;">${w}</span>`
    ).join("");
  }
  
  // Sentiment simulation
  if (statSentiment) {
    const pos = (text.match(/good|great|happy|best|love|amazing/g) || []).length;
    const neg = (text.match(/bad|sad|worst|terrible|hate|error/g) || []).length;
    statSentiment.textContent = pos > neg ? "😊 Positive" : (neg > pos ? "😔 Negative" : "😐 Neutral");
  }
};

/* 8. Voice Commands Simulation */
const voiceModal = document.getElementById("voice-modal");
const btnVoice = document.getElementById("btn-voice");
const btnCloseVoice = document.getElementById("btn-close-voice");
const btnListenToggle = document.getElementById("btn-listen-toggle");
const voiceIndicator = document.getElementById("voice-indicator");
const voiceStatus = document.getElementById("voice-status");

if (btnVoice) btnVoice.addEventListener("click", () => voiceModal.hidden = false);
if (btnCloseVoice) btnCloseVoice.addEventListener("click", () => voiceModal.hidden = true);

if (btnListenToggle) {
  let isListening = false;
  btnListenToggle.addEventListener("click", () => {
    isListening = !isListening;
    voiceIndicator.classList.toggle("listening", isListening);
    btnListenToggle.textContent = isListening ? "Stop Listening" : "Start Listening";
    voiceStatus.textContent = isListening ? "Listening for commands..." : "Ready";
    
    if (isListening) {
      setTimeout(() => {
        if (!isListening) return;
        const cmd = prompt("Voice Command Simulation (since browser may block mic):\nType: 'Save', 'Full', 'Bold', or 'Date'");
        if (cmd) {
          if (cmd.includes("Save")) document.getElementById("btn-save").click();
          if (cmd.includes("Full")) document.getElementById("btn-fullscreen").click();
          if (cmd.includes("Bold")) document.getElementById("cmd-bold").click();
          if (cmd.includes("Date")) document.getElementById("cmd-insertDate").click();
          setStatus(`Voice Command executed: ${cmd}`);
        }
        btnListenToggle.click(); // stop
      }, 500);
    }
  });
}

/* Update Command Palette with new features */
if (typeof commands !== "undefined") {
  commands.push({ name: "Mood Themes", icon: "palette", action: () => { window.scrollTo(0,0); setStatus("Check Aesthetics ribbon!"); } });
  commands.push({ name: "Voice Center", icon: "mic", action: () => voiceModal.hidden = false });
  commands.push({ name: "Apply Watermark", icon: "stamp", action: () => watermarkModal.hidden = false });
}

// Ensure icons are created for new elements
if (window.lucide) lucide.createIcons();

/* ----- Phase 13: The Infinite Canvas ----- */

/* 1. Real-Time A4 Pagination */
const editorCanvas = document.getElementById("editor-canvas");
const PAGE_HEIGHT_LIMIT = 1050; // pixels (A4 approx @ 96dpi - padding)

function checkPagination() {
  const pages = editorCanvas.querySelectorAll(".page-a4");
  const lastPage = pages[pages.length - 1];
  
  if (lastPage.scrollHeight > PAGE_HEIGHT_LIMIT) {
    const newPage = document.createElement("div");
    newPage.className = "page-a4 doc-page";
    newPage.contentEditable = "true";
    newPage.setAttribute("data-placeholder", "Continue typing...");
    editorCanvas.appendChild(newPage);
    
    // Transfer overflow (simplified)
    // In a real app, we'd move the last child node, but here we just focus the new page
    newPage.focus();
    _updatePages();
    lucide.createIcons();
    setStatus("New page created.");
  }
}

// Enhance stats to count pages
const originalUpdatePages = window._updatePages;
window._updatePages = function() {
  if (originalUpdatePages) originalUpdatePages();
  const pageCount = editorCanvas.querySelectorAll(".page-a4").length;
  const statPages = document.getElementById("stat-pages");
  if (statPages) statPages.textContent = pageCount;
};

editorCanvas.addEventListener("input", (e) => {
  if (e.target.classList.contains("page-a4")) {
    checkPagination();
  }
});

/* 2. Integrated Task Board (Kanban Lite) */
const kanbanSidebar = document.getElementById("kanban-sidebar");
const btnKanban = document.getElementById("btn-kanban");
const STORAGE_KEY = "texter-kanban";

btnKanban.addEventListener("click", () => {
  kanbanSidebar.hidden = !kanbanSidebar.hidden;
  if (!kanbanSidebar.hidden) loadKanban();
  updateKanbanBadge();
});

const columnIds = ["kanban-todo", "kanban-doing", "kanban-done"];

// Inline add on Enter (with bulk paste support)
document.querySelectorAll(".kanban-input").forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach(line => createKanbanTask(input.dataset.column, line));
      input.value = "";
    }
  });
  // Paste multiple lines
  input.addEventListener("paste", (e) => {
    setTimeout(() => {
      const val = input.value;
      if (val.includes("\n")) {
        // Let Enter handler process it
      }
    }, 0);
  });
});

// Clear column
document.querySelectorAll(".clear-col-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.column;
    const items = document.querySelectorAll(`#${col} .kanban-item`);
    if (!items.length) return;
    const snapshot = [];
    items.forEach(item => snapshot.push({
      text: item.querySelector(".kanban-text").textContent,
      priority: (item.className.match(/priority-\w+/) || [""])[0],
      done: item.classList.contains("done")
    }));
    items.forEach(el => el.remove());
    checkEmpty(col);
    saveKanban();
    updateCounts();
    showUndoToast(`Cleared ${snapshot.length} tasks`, "", col, false, () => {
      snapshot.forEach(({ text, priority, done }) => createKanbanTask(col, text, priority, done));
      updateKanbanBadge();
    });
  });
});

// Clear done only
document.querySelectorAll(".clear-col-done").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.column;
    document.querySelectorAll(`#${col} .kanban-item.done`).forEach(el => el.remove());
    checkEmpty(col);
    saveKanban();
    updateCounts();
  });
});

// Mark all done in column
document.querySelectorAll(".mark-all-done").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.column;
    document.querySelectorAll(`#${col} .kanban-item:not(.done)`).forEach(item => {
      item.classList.add("done");
      item.querySelector(".kanban-check").textContent = "☑";
    });
    saveKanban();
    updateCounts();
  });
});

// Move all to next column
const nextColMap = { "kanban-todo": "kanban-doing", "kanban-doing": "kanban-done" };
document.querySelectorAll(".move-all-next").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.column;
    const next = nextColMap[col];
    if (!next) return;
    const items = document.querySelectorAll(`#${col} .kanban-item`);
    const nextList = document.querySelector(`#${next} .kanban-list`);
    const nextEmpty = nextList.querySelector(".kanban-empty");
    if (nextEmpty) nextEmpty.remove();
    items.forEach(item => nextList.appendChild(item));
    checkEmpty(col);
    checkEmpty(next);
    saveKanban();
    updateCounts();
  });
});

// Sort by priority
document.querySelectorAll(".sort-by-prio").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.column;
    const list = document.querySelector(`#${col} .kanban-list`);
    const items = [...list.querySelectorAll(".kanban-item")];
    const prioOrder = { "priority-high": 0, "priority-medium": 1, "priority-low": 2, "": 3 };
    items.sort((a, b) => {
      const ap = a.className.match(/priority-\w+/);
      const bp = b.className.match(/priority-\w+/);
      return (prioOrder[ap ? ap[0] : ""] || 3) - (prioOrder[bp ? bp[0] : ""] || 3);
    });
    items.forEach(item => list.appendChild(item));
    const pinned = list.querySelectorAll(".kanban-item.pinned");
    pinned.forEach(p => list.insertBefore(p, list.firstChild));
    saveKanban();
  });
});

// Priority filter buttons
document.querySelectorAll(".prio-filter").forEach(btn => {
  btn.addEventListener("click", () => {
    const level = btn.dataset.level;
    document.querySelectorAll(".prio-filter").forEach(b => b.style.opacity = "0.3");
    btn.style.opacity = "0.8";
    document.querySelectorAll(".kanban-item").forEach(item => {
      if (!level) { item.hidden = false; return; }
      item.hidden = !item.classList.contains(level);
    });
  });
});

// Collapsible columns with persistence
document.querySelectorAll(".kanban-col-header").forEach(header => {
  const col = header.closest(".kanban-column");
  const colId = col.id;
  // Restore saved collapse state
  try {
    const collapsed = JSON.parse(localStorage.getItem("texter-kanban-cols") || "{}");
    if (collapsed[colId]) {
      const body = col.querySelector(".kanban-col-body");
      body.hidden = true;
      header.style.opacity = "0.25";
    }
  } catch (e) {}
  header.addEventListener("click", (e) => {
    if (e.target.closest(".clear-col-btn, .clear-col-done, .mark-all-done, .move-all-next")) return;
    const body = col.querySelector(".kanban-col-body");
    body.hidden = !body.hidden;
    header.style.opacity = body.hidden ? "0.25" : "0.5";
    // Save collapse state
    try {
      const collapsed = JSON.parse(localStorage.getItem("texter-kanban-cols") || "{}");
      collapsed[colId] = body.hidden;
      localStorage.setItem("texter-kanban-cols", JSON.stringify(collapsed));
    } catch (e) {}
  });
});

// Search / filter
const searchInput = document.getElementById("kanban-search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll(".kanban-item").forEach(item => {
      const text = item.querySelector(".kanban-text").textContent.toLowerCase();
      item.hidden = q && !text.includes(q);
    });
    document.querySelectorAll(".kanban-column").forEach(col => {
      const visible = col.querySelectorAll(".kanban-item:not([hidden])").length > 0;
      const hasItems = col.querySelectorAll(".kanban-item").length > 0;
      col.style.display = hasItems && !visible && q ? "none" : "";
    });
  });
}

// Focus mode
const focusBtn = document.getElementById("kanban-focus-mode");
let focusCol = null;
if (focusBtn) {
  focusBtn.addEventListener("click", () => {
    if (focusCol) {
      focusCol = null;
      focusBtn.style.opacity = "0.3";
      document.querySelectorAll(".kanban-column").forEach(c => c.style.display = "");
      return;
    }
    const cols = document.querySelectorAll(".kanban-column");
    // Find the first visible column with tasks
    for (const col of cols) {
      if (col.querySelector(".kanban-item")) {
        focusCol = col.id;
        break;
      }
    }
    if (!focusCol) focusCol = "kanban-todo";
    focusBtn.style.opacity = "0.8";
    cols.forEach(c => c.style.display = c.id === focusCol ? "" : "none");
  });
}

// Hide done toggle
const hideDoneBtn = document.getElementById("kanban-hide-done");
if (hideDoneBtn) {
  hideDoneBtn.addEventListener("click", () => {
    const hidden = hideDoneBtn.dataset.hidden === "true";
    hideDoneBtn.dataset.hidden = hidden ? "false" : "true";
    hideDoneBtn.style.opacity = hidden ? "0.3" : "0.8";
    document.querySelectorAll(".kanban-item.done").forEach(item => {
      item.hidden = !hidden;
    });
  });
}

// Trash system
const TRASH_KEY = "texter-kanban-trash";
const trashBtn = document.getElementById("kanban-trash-btn");
if (trashBtn) {
  // Save to trash on delete
  const origToast = showUndoToast;
  showUndoToast = function(text, priority, columnId, done, customUndo) {
    if (!customUndo) {
      try {
        const trash = JSON.parse(localStorage.getItem(TRASH_KEY) || "[]");
        trash.unshift({ text, priority, columnId, done, ts: Date.now() });
        if (trash.length > 50) trash.length = 50;
        localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
      } catch (e) {}
    }
    origToast(text, priority, columnId, done, customUndo);
  };
  trashBtn.addEventListener("click", () => {
    const trash = JSON.parse(localStorage.getItem(TRASH_KEY) || "[]");
    if (!trash.length) { trashBtn.style.opacity = "0.3"; return; }
    const items = trash.map((t, i) =>
      `${i + 1}. [${t.done ? "x" : " "}] ${t.text} (${t.columnId.replace("kanban-", "")})`
    ).join("\n");
    const idx = prompt(`Trash (recently deleted):\n\n${items}\n\nEnter number to restore, or Cancel:`);
    if (idx) {
      const n = parseInt(idx) - 1;
      if (n >= 0 && n < trash.length) {
        const t = trash[n];
        createKanbanTask(t.columnId, t.text, t.priority, t.done);
        trash.splice(n, 1);
        localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
        updateKanbanBadge();
      }
    }
  });
}

// Export
const exportBtn = document.getElementById("kanban-export-btn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    let out = "# Task Board\n\n";
    columnIds.forEach(id => {
      const name = document.querySelector(`#${id} .kanban-column-header`)?.textContent || id;
      out += `## ${name}\n`;
      document.querySelectorAll(`#${id} .kanban-item`).forEach(item => {
        const done = item.classList.contains("done") ? "[x] " : "[ ] ";
        const text = item.querySelector(".kanban-text").textContent;
        out += `- ${done}${text}\n`;
      });
      out += "\n";
    });
    navigator.clipboard?.writeText(out);
    const orig = exportBtn.textContent;
    exportBtn.textContent = "✓";
    setTimeout(() => exportBtn.textContent = orig, 1500);
  });
}

function createKanbanTask(columnId, text, priority, done, timestamp, pinned) {
  const list = document.querySelector(`#${columnId} .kanban-list`);
  const empty = list.querySelector(".kanban-empty");
  if (empty) empty.remove();

  const created = timestamp || Date.now();
  const item = document.createElement("div");
  item.className = "kanban-item" + (priority ? " priority-" + priority : "") + (done ? " done" : "") + (pinned ? " pinned" : "");
  item.draggable = true;
  item.innerHTML = `
    <span class="kanban-pin" title="Pin to top">${pinned ? "★" : "☆"}</span>
    <span class="kanban-check" title="Toggle done">${done ? "☑" : "☐"}</span>
    <span class="kanban-priority" title="Cycle priority">◉</span>
    <span class="kanban-text" contenteditable="true" title="Click to edit">${escapeHtml(text)}</span>
    <span class="kanban-actions">
      <span class="duplicate-task" title="Duplicate">⧉</span>
      <span class="move-task" data-dir="up" title="Move up">▲</span>
      <span class="move-task" data-dir="down" title="Move down">▼</span>
      <span class="delete-task" title="Delete">×</span>
    </span>
    <span class="kanban-time" title="${new Date(created).toLocaleString()}"></span>
  `;

  // Relative time
  const timeSpan = item.querySelector(".kanban-time");
  timeSpan.textContent = timeAgo(created);

  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", columnId);
    item.classList.add("dragging");
  });
  item.addEventListener("dragend", () => item.classList.remove("dragging"));

  // Inline edit on blur
  const textSpan = item.querySelector(".kanban-text");
  textSpan.addEventListener("blur", () => {
    saveKanban();
  });
  textSpan.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); textSpan.blur(); }
  });

  // Checkbox toggle
  const checkSpan = item.querySelector(".kanban-check");
  checkSpan.addEventListener("click", () => {
    item.classList.toggle("done");
    checkSpan.textContent = item.classList.contains("done") ? "☑" : "☐";
    saveKanban();
  });

  // Priority cycling
  const prioBtn = item.querySelector(".kanban-priority");
  const prios = ["", "priority-low", "priority-medium", "priority-high"];
  prioBtn.addEventListener("click", () => {
    const cls = item.className.split(" ").filter(c => c.startsWith("priority-"));
    cls.forEach(c => item.classList.remove(c));
    const idx = prios.indexOf(cls[0] || "");
    const next = prios[(idx + 1) % prios.length];
    if (next) item.classList.add(next);
    saveKanban();
  });

  // Pin toggle
  const pinBtn = item.querySelector(".kanban-pin");
  pinBtn.addEventListener("click", () => {
    item.classList.toggle("pinned");
    pinBtn.textContent = item.classList.contains("pinned") ? "★" : "☆";
    if (item.classList.contains("pinned")) list.insertBefore(item, list.firstChild);
    saveKanban();
  });

  // Move up/down
  item.querySelectorAll(".move-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir;
      if (dir === "up" && item.previousElementSibling) {
        list.insertBefore(item, item.previousElementSibling);
      } else if (dir === "down" && item.nextElementSibling) {
        list.insertBefore(item.nextElementSibling, item);
      }
      saveKanban();
    });
  });

  // Duplicate
  item.querySelector(".duplicate-task").addEventListener("click", () => {
    const t = item.querySelector(".kanban-text").textContent;
    const p = item.className.match(/priority-\w+/);
    const d = item.classList.contains("done");
    createKanbanTask(columnId, t, p ? p[0] : "", d);
  });

  // Delete with undo toast
  item.querySelector(".delete-task").addEventListener("click", () => {
    const t = item.querySelector(".kanban-text").textContent;
    const p = item.className.match(/priority-\w+/);
    const d = item.classList.contains("done");
    item.remove();
    checkEmpty(columnId);
    saveKanban();
    updateCounts();
    updateKanbanBadge();
    showUndoToast(t, p ? p[0] : "", columnId, d);
  });

  list.appendChild(item);
  saveKanban();
  updateCounts();
  updateKanbanBadge();
}

let undoTimeout;

function showUndoToast(text, priority, columnId, done, customUndo) {
  const existing = document.getElementById("kanban-undo-toast");
  if (existing) existing.remove();
  clearTimeout(undoTimeout);
  const toast = document.createElement("div");
  toast.id = "kanban-undo-toast";
  toast.innerHTML = `${customUndo ? text : "Deleted."} <button id="kanban-undo-btn">Undo</button>`;
  Object.assign(toast.style, {
    position: "fixed", bottom: "20px", right: "20px", zIndex: "9999",
    background: "var(--bg-ribbon)", color: "var(--text)", padding: "0.5rem 1rem",
    borderRadius: "var(--radius)", border: "1px solid var(--border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "0.85rem",
    display: "flex", alignItems: "center", gap: "0.75rem"
  });
  document.body.appendChild(toast);
  toast.querySelector("#kanban-undo-btn").addEventListener("click", () => {
    if (customUndo) customUndo();
    else createKanbanTask(columnId, text, priority, done);
    toast.remove();
    updateKanbanBadge();
  });
  undoTimeout = setTimeout(() => toast.remove(), 4000);
}

function checkEmpty(columnId) {
  const list = document.querySelector(`#${columnId} .kanban-list`);
  if (!list.querySelector(".kanban-item")) {
    const empty = document.createElement("div");
    empty.className = "kanban-empty";
    empty.textContent = "No tasks yet";
    list.appendChild(empty);
    // Suggestions for common tasks
    const suggestions = {
      "kanban-todo": ["Write documentation", "Review PR", "Fix bug #42", "Plan sprint"],
      "kanban-doing": ["Finish current task", "Code review", "Run tests"],
      "kanban-done": []
    }[columnId] || [];
    if (suggestions.length) {
      const chipWrap = document.createElement("div");
      chipWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.3rem;";
      suggestions.forEach(s => {
        const chip = document.createElement("span");
        chip.textContent = "+ " + s;
        chip.style.cssText = "font-size:0.6rem;opacity:0.3;cursor:pointer;border:1px dashed var(--border);border-radius:3px;padding:0.1rem 0.3rem;transition:opacity 0.15s;";
        chip.addEventListener("mouseenter", () => chip.style.opacity = "0.7");
        chip.addEventListener("mouseleave", () => chip.style.opacity = "0.3");
        chip.addEventListener("click", () => createKanbanTask(columnId, s));
        chipWrap.appendChild(chip);
      });
      list.appendChild(chipWrap);
    }
  }
}

// Drag & Drop between columns with auto-scroll
const kanbanContainer = document.getElementById("kanban-container");
document.querySelectorAll(".kanban-column").forEach(col => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    // Auto-scroll when near edge
    if (kanbanContainer) {
      const rect = kanbanContainer.getBoundingClientRect();
      const threshold = 40;
      if (e.clientY < rect.top + threshold) kanbanContainer.scrollTop -= 8;
      if (e.clientY > rect.bottom - threshold) kanbanContainer.scrollTop += 8;
    }
  });
  col.addEventListener("drop", (e) => {
    const dragging = document.querySelector(".kanban-item.dragging");
    if (dragging) {
      const list = col.querySelector(".kanban-list");
      const empty = list.querySelector(".kanban-empty");
      if (empty) empty.remove();
      list.appendChild(dragging);
      dragging.classList.remove("dragging");
      checkEmpty(columnIds.forEach(id => checkEmpty(id)));
      saveKanban();
      updateCounts();
    }
  });
});

// Persistence
function saveKanban() {
  const data = {};
  columnIds.forEach(id => {
    const items = [];
    document.querySelectorAll(`#${id} .kanban-item`).forEach(item => {
      const text = item.querySelector(".kanban-text").textContent;
      const prio = item.className.match(/priority-\w+/);
      const done = item.classList.contains("done");
      const pinned = item.classList.contains("pinned");
      const timeSpan = item.querySelector(".kanban-time");
      const timestamp = timeSpan ? parseInt(timeSpan.title) || Date.now() : Date.now();
      items.push({ text, priority: prio ? prio[0] : "", done, pinned, timestamp });
    });
    data[id] = items;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadKanban() {
  const raw = localStorage.getItem(STORAGE_KEY);
  columnIds.forEach(id => {
    const list = document.querySelector(`#${id} .kanban-list`);
    list.innerHTML = "";
  });
  if (!raw) {
    columnIds.forEach(id => checkEmpty(id));
    updateKanbanBadge();
    return;
  }
  try {
    const data = JSON.parse(raw);
    columnIds.forEach(id => {
      (data[id] || []).forEach(({ text, priority, done, pinned, timestamp }) =>
        createKanbanTask(id, text, priority, done, timestamp, pinned));
      checkEmpty(id);
    });
  } catch (e) { columnIds.forEach(id => checkEmpty(id)); }
  updateKanbanBadge();
}

function updateCounts() {
  columnIds.forEach(id => {
    const col = document.getElementById(id);
    const count = col.querySelectorAll(".kanban-item").length;
    const label = col.querySelector(".kanban-count");
    if (label) label.textContent = count ? `(${count})` : "";
  });
}

function updateKanbanBadge() {
  const total = document.querySelectorAll(".kanban-item").length;
  if (!btnKanban) return;
  let badge = btnKanban.querySelector(".kanban-badge");
  if (total) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "kanban-badge";
      Object.assign(badge.style, {
        position: "absolute", top: "-4px", right: "-4px",
        background: "var(--accent)", color: "#fff", fontSize: "0.55rem",
        borderRadius: "50%", width: "16px", height: "16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "bold"
      });
      if (getComputedStyle(btnKanban).position === "static") btnKanban.style.position = "relative";
      btnKanban.appendChild(badge);
    }
    badge.textContent = total > 9 ? "9+" : total;
  } else if (badge) {
    badge.remove();
  }
}

// Toggle kanban width
const toggleWidthBtn = document.getElementById("kanban-toggle-width");
if (toggleWidthBtn) {
  toggleWidthBtn.addEventListener("click", () => {
    const narrow = kanbanSidebar.style.width === "200px";
    kanbanSidebar.style.width = narrow ? "320px" : "200px";
  });
}

function updateKanbanProgress() {
  const total = document.querySelectorAll(".kanban-item").length;
  const done = document.querySelectorAll(".kanban-item.done").length;
  const wrap = document.getElementById("kanban-progress-wrap");
  if (!wrap) return;
  if (total) {
    wrap.style.display = "block";
    const bar = document.getElementById("kanban-progress-bar");
    if (bar) bar.style.width = Math.round(done / total * 100) + "%";
    // Confetti when all done
    if (total > 0 && done === total) {
      const c = document.getElementById("kanban-confetti");
      if (!c) {
        const el = document.createElement("div");
        el.id = "kanban-confetti";
        el.textContent = "🎉 All done!";
        el.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2rem;pointer-events:none;z-index:10;animation:fadeOut 2s forwards;";
        kanbanSidebar.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }
    }
  } else {
    wrap.style.display = "none";
  }
  // Stats
  const stats = document.getElementById("kanban-stats");
  if (stats) stats.textContent = total ? `${done}/${total}` : "";
}

// Rename kanban board title
const kanbanTitle = document.querySelector("#kanban-header h3");
if (kanbanTitle) {
  kanbanTitle.title = "Double-click to rename";
  kanbanTitle.style.cursor = "text";
  kanbanTitle.addEventListener("dblclick", () => {
    const name = kanbanTitle.textContent.replace(/\(.*\)/, "").trim();
    const neu = prompt("Rename board:", name);
    if (neu) {
      kanbanTitle.childNodes.forEach(n => {
        if (n.nodeType === 3) n.textContent = "";
      });
      kanbanTitle.insertBefore(document.createTextNode(neu + " "), kanbanTitle.querySelector("#kanban-stats") || null);
    }
  });
}

// Reset board
const resetBtn = document.getElementById("kanban-reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset entire task board? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    columnIds.forEach(id => {
      const list = document.querySelector(`#${id} .kanban-list`);
      list.innerHTML = "";
      checkEmpty(id);
    });
    updateCounts();
    updateKanbanBadge();
    updateKanbanProgress();
  });
}

// Hook progress into saveKanban
const origSave = saveKanban;
saveKanban = function() {
  origSave.call(this);
  updateKanbanProgress();
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  if (diff < 2592000) return Math.floor(diff / 86400) + "d";
  return Math.floor(diff / 2592000) + "mo";
}

// Column rename on double-click
document.querySelectorAll(".kanban-column-header").forEach(el => {
  el.addEventListener("dblclick", () => {
    const span = el.querySelector(":scope > span:first-child") || el;
    const name = span.textContent.replace(/\(\d+\)/, "").trim();
    const neu = prompt("Rename column:", name);
    if (neu) {
      const count = el.querySelector(".kanban-count");
      if (count) {
        count.before(document.createTextNode(neu + " "));
        span.textContent = "";
      } else {
        span.textContent = neu;
      }
    }
  });
});

// Initial load
loadKanban();
updateCounts();

// Make kanban draggable with position save
const kanbanHeader = document.getElementById("kanban-header");
const POS_KEY = "texter-kanban-pos";
let kbDrag = false, kbOffX, kbOffY;
if (kanbanHeader && kanbanSidebar) {
  // Restore saved position
  try {
    const pos = JSON.parse(localStorage.getItem(POS_KEY));
    if (pos) {
      kanbanSidebar.style.left = pos.left;
      kanbanSidebar.style.top = pos.top;
      kanbanSidebar.style.right = "auto";
      kanbanSidebar.style.transform = "none";
    }
  } catch (e) {}
  kanbanHeader.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("[contenteditable]")) return;
    kbDrag = true;
    const rect = kanbanSidebar.getBoundingClientRect();
    kbOffX = e.clientX - rect.left;
    kbOffY = e.clientY - rect.top;
    kanbanHeader.style.cursor = "grabbing";
    e.preventDefault();
  });
}
document.addEventListener("mousemove", (e) => {
  if (!kbDrag) return;
  kanbanSidebar.style.left = (e.clientX - kbOffX) + "px";
  kanbanSidebar.style.top = (e.clientY - kbOffY) + "px";
  kanbanSidebar.style.right = "auto";
  kanbanSidebar.style.transform = "none";
});
document.addEventListener("mouseup", () => {
  if (kbDrag) {
    kbDrag = false;
    if (kanbanHeader) kanbanHeader.style.cursor = "grab";
    // Save position
    localStorage.setItem(POS_KEY, JSON.stringify({
      left: kanbanSidebar.style.left,
      top: kanbanSidebar.style.top
    }));
  }
});

// Kanban keyboard shortcuts
const colKeys = ["kanban-todo", "kanban-doing", "kanban-done"];
document.addEventListener("keydown", (e) => {
  if (kanbanSidebar.hidden) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.contentEditable === "true") {
    // Ctrl+1/2/3 to move focused item
    if (e.ctrlKey && ["1","2","3"].includes(e.key)) {
      e.preventDefault();
      const input = e.target;
      if (!input.matches(".kanban-input")) return;
      const fromCol = input.dataset.column;
      const toCol = colKeys[parseInt(e.key) - 1];
      if (!toCol || fromCol === toCol) return;
      // Move all items from this column to target
      const items = document.querySelectorAll(`#${fromCol} .kanban-item`);
      const targetList = document.querySelector(`#${toCol} .kanban-list`);
      const targetEmpty = targetList.querySelector(".kanban-empty");
      if (targetEmpty) targetEmpty.remove();
      items.forEach(item => targetList.appendChild(item));
      checkEmpty(fromCol);
      saveKanban();
      updateCounts();
    }
    return;
  }
  if (e.key === "/") {
    e.preventDefault();
    document.getElementById("kanban-search")?.focus();
  } if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    const inputs = document.querySelectorAll(".kanban-input:not(:focus)");
    for (const inp of inputs) if (inp.offsetParent !== null) { inp.focus(); break; }
  }
});

/* 3. Smart Citation Manager */
const citationModal = document.getElementById("citation-modal");
const btnCite = document.getElementById("btn-cite");
const btnCloseCitation = document.getElementById("btn-close-citation");
const btnInsertCitation = document.getElementById("btn-insert-citation");

btnCite.addEventListener("click", () => citationModal.hidden = false);
btnCloseCitation.addEventListener("click", () => citationModal.hidden = true);

btnInsertCitation.addEventListener("click", () => {
  const author = document.getElementById("cite-author").value;
  const title = document.getElementById("cite-title").value;
  const year = document.getElementById("cite-year").value;
  const style = document.getElementById("cite-style").value;
  
  let formatted = "";
  if (style === 'mla') formatted = `${author}. *${title}*. ${year}.`;
  else if (style === 'apa') formatted = `${author} (${year}). *${title}*.`;
  else formatted = `${author}, *${title}* (${year}).`;
  
  editor.focus();
  document.execCommand("insertHTML", false, ` <span class="citation" style="color:var(--accent)">(${formatted})</span> `);
  citationModal.hidden = true;
  setStatus("Citation inserted.");
});

/* 4. Math & Equation Editor */
const mathModal = document.getElementById("math-modal");
const btnMath = document.getElementById("btn-math");
const btnCloseMath = document.getElementById("btn-close-math");
const btnInsertMath = document.getElementById("btn-insert-math");
const mathInput = document.getElementById("math-input");
const mathPreview = document.getElementById("math-preview");

btnMath.addEventListener("click", () => mathModal.hidden = false);
btnCloseMath.addEventListener("click", () => mathModal.hidden = true);

mathInput.addEventListener("input", (e) => {
  // Simple rendering simulation
  mathPreview.textContent = e.target.value || "Preview will appear here";
});

btnInsertMath.addEventListener("click", () => {
  const formula = mathInput.value;
  if (!formula) return;
  
  const mathHtml = `<div class="math-equation" contenteditable="false" style="font-family:'Times New Roman', serif; border:1px dashed var(--border); padding:1rem; border-radius:var(--radius); margin:1rem 0;">${formula}</div>`;
  editor.focus();
  document.execCommand("insertHTML", false, mathHtml);
  mathModal.hidden = true;
  mathInput.value = "";
  setStatus("Equation inserted.");
});

/* 5. Multi-Language Translator */
const translateModal = document.getElementById("translate-modal");
const btnTranslate = document.getElementById("btn-ai-translate");
const btnCloseTranslate = document.getElementById("btn-close-translate");
const btnRunTranslate = document.getElementById("btn-run-translate");
const translateOriginal = document.getElementById("translate-original");
const translateResult = document.getElementById("translate-result");

const translations = {
  "es": { "hello": "Hola", "writing": "escribiendo", "masterpiece": "obra maestra", "project": "proyecto" },
  "fr": { "hello": "Bonjour", "writing": "écrire", "masterpiece": "chef-d'œuvre", "project": "projet" },
  "de": { "hello": "Hallo", "writing": "schreiben", "masterpiece": "Meisterwerk", "project": "Projekt" }
};

btnTranslate.addEventListener("click", () => {
  const sel = window.getSelection().toString().trim();
  if (!sel) { setStatus("Select text to translate!"); return; }
  
  translateOriginal.textContent = sel;
  translateModal.hidden = false;
});

btnCloseTranslate.addEventListener("click", () => translateModal.hidden = true);

btnRunTranslate.addEventListener("click", () => {
  const text = translateOriginal.textContent.toLowerCase();
  const lang = document.getElementById("translate-lang").value;
  
  let result = text;
  // Simulated word-by-word local translation
  Object.keys(translations[lang] || {}).forEach(word => {
    result = result.replace(new RegExp(word, 'g'), translations[lang][word]);
  });
  
  translateResult.textContent = result === text ? "[Partial Match]: " + result : result;
  
  const apply = confirm(`Insert translation?\n"${result}"`);
  if (apply) {
    document.execCommand("insertHTML", false, `<span class="translated-text">${result}</span>`);
    translateModal.hidden = true;
  }
});

/* Update Command Palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Toggle Kanban", icon: "trello", action: () => kanbanSidebar.hidden = !kanbanSidebar.hidden });
  commands.push({ name: "Insert Citation", icon: "book-open", action: () => citationModal.hidden = false });
  commands.push({ name: "Equation Editor", icon: "sigma", action: () => mathModal.hidden = false });
}

lucide.createIcons();

/* ----- Phase 12: Precision & Presentation ----- */

/* 1. Floating Selection Toolbar */
const selToolbar = document.getElementById("selection-toolbar");
const editorContainer = document.getElementById("editor-container");

editor.addEventListener("mouseup", () => {
  const sel = window.getSelection();
  if (sel.isCollapsed) {
    selToolbar.hidden = true;
    return;
  }
  
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const containerRect = editorContainer.getBoundingClientRect();
  
  selToolbar.style.left = `${rect.left + rect.width/2 - containerRect.left - 50}px`;
  selToolbar.style.top = `${rect.top - containerRect.top - 50}px`;
  selToolbar.hidden = false;
});

document.addEventListener("mousedown", (e) => {
  if (!selToolbar.contains(e.target) && !editor.contains(e.target)) {
    selToolbar.hidden = true;
  }
});

/* 2. Side Margin Annotations (Comments) */
const commentsSidebar = document.getElementById("margin-comments");
const commentsList = document.getElementById("comments-list");
const btnAddCommentSel = document.getElementById("btn-add-comment-sel");

let annotations = []; // Stores { id, text, timestamp, color }

window.addComment = (text) => {
  const id = Date.now();
  const comment = { id, text, timestamp: new Date().toLocaleTimeString(), color: "var(--accent)" };
  annotations.push(comment);
  renderComments();
  commentsSidebar.hidden = false;
};

function renderComments() {
  commentsList.innerHTML = annotations.map(ann => `
    <div class="comment-card" onclick="this.style.opacity=0.5">
      <div class="comment-text">${ann.text}</div>
      <div class="comment-meta">
        <span>${ann.timestamp}</span>
        <span onclick="event.stopPropagation(); removeComment(${ann.id})" style="color:red; cursor:pointer;">Delete</span>
      </div>
    </div>
  `).join("");
}

window.removeComment = (id) => {
  annotations = annotations.filter(a => a.id !== id);
  renderComments();
  if (annotations.length === 0) commentsSidebar.hidden = true;
};

if (btnAddCommentSel) {
  btnAddCommentSel.addEventListener("click", () => {
    const text = prompt("Comment text:");
    if (text) addComment(text);
  });
}

/* 3. Advanced PDF/Export Settings */
const pdfModal = document.getElementById("pdf-settings-modal");
const btnPdfTrigger = document.getElementById("btn-save-pdf");
const btnClosePdfSettings = document.getElementById("btn-close-pdf-settings");
const btnFinalExportPdf = document.getElementById("btn-final-export-pdf");

// Replace original listener
const newPdfTrigger = btnPdfTrigger.cloneNode(true);
btnPdfTrigger.parentNode.replaceChild(newPdfTrigger, btnPdfTrigger);

newPdfTrigger.addEventListener("click", () => pdfModal.hidden = false);
btnClosePdfSettings.addEventListener("click", () => pdfModal.hidden = true);

btnFinalExportPdf.addEventListener("click", () => {
  const pageSize = document.getElementById("pdf-page-size").value;
  const margins = document.getElementById("pdf-margins").value;
  const showPageNum = document.getElementById("pdf-show-pagenum").checked;
  const showWatermark = document.getElementById("pdf-show-watermark").checked;
  
  pdfModal.hidden = true;
  setStatus(`Applying ${pageSize} settings...`);
  
  // Custom Styling for Export
  const printStyle = document.createElement("style");
  printStyle.innerHTML = `
    @page { size: ${pageSize}; margin: ${margins === 'narrow' ? '0.5in' : (margins === 'wide' ? '2in' : '1in')}; }
    .watermark-overlay { display: ${showWatermark ? 'flex' : 'none'} !important; }
  `;
  document.head.appendChild(printStyle);
  
  window.print();
  printStyle.remove();
});

/* 4. Interactive Lucide Icon Search */
const iconModal = document.getElementById("icon-search-modal");
const btnIconSearch = document.getElementById("btn-icon-search");
const btnCloseIconSearch = document.getElementById("btn-close-icon-search");
const iconSearchInput = document.getElementById("icon-search-input");
const iconGrid = document.getElementById("icon-grid");

const commonIcons = [
  "heart", "star", "user", "home", "settings", "search", "mail", "bell", "calendar", "camera", "clock", "check", 
  "info", "alert-circle", "help-circle", "arrow-right", "chevron-down", "plus", "minus", "x", "edit", "trash-2",
  "folder", "file", "image", "music", "video", "headphones", "smartphone", "laptop", "monitor", "coffee", "smile", "moon", "sun"
];

btnIconSearch.addEventListener("click", () => {
  iconModal.hidden = false;
  renderIconGrid("");
});

btnCloseIconSearch.addEventListener("click", () => iconModal.hidden = true);

function renderIconGrid(query) {
  const filtered = commonIcons.filter(name => name.includes(query.toLowerCase()));
  iconGrid.innerHTML = filtered.map(name => `
    <div class="icon-item" onclick="insertIcon('${name}')">
      <i data-lucide="${name}"></i>
      <span>${name}</span>
    </div>
  `).join("");
  lucide.createIcons();
}

iconSearchInput.addEventListener("input", (e) => renderIconGrid(e.target.value));

window.insertIcon = (name) => {
  iconModal.hidden = true;
  editor.focus();
  const iconHtml = `<i data-lucide="${name}" style="vertical-align:middle; width:1.2em; height:1.2em;"></i>&nbsp;`;
  document.execCommand("insertHTML", false, iconHtml);
  lucide.createIcons();
  setStatus(`Icon "${name}" inserted.`);
};

/* 5. AI Style Analyzer (Tone & Bias) */
const styleModal = document.getElementById("style-report-modal");
const btnStyleAnalyzer = document.getElementById("btn-ai-style");
const btnCloseStyleReport = document.getElementById("btn-close-style-report");

btnStyleAnalyzer.addEventListener("click", () => {
  const text = getText();
  if (text.length < 100) { setStatus("Enter more text for analysis!"); return; }
  
  styleModal.hidden = false;
  const analysis = analyzeWritingStyle(text);
  
  document.getElementById("style-tone-label").textContent = analysis.mainTone;
  document.getElementById("style-clarity-score").textContent = analysis.clarity;
  document.getElementById("style-feedback").textContent = analysis.feedback;
  
  const bars = document.getElementById("style-bars");
  bars.innerHTML = analysis.scores.map(s => `
    <div style="font-size:0.7rem;">${s.label} (${s.value}%)</div>
    <div class="style-bar-container">
      <div class="style-bar-fill" style="width:${s.value}%"></div>
    </div>
  `).join("");
});

btnCloseStyleReport.addEventListener("click", () => styleModal.hidden = true);

function analyzeWritingStyle(text) {
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
  const avgSentLength = wordCount / sentenceCount;
  
  let tone = "Formal";
  if (avgSentLength < 10) tone = "Conversational";
  else if (avgSentLength > 25) tone = "Academic/Complex";
  
  const passiveVoice = (text.match(/\b(am|is|are|was|were|be|been|being)\b\s+\w+ed\b/gi) || []).length;
  const descriptors = (text.match(/\b\w+ly\b/gi) || []).length;
  
  return {
    mainTone: tone,
    clarity: avgSentLength > 30 ? "Moderate" : "High",
    feedback: `Your document averages ${avgSentLength.toFixed(1)} words per sentence. ` + 
              (tone === "Academic/Complex" ? "It is highly structured and analytical." : "It is direct and easy to follow."),
    scores: [
      { label: "Formality", value: Math.min(100, avgSentLength * 3) },
      { label: "Confidence", value: 85 - (passiveVoice * 5) },
      { label: "Directness", value: 100 - Math.min(50, passiveVoice * 10) },
      { label: "Vividness", value: Math.min(100, descriptors * 15) }
    ]
  };
}

/* Update Selection Toolbar buttons */
const btnSelAiRewrite = document.getElementById("btn-sel-ai-rewrite");
if (btnSelAiRewrite) {
  btnSelAiRewrite.addEventListener("click", () => {
    selToolbar.hidden = true;
    document.getElementById("btn-ai-rewrite").click();
  });
}

lucide.createIcons();

/* ----- Phase 11: Security & Sophistication ----- */

/* 1. Multi-Document Buffer System (Tabs) */
let currentBufferIndex = 0;
let buffers = [
  { content: "", filename: "Document 1" },
  { content: "", filename: "Document 2" },
  { content: "", filename: "Document 3" }
];

// Load from localStorage if available
const savedBuffers = localStorage.getItem('texter-buffers');
if (savedBuffers) {
  buffers = JSON.parse(savedBuffers);
} else {
  buffers[0].content = editor.innerHTML;
  buffers[0].filename = document.getElementById("filename").textContent;
}

window.switchBuffer = (index) => {
  // Save current
  buffers[currentBufferIndex].content = editor.innerHTML;
  buffers[currentBufferIndex].filename = document.getElementById("filename").textContent;
  
  currentBufferIndex = index;
  
  // Load new
  editor.innerHTML = buffers[currentBufferIndex].content;
  document.getElementById("filename").textContent = buffers[currentBufferIndex].filename;
  document.getElementById("filename-input").value = buffers[currentBufferIndex].filename;
  
  // Update Tab UI
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
  
  localStorage.setItem('texter-buffers', JSON.stringify(buffers));
  _updateStats();
  _updatePages();
  setStatus(`Switched to ${buffers[index].filename}`);
};

/* 2. Slash Commands (/) */
const slashMenu = document.getElementById("slash-menu");
editor.addEventListener("keyup", (e) => {
  if (e.key === "/") {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textAtCursor = range.startContainer.textContent || "";
      const offset = range.startOffset;
      
      // Only show if / is the first character or preceded by a newline/space
      if (offset === 1 || (offset > 1 && /[\s\n]/.test(textAtCursor[offset - 2]))) {
        const rect = range.getBoundingClientRect();
        slashMenu.style.left = `${rect.left}px`;
        slashMenu.style.top = `${rect.bottom + 5}px`;
        slashMenu.hidden = false;
      }
    }
  } else if (e.key === "Escape") {
    slashMenu.hidden = true;
  }
});

// Hide slash menu on click outside
document.addEventListener("mousedown", (e) => {
  if (!slashMenu.contains(e.target)) slashMenu.hidden = true;
});

window.execSlash = (cmd, val) => {
  slashMenu.hidden = true;
  editor.focus();
  // Remove the /
  document.execCommand("delete", false, null);
  
  if (cmd === 'insertTable') {
    document.getElementById("cmd-insertTable").click();
  } else if (cmd === 'insertImage') {
    document.getElementById("cmd-insertImage").click();
  } else if (cmd === 'insertCheckbox') {
    document.getElementById("cmd-insertCheckbox").click();
  } else {
    document.execCommand(cmd, false, val);
  }
};

/* 3. AES-256 Password Protection (Web Crypto API) */
const encryptModal = document.getElementById("encrypt-modal");
const btnEncrypt = document.getElementById("btn-encrypt");
const btnCloseEncrypt = document.getElementById("btn-close-encrypt");
const btnDoEncrypt = document.getElementById("btn-do-encrypt");
const btnDoDecrypt = document.getElementById("btn-do-decrypt");
const encryptPass = document.getElementById("encrypt-pass");

btnEncrypt.addEventListener("click", () => encryptModal.hidden = false);
btnCloseEncrypt.addEventListener("click", () => encryptModal.hidden = true);

async function deriveKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("texter-salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

btnDoEncrypt.addEventListener("click", async () => {
  const pass = encryptPass.value;
  if (!pass) return;
  
  try {
    const key = await deriveKey(pass);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(editor.innerHTML));
    
    // Store IV + ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    const base64 = btoa(String.fromCharCode(...combined));
    editor.innerHTML = `<div class="encrypted-placeholder" style="padding:2rem; text-align:center; border:2px dashed var(--accent); border-radius:var(--radius);">
      <i data-lucide="lock" style="width:3rem; height:3rem; color:var(--accent); margin-bottom:1rem;"></i>
      <h3>Document Encrypted</h3>
      <p style="opacity:0.6;">This document is locked with AES-256. Click "Decrypt" in the sidebar to unlock.</p>
      <div hidden>${base64}</div>
    </div>`;
    
    lucide.createIcons();
    encryptModal.hidden = true;
    encryptPass.value = "";
    btnEncrypt.style.color = "var(--accent)";
    setStatus("Document Encrypted & Locked.");
  } catch (err) {
    alert("Encryption failed: " + err.message);
  }
});

/* Double-click encrypted placeholder to open decrypt modal */
editor.addEventListener("dblclick", (e) => {
  if (e.target.closest(".encrypted-placeholder")) {
    encryptModal.hidden = false;
    btnDoEncrypt.hidden = true;
    btnDoDecrypt.hidden = false;
  }
});

btnDoDecrypt.addEventListener("click", async () => {
  const pass = encryptPass.value;
  const placeholder = editor.querySelector(".encrypted-placeholder");
  if (!pass || !placeholder) return;
  
  const base64 = placeholder.querySelector("div").textContent;
  const combined = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  try {
    const key = await deriveKey(pass);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    editor.innerHTML = new TextDecoder().decode(decrypted);
    
    encryptModal.hidden = true;
    btnDoDecrypt.hidden = true;
    btnDoEncrypt.hidden = false;
    btnEncrypt.style.color = "";
    setStatus("Document Decrypted & Unlocked.");
  } catch (err) {
    alert("Decryption failed. Incorrect password.");
  }
});

/* 4. Interactive Table Management */
const tableContextMenu = document.getElementById("table-context-menu");
editor.addEventListener("mousedown", (e) => {
  const cell = e.target.closest("td, th");
  if (cell) {
    const rect = cell.getBoundingClientRect();
    tableContextMenu.style.left = `${rect.left}px`;
    tableContextMenu.style.top = `${rect.top - 40}px`;
    tableContextMenu.hidden = false;
    
    // store target cell for actions
    tableContextMenu.dataset.targetCell = "active";
    cell.id = "active-table-cell";
  } else {
    tableContextMenu.hidden = true;
    const active = document.getElementById("active-table-cell");
    if (active) active.removeAttribute("id");
  }
});

window.tableAction = (type) => {
  const cell = document.getElementById("active-table-cell");
  if (!cell) return;
  const row = cell.parentElement;
  const table = row.closest("table");
  
  if (type === 'addRowBelow') {
    const newRow = table.insertRow(row.rowIndex + 1);
    for (let i = 0; i < row.cells.length; i++) newRow.insertCell(i).textContent = "";
  } else if (type === 'addRowAbove') {
    const newRow = table.insertRow(row.rowIndex);
    for (let i = 0; i < row.cells.length; i++) newRow.insertCell(i).textContent = "";
  } else if (type === 'deleteRow') {
    if (table.rows.length > 1) table.deleteRow(row.rowIndex);
    else table.remove();
  } else if (type === 'deleteTable') {
    table.remove();
  } else if (type === 'addColRight') {
    for (let i = 0; i < table.rows.length; i++) table.rows[i].insertCell(cell.cellIndex + 1).textContent = "";
  } else if (type === 'addColLeft') {
    for (let i = 0; i < table.rows.length; i++) table.rows[i].insertCell(cell.cellIndex).textContent = "";
  }
  
  tableContextMenu.hidden = true;
  _updateStats();
};

/* 5. Deep History Search */
const deepSearchModal = document.getElementById("deep-search-modal");
const btnDeepSearch = document.getElementById("btn-deep-history-search");
const btnCloseDeepSearch = document.getElementById("btn-close-deep-search");
const deepSearchInput = document.getElementById("deep-search-input");
const btnRunDeepSearch = document.getElementById("btn-run-deep-search");
const deepSearchResults = document.getElementById("deep-search-results");

btnDeepSearch.addEventListener("click", () => deepSearchModal.hidden = false);
btnCloseDeepSearch.addEventListener("click", () => deepSearchModal.hidden = true);

btnRunDeepSearch.addEventListener("click", () => {
  const query = deepSearchInput.value.toLowerCase();
  if (!query) return;
  
  const history = JSON.parse(localStorage.getItem('texter-history')) || [];
  let foundHtml = "";
  
  history.forEach((item, i) => {
    if (item.content.toLowerCase().includes(query)) {
      foundHtml += `<div style="padding:0.5rem; border:1px solid var(--border); margin-bottom:0.5rem; cursor:pointer;" onclick="deepSearchModal.hidden=true; compareVersion(${i})">
        <strong>${item.timestamp}</strong> - Match found
      </div>`;
    }
  });
  
  deepSearchResults.innerHTML = foundHtml || `<p style="opacity:0.5;">No matches found in any snapshot.</p>`;
});

/* 6. Markdown Side-by-Side Preview */
const btnSplitView = document.getElementById("btn-split-view");
const splitPreview = document.getElementById("split-preview");
let isSplitView = false;

btnSplitView.addEventListener("click", () => {
  isSplitView = !isSplitView;
  splitPreview.hidden = !isSplitView;
  btnSplitView.style.color = isSplitView ? "var(--accent)" : "";
  if (isSplitView) updateMarkdownPreview();
});

function updateMarkdownPreview() {
  if (!isSplitView) return;
  let text = editor.innerText;
  
  // Very simple MD rendering logic
  let html = text
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n\n/gim, '<br><br>');
    
  splitPreview.innerHTML = html;
}

editor.addEventListener("input", updateMarkdownPreview);

/* 7. Navigation Radar (Mini-map) */
const navRadarItems = document.getElementById("nav-radar-items");
function updateRadar() {
  const headers = Array.from(editor.querySelectorAll("h1, h2, h3"));
  if (headers.length === 0) {
    navRadarItems.innerHTML = `<p style="font-size:0.5rem; opacity:0.3;">Empty Radar</p>`;
    return;
  }
  
  navRadarItems.innerHTML = headers.map((h, i) => {
    const text = h.innerText.substring(0, 15);
    const tag = h.tagName.toLowerCase();
    const margin = (tag === 'h1' ? 0 : (tag === 'h2' ? 5 : 10));
    const uniqueId = `radar-target-${i}`;
    h.id = uniqueId;
    return `<div class="radar-item" style="margin-left:${margin}px" onclick="document.getElementById('${uniqueId}').scrollIntoView({behavior:'smooth'})">${text}</div>`;
  }).join("");
}

editor.addEventListener("input", updateRadar);
setInterval(updateRadar, 3000); // and periodically
updateRadar();

/* ===== New Phase 14 Features ===== */

/* 1. Emoji Picker */
const emojiList = [
  "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗",
  "😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡",
  "🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴",
  "😷","🤒","🤕","🤢","🤮","🥴","😵","🤯","🥳","🥺","😢","😭","😤","😠","😡","🤬",
  "👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✌️","🤟","🤘","👌",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","💖","💗","💓","💕","💌",
  "⭐","🌟","✨","⚡","🔥","💯","🎯","🎉","🎊","🎈","🎁","🎀","🪄","💡","🔑","🔒",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐸","🦁","🐮","🐷","🐒","🐔","🐧",
  "🌸","🌺","🌻","🌹","🌷","🌿","🍀","🌵","🌲","🌴","🍎","🍕","🍔","🌮","🍦","☕",
  "🚀","✈️","🚗","🚌","🚲","🏠","🔥","🌈","⭐","🌙","☀️","❄️","💧","🌊","🎵","🎶"
];

const btnEmoji = document.getElementById("btn-emoji");
const emojiModal = document.getElementById("emoji-modal");
const btnCloseEmoji = document.getElementById("btn-close-emoji");
const emojiSearch = document.getElementById("emoji-search");
const emojiGrid = document.getElementById("emoji-grid");

if (btnEmoji) {
  btnEmoji.addEventListener("click", () => {
    emojiModal.hidden = false;
    renderEmojis("");
    setTimeout(() => emojiSearch.focus(), 50);
  });
}
if (btnCloseEmoji) btnCloseEmoji.addEventListener("click", () => emojiModal.hidden = true);

function renderEmojis(query) {
  const filtered = query ? emojiList.filter(e => e.includes(query)) : emojiList;
  emojiGrid.innerHTML = filtered.map(e => `<span style="cursor:pointer; text-align:center; padding:0.25rem; border-radius:4px;" onclick="insertEmoji('${e}')">${e}</span>`).join("");
}

window.insertEmoji = function(emoji) {
  emojiModal.hidden = true;
  editor.focus();
  document.execCommand("insertText", false, emoji);
};

if (emojiSearch) {
  emojiSearch.addEventListener("input", (e) => renderEmojis(e.target.value));
  emojiSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && emojiGrid.firstChild) emojiGrid.firstChild.click();
    if (e.key === "Escape") emojiModal.hidden = true;
  });
}

/* 2. Writing Streak & Session Tracker */
const streakEl = document.getElementById("streak-tracker");
const sessionEl = document.getElementById("session-timer");
let sessionStart = Date.now();

function updateStreak() {
  if (!streakEl) return;
  try {
    const data = JSON.parse(localStorage.getItem("texter-streak") || '{}');
    const today = new Date().toDateString();
    if (data.lastDate === today) {
      streakEl.textContent = `🔥 ${data.count} day${data.count !== 1 ? 's' : ''}`;
      return data.count;
    }
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newCount = (data.lastDate === yesterday) ? (data.count || 0) + 1 : 1;
    localStorage.setItem("texter-streak", JSON.stringify({ count: newCount, lastDate: today }));
    streakEl.textContent = `🔥 ${newCount} day${newCount !== 1 ? 's' : ''}`;
    return newCount;
  } catch(e) { return 0; }
}

function updateSessionTimer() {
  if (!sessionEl) return;
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  sessionEl.textContent = `⏱ ${m}:${s}`;
}

setInterval(updateSessionTimer, 1000);
updateStreak();
updateSessionTimer();

/* 3. Quick Calculator */
const btnCalc = document.getElementById("btn-quick-calc");
if (btnCalc) {
  btnCalc.addEventListener("click", () => {
    const sel = window.getSelection().toString().trim();
    if (!sel) { setStatus("Select a math expression first!"); return; }
    try {
      const result = Function('"use strict"; return (' + sel + ')')();
      const reply = confirm(`Result: ${sel} = ${result}\nInsert result?`);
      if (reply) document.execCommand("insertText", false, String(result));
      setStatus(`= ${result}`);
    } catch(e) {
      setStatus("Invalid expression: " + e.message);
    }
  });
}

/* 4. Smart Formatting Toggle */
let smartFormatEnabled = true;
const btnSmartFormat = document.getElementById("btn-smart-format");
if (btnSmartFormat) {
  btnSmartFormat.style.color = "var(--accent)";
  btnSmartFormat.addEventListener("click", () => {
    smartFormatEnabled = !smartFormatEnabled;
    btnSmartFormat.style.color = smartFormatEnabled ? "var(--accent)" : "";
    setStatus(smartFormatEnabled ? "Smart Formatting ON" : "Smart Formatting OFF");
  });
}

editor.addEventListener("input", () => {
  if (!smartFormatEnabled) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const node = sel.anchorNode;
  if (!node || node.nodeType !== 3) return;
  const text = node.textContent;
  const pos = sel.anchorOffset;
  
  const replacements = [
    [/'{2}(.*?)'{2}/g, '\u201C$1\u201D'],
    [/""/g, '\u201C'],
    [/''/g, '\u2019'],
    [/(?<=\s)---(?=\s)/g, '\u2014'],
    [/(?<=\s)--(?=\s)/g, '\u2013'],
    [/\.\.\./g, '\u2026'],
    [/(?<=\s)->(?=\s)/g, '\u2192'],
    [/(?<=\s)<-(?=\s)/g, '\u2190'],
    [/\(c\)/gi, '\u00A9'],
    [/\(r\)/gi, '\u00AE'],
    [/\(tm\)/gi, '\u2122'],
  ];
  
  let changed = false;
  replacements.forEach(([regex, replacement]) => {
    if (regex.test(text)) {
      node.textContent = text.replace(regex, replacement);
      changed = true;
    }
  });
  
  if (changed) {
    const range = document.createRange();
    range.setStart(node, Math.min(pos, node.textContent.length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
});

/* 5. Image Resize via double-click */
editor.addEventListener("dblclick", (e) => {
  const img = e.target.closest("img");
  if (!img || !img.closest("#editor")) return;
  
  const currentW = img.width || 200;
  const newW = prompt("Resize image width (px):", currentW);
  if (newW && !isNaN(newW) && parseInt(newW) > 0) {
    img.width = parseInt(newW);
    img.height = img.naturalHeight * (parseInt(newW) / img.naturalWidth) || img.height;
    setStatus(`Image resized to ${newW}px`);
  }
});

/* 6. Definition Lookup (Datamuse API) */
let defTimeout = null;
editor.addEventListener("mouseup", (e) => {
  clearTimeout(defTimeout);
  const defTooltip = document.getElementById("def-tooltip");
  if (!defTooltip) return;
  
  defTimeout = setTimeout(() => {
    const sel = window.getSelection().toString().trim();
    if (!sel || sel.includes(" ") || sel.length > 30) {
      defTooltip.hidden = true;
      return;
    }
    
    fetch(`https://api.datamuse.com/words?sp=${sel}&md=d&max=1`)
      .then(r => r.json())
      .then(data => {
        if (data.length && data[0].defs) {
          const def = data[0].defs[0].replace(/^[a-z]+\t/, '');
          document.getElementById("def-content").innerHTML = `<strong>${sel}</strong><br>${def}`;
          defTooltip.hidden = false;
          const rect = e.target.getBoundingClientRect();
          defTooltip.style.left = Math.min(rect.left + rect.width/2 - 150, window.innerWidth - 320) + "px";
          defTooltip.style.top = (rect.bottom + 8) + "px";
        } else {
          defTooltip.hidden = true;
        }
      })
      .catch(() => defTooltip.hidden = true);
  }, 600);
});

document.addEventListener("mousedown", () => {
  const defTooltip = document.getElementById("def-tooltip");
  if (defTooltip) defTooltip.hidden = true;
});

/* 7. EPUB Export */
const btnEpub = document.getElementById("btn-save-epub");
if (btnEpub) {
  btnEpub.addEventListener("click", () => {
    const title = filenameEl.textContent === "Untitled" ? "Document" : filenameEl.textContent;
    const content = editor.innerHTML;
    const text = getText();
    
    const epubContent = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
    
    const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="content.xhtml" media-type="application/xhtml+xml"/>
  </rootfiles>
</container>`;
    
    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");
    zip.file("META-INF/container.xml", container);
    zip.file("content.xhtml", epubContent);
    
    zip.generateAsync({ type: "blob" }).then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = title.replace(/\.[^.]+$/, "") + ".epub";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("EPUB downloaded");
    }).catch(err => setStatus("EPUB failed: " + err.message));
  });
}

/* 8. Auto-Backup System */
const backupIndicator = document.getElementById("backup-indicator");
let backupCount = 0;

function runAutoBackup() {
  const html = editor.innerHTML;
  if (!html.trim() || html === '<p><br></p>') return;
  try {
    const backups = JSON.parse(localStorage.getItem("texter-backups") || '[]');
    backups.push({ html, timestamp: Date.now(), filename: filenameEl.textContent });
    if (backups.length > 50) backups.splice(0, backups.length - 50);
    localStorage.setItem("texter-backups", JSON.stringify(backups));
    backupCount++;
    if (backupIndicator) {
      backupIndicator.textContent = `💾 ${backupCount} backup${backupCount !== 1 ? 's' : ''}`;
      backupIndicator.style.color = "var(--accent)";
      setTimeout(() => backupIndicator.style.color = "var(--text-muted)", 2000);
    }
  } catch(e) { /* localStorage full */ }
}

setInterval(runAutoBackup, 5 * 60 * 1000); // every 5 min
editor.addEventListener("input", () => { clearTimeout(window._backupTimer); window._backupTimer = setTimeout(runAutoBackup, 60000); }); // also 1 min after last edit

/* 9. Daily Writing Prompt (inspiration) */
const promptIdeas = [
  "Write about a memory from childhood.",
  "Describe your perfect day.",
  "What would you do with unlimited resources?",
  "Write a letter to your future self.",
  "Describe a place that inspires you.",
  "What's a lesson you learned the hard way?",
  "Write a short story in 100 words.",
  "Who has influenced you most and why?",
  "What does success mean to you?",
  "Describe a challenge you overcame."
];

function showRandomPrompt() {
  const p = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
  setStatus(`💡 Prompt: ${p}`);
}

// On idle detection — show prompt if user hasn't typed in 5 minutes
let promptTimer = null;
editor.addEventListener("keydown", () => {
  clearTimeout(promptTimer);
  promptTimer = setTimeout(showRandomPrompt, 5 * 60 * 1000);
});
// Show initial prompt after 2 minutes of opening
setTimeout(showRandomPrompt, 2 * 60 * 1000);

/* Update Command Palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Insert Emoji", icon: "smile-plus", action: () => document.getElementById("btn-emoji").click() });
  commands.push({ name: "Quick Calculator", icon: "calculator", action: () => document.getElementById("btn-quick-calc").click() });
  commands.push({ name: "Toggle Smart Formatting", icon: "wand-2", action: () => document.getElementById("btn-smart-format").click() });
  commands.push({ name: "Export EPUB", icon: "book", action: () => document.getElementById("btn-save-epub").click() });
  commands.push({ name: "Writing Streak", icon: "flame", action: () => { updateStreak(); setStatus("Streak updated!"); } });
  commands.push({ name: "Writing Prompt", icon: "lightbulb", action: showRandomPrompt });
}

/* ===== Phase 15: Productivity & Polish ===== */

/* 1. Reading Progress Bar */
const progressBar = document.getElementById("reading-progress");
const editorContainerScroll = document.getElementById("editor-container") || document.querySelector(".editor-container");

function updateReadingProgress() {
  if (!progressBar) return;
  const container = document.querySelector(".editor-container") || document.querySelector(".doc-wrap");
  if (!container) return;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight - container.clientHeight;
  const pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
  progressBar.style.width = pct + "%";
}

document.querySelector(".editor-container")?.addEventListener("scroll", updateReadingProgress);
document.querySelector(".doc-wrap")?.addEventListener("scroll", updateReadingProgress);
setInterval(updateReadingProgress, 300);

/* 2. Bookmarks System */
let bookmarks = JSON.parse(localStorage.getItem("texter-bookmarks") || "[]");
const btnBookmark = document.getElementById("btn-bookmark");
const bookmarkPanel = document.getElementById("bookmark-panel");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkCount = document.getElementById("bookmark-count");

function saveBookmarks() {
  localStorage.setItem("texter-bookmarks", JSON.stringify(bookmarks));
  renderBookmarks();
}

function renderBookmarks() {
  if (!bookmarkList) return;
  bookmarkList.innerHTML = bookmarks.map((bm, i) => `
    <div style="font-size:0.75rem; padding:0.3rem 0.4rem; background:var(--bg-editor); border-radius:4px; border-left:2px solid var(--accent); cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
         onclick="goToBookmark(${i})">
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${bm.label}</span>
      <span onclick="event.stopPropagation(); removeBookmark(${i})" style="color:red; cursor:pointer; margin-left:0.5rem; font-size:0.7rem;">&times;</span>
    </div>
  `).join("") || '<p style="font-size:0.7rem; opacity:0.4;">No bookmarks</p>';
  if (bookmarkCount) bookmarkCount.textContent = `(${bookmarks.length})`;
}

window.goToBookmark = function(i) {
  const bm = bookmarks[i];
  if (!bm) return;
  const el = document.getElementById(bm.id);
  if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.style.outline = "2px solid var(--accent)"; setTimeout(() => el.style.outline = "", 1500); }
  else { setStatus("Bookmark target not found"); }
};

window.removeBookmark = function(i) {
  bookmarks.splice(i, 1);
  saveBookmarks();
};

function toggleBookmark() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  let node = sel.anchorNode;
  if (node.nodeType === 3) node = node.parentNode;
  while (node && node !== editor && node.parentNode !== editor) node = node.parentNode;
  if (!node || node === editor) { setStatus("Select a paragraph to bookmark"); return; }
  
  const existing = bookmarks.findIndex(b => b.id === node.id);
  if (existing >= 0) {
    bookmarks.splice(existing, 1);
    setStatus("Bookmark removed");
  } else {
    if (!node.id) node.id = "bm-" + Date.now();
    const label = node.textContent?.substring(0, 40).trim() || "Bookmark";
    bookmarks.push({ id: node.id, label, ts: Date.now() });
    node.style.outline = "2px solid var(--accent)";
    setTimeout(() => node.style.outline = "", 1500);
    setStatus("Bookmark added: " + label);
  }
  saveBookmarks();
}

if (btnBookmark) btnBookmark.addEventListener("click", toggleBookmark);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "m") { e.preventDefault(); toggleBookmark(); }
});
renderBookmarks();

if (bookmarkPanel) {
  btnBookmark?.addEventListener("dblclick", () => { bookmarkPanel.hidden = !bookmarkPanel.hidden; });
}

/* 3. Markdown Import */
const btnImportMd = document.getElementById("btn-import-md");
const mdImportInput = document.getElementById("md-import-input");

function parseMarkdownToHtml(md) {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width:100%;">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return "<p>" + html + "</p>";
}

if (btnImportMd) {
  btnImportMd.addEventListener("click", () => mdImportInput?.click());
}

if (mdImportInput) {
  mdImportInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    if (!confirm("Import will replace current content. Continue?")) return;
    setHtml(parseMarkdownToHtml(text));
    setFilename(file.name);
    setStatus("Markdown imported");
    debouncedStats();
    mdImportInput.value = "";
  });
}

/* 4. Grammar Checker */
const btnGrammar = document.getElementById("btn-grammar");
const grammarModal = document.getElementById("grammar-modal");
const btnCloseGrammar = document.getElementById("btn-close-grammar");
const btnRunGrammar = document.getElementById("btn-run-grammar");
const grammarResults = document.getElementById("grammar-results");

const grammarRules = [
  { pattern: /\b(its|it's)\b/gi, msg: "Check 'it's' vs 'its' (apostrophe = 'it is')" },
  { pattern: /\b(they're|their|there)\b/gi, msg: "Check 'they're/their/there' usage" },
  { pattern: /\b(your|you're)\b/gi, msg: "Check 'your' vs 'you're' (you are)" },
  { pattern: /\b(whose|who's)\b/gi, msg: "Check 'whose' vs 'who's' (who is)" },
  { pattern: /\b(affect|effect)\b/gi, msg: "Check 'affect' (verb) vs 'effect' (noun)" },
  { pattern: /\b(lose|loose)\b/gi, msg: "Check 'lose' (misplace) vs 'loose' (not tight)" },
  { pattern: /\bthen\b(?![^.]*\.)/gi, msg: "Check 'then' vs 'than' for comparisons" },
  { pattern: /\b(alot|alot)\b/gi, msg: "'Alot' should be 'a lot' (two words)" },
  { pattern: /\bcould of\b/gi, msg: "'Could of' should be 'could have' or 'could've'" },
  { pattern: /\bshould of\b/gi, msg: "'Should of' should be 'should have'" },
  { pattern: /\bwould of\b/gi, msg: "'Would of' should be 'would have'" },
];

function runGrammarCheck() {
  const text = getText();
  if (!text.trim()) { grammarResults.innerHTML = "<p>Document is empty.</p>"; return; }
  
  let issues = [];
  grammarRules.forEach(rule => {
    const matches = text.match(rule.pattern);
    if (matches) issues.push({ rule: rule.msg, count: matches.length });
  });
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWords = sentences.length > 0 ? Math.round(text.split(/\s+/).length / sentences.length) : 0;
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 30).length;
  
  let html = `<div style="margin-bottom:1rem;"><strong>Document Stats:</strong><br>
    ~${text.split(/\s+/).length} words, ${sentences.length} sentences, avg ${avgWords} words/sentence<br>
    ${longSentences > 0 ? `⚠ ${longSentences} sentence(s) over 30 words — consider splitting.` : "✅ Sentence lengths look good."}
  </div>`;
  
  if (issues.length === 0) {
    html += '<div style="color:#4ade80; font-weight:bold;">✅ No common grammar issues detected!</div>';
  } else {
    html += '<div style="margin-top:0.5rem;"><strong>Potential Issues:</strong></div>';
    issues.forEach(issue => {
      html += `<div style="padding:0.4rem; background:rgba(239,68,68,0.1); border-radius:4px; margin-top:0.3rem; font-size:0.85rem;">
        <span style="color:var(--accent);">⚠</span> ${issue.rule} <span style="opacity:0.5;">(${issue.count} match${issue.count > 1 ? 'es' : ''})</span>
      </div>`;
    });
  }
  
  grammarResults.innerHTML = html;
}

if (btnGrammar) btnGrammar.addEventListener("click", () => { grammarModal.hidden = false; runGrammarCheck(); });
if (btnCloseGrammar) btnCloseGrammar.addEventListener("click", () => grammarModal.hidden = true);
if (btnRunGrammar) btnRunGrammar.addEventListener("click", runGrammarCheck);

/* 5. Todo Aggregator */
const btnTodoAgg = document.getElementById("btn-todo-agg");
const todoAgg = document.getElementById("todo-aggregator");
const todoAggList = document.getElementById("todo-agg-list");
const todoAggCount = document.getElementById("todo-agg-count");

function updateTodoAggregator() {
  if (!todoAggList || todoAgg.hidden) return;
  const checkboxes = editor.querySelectorAll('input[type="checkbox"]');
  let html = "", checked = 0, total = 0;
  checkboxes.forEach(cb => {
    total++;
    if (cb.checked) checked++;
    const parent = cb.closest("p, div, li") || cb.parentElement;
    const text = parent?.textContent?.replace(cb.textContent || "", "").trim() || "";
    html += `<label style="font-size:0.75rem; display:flex; align-items:center; gap:0.4rem; cursor:pointer; padding:0.2rem 0;">
      <input type="checkbox" ${cb.checked ? "checked" : ""} onchange="this.closest('.app').querySelector('#editor').querySelectorAll('input[type=checkbox]')[${Array.from(checkboxes).indexOf(cb)}].checked=this.checked; _updateChecklists(); updateTodoAggregator();">
      <span style="${cb.checked ? 'text-decoration:line-through; opacity:0.5;' : ''}">${text || 'Task'}</span>
    </label>`;
  });
  todoAggList.innerHTML = html || '<p style="font-size:0.7rem; opacity:0.4;">No checkboxes in document</p>';
  if (todoAggCount) todoAggCount.textContent = `${checked}/${total}`;
}

if (btnTodoAgg) {
  btnTodoAgg.addEventListener("click", () => {
    todoAgg.hidden = !todoAgg.hidden;
    if (!todoAgg.hidden) updateTodoAggregator();
  });
}
editor.addEventListener("input", () => { if (todoAgg && !todoAgg.hidden) updateTodoAggregator(); });
editor.addEventListener("change", () => { if (todoAgg && !todoAgg.hidden) updateTodoAggregator(); });

/* 6. Reading Mode */
const btnReadingMode = document.getElementById("btn-reading-mode");
const readingOverlay = document.getElementById("reading-mode-overlay");
const readingTitle = document.getElementById("reading-title");
const readingMeta = document.getElementById("reading-meta");
const readingContent = document.getElementById("reading-content");
const btnCloseReading = document.getElementById("btn-close-reading");
const readingFontsize = document.getElementById("reading-fontsize");
const readingTheme = document.getElementById("reading-theme");
const readingProgress = document.getElementById("reading-progress");

function openReadingMode() {
  if (!readingOverlay || !readingTitle || !readingMeta || !readingContent) return;
  const text = getText();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  readingTitle.textContent = filenameEl.textContent;
  readingMeta.textContent = `${words} word${words !== 1 ? 's' : ''} | ${Math.max(1, Math.ceil(words / 200))} min read`;
  
  // Clone editor content for clean reading
  const clone = editor.cloneNode(true);
  clone.contentEditable = false;
  clone.style.border = "none";
  clone.style.boxShadow = "none";
  clone.style.background = "transparent";
  clone.style.color = "var(--text)";
  clone.style.padding = "0";
  clone.style.width = "auto";
  clone.style.minHeight = "auto";
  readingContent.innerHTML = "";
  readingContent.appendChild(clone);
  
  // Apply saved settings
  const fs = localStorage.getItem("texter-reading-fs") || "1.1";
  const th = localStorage.getItem("texter-reading-theme") || "default";
  if (readingFontsize) readingFontsize.value = fs;
  if (readingTheme) readingTheme.value = th;
  applyReadingSettings(fs, th);
  
  readingOverlay.hidden = false;
  readingOverlay.scrollTop = 0;
  updateReadingProgress();
}

function applyReadingSettings(fs, th) {
  if (!readingContent) return;
  readingContent.style.fontSize = fs + "rem";
  const overlay = readingOverlay;
  if (th === "sepia") { overlay.style.background = "#fbf0d9"; overlay.style.color = "#5b4636"; readingContent.style.color = "#5b4636"; }
  else if (th === "dark") { overlay.style.background = "#1a1a2e"; overlay.style.color = "#e0e0e0"; readingContent.style.color = "#e0e0e0"; }
  else { overlay.style.background = ""; overlay.style.color = ""; readingContent.style.color = ""; }
}

function updateReadingProgress() {
  if (!readingOverlay || readingOverlay.hidden) return;
  const scrollTop = readingOverlay.scrollTop;
  const scrollH = readingOverlay.scrollHeight - readingOverlay.clientHeight;
  const pct = scrollH > 0 ? Math.round(scrollTop / scrollH * 100) : 0;
  if (readingProgress) readingProgress.textContent = pct + "%";
}

if (btnReadingMode) btnReadingMode.addEventListener("click", openReadingMode);
if (btnCloseReading) btnCloseReading.addEventListener("click", () => { if (readingOverlay) readingOverlay.hidden = true; });
if (readingFontsize) readingFontsize.addEventListener("change", () => {
  localStorage.setItem("texter-reading-fs", readingFontsize.value);
  applyReadingSettings(readingFontsize.value, readingTheme?.value || "default");
});
if (readingTheme) readingTheme.addEventListener("change", () => {
  localStorage.setItem("texter-reading-theme", readingTheme.value);
  applyReadingSettings(readingFontsize?.value || "1.1", readingTheme.value);
});
readingOverlay?.addEventListener("scroll", updateReadingProgress);

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "R"||e.key === "r")) { e.preventDefault(); openReadingMode(); }
  if (e.key === "Escape" && readingOverlay && !readingOverlay.hidden) readingOverlay.hidden = true;
});

/* 7. Clipboard Manager */
const clipboardMgr = document.getElementById("btn-clipboard-mgr");
const clipboardModal = document.getElementById("clipboard-modal");
const btnCloseClipboard = document.getElementById("btn-close-clipboard");
const clipboardList = document.getElementById("clipboard-list");
let clipboardHistory = JSON.parse(localStorage.getItem("texter-clipboard") || "[]");

function saveClipboardHistory() {
  localStorage.setItem("texter-clipboard", JSON.stringify(clipboardHistory));
}

function renderClipboard(filter) {
  if (!clipboardList) return;
  const q = (filter || "").toLowerCase();
  const items = q ? clipboardHistory.filter(t => t.toLowerCase().includes(q)) : clipboardHistory;
  clipboardList.innerHTML = items.map((item, i) => {
    const realIdx = clipboardHistory.indexOf(item);
    return `<div style="padding:0.5rem; background:var(--bg-ribbon); border-radius:4px; cursor:pointer; font-size:0.8rem; border:1px solid var(--border);"
         onclick="pasteClipboardItem(${realIdx})" title="Click to paste">
      <div style="max-height:60px; overflow:hidden; opacity:0.8;">${item.length > 100 ? item.substring(0,100)+'...' : item}</div>
      <div style="font-size:0.65rem; opacity:0.4; margin-top:0.25rem;">
        <span onclick="event.stopPropagation(); togglePinClipboard(${realIdx})" style="cursor:pointer; ${clipboardHistory._pinned?.includes(item) ? 'color:gold;' : ''}">${clipboardHistory._pinned?.includes(item) ? '★' : '☆'}</span>
        &bull; Click to paste &bull;
        <span onclick="event.stopPropagation(); removeClipboardItem(${realIdx})" style="color:red; cursor:pointer;">Delete</span>
      </div>
    </div>`;
  }).join("") || '<p style="opacity:0.5; font-size:0.85rem;">Empty. Copy text to build history.</p>';
}

window.togglePinClipboard = function(i) {
  const item = clipboardHistory[i];
  if (!clipboardHistory._pinned) clipboardHistory._pinned = [];
  const idx = clipboardHistory._pinned.indexOf(item);
  if (idx >= 0) clipboardHistory._pinned.splice(idx, 1);
  else clipboardHistory._pinned.push(item);
  saveClipboardHistory();
  renderClipboard(document.getElementById("clipboard-search")?.value);
};

window.pasteClipboardItem = function(i) {
  const item = clipboardHistory[i];
  if (item) { editor.focus(); document.execCommand("insertText", false, item); clipboardModal.hidden = true; setStatus("Pasted from clipboard history"); }
};

window.removeClipboardItem = function(i) {
  clipboardHistory.splice(i, 1);
  saveClipboardHistory();
  renderClipboard(document.getElementById("clipboard-search")?.value);
};

document.addEventListener("copy", () => {
  setTimeout(() => {
    const sel = window.getSelection().toString().trim();
    if (!sel) return;
    clipboardHistory.unshift(sel);
    if (clipboardHistory.length > 15) clipboardHistory = clipboardHistory.slice(0, 15);
    saveClipboardHistory();
  }, 100);
});

if (clipboardMgr) clipboardMgr.addEventListener("click", () => { renderClipboard(); clipboardModal.hidden = false; });
if (btnCloseClipboard) btnCloseClipboard.addEventListener("click", () => clipboardModal.hidden = true);

// Clipboard search
const clipboardSearch = document.getElementById("clipboard-search");
if (clipboardSearch) {
  clipboardSearch.addEventListener("input", () => renderClipboard(clipboardSearch.value));
}

/* 8. Auto-Save Status Indicator */
const saveStatusEl = document.getElementById("save-status");
let isDirty = false;

function markDirty() {
  if (!isDirty && saveStatusEl) {
    isDirty = true;
    saveStatusEl.textContent = "Unsaved";
    saveStatusEl.style.color = "#f87171";
  }
}

function markSaved() {
  isDirty = false;
  if (saveStatusEl) {
    saveStatusEl.textContent = "Saved";
    saveStatusEl.style.color = "var(--accent)";
  }
}

editor.addEventListener("input", markDirty);

const origSaveFile = window.saveFile;
if (typeof saveFile === "function") {
  const _origSave = saveFile;
  saveFile = function(...args) {
    const result = _origSave.apply(this, args);
    markSaved();
    return result;
  };
}
["btn-save", "btn-save-txt", "btn-save-md", "btn-save-docx", "btn-save-pdf", "btn-save-png", "btn-save-epub"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", () => setTimeout(markSaved, 500));
});

/* Add to Command Palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Check Grammar", icon: "check-check", action: () => document.getElementById("btn-grammar")?.click() });
  commands.push({ name: "Toggle Bookmark", icon: "bookmark", action: toggleBookmark });
  commands.push({ name: "Reading Mode", icon: "book-open-check", action: openReadingMode });
  commands.push({ name: "Show Checklists", icon: "list-checks", action: () => document.getElementById("btn-todo-agg")?.click() });
  commands.push({ name: "Clipboard History", icon: "clipboard-list", action: () => document.getElementById("btn-clipboard-mgr")?.click() });
  commands.push({ name: "Import Markdown", icon: "file-down", action: () => document.getElementById("btn-import-md")?.click() });
}

/* ===== Phase 16: The Writer's Workshop ===== */

/* 1. Line Numbers Toggle */
let lineNumsEnabled = false;
const btnLineNums = document.getElementById("btn-line-nums");

function toggleLineNumbers() {
  lineNumsEnabled = !lineNumsEnabled;
  const editorCanvas = document.getElementById("editor-canvas");
  if (!editorCanvas) return;
  
  let gutter = document.getElementById("line-nums-gutter");
  if (lineNumsEnabled) {
    btnLineNums.style.color = "var(--accent)";
    if (!gutter) {
      gutter = document.createElement("div");
      gutter.id = "line-nums-gutter";
      gutter.className = "line-numbers-gutter";
      gutter.style.cssText = "padding:20mm 0.5rem; text-align:right; font-family:monospace; font-size:0.75rem; line-height:1.6; color:var(--text-muted); opacity:0.4; user-select:none; border-right:1px solid var(--border); min-width:2.5rem; overflow:hidden;";
      editorCanvas.parentElement.style.display = "flex";
      editorCanvas.parentElement.style.flexDirection = "row";
      editorCanvas.parentElement.insertBefore(gutter, editorCanvas);
    }
    updateLineNumbers();
    editor.addEventListener("input", updateLineNumbers);
    editor.addEventListener("scroll", updateLineNumbers);
    setStatus("Line Numbers ON");
  } else {
    btnLineNums.style.color = "";
    if (gutter) gutter.remove();
    editor.removeEventListener("input", updateLineNumbers);
    editor.removeEventListener("scroll", updateLineNumbers);
    setStatus("Line Numbers OFF");
  }
}

function updateLineNumbers() {
  const gutter = document.getElementById("line-nums-gutter");
  if (!gutter) return;
  const text = editor.innerText || "";
  const lines = text.split("\n").length;
  let nums = "";
  for (let i = 1; i <= lines; i++) nums += i + "\n";
  gutter.textContent = nums;
}

if (btnLineNums) btnLineNums.addEventListener("click", toggleLineNumbers);

/* 2. URL Auto-Linkify */
editor.addEventListener("input", () => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const node = sel.anchorNode;
  if (!node || node.nodeType !== 3) return;
  const text = node.textContent;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (urlRegex.test(text)) {
    node.textContent = text.replace(urlRegex, (url) => {
      try { new URL(url); return url; } catch { return url; }
    });
    const html = text.replace(urlRegex, '<a href="$1" target="_blank" style="color:var(--accent);">$1</a>');
    if (html !== text) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const fragment = range.createContextualFragment(html);
      node.parentNode.replaceChild(fragment, node);
    }
  }
});

/* 3. Daily Journal Entry */
const btnJournal = document.getElementById("btn-journal");
if (btnJournal) {
  btnJournal.addEventListener("click", () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const intro = [
      "Today I'm focusing on",
      "Reflecting on",
      "Working through ideas about",
      "Journal entry for",
    ][Math.floor(Math.random() * 4)];
    const html = `<div style="border-left:3px solid var(--accent); padding-left:1rem; margin:1rem 0;">
      <h3 style="margin:0 0 0.5rem;">${dateStr}</h3>
      <p style="opacity:0.7; font-style:italic;">${intro} ${dateStr}...</p>
      <p><br></p>
    </div>`;
    exec("insertHTML", html);
    setStatus(`Journal entry: ${dateStr}`);
  });
}

/* 4. Scratchpad (Persistent Quick Notes) */
const btnScratchpad = document.getElementById("btn-scratchpad");
const scratchpadPanel = document.getElementById("scratchpad-panel");
const scratchpadTextarea = document.getElementById("scratchpad-textarea");
const scratchpadHeader = document.getElementById("scratchpad-header");
const scratchpadTitle = document.getElementById("scratchpad-title");

if (btnScratchpad) {
  btnScratchpad.addEventListener("click", () => {
    scratchpadPanel.hidden = !scratchpadPanel.hidden;
    if (!scratchpadPanel.hidden) {
      scratchpadTextarea.value = localStorage.getItem("texter-scratchpad") || "";
      scratchpadTitle.value = localStorage.getItem("texter-scratchpad-title") || "";
      scratchpadTextarea.focus();
    }
  });
}

if (scratchpadTextarea) {
  scratchpadTextarea.addEventListener("input", () => {
    localStorage.setItem("texter-scratchpad", scratchpadTextarea.value);
  });
}

if (scratchpadTitle) {
  scratchpadTitle.addEventListener("input", () => {
    localStorage.setItem("texter-scratchpad-title", scratchpadTitle.value);
  });
}

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && scratchpadPanel && !scratchpadPanel.hidden) scratchpadPanel.hidden = true;
  if (e.key === "Escape" && kanbanSidebar && !kanbanSidebar.hidden) kanbanSidebar.hidden = true;
});

// Make scratchpad draggable
let spDrag = false, spOffX, spOffY;
if (scratchpadHeader && scratchpadPanel) {
  scratchpadHeader.addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) return;
    spDrag = true;
    const rect = scratchpadPanel.getBoundingClientRect();
    spOffX = e.clientX - rect.left;
    spOffY = e.clientY - rect.top;
    scratchpadHeader.style.cursor = "grabbing";
    e.preventDefault();
  });
}
document.addEventListener("mousemove", (e) => {
  if (!spDrag) return;
  scratchpadPanel.style.left = (e.clientX - spOffX) + "px";
  scratchpadPanel.style.top = (e.clientY - spOffY) + "px";
  scratchpadPanel.style.right = "auto";
});
document.addEventListener("mouseup", () => {
  if (spDrag) {
    spDrag = false;
    if (scratchpadHeader) scratchpadHeader.style.cursor = "grab";
  }
});

/* 5. Invisibles Toggle (show spaces/tabs/paragraphs) */
let invisiblesOn = false;
const btnInvisibles = document.getElementById("btn-invisibles");

function toggleInvisibles() {
  invisiblesOn = !invisiblesOn;
  document.body.classList.toggle("invisibles-show", invisiblesOn);
  btnInvisibles.style.color = invisiblesOn ? "var(--accent)" : "";
  setStatus(invisiblesOn ? "Invisibles ON" : "Invisibles OFF");
}

if (btnInvisibles) btnInvisibles.addEventListener("click", toggleInvisibles);

/* 6. Column Layout for Selection */
const btnColumns = document.getElementById("btn-columns");
if (btnColumns) {
  btnColumns.addEventListener("click", () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) { setStatus("Select text to format as columns"); return; }
    const html = `<div style="column-count:2; column-gap:2rem; margin:1rem 0; text-align:justify;">${sel.toString()}</div><p><br></p>`;
    exec("insertHTML", html);
    setStatus("Text wrapped in 2-column layout");
  });
}

/* 7. Export Stats Report */
const btnExportStats = document.getElementById("btn-export-stats");
if (btnExportStats) {
  btnExportStats.addEventListener("click", () => {
    const text = getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const syllables = text.toLowerCase().split(/\s+/).reduce((sum, w) => {
      w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
      const m = w.match(/[aeiouy]{1,2}/g);
      return sum + (m ? m.length : 1);
    }, 0);
    const grade = words > 0 ? 0.39 * (words / sentences) + 11.8 * (syllables / Math.max(1, words)) - 15.59 : 0;
    const gradeLevel = grade < 1 ? "1st Grade" : grade >= 13 ? "College" : Math.round(grade) + "th Grade";
    
    const report = `=== Document Statistics ===
Filename: ${filenameEl.textContent}
Date: ${new Date().toLocaleString()}

Words: ${words}
Characters (no spaces): ${charsNoSpace}
Characters (total): ${chars}
Sentences: ${sentences}
Paragraphs: ${paragraphs}
Avg words/sentence: ${(words / Math.max(1, sentences)).toFixed(1)}
Readability: ${gradeLevel}
Est. reading time: ${Math.max(1, Math.ceil(words / 200))} min
Est. speaking time: ${Math.max(1, Math.ceil(words / 130))} min
========================`;
    
    const blob = new Blob([report], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filenameEl.textContent.replace(/\.[^.]+$/, "") + "-stats.txt";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("Stats report exported");
  });
}

/* 8. Focus Session History */
let focusHistory = JSON.parse(localStorage.getItem("texter-focus-history") || "[]");
const btnFocusHistory = document.getElementById("btn-focus-history");
const focusHistoryModal = document.getElementById("focus-history-modal");
const btnCloseFocusHistory = document.getElementById("btn-close-focus-history");
const focusHistoryList = document.getElementById("focus-history-list");
const focusTotalSessions = document.getElementById("focus-total-sessions");
const focusTotalMinutes = document.getElementById("focus-total-minutes");

// Log completed pomodoro
const origPomoCheck = pomoInterval;
setInterval(() => {
  if (pomoSeconds <= 0 && !isPomoBreak && isPomoRunning) {
    focusHistory.push({ date: new Date().toLocaleString(), minutes: 25 });
    if (focusHistory.length > 100) focusHistory.splice(0, focusHistory.length - 100);
    localStorage.setItem("texter-focus-history", JSON.stringify(focusHistory));
  }
}, 1000);

function renderFocusHistory() {
  if (!focusHistoryList) return;
  if (focusHistory.length === 0) {
    focusHistoryList.innerHTML = '<p style="opacity:0.5;">No focus sessions completed yet. Use the Pomodoro timer!</p>';
    if (focusTotalSessions) focusTotalSessions.textContent = "Total: 0";
    if (focusTotalMinutes) focusTotalMinutes.textContent = "Minutes: 0";
    return;
  }
  focusHistoryList.innerHTML = focusHistory.map(s => `
    <div style="display:flex; justify-content:space-between; padding:0.3rem 0; border-bottom:1px solid var(--border); font-size:0.8rem;">
      <span>${s.date}</span>
      <span style="color:var(--accent); font-weight:bold;">${s.minutes}m</span>
    </div>
  `).reverse().join("");
  if (focusTotalSessions) focusTotalSessions.textContent = `Total: ${focusHistory.length}`;
  if (focusTotalMinutes) focusTotalMinutes.textContent = `Minutes: ${focusHistory.reduce((a, b) => a + b.minutes, 0)}`;
}

// Add focus history button to pomodoro widget
const pomoStatsBtn = document.createElement("button");
pomoStatsBtn.id = "btn-focus-history";
pomoStatsBtn.className = "btn btn-top";
pomoStatsBtn.style.cssText = "font-size:0.65rem; padding:0.15rem 0.4rem; margin-left:0.5rem;";
pomoStatsBtn.textContent = "Stats";
pomoWidget?.appendChild(pomoStatsBtn);

const btnFocusHist = document.getElementById("btn-focus-history");
if (btnFocusHist) btnFocusHist.addEventListener("click", () => { renderFocusHistory(); focusHistoryModal.hidden = false; });
if (btnCloseFocusHistory) btnCloseFocusHistory.addEventListener("click", () => focusHistoryModal.hidden = true);

/* Add to Command Palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Toggle Line Numbers", icon: "hash", action: toggleLineNumbers });
  commands.push({ name: "Daily Journal", icon: "notebook-pen", action: () => document.getElementById("btn-journal")?.click() });
  commands.push({ name: "Toggle Invisibles", icon: "pilcrow", action: toggleInvisibles });
  commands.push({ name: "Export Statistics", icon: "file-chart-column", action: () => document.getElementById("btn-export-stats")?.click() });
  commands.push({ name: "Wrap in Columns", icon: "columns-3", action: () => document.getElementById("btn-columns")?.click() });
  commands.push({ name: "Focus History", icon: "timer", action: () => { renderFocusHistory(); focusHistoryModal.hidden = false; } });
  commands.push({ name: "Toggle Scratchpad", icon: "sticky-note", action: () => document.getElementById("btn-scratchpad")?.click() });
}

/* ===== Phase 17: Artisan & Utility ===== */

/* 1. Text Transform: Title Case, snake_case */
document.getElementById("cmd-titlecase")?.addEventListener("click", () => {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const text = sel.toString();
  const transformed = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  document.execCommand("insertText", false, transformed);
});
document.getElementById("cmd-snakecase")?.addEventListener("click", () => {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const text = sel.toString();
  document.execCommand("insertText", false, text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
});

/* 2. Drop Cap / Initial Letter */
document.getElementById("cmd-dropcap")?.addEventListener("click", () => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  let node = sel.anchorNode;
  if (node.nodeType === 3) node = node.parentNode;
  while (node && node.parentNode !== editor) node = node.parentNode;
  if (!node) { setStatus("Place cursor in a paragraph"); return; }
  const firstLetter = node.textContent.trim().charAt(0);
  if (!firstLetter) return;
  const rest = node.textContent.trim().slice(1);
  node.innerHTML = `<span style="font-size:3.5em; line-height:1; font-weight:700; float:left; margin-right:0.5rem; color:var(--accent);">${firstLetter}</span>${rest}`;
  setStatus("Drop cap applied");
});

/* 3. Copy Special (Plain / HTML / Markdown) */
const btnCopySpecial = document.getElementById("btn-copy-special");
const copySpecialDropdown = document.getElementById("copy-special-dropdown");
if (btnCopySpecial) {
  btnCopySpecial.addEventListener("click", () => {
    copySpecialDropdown.hidden = !copySpecialDropdown.hidden;
  });
}
document.addEventListener("mousedown", (e) => {
  if (copySpecialDropdown && !e.target.closest("#btn-copy-special") && !copySpecialDropdown.contains(e.target))
    copySpecialDropdown.hidden = true;
});

window.copySpecial = function(format) {
  copySpecialDropdown.hidden = true;
  const sel = window.getSelection();
  const content = !sel.isCollapsed ? sel.toString() : getText();
  let text = content;
  if (format === 'html') text = !sel.isCollapsed ? sel.toString() : getHtml();
  if (format === 'md') {
    text = content
      .split("\n").filter(l => l.trim()).map(l => {
        if (l.length < 50) return `## ${l}`;
        return l;
      }).join("\n\n");
  }
  navigator.clipboard.writeText(text).then(() => setStatus(`Copied as ${format.toUpperCase()}`)).catch(() => setStatus("Copy failed"));
};

/* 4. Drag & Drop File Import */
editor.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; editor.style.outline = "2px dashed var(--accent)"; });
editor.addEventListener("dragleave", () => { editor.style.outline = ""; });
editor.addEventListener("drop", (e) => {
  e.preventDefault();
  editor.style.outline = "";
  const files = e.dataTransfer.files;
  if (!files.length) return;
  const file = files[0];
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".html") || name.endsWith(".htm")) {
    if (!confirm("Import will replace current content. Continue?")) return;
    file.text().then(text => {
      if (name.endsWith(".md")) {
        setHtml(parseMarkdownToHtml(text));
      } else if (name.endsWith(".html") || name.endsWith(".htm")) {
        setHtml(stripScripts(text));
      } else {
        setHtml(text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
      }
      setFilename(file.name);
      setStatus(`Imported: ${file.name}`);
      debouncedStats();
    });
  } else if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (ev) => exec("insertImage", ev.target.result);
    reader.readAsDataURL(file);
  } else {
    setStatus("Unsupported file type");
  }
});

/* 5. Readability Score in Status Bar */
const readabilityEl = document.getElementById("readability-score");
function updateReadability() {
  if (!readabilityEl) return;
  const text = getText();
  if (!text.trim()) { readabilityEl.textContent = "📖 --"; return; }
  const words = text.trim().split(/\s+/).length;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const syllables = text.toLowerCase().split(/\s+/).reduce((sum, w) => {
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const m = w.match(/[aeiouy]{1,2}/g);
    return sum + (m ? m.length : 1);
  }, 0);
  const score = words > 0 && sentences > 0 ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / Math.max(1, words)) : 0;
  const label = score >= 90 ? "Very Easy" : score >= 80 ? "Easy" : score >= 70 ? "Fairly Easy" : score >= 60 ? "Standard" : score >= 50 ? "Fairly Hard" : score >= 30 ? "Hard" : "Very Hard";
  readabilityEl.textContent = `📖 ${Math.round(score)} (${label})`;
}
editor.addEventListener("input", () => setTimeout(updateReadability, 300));
updateReadability();

/* 6. Last Saved Timestamp */
const lastSavedEl = document.getElementById("last-saved");
let lastSavedTime = Date.now();
function updateLastSaved() {
  if (!lastSavedEl) return;
  const diff = Math.floor((Date.now() - lastSavedTime) / 1000);
  if (diff < 60) lastSavedEl.textContent = "just now";
  else if (diff < 3600) lastSavedEl.textContent = `${Math.floor(diff / 60)}m ago`;
  else lastSavedEl.textContent = `${Math.floor(diff / 3600)}h ago`;
}
setInterval(updateLastSaved, 10000);
["btn-save", "btn-save-txt", "btn-save-md", "btn-save-docx", "btn-save-pdf", "btn-save-png", "btn-save-epub"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", () => { lastSavedTime = Date.now(); updateLastSaved(); });
});
updateLastSaved();

/* 7. Heading Permalinks (show § on hover) */
editor.addEventListener("mouseover", (e) => {
  const heading = e.target.closest("h1, h2, h3");
  if (!heading || heading.closest("#editor") !== heading.parentElement && !heading.closest("#editor")?.contains(heading)) return;
  let existing = heading.querySelector(".heading-permalink");
  if (!existing) {
    existing = document.createElement("span");
    existing.className = "heading-permalink";
    existing.textContent = " §";
    existing.style.cssText = "cursor:pointer; opacity:0.3; font-size:0.7em; margin-left:0.25rem; color:var(--accent);";
    existing.title = "Copy anchor link to heading";
    existing.onclick = (ev) => {
      ev.stopPropagation();
      if (!heading.id) heading.id = "h-" + Date.now();
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${heading.id}`).then(() => setStatus("Heading link copied!"));
    };
    heading.appendChild(existing);
  }
  existing.style.opacity = "0.6";
});
editor.addEventListener("mouseout", (e) => {
  const heading = e.target.closest("h1, h2, h3");
  if (!heading) return;
  const link = heading.querySelector(".heading-permalink");
  if (link) link.style.opacity = "0";
});

/* 8. Custom Theme Builder */
const btnThemeBuilder = document.getElementById("btn-theme-builder");
const themeBuilderModal = document.getElementById("theme-builder-modal");
const btnCloseThemeBuilder = document.getElementById("btn-close-theme-builder");
const btnApplyTheme = document.getElementById("btn-apply-theme");
const btnResetTheme = document.getElementById("btn-reset-theme");

if (btnThemeBuilder) btnThemeBuilder.addEventListener("click", () => {
  themeBuilderModal.hidden = false;
  const root = getComputedStyle(document.documentElement);
  document.getElementById("tb-accent").value = root.getPropertyValue("--accent").trim() || "#a78bfa";
  document.getElementById("tb-bg-app").value = root.getPropertyValue("--bg-app").trim() || "#0f0f12";
  document.getElementById("tb-bg-editor").value = root.getPropertyValue("--bg-editor").trim() || "#16161b";
  document.getElementById("tb-border").value = root.getPropertyValue("--border").trim() || "#2a2a32";
  document.getElementById("tb-text").value = root.getPropertyValue("--text").trim() || "#e4e4e7";
});
if (btnCloseThemeBuilder) btnCloseThemeBuilder.addEventListener("click", () => themeBuilderModal.hidden = true);

if (btnApplyTheme) {
  btnApplyTheme.addEventListener("click", () => {
    const root = document.documentElement;
    root.style.setProperty("--accent", document.getElementById("tb-accent").value);
    root.style.setProperty("--bg-app", document.getElementById("tb-bg-app").value);
    root.style.setProperty("--bg-editor", document.getElementById("tb-bg-editor").value);
    root.style.setProperty("--border", document.getElementById("tb-border").value);
    root.style.setProperty("--text", document.getElementById("tb-text").value);
    const theme = { accent: document.getElementById("tb-accent").value, bgApp: document.getElementById("tb-bg-app").value, bgEditor: document.getElementById("tb-bg-editor").value, border: document.getElementById("tb-border").value, text: document.getElementById("tb-text").value };
    localStorage.setItem("texter-custom-theme", JSON.stringify(theme));
    themeBuilderModal.hidden = true;
    setStatus("Custom theme applied");
    if (window.lucide) lucide.createIcons();
  });
}

if (btnResetTheme) {
  btnResetTheme.addEventListener("click", () => {
    const root = document.documentElement;
    ["--accent","--bg-app","--bg-editor","--border","--text"].forEach(p => root.style.removeProperty(p));
    localStorage.removeItem("texter-custom-theme");
    themeBuilderModal.hidden = true;
    setStatus("Theme reset to default");
  });
}

// Restore saved custom theme
try {
  const savedTheme = JSON.parse(localStorage.getItem("texter-custom-theme"));
  if (savedTheme) {
    const root = document.documentElement;
    root.style.setProperty("--accent", savedTheme.accent);
    root.style.setProperty("--bg-app", savedTheme.bgApp);
    root.style.setProperty("--bg-editor", savedTheme.bgEditor);
    root.style.setProperty("--border", savedTheme.border);
    root.style.setProperty("--text", savedTheme.text);
  }
} catch(e) {}

/* Add new commands to palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Title Case", icon: "text-cursor-input", action: () => document.getElementById("cmd-titlecase")?.click() });
  commands.push({ name: "snake_case", icon: "square-code", action: () => document.getElementById("cmd-snakecase")?.click() });
  commands.push({ name: "Drop Cap", icon: "text-cursor", action: () => document.getElementById("cmd-dropcap")?.click() });
  commands.push({ name: "Theme Builder", icon: "palette", action: () => document.getElementById("btn-theme-builder")?.click() });
}

/* Init new features */
updateTodoAggregator();
markSaved();

/* ===== Phase 18: New Features ===== */

/* 1. Collapsible Sections */
let collapseEnabled = false;
const btnCollapse = document.getElementById("btn-collapse-sections");

function addCollapseToggles() {
  if (!collapseEnabled) return;
  editor.querySelectorAll("h1, h2, h3").forEach(h => {
    if (h.querySelector(".collapse-toggle")) return;
    const toggle = document.createElement("span");
    toggle.className = "collapse-toggle";
    toggle.textContent = "▾";
    toggle.style.cssText = "cursor:pointer; font-size:0.6em; margin-right:0.4em; opacity:0.4; display:inline-block; transition:transform 0.2s; user-select:none;";
    toggle.title = "Collapse section";
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      let sib = h.nextElementSibling;
      const toHide = [];
      while (sib && !/^H[123]$/.test(sib.tagName)) {
        toHide.push(sib);
        sib = sib.nextElementSibling;
      }
      const collapsed = h.dataset.collapsed === "true";
      h.dataset.collapsed = collapsed ? "false" : "true";
      toggle.textContent = collapsed ? "▾" : "▸";
      toggle.style.transform = collapsed ? "rotate(0deg)" : "rotate(-90deg)";
      toggle.title = collapsed ? "Collapse section" : "Expand section";
      toHide.forEach(el => el.style.display = collapsed ? "" : "none");
    });
    h.insertBefore(toggle, h.firstChild);
  });
}

if (btnCollapse) {
  btnCollapse.addEventListener("click", () => {
    collapseEnabled = !collapseEnabled;
    btnCollapse.style.color = collapseEnabled ? "var(--accent)" : "";
    if (collapseEnabled) {
      addCollapseToggles();
      setStatus("Collapsible headings ON");
    } else {
      editor.querySelectorAll(".collapse-toggle").forEach(t => t.remove());
      editor.querySelectorAll("[data-collapsed]").forEach(h => {
        let sib = h.nextElementSibling;
        while (sib && !/^H[123]$/.test(sib.tagName)) {
          sib.style.display = "";
          sib = sib.nextElementSibling;
        }
        delete h.dataset.collapsed;
      });
      setStatus("Collapsible headings OFF");
    }
  });
  editor.addEventListener("input", () => { if (collapseEnabled) addCollapseToggles(); });
}

/* 2. Document Map */
const btnDocMap = document.getElementById("btn-doc-map");
const docMapPanel = document.getElementById("doc-map-panel");
const docMapContent = document.getElementById("doc-map-content");

function updateDocMap() {
  if (!docMapPanel || docMapPanel.hidden) return;
  const headings = editor.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) {
    docMapContent.innerHTML = '<div style="font-size:0.65rem; opacity:0.3; text-align:center; padding:1rem 0;">No headings</div>';
    return;
  }
  docMapContent.innerHTML = Array.from(headings).map((h, i) => {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent.replace(/^[▾▸]\s*/, "").trim() || "(untitled)";
    const short = text.length > 30 ? text.slice(0, 30) + "…" : text;
    return `<div class="doc-map-item" data-map-index="${i}" style="padding:0.2rem 0.3rem; font-size:0.65rem; cursor:pointer; border-radius:3px; margin-left:${(level-1)*12}px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:background 0.15s;"
      onmouseover="this.style.background='rgba(167,139,250,0.15)'" onmouseout="this.style.background=''"
      onclick="document.querySelectorAll('h1,h2,h3')[${i}]?.scrollIntoView({behavior:'smooth',block:'center'});">${short}</div>`;
  }).join("");
}

if (btnDocMap) {
  btnDocMap.addEventListener("click", () => {
    docMapPanel.hidden = !docMapPanel.hidden;
    if (!docMapPanel.hidden) updateDocMap();
  });
}
document.getElementById("btn-close-doc-map")?.addEventListener("click", () => { if (docMapPanel) docMapPanel.hidden = true; });
editor.addEventListener("input", function __mapUpdate() { if (docMapPanel && !docMapPanel.hidden) updateDocMap(); });

/* 3. Writing Sprints */
const sprintModal = document.getElementById("sprint-modal");
const btnSprint = document.getElementById("btn-writing-sprint");
const btnCloseSprint = document.getElementById("btn-close-sprint");
const btnStartSprint = document.getElementById("btn-start-sprint");
const sprintTarget = document.getElementById("sprint-target");
const sprintTimer = document.getElementById("sprint-timer");
const sprintWords = document.getElementById("sprint-words");
const sprintBar = document.getElementById("sprint-bar");
const sprintProgress = document.getElementById("sprint-progress");

let sprintInterval = null;
let sprintRemaining = 0;
let sprintDuration = 25;
let sprintWordTarget = 500;
let sprintStartWords = 0;
let isSprintRunning = false;

if (btnSprint) btnSprint.addEventListener("click", () => sprintModal.hidden = false);
if (btnCloseSprint) btnCloseSprint.addEventListener("click", () => { if (isSprintRunning) { clearInterval(sprintInterval); sprintInterval = null; isSprintRunning = false; btnStartSprint.textContent = "Start Sprint"; if (sprintProgress) sprintProgress.hidden = true; } sprintModal.hidden = true; });

document.querySelectorAll(".sprint-duration").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sprint-duration").forEach(b => { b.style.background = ""; b.style.color = ""; b.style.borderColor = "var(--border)"; });
    sprintDuration = parseInt(btn.dataset.minutes);
    btn.style.background = "var(--accent)";
    btn.style.color = "#fff";
    btn.style.borderColor = "var(--accent)";
    updateSprintDisplay();
  });
});

function updateSprintDisplay() {
  const m = String(Math.floor(sprintRemaining / 60)).padStart(2, "0");
  const s = String(sprintRemaining % 60).padStart(2, "0");
  if (sprintTimer) sprintTimer.textContent = `${m}:${s}`;
  const current = getText().trim() ? getText().trim().split(/\s+/).length : 0;
  const delta = Math.max(0, current - sprintStartWords);
  if (sprintWords) sprintWords.textContent = `${delta} / ${sprintWordTarget}`;
  const pct = sprintWordTarget > 0 ? Math.min(100, (delta / sprintWordTarget) * 100) : 0;
  if (sprintBar) sprintBar.style.width = pct + "%";
  if (delta >= sprintWordTarget && isSprintRunning) {
    endSprint();
    if (typeof confetti === "function") confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    setStatus("🎉 Sprint target reached!");
  }
}

function endSprint() {
  clearInterval(sprintInterval);
  sprintInterval = null;
  isSprintRunning = false;
  btnStartSprint.textContent = "Start Sprint";
  if (sprintProgress) sprintProgress.hidden = true;
}

if (btnStartSprint) {
  btnStartSprint.addEventListener("click", () => {
    if (isSprintRunning) {
      endSprint();
      return;
    }
    sprintWordTarget = parseInt(sprintTarget.value) || 500;
    sprintRemaining = sprintDuration * 60;
    sprintStartWords = getText().trim() ? getText().trim().split(/\s+/).length : 0;
    isSprintRunning = true;
    if (sprintProgress) sprintProgress.hidden = false;
    btnStartSprint.textContent = "Stop Sprint";
    updateSprintDisplay();
    sprintInterval = setInterval(() => {
      sprintRemaining--;
      updateSprintDisplay();
      if (sprintRemaining <= 0) {
        endSprint();
        setStatus("⏰ Sprint time is up!");
        if (typeof confetti === "function") confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } });
      }
    }, 1000);
    editor.addEventListener("input", updateSprintDisplay);
    sprintModal.hidden = true;
    editor.focus();
  });
}

/* 4. Highlight All Occurrences */
let highlightOccEnabled = false;
const btnHighlightOcc = document.getElementById("btn-highlight-occ");

function clearOccurrenceHighlights() {
  editor.querySelectorAll(".occ-highlight").forEach(el => {
    const parent = el.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    }
  });
}

function highlightOccurrences(word) {
  clearOccurrenceHighlights();
  if (!word || !highlightOccEnabled) return;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const lowerWord = word.toLowerCase();
  nodes.forEach(node => {
    const text = node.textContent;
    let idx = text.toLowerCase().indexOf(lowerWord);
    if (idx === -1) return;
    const frag = document.createDocumentFragment();
    let last = 0;
    while (idx !== -1) {
      frag.appendChild(document.createTextNode(text.slice(last, idx)));
      const mark = document.createElement("mark");
      mark.className = "occ-highlight";
      mark.textContent = text.slice(idx, idx + word.length);
      frag.appendChild(mark);
      last = idx + word.length;
      idx = text.toLowerCase().indexOf(lowerWord, last);
    }
    frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });
}

if (btnHighlightOcc) {
  btnHighlightOcc.addEventListener("click", () => {
    highlightOccEnabled = !highlightOccEnabled;
    btnHighlightOcc.style.color = highlightOccEnabled ? "var(--accent)" : "";
    if (!highlightOccEnabled) clearOccurrenceHighlights();
    setStatus(highlightOccEnabled ? "Highlight occurrences ON — select a word" : "Highlight occurrences OFF");
  });
  editor.addEventListener("mouseup", () => {
    if (!highlightOccEnabled) return;
    const sel = window.getSelection().toString().trim();
    if (sel && !sel.includes(" ") && sel.length > 1) highlightOccurrences(sel);
    else clearOccurrenceHighlights();
  });
}

/* 5. Quick Color Presets */
const textColors = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db","#9b59b6","#e4e4e7","#95a5a6","#2c3e50","#000000","#ffffff","#ff6b6b","#ff9ff3"];
const hlColors = ["#ff6b6b","#ffa502","#ffd43b","#69db7c","#38d9a9","#74c0fc","#cc9eff","#fef08a","#ffcccc","#b3f0ff","#d5f5e3","#fadbd8","#d7bde2","#f9e79f"];

const btnQuickColors = document.getElementById("btn-quick-colors");
const quickColorsDropdown = document.getElementById("quick-colors-dropdown");
const quickTextColors = document.getElementById("quick-text-colors");
const quickHlColors = document.getElementById("quick-hl-colors");

function renderQuickColors() {
  if (!quickTextColors || !quickHlColors) return;
  quickTextColors.innerHTML = textColors.map(c =>
    `<div style="width:22px;height:22px;background:${c};border-radius:3px;cursor:pointer;border:1px solid ${c==='#ffffff'||c==='#fef08a'?'var(--border)':'transparent'};" onclick="applyQuickColor('${c}')" title="${c}"></div>`
  ).join("");
  quickHlColors.innerHTML = hlColors.map(c =>
    `<div style="width:22px;height:22px;background:${c};border-radius:3px;cursor:pointer;border:1px solid ${c==='#ffffff'?'var(--border)':'transparent'};" onclick="applyQuickHl('${c}')" title="${c}"></div>`
  ).join("");
}

window.applyQuickColor = function(color) {
  quickColorsDropdown.hidden = true;
  editor.focus();
  document.execCommand("foreColor", false, color);
};

window.applyQuickHl = function(color) {
  quickColorsDropdown.hidden = true;
  editor.focus();
  document.execCommand("hiliteColor", false, color);
};

if (btnQuickColors) {
  btnQuickColors.addEventListener("click", () => {
    quickColorsDropdown.hidden = !quickColorsDropdown.hidden;
    if (!quickColorsDropdown.hidden) renderQuickColors();
  });
}

document.addEventListener("mousedown", (e) => {
  if (quickColorsDropdown && !e.target.closest("#btn-quick-colors") && !quickColorsDropdown.contains(e.target))
    quickColorsDropdown.hidden = true;
});

/* 6. Regex Find & Replace */
const regexModal = document.getElementById("regex-modal");
const btnRegexOpen = document.getElementById("btn-regex-open");
const btnCloseRegex = document.getElementById("btn-close-regex");
const btnRegexFind = document.getElementById("btn-regex-find");
const btnRegexReplace = document.getElementById("btn-regex-replace");
const regexPattern = document.getElementById("regex-pattern");
const regexReplace = document.getElementById("regex-replace");
const regexCount = document.getElementById("regex-count");
const regexFlagG = document.getElementById("regex-flag-g");
const regexFlagI = document.getElementById("regex-flag-i");
const regexFlagM = document.getElementById("regex-flag-m");

if (btnRegexOpen) btnRegexOpen.addEventListener("click", () => regexModal.hidden = false);
if (btnCloseRegex) btnCloseRegex.addEventListener("click", () => regexModal.hidden = true);

if (btnRegexFind) btnRegexFind.addEventListener("click", () => {
  const pat = regexPattern.value;
  if (!pat) return;
  const flags = (regexFlagG.checked ? "g" : "") + (regexFlagI.checked ? "i" : "") + (regexFlagM.checked ? "m" : "");
  try {
    const re = new RegExp(pat, flags);
    const text = editor.textContent || "";
    const matches = text.match(re);
    const count = matches ? matches.length : 0;
    regexCount.textContent = `Found ${count} match${count !== 1 ? "es" : ""}.`;
    if (count > 0) {
      editor.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (re.test(node.textContent)) {
          range.selectNodeContents(node);
          sel.removeAllRanges();
          sel.addRange(range);
          break;
        }
      }
    }
  } catch (e) {
    regexCount.textContent = "Invalid regex: " + e.message;
  }
});

if (btnRegexReplace) btnRegexReplace.addEventListener("click", () => {
  const pat = regexPattern.value;
  const repl = regexReplace.value;
  if (!pat) return;
  const flags = (regexFlagG.checked ? "g" : "") + (regexFlagI.checked ? "i" : "") + (regexFlagM.checked ? "m" : "");
  try {
    const re = new RegExp(pat, flags);
    editor.focus();
    const oldContent = editor.innerHTML;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let total = 0;
    textNodes.forEach(node => {
      const orig = node.textContent;
      const replaced = orig.replace(re, repl);
      if (replaced !== orig) {
        total += (orig.match(re) || []).length;
        node.textContent = replaced;
      }
    });
    regexCount.textContent = `Replaced ${total} occurrence${total !== 1 ? "s" : ""}.`;
  } catch (e) {
    regexCount.textContent = "Invalid regex: " + e.message;
  }
});

/* 7. Word Frequency Analyzer */
const wordFreqPanel = document.getElementById("word-freq-panel");
const btnWordFreq = document.getElementById("btn-word-freq");
const btnCloseWordFreq = document.getElementById("btn-close-wordfreq");
const btnAnalyzeWF = document.getElementById("btn-analyze-wf");
const wfMinWords = document.getElementById("wf-min-words");
const wfResults = document.getElementById("wf-results");

if (btnWordFreq) btnWordFreq.addEventListener("click", () => {
  wordFreqPanel.hidden = !wordFreqPanel.hidden;
  if (!wordFreqPanel.hidden) btnAnalyzeWF.click();
});
if (btnCloseWordFreq) btnCloseWordFreq.addEventListener("click", () => wordFreqPanel.hidden = true);

if (btnAnalyzeWF) btnAnalyzeWF.addEventListener("click", () => {
  const text = getText();
  if (!text.trim()) { wfResults.textContent = "No text to analyze."; return; }
  const minLen = parseInt(wfMinWords.value) || 3;
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq = {};
  words.forEach(w => { if (w.length >= minLen) freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (sorted.length === 0) { wfResults.textContent = "No words matching minimum length."; return; }
  const maxFreq = sorted[0][1];
  wfResults.innerHTML = sorted.map(([word, count], i) => {
    const bar = Math.round((count / maxFreq) * 200);
    const pct = ((count / words.length) * 100).toFixed(1);
    return `<div style="display:flex; align-items:center; gap:0.5rem; padding:0.1rem 0;">
      <span style="width:30px; text-align:right; font-size:0.7rem; opacity:0.6;">${i + 1}</span>
      <span style="width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${word}</span>
      <span style="font-size:0.65rem; opacity:0.5; width:40px;">${count}</span>
      <div style="height:10px; background:var(--accent); border-radius:4px; width:${bar}px; opacity:0.6;"></div>
      <span style="font-size:0.6rem; opacity:0.3;">${pct}%</span>
    </div>`;
  }).join("");
});

/* 8. Focus Blocks (Deep Work Timer) */
const focusModal = document.getElementById("focus-blocks-modal");
const btnFocusBlocks = document.getElementById("btn-focus-blocks");
const btnCloseFocus = document.getElementById("btn-close-focusblocks");
const btnStartFocus = document.getElementById("btn-start-focus-block");
const fbTimer = document.getElementById("fb-timer");
const fbBar = document.getElementById("fb-bar");
const fbProgress = document.getElementById("focus-blocks-progress");
const fbStatus = document.getElementById("fb-status");

let focusInterval = null;
let focusRemaining = 0;
let focusDuration = 25;
let isFocusRunning = false;

if (btnFocusBlocks) btnFocusBlocks.addEventListener("click", () => focusModal.hidden = false);
if (btnCloseFocus) btnCloseFocus.addEventListener("click", () => {
  if (isFocusRunning) {
    clearInterval(focusInterval);
    focusInterval = null;
    isFocusRunning = false;
    btnStartFocus.textContent = "Start Focus Block";
    fbProgress.hidden = true;
    document.getElementById("btn-focus-mode")?.click();
  }
  focusModal.hidden = true;
});

document.querySelectorAll(".focus-duration").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".focus-duration").forEach(b => { b.style.background = ""; b.style.color = ""; b.style.borderColor = "var(--border)"; });
    focusDuration = parseInt(btn.dataset.minutes);
    btn.style.background = "var(--accent)";
    btn.style.color = "#fff";
    btn.style.borderColor = "var(--accent)";
    if (!isFocusRunning && fbTimer) {
      const m = String(focusDuration).padStart(2, "0");
      fbTimer.textContent = `${m}:00`;
    }
  });
});

if (btnStartFocus) btnStartFocus.addEventListener("click", () => {
  if (isFocusRunning) {
    clearInterval(focusInterval);
    focusInterval = null;
    isFocusRunning = false;
    btnStartFocus.textContent = "Start Focus Block";
    fbProgress.hidden = true;
    document.getElementById("btn-focus-mode")?.click();
    setStatus("Focus block ended.");
    return;
  }
  focusRemaining = focusDuration * 60;
  isFocusRunning = true;
  fbProgress.hidden = false;
  btnStartFocus.textContent = "Stop Focus Block";
  if (!document.querySelector(".focus-mode")) document.getElementById("btn-focus-mode")?.click();
  if (fbStatus) fbStatus.textContent = "Focus mode active — stay focused!";
  setStatus("Focus block started — " + focusDuration + " min deep work.");
  const updateFB = () => {
    const m = String(Math.floor(focusRemaining / 60)).padStart(2, "0");
    const s = String(focusRemaining % 60).padStart(2, "0");
    if (fbTimer) fbTimer.textContent = `${m}:${s}`;
    const pct = (focusRemaining / (focusDuration * 60)) * 100;
    if (fbBar) fbBar.style.width = pct + "%";
    if (focusRemaining <= 0) {
      clearInterval(focusInterval);
      focusInterval = null;
      isFocusRunning = false;
      btnStartFocus.textContent = "Start Focus Block";
      fbProgress.hidden = true;
      document.getElementById("btn-focus-mode")?.click();
      if (typeof confetti === "function") confetti({ particleCount: 120, spread: 140, origin: { y: 0.5 } });
      setStatus("Focus block complete! Great job.");
    }
    focusRemaining--;
  };
  updateFB();
  focusInterval = setInterval(updateFB, 1000);
  focusModal.hidden = true;
  editor.focus();
});

/* 9. Auto Alt Text on Image Insert */
(function patchImageInsert() {
  const origCmd = document.getElementById("cmd-insertImage");
  if (!origCmd) return;
  const origHandler = origCmd._listeners ? origCmd._listeners.click : null;
  const newHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const altText = prompt("Image alt text (for accessibility):", file.name.replace(/\.[^.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (ev) => {
        exec("insertImage", ev.target.result);
        setTimeout(() => {
          const img = editor.querySelector("img:last-of-type");
          if (img && altText !== null) img.alt = altText;
        }, 50);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  origCmd.removeEventListener("click", origHandler);
  origCmd.addEventListener("click", newHandler);
})();

/* 10. Selection Word Count */
const selWordCount = document.getElementById("sel-word-count");
editor.addEventListener("mouseup", () => {
  const sel = window.getSelection().toString().trim();
  if (sel && selWordCount) {
    const words = sel.split(/\s+/).filter(Boolean).length;
    const chars = sel.length;
    selWordCount.hidden = false;
    selWordCount.textContent = `Sel: ${words} w, ${chars} c`;
    selWordCount.title = `${words} words, ${chars} characters selected`;
  } else if (selWordCount) {
    selWordCount.hidden = true;
  }
});
editor.addEventListener("keyup", () => {
  const sel = window.getSelection().toString().trim();
  if (!sel && selWordCount) selWordCount.hidden = true;
});

/* Add to Command Palette */
if (typeof commands !== "undefined") {
  commands.push({ name: "Writing Sprint", icon: "stopwatch", action: () => document.getElementById("btn-writing-sprint")?.click() });
  commands.push({ name: "Toggle Highlight Occurrences", icon: "search-code", action: () => document.getElementById("btn-highlight-occ")?.click() });
  commands.push({ name: "Toggle Collapsible Sections", icon: "fold-vertical", action: () => document.getElementById("btn-collapse-sections")?.click() });
  commands.push({ name: "Toggle Document Map", icon: "map", action: () => document.getElementById("btn-doc-map")?.click() });
  commands.push({ name: "Regex Find & Replace", icon: "regex", action: () => document.getElementById("btn-regex-open")?.click() });
  commands.push({ name: "Word Frequency Analyzer", icon: "bar-chart-3", action: () => document.getElementById("btn-word-freq")?.click() });
  commands.push({ name: "Focus Blocks (Deep Work Timer)", icon: "brain", action: () => document.getElementById("btn-focus-blocks")?.click() });
}

/* Initialize Icons again */
lucide.createIcons();
