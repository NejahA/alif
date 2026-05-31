import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import Talkbox from './components/Talkbox';
import FrenchHorn from './components/FrenchHorn';
import DoubleBass from './components/DoubleBass';
import Clarinet from './components/Clarinet';
import Harpsichord from './components/Harpsichord';
import TubularBells from './components/TubularBells';"""

content = content.replace("import Talkbox from './components/Talkbox';", imports)

# 2. Add instrument info
info = """    talkbox: "Talkbox - Classic 70s vocal effect. Use your mic to modulate a gnarly synth.",
    frenchhorn: "French Horn - Majestic orchestral brass with a warm, swelling tone.",
    doublebass: "Double Bass - The massive foundation of the string section. Toggle between Arco and Pizzicato.",
    clarinet: "Clarinet - Classic woodwind instrument with a distinctive hollow, woody tone.",
    harpsichord: "Harpsichord - Classic Baroque keyboard. Plucks the strings for a bright, sharp attack.",
    tubularbells: "Tubular Bells - Large orchestral chimes for dramatic, cinematic resonance."
  };"""

content = content.replace("    talkbox: \"Talkbox - Classic 70s vocal effect. Use your mic to modulate a gnarly synth.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'tubularbells', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'talkbox' && (
              <motion.div
                key="talkbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Talkbox</h2>
                <Talkbox />
              </motion.div>
            )}

            {activeTab === 'frenchhorn' && (
              <motion.div
                key="frenchhorn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>French Horn</h2>
                <FrenchHorn />
              </motion.div>
            )}

            {activeTab === 'doublebass' && (
              <motion.div
                key="doublebass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Double Bass</h2>
                <DoubleBass />
              </motion.div>
            )}

            {activeTab === 'clarinet' && (
              <motion.div
                key="clarinet"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Clarinet</h2>
                <Clarinet />
              </motion.div>
            )}

            {activeTab === 'harpsichord' && (
              <motion.div
                key="harpsichord"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Harpsichord</h2>
                <Harpsichord />
              </motion.div>
            )}

            {activeTab === 'tubularbells' && (
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
            )}"""

content = content.replace("""{activeTab === 'talkbox' && (
              <motion.div
                key="talkbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Talkbox</h2>
                <Talkbox />
              </motion.div>
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 8")
