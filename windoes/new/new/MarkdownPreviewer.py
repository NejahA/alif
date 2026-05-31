import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext, font
import re
from datetime import datetime

class MarkdownPreviewer:
    def __init__(self, root):
        self.root = root
        self.root.title("Markdown Previewer")
        self.root.geometry("1200x700")
        
        self.current_file = None
        self.is_modified = False
        
        self.setup_ui()
        self.insert_sample_markdown()
        self.update_preview()
    
    def setup_ui(self):
        # Menu bar
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New", command=self.new_file, accelerator="Ctrl+N")
        file_menu.add_command(label="Open", command=self.open_file, accelerator="Ctrl+O")
        file_menu.add_command(label="Save", command=self.save_file, accelerator="Ctrl+S")
        file_menu.add_command(label="Save As", command=self.save_as_file)
        file_menu.add_separator()
        file_menu.add_command(label="Export HTML", command=self.export_html)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
        # Edit menu
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Edit", menu=edit_menu)
        edit_menu.add_command(label="Undo", command=self.undo, accelerator="Ctrl+Z")
        edit_menu.add_command(label="Redo", command=self.redo, accelerator="Ctrl+Y")
        edit_menu.add_separator()
        edit_menu.add_command(label="Cut", command=self.cut, accelerator="Ctrl+X")
        edit_menu.add_command(label="Copy", command=self.copy, accelerator="Ctrl+C")
        edit_menu.add_command(label="Paste", command=self.paste, accelerator="Ctrl+V")
        
        # Insert menu
        insert_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Insert", menu=insert_menu)
        insert_menu.add_command(label="Bold", command=lambda: self.insert_markdown("**", "**"))
        insert_menu.add_command(label="Italic", command=lambda: self.insert_markdown("*", "*"))
        insert_menu.add_command(label="Code", command=lambda: self.insert_markdown("`", "`"))
        insert_menu.add_command(label="Link", command=self.insert_link)
        insert_menu.add_command(label="Image", command=self.insert_image)
        insert_menu.add_separator()
        insert_menu.add_command(label="Heading 1", command=lambda: self.insert_heading(1))
        insert_menu.add_command(label="Heading 2", command=lambda: self.insert_heading(2))
        insert_menu.add_command(label="Heading 3", command=lambda: self.insert_heading(3))
        insert_menu.add_separator()
        insert_menu.add_command(label="Bullet List", command=lambda: self.insert_list("-"))
        insert_menu.add_command(label="Numbered List", command=lambda: self.insert_list("1."))
        insert_menu.add_command(label="Code Block", command=self.insert_code_block)
        insert_menu.add_command(label="Horizontal Rule", command=lambda: self.insert_text("\n---\n"))
        
        # Toolbar
        toolbar = tk.Frame(self.root, bg="#34495e", height=50)
        toolbar.pack(fill=tk.X)
        toolbar.pack_propagate(False)
        
        # Toolbar buttons
        buttons = [
            ("📄", self.new_file, "New"),
            ("📁", self.open_file, "Open"),
            ("💾", self.save_file, "Save"),
            ("|", None, None),
            ("B", lambda: self.insert_markdown("**", "**"), "Bold"),
            ("I", lambda: self.insert_markdown("*", "*"), "Italic"),
            ("C", lambda: self.insert_markdown("`", "`"), "Code"),
            ("|", None, None),
            ("H1", lambda: self.insert_heading(1), "Heading 1"),
            ("H2", lambda: self.insert_heading(2), "Heading 2"),
            ("H3", lambda: self.insert_heading(3), "Heading 3"),
            ("|", None, None),
            ("🔗", self.insert_link, "Link"),
            ("🖼️", self.insert_image, "Image"),
            ("•", lambda: self.insert_list("-"), "Bullet List"),
            ("1.", lambda: self.insert_list("1."), "Numbered List"),
        ]
        
        for text, command, tooltip in buttons:
            if text == "|":
                tk.Frame(toolbar, width=2, bg="#7f8c8d").pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
            else:
                btn = tk.Button(toolbar, text=text, command=command,
                              bg="#2c3e50", fg="white", font=("Arial", 10, "bold"),
                              relief=tk.FLAT, padx=10, pady=5)
                btn.pack(side=tk.LEFT, padx=2, pady=5)
        
        # Main container
        main_frame = tk.PanedWindow(self.root, orient=tk.HORIZONTAL, sashwidth=5)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Left side - Editor
        editor_frame = tk.Frame(main_frame)
        main_frame.add(editor_frame, width=600)
        
        tk.Label(editor_frame, text="📝 Markdown Editor", 
                font=("Arial", 12, "bold"), bg="#ecf0f1").pack(fill=tk.X, pady=5)
        
        # Editor with line numbers
        editor_container = tk.Frame(editor_frame)
        editor_container.pack(fill=tk.BOTH, expand=True)
        
        # Line numbers
        self.line_numbers = tk.Text(editor_container, width=4, padx=5, takefocus=0,
                                    border=0, background='#f0f0f0', state='disabled',
                                    font=("Courier", 10))
        self.line_numbers.pack(side=tk.LEFT, fill=tk.Y)
        
        # Editor
        editor_scroll = tk.Scrollbar(editor_container)
        editor_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.editor = tk.Text(editor_container, wrap=tk.WORD, 
                             yscrollcommand=editor_scroll.set,
                             font=("Courier", 11), undo=True, maxundo=-1)
        self.editor.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        editor_scroll.config(command=self.editor.yview)
        
        # Bind events
        self.editor.bind('<KeyRelease>', self.on_text_change)
        self.editor.bind('<Button-1>', self.on_text_change)
        self.editor.bind('<<Modified>>', self.on_modified)
        
        # Editor stats
        self.editor_stats = tk.Label(editor_frame, text="Lines: 0 | Words: 0 | Chars: 0",
                                     font=("Arial", 9), bg="#ecf0f1", anchor=tk.W)
        self.editor_stats.pack(fill=tk.X, padx=5, pady=2)
        
        # Right side - Preview
        preview_frame = tk.Frame(main_frame)
        main_frame.add(preview_frame, width=600)
        
        tk.Label(preview_frame, text="👁️ Preview", 
                font=("Arial", 12, "bold"), bg="#ecf0f1").pack(fill=tk.X, pady=5)
        
        # Preview area
        preview_scroll = tk.Scrollbar(preview_frame)
        preview_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.preview = tk.Text(preview_frame, wrap=tk.WORD,
                              yscrollcommand=preview_scroll.set,
                              font=("Arial", 11), state='disabled',
                              bg="white", padx=20, pady=20)
        self.preview.pack(fill=tk.BOTH, expand=True)
        preview_scroll.config(command=self.preview.yview)
        
        # Configure preview tags
        self.setup_preview_tags()
        
        # Status bar
        self.status_bar = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN,
                                   anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Keyboard shortcuts
        self.root.bind('<Control-n>', lambda e: self.new_file())
        self.root.bind('<Control-o>', lambda e: self.open_file())
        self.root.bind('<Control-s>', lambda e: self.save_file())
        self.root.bind('<Control-b>', lambda e: self.insert_markdown("**", "**"))
        self.root.bind('<Control-i>', lambda e: self.insert_markdown("*", "*"))
    
    def setup_preview_tags(self):
        """Configure text tags for preview formatting"""
        # Headings
        h1_font = font.Font(family="Arial", size=24, weight="bold")
        h2_font = font.Font(family="Arial", size=20, weight="bold")
        h3_font = font.Font(family="Arial", size=16, weight="bold")
        h4_font = font.Font(family="Arial", size=14, weight="bold")
        
        self.preview.tag_config("h1", font=h1_font, spacing3=10)
        self.preview.tag_config("h2", font=h2_font, spacing3=8)
        self.preview.tag_config("h3", font=h3_font, spacing3=6)
        self.preview.tag_config("h4", font=h4_font, spacing3=4)
        
        # Text styles
        bold_font = font.Font(family="Arial", size=11, weight="bold")
        italic_font = font.Font(family="Arial", size=11, slant="italic")
        code_font = font.Font(family="Courier", size=10)
        
        self.preview.tag_config("bold", font=bold_font)
        self.preview.tag_config("italic", font=italic_font)
        self.preview.tag_config("code", font=code_font, background="#f0f0f0", foreground="#c7254e")
        self.preview.tag_config("code_block", font=code_font, background="#f5f5f5", 
                               lmargin1=20, lmargin2=20, spacing1=5, spacing3=5)
        
        # Links
        self.preview.tag_config("link", foreground="#3498db", underline=True)
        
        # Lists
        self.preview.tag_config("list", lmargin1=30, lmargin2=30)
        
        # Blockquote
        self.preview.tag_config("blockquote", lmargin1=20, lmargin2=20, 
                               background="#f9f9f9", foreground="#666")
        
        # HR
        self.preview.tag_config("hr", foreground="#ccc")
    
    def on_text_change(self, event=None):
        self.update_line_numbers()
        self.update_stats()
        self.update_preview()
    
    def on_modified(self, event=None):
        if self.editor.edit_modified():
            self.is_modified = True
            self.update_title()
            self.editor.edit_modified(False)
    
    def update_line_numbers(self):
        self.line_numbers.config(state='normal')
        self.line_numbers.delete(1.0, tk.END)
        
        line_count = int(self.editor.index('end-1c').split('.')[0])
        line_numbers_string = "\n".join(str(i) for i in range(1, line_count + 1))
        self.line_numbers.insert(1.0, line_numbers_string)
        
        self.line_numbers.config(state='disabled')
    
    def update_stats(self):
        content = self.editor.get(1.0, tk.END)
        lines = content.count('\n')
        words = len(content.split())
        chars = len(content) - 1  # Exclude final newline
        
        self.editor_stats.config(text=f"Lines: {lines} | Words: {words} | Chars: {chars}")
    
    def update_preview(self):
        content = self.editor.get(1.0, tk.END)
        
        self.preview.config(state='normal')
        self.preview.delete(1.0, tk.END)
        
        self.render_markdown(content)
        
        self.preview.config(state='disabled')
    
    def render_markdown(self, text):
        """Simple markdown renderer"""
        lines = text.split('\n')
        in_code_block = False
        code_block_content = []
        
        for line in lines:
            # Code blocks
            if line.strip().startswith('```'):
                if in_code_block:
                    # End code block
                    self.preview.insert(tk.END, '\n'.join(code_block_content) + '\n', 'code_block')
                    code_block_content = []
                    in_code_block = False
                else:
                    # Start code block
                    in_code_block = True
                continue
            
            if in_code_block:
                code_block_content.append(line)
                continue
            
            # Headings
            if line.startswith('# '):
                self.preview.insert(tk.END, line[2:] + '\n', 'h1')
            elif line.startswith('## '):
                self.preview.insert(tk.END, line[3:] + '\n', 'h2')
            elif line.startswith('### '):
                self.preview.insert(tk.END, line[4:] + '\n', 'h3')
            elif line.startswith('#### '):
                self.preview.insert(tk.END, line[5:] + '\n', 'h4')
            
            # Horizontal rule
            elif line.strip() in ['---', '***', '___']:
                self.preview.insert(tk.END, '─' * 80 + '\n', 'hr')
            
            # Lists
            elif line.strip().startswith(('- ', '* ', '+ ')) or re.match(r'^\d+\.\s', line.strip()):
                self.preview.insert(tk.END, line + '\n', 'list')
            
            # Blockquote
            elif line.strip().startswith('>'):
                self.preview.insert(tk.END, line[1:].strip() + '\n', 'blockquote')
            
            # Regular text with inline formatting
            else:
                self.render_inline(line + '\n')
    
    def render_inline(self, text):
        """Render inline markdown (bold, italic, code, links)"""
        pos = 0
        
        # Patterns
        patterns = [
            (r'\*\*(.+?)\*\*', 'bold'),  # Bold
            (r'\*(.+?)\*', 'italic'),     # Italic
            (r'`(.+?)`', 'code'),         # Inline code
            (r'\[(.+?)\]\((.+?)\)', 'link'),  # Links
        ]
        
        while pos < len(text):
            found = False
            
            for pattern, tag in patterns:
                match = re.match(pattern, text[pos:])
                if match:
                    if tag == 'link':
                        link_text = match.group(1)
                        self.preview.insert(tk.END, link_text, tag)
                    else:
                        self.preview.insert(tk.END, match.group(1), tag)
                    pos += match.end()
                    found = True
                    break
            
            if not found:
                self.preview.insert(tk.END, text[pos])
                pos += 1
    
    def insert_markdown(self, before, after):
        try:
            selected = self.editor.get(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.delete(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.insert(tk.INSERT, before + selected + after)
        except:
            self.editor.insert(tk.INSERT, before + after)
            # Move cursor between markers
            pos = self.editor.index(tk.INSERT)
            line, col = map(int, pos.split('.'))
            self.editor.mark_set(tk.INSERT, f"{line}.{col - len(after)}")
    
    def insert_heading(self, level):
        prefix = '#' * level + ' '
        self.editor.insert(tk.INSERT, prefix)
    
    def insert_list(self, marker):
        self.editor.insert(tk.INSERT, f"{marker} ")
    
    def insert_code_block(self):
        self.editor.insert(tk.INSERT, "```\n\n```")
        pos = self.editor.index(tk.INSERT)
        line, col = map(int, pos.split('.'))
        self.editor.mark_set(tk.INSERT, f"{line - 1}.0")
    
    def insert_link(self):
        self.editor.insert(tk.INSERT, "[Link Text](https://example.com)")
    
    def insert_image(self):
        self.editor.insert(tk.INSERT, "![Alt Text](image.jpg)")
    
    def insert_text(self, text):
        self.editor.insert(tk.INSERT, text)
    
    def new_file(self):
        if self.is_modified:
            response = messagebox.askyesnocancel("Save?", "Save current file?")
            if response is None:
                return
            elif response:
                self.save_file()
        
        self.editor.delete(1.0, tk.END)
        self.current_file = None
        self.is_modified = False
        self.update_title()
        self.status_bar.config(text="New file created")
    
    def open_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Markdown files", "*.md"), ("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self.editor.delete(1.0, tk.END)
                self.editor.insert(1.0, content)
                self.current_file = file_path
                self.is_modified = False
                self.update_title()
                self.status_bar.config(text=f"Opened: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file: {str(e)}")
    
    def save_file(self):
        if self.current_file:
            self.save_to_file(self.current_file)
        else:
            self.save_as_file()
    
    def save_as_file(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".md",
            filetypes=[("Markdown files", "*.md"), ("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            self.save_to_file(file_path)
            self.current_file = file_path
    
    def save_to_file(self, file_path):
        try:
            content = self.editor.get(1.0, tk.END)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.is_modified = False
            self.update_title()
            self.status_bar.config(text=f"Saved: {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file: {str(e)}")
    
    def export_html(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".html",
            filetypes=[("HTML files", "*.html"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                content = self.editor.get(1.0, tk.END)
                html = self.markdown_to_html(content)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                
                messagebox.showinfo("Success", f"Exported to:\n{file_path}")
                self.status_bar.config(text=f"Exported HTML: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export: {str(e)}")
    
    def markdown_to_html(self, text):
        """Convert markdown to basic HTML"""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Export</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }}
        h1 {{ border-bottom: 2px solid #333; }}
        code {{ background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }}
        pre {{ background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        blockquote {{ border-left: 4px solid #ccc; margin-left: 0; padding-left: 20px; color: #666; }}
    </style>
</head>
<body>
"""
        
        lines = text.split('\n')
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith('```'):
                if in_code_block:
                    html += '</pre>\n'
                    in_code_block = False
                else:
                    html += '<pre><code>'
                    in_code_block = True
                continue
            
            if in_code_block:
                html += line + '\n'
                continue
            
            # Headings
            if line.startswith('# '):
                html += f'<h1>{line[2:]}</h1>\n'
            elif line.startswith('## '):
                html += f'<h2>{line[3:]}</h2>\n'
            elif line.startswith('### '):
                html += f'<h3>{line[4:]}</h3>\n'
            elif line.strip() in ['---', '***']:
                html += '<hr>\n'
            elif line.strip().startswith('>'):
                html += f'<blockquote>{line[1:].strip()}</blockquote>\n'
            else:
                # Inline formatting
                line = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
                line = re.sub(r'\*(.+?)\*', r'<em>\1</em>', line)
                line = re.sub(r'`(.+?)`', r'<code>\1</code>', line)
                line = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', line)
                
                if line.strip():
                    html += f'<p>{line}</p>\n'
        
        html += '</body>\n</html>'
        return html
    
    def update_title(self):
        title = "Markdown Previewer"
        if self.current_file:
            title += f" - {self.current_file}"
        if self.is_modified:
            title += " *"
        self.root.title(title)
    
    def undo(self):
        try:
            self.editor.edit_undo()
        except:
            pass
    
    def redo(self):
        try:
            self.editor.edit_redo()
        except:
            pass
    
    def cut(self):
        try:
            self.editor.event_generate("<<Cut>>")
        except:
            pass
    
    def copy(self):
        try:
            self.editor.event_generate("<<Copy>>")
        except:
            pass
    
    def paste(self):
        try:
            self.editor.event_generate("<<Paste>>")
        except:
            pass
    
    def insert_sample_markdown(self):
        sample = """# Welcome to Markdown Previewer

## Features

This is a **real-time** markdown editor with *live preview*.

### What you can do:

- Write markdown on the left
- See preview on the right
- Use toolbar buttons for quick formatting
- Export to HTML

### Code Example

Inline code: `print("Hello World")`

Code block:
```
def hello():
    print("Hello, Markdown!")
```

### Links and More

Check out [Markdown Guide](https://www.markdownguide.org)

> This is a blockquote
> It can span multiple lines

---

**Try editing this text to see the preview update!**
"""
        self.editor.insert(1.0, sample)

if __name__ == "__main__":
    root = tk.Tk()
    app = MarkdownPreviewer(root)
    root.mainloop()
