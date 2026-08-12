







import tkinter as tk
from music21 import stream, note







class MusicGenerator:
    def __init__(self):
        self.genre = tk.StringVar()
        self.mood = tk.StringVar()
        self.style = tk.StringVar()







        self.genres = ["Classical", "Jazz", "Rock"]
        self.moods = ["Happy", "Sad", "Neutral"]
        self.styles = ["Simple", "Complex"]

        self.root = tk.Tk()
        self.root.title("Music Generator")

        # Create GUI elements
        tk.Label(self.root, text="Select Genre:").pack()
        genre_menu = tk.OptionMenu(self.root, self.genre, *self.genres)
        genre_menu.pack()

        tk.Label(self.root, text="Select Mood:").pack()
        mood_menu = tk.OptionMenu(self.root, self.mood, *self.moods)
        mood_menu.pack()

        tk.Label(self.root, text="Select Style:").pack()
        style_menu = tk.OptionMenu(self.root, self.style, *self.styles)
        style_menu.pack()

        # Create generate button
        generate_button = tk.Button(self.root, text="Generate Music", command=self.generate_music)
        generate_button.pack()

    def generate_music(self):
        # Get selected genre, mood, and style
        genre = self.genre.get()
        mood = self.mood.get()
        style = self.style.get()

        # Generate musical notes based on selection
        if genre == "Classical":
            notes = [note.Note("C4"), note.Note("D4")]
        elif genre == "Jazz":
            notes = [note.Note("E4"), note.Note("F4")]
        else:
            notes = [note.Note("G4"), note.Note("A4")]

        if mood == "Happy":
            notes[0].pitch.ps = 72
        elif mood == "Sad":
            notes[1].pitch.ps = 64

        if style == "Simple":
            notes[0].octave = 3
        else:
            notes[1].octave = 4

        # Create melody using generated notes
        melody = stream.Stream(notes)

        # Play generated music
        melody.show()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    generator = MusicGenerator()
    generator.run()
