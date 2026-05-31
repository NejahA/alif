import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
import re

class DataFormatter:
    def __init__(self, root):
        self.root = root
        self.root.title("JSON/XML Formatter & Validator")
        self.root.geometry("1000x700")
        
        self.current_file = None
        self.current_format = "json"
        
        self.setup_ui()
    
    def setup_ui(self):
        # Menu bar
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Open", command=self.open_file, accelerator="Ctrl+O")
        file_menu.add_command(label="Save", command=self.save_file, accelerator="Ctrl+S")
        file_menu.add_command(label="Save As", command=self.save_as_file)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
        # Format menu
        format_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Format", menu=format_menu)
        format_menu.add_command(label="Format JSON", command=lambda: self.format_data("json"))
        format_menu.add_command(label="Format XML", command=lambda: self.format_data("xml"))
        format_menu.add_command(label="Minify", command=self.minify_data)
        format_menu.add_separator()
        format_menu.add_command(label="Validate", command=self.validate_data)
        
        # Convert menu
        convert_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Convert", menu=convert_menu)
        convert_menu.add_command(label="JSON to XML", command=lambda: self.convert_format("json_to_xml"))
        convert_menu.add_command(label="XML to JSON", command=lambda: self.convert_format("xml_to_json"))
        
        # Title
        title_frame = tk.Frame(self.root, bg="#673ab7", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="📋 JSON/XML Formatter & Validator", 
                font=("Arial", 20, "bold"),
                bg="#673ab7", fg="white").pack(pady=20)
        
        # Toolbar
        toolbar = tk.Frame(self.root, bg="#f5f5f5")
        toolbar.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(toolbar, text="📁 Open", command=self.open_file,
                 bg="#2196F3", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="💾 Save", command=self.save_file,
                 bg="#4CAF50", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        
        tk.Frame(toolbar, width=2, bg="#ccc").pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        tk.Button(toolbar, text="✨ Format JSON", command=lambda: self.format_data("json"),
                 bg="#9C27B0", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="✨ Format XML", command=lambda: self.format_data("xml"),
                 bg="#9C27B0", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="📦 Minify", command=self.minify_data,
                 bg="#FF9800", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        
        tk.Frame(toolbar, width=2, bg="#ccc").pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        tk.Button(toolbar, text="✓ Validate", command=self.validate_data,
                 bg="#4CAF50", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        
        tk.Frame(toolbar, width=2, bg="#ccc").pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        tk.Button(toolbar, text="JSON→XML", command=lambda: self.convert_format("json_to_xml"),
                 bg="#00BCD4", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="XML→JSON", command=lambda: self.convert_format("xml_to_json"),
                 bg="#00BCD4", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        
        tk.Frame(toolbar, width=2, bg="#ccc").pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        tk.Button(toolbar, text="🗑️ Clear", command=self.clear_text,
                 bg="#f44336", fg="white", font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=2)
        
        # Main content
        content_frame = tk.PanedWindow(self.root, orient=tk.HORIZONTAL, sashwidth=5)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Left side - Input
        left_frame = tk.Frame(content_frame)
        content_frame.add(left_frame, width=500)
        
        tk.Label(left_frame, text="📝 Input", font=("Arial", 11, "bold"),
                bg="#f5f5f5").pack(fill=tk.X, pady=5)
        
        # Input text area
        input_frame = tk.Frame(left_frame)
        input_frame.pack(fill=tk.BOTH, expand=True)
        
        input_scroll_y = tk.Scrollbar(input_frame)
        input_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        
        input_scroll_x = tk.Scrollbar(input_frame, orient=tk.HORIZONTAL)
        input_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.input_text = tk.Text(input_frame, wrap=tk.NONE,
                                  yscrollcommand=input_scroll_y.set,
                                  xscrollcommand=input_scroll_x.set,
                                  font=("Courier", 10))
        self.input_text.pack(fill=tk.BOTH, expand=True)
        
        input_scroll_y.config(command=self.input_text.yview)
        input_scroll_x.config(command=self.input_text.xview)
        
        # Input stats
        self.input_stats = tk.Label(left_frame, text="Lines: 0 | Chars: 0",
                                    font=("Arial", 9), bg="#f5f5f5", anchor=tk.W)
        self.input_stats.pack(fill=tk.X, pady=2)
        
        self.input_text.bind('<KeyRelease>', self.update_input_stats)
        
        # Right side - Output
        right_frame = tk.Frame(content_frame)
        content_frame.add(right_frame, width=500)
        
        tk.Label(right_frame, text="✨ Output", font=("Arial", 11, "bold"),
                bg="#f5f5f5").pack(fill=tk.X, pady=5)
        
        # Output text area
        output_frame = tk.Frame(right_frame)
        output_frame.pack(fill=tk.BOTH, expand=True)
        
        output_scroll_y = tk.Scrollbar(output_frame)
        output_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        
        output_scroll_x = tk.Scrollbar(output_frame, orient=tk.HORIZONTAL)
        output_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.output_text = tk.Text(output_frame, wrap=tk.NONE,
                                   yscrollcommand=output_scroll_y.set,
                                   xscrollcommand=output_scroll_x.set,
                                   font=("Courier", 10),
                                   bg="#f9f9f9")
        self.output_text.pack(fill=tk.BOTH, expand=True)
        
        output_scroll_y.config(command=self.output_text.yview)
        output_scroll_x.config(command=self.output_text.xview)
        
        # Output actions
        output_actions = tk.Frame(right_frame)
        output_actions.pack(fill=tk.X, pady=2)
        
        tk.Button(output_actions, text="📋 Copy Output", command=self.copy_output,
                 bg="#4CAF50", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=2)
        tk.Button(output_actions, text="⬅️ Copy to Input", command=self.copy_to_input,
                 bg="#2196F3", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=2)
        
        self.output_stats = tk.Label(output_actions, text="Lines: 0 | Chars: 0",
                                     font=("Arial", 9), anchor=tk.E)
        self.output_stats.pack(side=tk.RIGHT, padx=5)
        
        # Validation panel
        validation_frame = tk.LabelFrame(self.root, text="Validation Results",
                                        font=("Arial", 10, "bold"))
        validation_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.validation_label = tk.Label(validation_frame, text="No validation performed yet",
                                         font=("Arial", 10), fg="#666", anchor=tk.W)
        self.validation_label.pack(fill=tk.X, padx=10, pady=10)
        
        # Status bar
        self.status_bar = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN,
                                   anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Keyboard shortcuts
        self.root.bind('<Control-o>', lambda e: self.open_file())
        self.root.bind('<Control-s>', lambda e: self.save_file())
        
        # Sample data
        self.insert_sample_json()
    
    def update_input_stats(self, event=None):
        content = self.input_text.get(1.0, tk.END)
        lines = content.count('\n')
        chars = len(content) - 1
        self.input_stats.config(text=f"Lines: {lines} | Chars: {chars}")
    
    def update_output_stats(self):
        content = self.output_text.get(1.0, tk.END)
        lines = content.count('\n')
        chars = len(content) - 1
        self.output_stats.config(text=f"Lines: {lines} | Chars: {chars}")
    
    def format_data(self, format_type):
        input_data = self.input_text.get(1.0, tk.END).strip()
        
        if not input_data:
            messagebox.showwarning("Warning", "Please enter some data to format")
            return
        
        try:
            if format_type == "json":
                # Parse and format JSON
                data = json.loads(input_data)
                formatted = json.dumps(data, indent=2, ensure_ascii=False)
                
                self.output_text.delete(1.0, tk.END)
                self.output_text.insert(1.0, formatted)
                
                self.validation_label.config(text="✓ Valid JSON - Formatted successfully",
                                            fg="#4CAF50")
                self.status_bar.config(text="JSON formatted successfully")
                
            elif format_type == "xml":
                # Parse and format XML
                root = ET.fromstring(input_data)
                rough_string = ET.tostring(root, encoding='unicode')
                reparsed = minidom.parseString(rough_string)
                formatted = reparsed.toprettyxml(indent="  ")
                
                # Remove extra blank lines
                formatted = '\n'.join([line for line in formatted.split('\n') if line.strip()])
                
                self.output_text.delete(1.0, tk.END)
                self.output_text.insert(1.0, formatted)
                
                self.validation_label.config(text="✓ Valid XML - Formatted successfully",
                                            fg="#4CAF50")
                self.status_bar.config(text="XML formatted successfully")
            
            self.update_output_stats()
            
        except json.JSONDecodeError as e:
            self.validation_label.config(text=f"✗ JSON Error: {str(e)}", fg="#f44336")
            messagebox.showerror("JSON Error", f"Invalid JSON:\n{str(e)}")
        
        except ET.ParseError as e:
            self.validation_label.config(text=f"✗ XML Error: {str(e)}", fg="#f44336")
            messagebox.showerror("XML Error", f"Invalid XML:\n{str(e)}")
        
        except Exception as e:
            self.validation_label.config(text=f"✗ Error: {str(e)}", fg="#f44336")
            messagebox.showerror("Error", f"Failed to format:\n{str(e)}")
    
    def minify_data(self):
        input_data = self.input_text.get(1.0, tk.END).strip()
        
        if not input_data:
            messagebox.showwarning("Warning", "Please enter some data to minify")
            return
        
        try:
            # Try JSON first
            try:
                data = json.loads(input_data)
                minified = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
                format_type = "JSON"
            except:
                # Try XML
                root = ET.fromstring(input_data)
                minified = ET.tostring(root, encoding='unicode')
                # Remove whitespace between tags
                minified = re.sub(r'>\s+<', '><', minified)
                format_type = "XML"
            
            self.output_text.delete(1.0, tk.END)
            self.output_text.insert(1.0, minified)
            
            self.validation_label.config(text=f"✓ {format_type} minified successfully",
                                        fg="#4CAF50")
            self.status_bar.config(text=f"{format_type} minified")
            self.update_output_stats()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to minify:\n{str(e)}")
    
    def validate_data(self):
        input_data = self.input_text.get(1.0, tk.END).strip()
        
        if not input_data:
            messagebox.showwarning("Warning", "Please enter some data to validate")
            return
        
        # Try JSON
        try:
            json.loads(input_data)
            self.validation_label.config(text="✓ Valid JSON", fg="#4CAF50")
            messagebox.showinfo("Validation", "✓ Valid JSON")
            return
        except json.JSONDecodeError as e:
            pass
        
        # Try XML
        try:
            ET.fromstring(input_data)
            self.validation_label.config(text="✓ Valid XML", fg="#4CAF50")
            messagebox.showinfo("Validation", "✓ Valid XML")
            return
        except ET.ParseError as e:
            pass
        
        # Neither valid
        self.validation_label.config(text="✗ Invalid JSON and XML", fg="#f44336")
        messagebox.showerror("Validation", "✗ Data is neither valid JSON nor XML")
    
    def convert_format(self, conversion_type):
        input_data = self.input_text.get(1.0, tk.END).strip()
        
        if not input_data:
            messagebox.showwarning("Warning", "Please enter some data to convert")
            return
        
        try:
            if conversion_type == "json_to_xml":
                # Parse JSON
                data = json.loads(input_data)
                
                # Convert to XML
                root = self.dict_to_xml(data, "root")
                xml_str = ET.tostring(root, encoding='unicode')
                
                # Format XML
                reparsed = minidom.parseString(xml_str)
                formatted = reparsed.toprettyxml(indent="  ")
                formatted = '\n'.join([line for line in formatted.split('\n') if line.strip()])
                
                self.output_text.delete(1.0, tk.END)
                self.output_text.insert(1.0, formatted)
                
                self.validation_label.config(text="✓ Converted JSON to XML", fg="#4CAF50")
                self.status_bar.config(text="Converted JSON to XML")
                
            elif conversion_type == "xml_to_json":
                # Parse XML
                root = ET.fromstring(input_data)
                
                # Convert to dict
                data = self.xml_to_dict(root)
                
                # Format JSON
                formatted = json.dumps(data, indent=2, ensure_ascii=False)
                
                self.output_text.delete(1.0, tk.END)
                self.output_text.insert(1.0, formatted)
                
                self.validation_label.config(text="✓ Converted XML to JSON", fg="#4CAF50")
                self.status_bar.config(text="Converted XML to JSON")
            
            self.update_output_stats()
            
        except Exception as e:
            messagebox.showerror("Conversion Error", f"Failed to convert:\n{str(e)}")
    
    def dict_to_xml(self, data, root_name):
        """Convert dictionary to XML element"""
        root = ET.Element(root_name)
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    child = self.dict_to_xml(value, key)
                    root.append(child)
                else:
                    child = ET.SubElement(root, key)
                    child.text = str(value)
        
        elif isinstance(data, list):
            for item in data:
                child = self.dict_to_xml(item, "item")
                root.append(child)
        
        else:
            root.text = str(data)
        
        return root
    
    def xml_to_dict(self, element):
        """Convert XML element to dictionary"""
        result = {}
        
        # Add attributes
        if element.attrib:
            result['@attributes'] = element.attrib
        
        # Add text content
        if element.text and element.text.strip():
            if len(element) == 0:
                return element.text.strip()
            result['#text'] = element.text.strip()
        
        # Add children
        for child in element:
            child_data = self.xml_to_dict(child)
            
            if child.tag in result:
                # Multiple children with same tag - make it a list
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(child_data)
            else:
                result[child.tag] = child_data
        
        return {element.tag: result} if result else {element.tag: element.text}
    
    def copy_output(self):
        output = self.output_text.get(1.0, tk.END).strip()
        
        if not output:
            messagebox.showinfo("Info", "No output to copy")
            return
        
        try:
            import pyperclip
            pyperclip.copy(output)
        except:
            self.root.clipboard_clear()
            self.root.clipboard_append(output)
        
        self.status_bar.config(text="Output copied to clipboard")
        messagebox.showinfo("Copied", "Output copied to clipboard!")
    
    def copy_to_input(self):
        output = self.output_text.get(1.0, tk.END).strip()
        
        if not output:
            messagebox.showinfo("Info", "No output to copy")
            return
        
        self.input_text.delete(1.0, tk.END)
        self.input_text.insert(1.0, output)
        self.update_input_stats()
        self.status_bar.config(text="Output copied to input")
    
    def clear_text(self):
        self.input_text.delete(1.0, tk.END)
        self.output_text.delete(1.0, tk.END)
        self.validation_label.config(text="No validation performed yet", fg="#666")
        self.update_input_stats()
        self.update_output_stats()
        self.status_bar.config(text="Cleared")
    
    def open_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[
                ("JSON files", "*.json"),
                ("XML files", "*.xml"),
                ("All files", "*.*")
            ]
        )
        
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self.input_text.delete(1.0, tk.END)
                self.input_text.insert(1.0, content)
                
                self.current_file = file_path
                self.update_input_stats()
                self.status_bar.config(text=f"Opened: {file_path}")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file:\n{str(e)}")
    
    def save_file(self):
        if self.current_file:
            self.save_to_file(self.current_file)
        else:
            self.save_as_file()
    
    def save_as_file(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[
                ("JSON files", "*.json"),
                ("XML files", "*.xml"),
                ("All files", "*.*")
            ]
        )
        
        if file_path:
            self.save_to_file(file_path)
            self.current_file = file_path
    
    def save_to_file(self, file_path):
        try:
            # Save output if available, otherwise input
            content = self.output_text.get(1.0, tk.END).strip()
            if not content:
                content = self.input_text.get(1.0, tk.END).strip()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.status_bar.config(text=f"Saved: {file_path}")
            messagebox.showinfo("Success", f"Saved to:\n{file_path}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file:\n{str(e)}")
    
    def insert_sample_json(self):
        sample = """{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "gaming"]
}"""
        self.input_text.insert(1.0, sample)
        self.update_input_stats()

if __name__ == "__main__":
    root = tk.Tk()
    app = DataFormatter(root)
    root.mainloop()
