import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import SpringReverb from './components/SpringReverb';
import TR808 from './components/TR808';
import TB303 from './components/TB303';
import Stylophone from './components/Stylophone';
import Kaossilator from './components/Kaossilator';
import Talkbox from './components/Talkbox';"""

content = content.replace("import SpringReverb from './components/SpringReverb';", imports)

# 2. Add instrument info
info = """    springreverb: "Spring Reverb Tank - An interactive reverb tank that you can physically kick.",
    tr808: "TR-808 - Legendary 16-step drum machine with classic hip-hop and techno sounds.",
    tb303: "TB-303 - The iconic acid bassline synthesizer with extreme filter controls.",
    stylophone: "Stylophone - Retro 60s pocket synth. Drag your mouse across the metallic foil keys.",
    kaossilator: "Kaossilator - Glowing XY-pad synthesizer for fluidly sweeping pitch and filters.",
    talkbox: "Talkbox - Classic 70s vocal effect. Use your mic to modulate a gnarly synth."
  };"""

content = content.replace("    springreverb: \"Spring Reverb Tank - An interactive reverb tank that you can physically kick.\"\n  };", info)

# 3. Update categories
old_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

new_categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'talkbox', 'pads', 'seq', 'vocoder', 'springreverb'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};"""

content = content.replace(old_categories, new_categories)

# 4. Add render blocks
render_blocks = """{activeTab === 'springreverb' && (
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
            )}

            {activeTab === 'tr808' && (
              <motion.div
                key="tr808"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>TR-808 Drum Machine</h2>
                <TR808 />
              </motion.div>
            )}

            {activeTab === 'tb303' && (
              <motion.div
                key="tb303"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>TB-303 Acid Bass</h2>
                <TB303 />
              </motion.div>
            )}

            {activeTab === 'stylophone' && (
              <motion.div
                key="stylophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Stylophone</h2>
                <Stylophone />
              </motion.div>
            )}

            {activeTab === 'kaossilator' && (
              <motion.div
                key="kaossilator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Kaossilator</h2>
                <Kaossilator />
              </motion.div>
            )}

            {activeTab === 'talkbox' && (
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
            )}"""

content = content.replace("""{activeTab === 'springreverb' && (
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
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring App.jsx for phase 7")
