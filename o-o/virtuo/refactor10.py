import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import Launchpad from './components/Launchpad';
import Looper from './components/Looper';
import BeatSlicer from './components/BeatSlicer';
import VinylCrackle from './components/VinylCrackle';
import TapeStop from './components/TapeStop';"""

content = content.replace("import Launchpad from './components/Launchpad';", imports) # Just in case it was re-run, else we need a good injection point
# A better insertion point is the last import we added in phase 9
content = content.replace("import OndesMartenot from './components/OndesMartenot';", "import OndesMartenot from './components/OndesMartenot';\n" + imports)


# 2. Add instrument info
info = """    ondesmartenot: "Ondes Martenot - Early electronic instrument. Slide the ring for pitch and press the key for volume.",
    launchpad: "Launchpad - 64-pad isomorphic grid controller for rapid chord and melody sequencing.",
    looper: "Loop Station - Record a phrase with your mic and overdub endless layers to build a track live.",
    beatslicer: "Beat Slicer - MPC-style sampler that chops a breakbeat into 8 slices for finger-drumming.",
    vinylcrackle: "Vinyl Crackle - Studio FX. Drops a needle to add authentic record dust, crackle, and hiss.",
    tapestop: "Tape Stop - Studio FX. A massive button that simulates a turntable motor turning off, crashing the tempo."
  };"""

content = content.replace("    ondesmartenot: \"Ondes Martenot - Early electronic instrument. Slide the ring for pitch and press the key for volume.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'ondesmartenot', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp', 'dulcimer', 'balalaika'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'alphorn', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'tubularbells', 'vibraphone', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'ondesmartenot', 'launchpad', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp', 'dulcimer', 'balalaika'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'alphorn', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'beatslicer', 'tabla', 'tubularbells', 'vibraphone', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'looper', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'vinylcrackle', 'tapestop', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'ondesmartenot' && (
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
            )}

            {activeTab === 'launchpad' && (
              <motion.div
                key="launchpad"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Launchpad (Isomorphic Grid)</h2>
                <Launchpad />
              </motion.div>
            )}

            {activeTab === 'looper' && (
              <motion.div
                key="looper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Loop Station</h2>
                <Looper />
              </motion.div>
            )}

            {activeTab === 'beatslicer' && (
              <motion.div
                key="beatslicer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Beat Slicer</h2>
                <BeatSlicer />
              </motion.div>
            )}

            {activeTab === 'vinylcrackle' && (
              <motion.div
                key="vinylcrackle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vinyl Crackle FX</h2>
                <VinylCrackle />
              </motion.div>
            )}

            {activeTab === 'tapestop' && (
              <motion.div
                key="tapestop"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tape Stop FX</h2>
                <TapeStop />
              </motion.div>
            )}"""

content = content.replace("""{activeTab === 'ondesmartenot' && (
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
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 10")
