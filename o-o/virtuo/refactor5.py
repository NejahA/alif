import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import HurdyGurdy from './components/HurdyGurdy';
import Oboe from './components/Oboe';
import Gong from './components/Gong';
import Bagpipes from './components/Bagpipes';
import Autoharp from './components/Autoharp';
import Vocoder from './components/Vocoder';"""

content = content.replace("import HurdyGurdy from './components/HurdyGurdy';", imports)

# 2. Add instrument info
info = """    hurdygurdy: "Hurdy Gurdy - Hand-cranked string instrument with drones.",
    oboe: "Oboe - Expressive double reed woodwind instrument.",
    gong: "Gong - Massive resonant percussion instrument.",
    bagpipes: "Bagpipes - Traditional wind instrument with continuous drones.",
    autoharp: "Autoharp - Strummable zither with chord bars.",
    vocoder: "Vocoder - Robotic voice synthesizer using mic input."
  };"""

content = content.replace("    hurdygurdy: \"Hurdy Gurdy - Hand-cranked string instrument with drones.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq', 'vocoder'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'hurdygurdy' && (
              <motion.div
                key="hurdygurdy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Hurdy Gurdy</h2>
                <HurdyGurdy />
              </motion.div>
            )}

            {activeTab === 'oboe' && (
              <motion.div
                key="oboe"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Oboe</h2>
                <Oboe />
              </motion.div>
            )}

            {activeTab === 'gong' && (
              <motion.div
                key="gong"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Gong</h2>
                <Gong />
              </motion.div>
            )}

            {activeTab === 'bagpipes' && (
              <motion.div
                key="bagpipes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Bagpipes</h2>
                <Bagpipes />
              </motion.div>
            )}

            {activeTab === 'autoharp' && (
              <motion.div
                key="autoharp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Autoharp</h2>
                <Autoharp />
              </motion.div>
            )}

            {activeTab === 'vocoder' && (
              <motion.div
                key="vocoder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vocoder</h2>
                <Vocoder />
              </motion.div>
            )}"""

content = content.replace("""{activeTab === 'hurdygurdy' && (
              <motion.div
                key="hurdygurdy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Hurdy Gurdy</h2>
                <HurdyGurdy />
              </motion.div>
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 5")
