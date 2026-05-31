import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import TubularBells from './components/TubularBells';
import Dulcimer from './components/Dulcimer';
import Balalaika from './components/Balalaika';
import Vibraphone from './components/Vibraphone';
import Alphorn from './components/Alphorn';
import OndesMartenot from './components/OndesMartenot';"""

content = content.replace("import TubularBells from './components/TubularBells';", imports)

# 2. Add instrument info
info = """    tubularbells: "Tubular Bells - Large orchestral chimes for dramatic, cinematic resonance.",
    dulcimer: "Dulcimer - Traditional hammered string instrument with a bright metallic tone.",
    balalaika: "Balalaika - Russian triangular string instrument. Hold the frets for rapid tremolo picking.",
    vibraphone: "Vibraphone - Metallic keyboard with a motor speed slider for deep tremolo.",
    alphorn: "Alphorn - Massive, resonating mountain horn of the Swiss Alps.",
    ondesmartenot: "Ondes Martenot - Early electronic instrument. Slide the ring for pitch and press the key for volume."
  };"""

content = content.replace("    tubularbells: \"Tubular Bells - Large orchestral chimes for dramatic, cinematic resonance.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'tubularbells', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'ondesmartenot', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp', 'dulcimer', 'balalaika'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'alphorn', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'tubularbells', 'vibraphone', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'tubularbells' && (
              <motion.div
                key="tubularbells"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tubular Bells</h2>
                <TubularBells />
              </motion.div>
            )}

            {activeTab === 'dulcimer' && (
              <motion.div
                key="dulcimer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Dulcimer</h2>
                <Dulcimer />
              </motion.div>
            )}

            {activeTab === 'balalaika' && (
              <motion.div
                key="balalaika"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Balalaika</h2>
                <Balalaika />
              </motion.div>
            )}

            {activeTab === 'vibraphone' && (
              <motion.div
                key="vibraphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vibraphone</h2>
                <Vibraphone />
              </motion.div>
            )}

            {activeTab === 'alphorn' && (
              <motion.div
                key="alphorn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Alphorn</h2>
                <Alphorn />
              </motion.div>
            )}

            {activeTab === 'ondesmartenot' && (
              <motion.div
                key="ondesmartenot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ondes Martenot</h2>
                <OndesMartenot />
              </motion.div>
            )}"""

content = content.replace("""{activeTab === 'tubularbells' && (
              <motion.div
                key="tubularbells"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tubular Bells</h2>
                <TubularBells />
              </motion.div>
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 9")
