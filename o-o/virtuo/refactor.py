import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for MultiTrackArranger, Mellotron, HurdyGurdy
imports = """import Xylophone from './components/Xylophone';
import MultiTrackArranger from './components/MultiTrackArranger';
import Mellotron from './components/Mellotron';
import HurdyGurdy from './components/HurdyGurdy';"""

content = content.replace("import Xylophone from './components/Xylophone';", imports)

# Update instrumentInfo
info = """    xylophone: "Xylophone - Classic wooden mallet instrument.",
    multitrack: "Multi-Track - Timeline arrangement view for multiple audio layers.",
    mellotron: "Mellotron - Vintage tape-replay keyboard instrument.",
    hurdygurdy: "Hurdy Gurdy - Hand-cranked string instrument with drones."
  };"""

content = content.replace("    xylophone: \"Xylophone - Classic wooden mallet instrument.\"\n  };", info)

# Add categories constant right before App function
categories = """const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'synth', 'bass', 'ambient', 'organ', 'mellotron', 'chiptune', 'theremin'],
  "Strings": ['violin', 'guitar', 'cello', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy'],
  "Winds & Brass": ['trumpet', 'saxophone', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'kazoo'],
  "Percussion": ['drums', 'tabla', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox'],
  "Studio & FX": ['multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'glassarmonica', 'glitch', 'beatbox', 'choir', 'vocal', 'pads', 'seq'],
  "Learning": ['scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder']
};

function App() {"""

content = content.replace("function App() {", categories)

# Replace the giant button list with a Category Dropdown
nav_start = content.find('<nav')
nav_end = content.find('</nav>', nav_start) + 6

# The Tools button starts at `<button \n            className={\`btn-glass ${showUtilities ? 'active' : ''}\`}`
tools_start = content.find('<button \n            className={`btn-glass ${showUtilities ? \'active\' : \'\'}`')

# We want to keep everything from Tools button onwards inside the nav.
nav_content_end = tools_start

new_nav = """<nav style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative' }}>
          <Recorder onRecordingComplete={addRecording} />
          
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="btn-glass"
            style={{ padding: '10px 15px', fontSize: '14px', minWidth: '250px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--accent-primary)', borderRadius: '8px', cursor: 'pointer' }}
          >
            {Object.entries(INSTRUMENT_CATEGORIES).map(([catName, instruments]) => (
              <optgroup key={catName} label={catName} style={{ background: '#111', color: '#a855f7' }}>
                {instruments.map(inst => (
                  <option key={inst} value={inst} style={{ color: '#fff' }}>
                    {instrumentInfo[inst] ? instrumentInfo[inst].split(' - ')[0] : inst}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          
          <div style={{ flex: 1 }} />
          
          """

# Splice it in
content = content[:content.find('<Recorder onRecordingComplete={addRecording} />')] + new_nav + content[tools_start:]

# Now add render blocks for multitrack, mellotron, hurdygurdy
render_blocks = """{activeTab === 'xylophone' && (
              <motion.div
                key="xylophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Xylophone</h2>
                <Xylophone />
              </motion.div>
            )}

            {activeTab === 'multitrack' && (
              <motion.div
                key="multitrack"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Multi-Track Arranger</h2>
                <MultiTrackArranger />
              </motion.div>
            )}

            {activeTab === 'mellotron' && (
              <motion.div
                key="mellotron"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Mellotron</h2>
                <Mellotron />
              </motion.div>
            )}

            {activeTab === 'hurdygurdy' && (
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
            )}"""

content = content.replace("""{activeTab === 'xylophone' && (
              <motion.div
                key="xylophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Xylophone</h2>
                <Xylophone />
              </motion.div>
            )}""", render_blocks)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done refactoring App.jsx")
