import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import Vocoder from './components/Vocoder';
import Waterphone from './components/Waterphone';
import Otamatone from './components/Otamatone';
import JawHarp from './components/JawHarp';
import FoleyStage from './components/FoleyStage';
import SpringReverb from './components/SpringReverb';"""

content = content.replace("import Vocoder from './components/Vocoder';", imports)

# 2. Add instrument info
info = """    vocoder: "Vocoder - Robotic voice synthesizer using mic input.",
    waterphone: "Waterphone - Eerie, bowed acoustic instrument perfect for horror scores.",
    otamatone: "Otamatone - Japanese electronic musical toy with a sliding ribbon controller.",
    jawharp: "Jaw Harp - Twangy folk instrument with mouth-shape filter modulation.",
    foleystage: "Foley Stage - A 12-pad sampler with synthesized cinematic sound effects.",
    springreverb: "Spring Reverb Tank - An interactive reverb tank that you can physically kick."
  };"""

content = content.replace("    vocoder: \"Vocoder - Robotic voice synthesizer using mic input.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq', 'vocoder'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'vocoder' && (
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
            )}

            {activeTab === 'waterphone' && (
              <motion.div
                key="waterphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Waterphone</h2>
                <Waterphone />
              </motion.div>
            )}

            {activeTab === 'otamatone' && (
              <motion.div
                key="otamatone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Otamatone</h2>
                <Otamatone />
              </motion.div>
            )}

            {activeTab === 'jawharp' && (
              <motion.div
                key="jawharp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Jaw Harp</h2>
                <JawHarp />
              </motion.div>
            )}

            {activeTab === 'foleystage' && (
              <motion.div
                key="foleystage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Foley Stage</h2>
                <FoleyStage />
              </motion.div>
            )}

            {activeTab === 'springreverb' && (
              <motion.div
                key="springreverb"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Spring Reverb Tank</h2>
                <SpringReverb />
              </motion.div>
            )}"""

content = content.replace("""{activeTab === 'vocoder' && (
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
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 6")
