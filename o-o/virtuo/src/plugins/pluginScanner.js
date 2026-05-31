/**
 * Plugin Scanner Module
 * 
 * Scans for VST/AU plugin files in common directories and extracts metadata.
 * 
 * Validates: Requirements 1.1, 1.2
 */

import { PluginMetadata, PluginScanResult } from '../types/plugin.types.js';

/**
 * Common plugin directory paths for different platforms
 */
const PLUGIN_DIRECTORIES = {
  windows: [
    'C:\\Program Files\\Common Files\\VST3',
    'C:\\Program Files\\VSTPlugins',
    'C:\\Program Files\\Steinberg\\VSTPlugins',
    process.env.APPDATA + '\\VST3' // User-specific VST3 directory
  ],
  macos: [
    '/Library/Audio/Plug-Ins/VST3',
    '/Library/Audio/Plug-Ins/Components', // AU plugins
    '/Library/Audio/Plug-Ins/VST',
    '~/Library/Audio/Plug-Ins/VST3', // User-specific
    '~/Library/Audio/Plug-Ins/Components' // User-specific AU
  ],
  linux: [
    '/usr/lib/vst3',
    '/usr/lib/vst',
    '/usr/local/lib/vst3',
    '/usr/local/lib/vst',
    '~/.vst3',
    '~/.vst'
  ]
};

/**
 * Plugin file extensions by format
 */
const PLUGIN_EXTENSIONS = {
  'VST3': ['.vst3'],
  'AU': ['.component'],
  'VST2': ['.dll', '.so', '.dylib'],
  'CLAP': ['.clap']
};

/**
 * Scans for plugins in the specified directories
 * @param {string[]} directories - Directories to scan (optional, defaults to platform defaults)
 * @returns {Promise<PluginScanResult>} Scan results with discovered plugins and errors
 */
export async function scanForPlugins(directories = null) {
  const results = {
    plugins: [],
    errors: [],
    scanTime: 0
  };

  const startTime = Date.now();
  
  try {
    // Determine platform
    const platform = getPlatform();
    const scanDirs = directories || PLUGIN_DIRECTORIES[platform] || [];
    
    for (const dir of scanDirs) {
      try {
        const dirResults = await scanDirectory(dir);
        results.plugins.push(...dirResults.plugins);
        results.errors.push(...dirResults.errors);
      } catch (error) {
        results.errors.push(`Failed to scan directory ${dir}: ${error.message}`);
      }
    }
    
    // Remove duplicate plugins (same path)
    results.plugins = removeDuplicates(results.plugins);
    
  } catch (error) {
    results.errors.push(`Scan failed: ${error.message}`);
  }
  
  results.scanTime = Date.now() - startTime;
  return results;
}

/**
 * Scans a single directory for plugin files
 * @param {string} directoryPath - Directory to scan
 * @returns {Promise<{plugins: PluginMetadata[], errors: string[]}>} Directory scan results
 */
async function scanDirectory(directoryPath) {
  const results = {
    plugins: [],
    errors: []
  };
  
  try {
    // In Electron, we would use fs module to read directory
    // For now, we'll create a mock implementation
    const files = await listFiles(directoryPath);
    
    for (const file of files) {
      try {
        const pluginFormat = detectPluginFormat(file);
        if (pluginFormat) {
          const metadata = await extractPluginMetadata(file, pluginFormat);
          if (metadata) {
            results.plugins.push(metadata);
          }
        }
      } catch (error) {
        results.errors.push(`Failed to process ${file}: ${error.message}`);
      }
    }
  } catch (error) {
    results.errors.push(`Failed to read directory ${directoryPath}: ${error.message}`);
  }
  
  return results;
}

/**
 * Detects plugin format based on file extension
 * @param {string} filePath - File path to check
 * @returns {string|null} Plugin format or null if not a plugin
 */
function detectPluginFormat(filePath) {
  const lowerPath = filePath.toLowerCase();
  
  for (const [format, extensions] of Object.entries(PLUGIN_EXTENSIONS)) {
    for (const ext of extensions) {
      if (lowerPath.endsWith(ext.toLowerCase())) {
        return format;
      }
    }
  }
  
  return null;
}

/**
 * Extracts metadata from a plugin file
 * @param {string} filePath - Path to plugin file
 * @param {string} format - Plugin format
 * @returns {Promise<PluginMetadata>} Plugin metadata
 */
async function extractPluginMetadata(filePath, format) {
  // In a real implementation, this would:
  // 1. Load the plugin binary
  // 2. Extract metadata using platform-specific APIs
  // 3. Parse VST3/AU manifest files
  
  // For now, create mock metadata
  const fileName = filePath.split(/[\\/]/).pop();
  const name = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  
  return {
    id: generatePluginId(filePath),
    name: name,
    vendor: 'Unknown Vendor',
    version: '1.0.0',
    format: format,
    category: detectPluginCategory(name),
    parameters: generateMockParameters(),
    presets: []
  };
}

/**
 * Generates a unique ID for a plugin
 * @param {string} filePath - Plugin file path
 * @returns {string} Unique plugin ID
 */
function generatePluginId(filePath) {
  // Create a hash-like ID from file path
  return 'plugin_' + btoa(filePath).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32);
}

/**
 * Detects plugin category based on name
 * @param {string} name - Plugin name
 * @returns {string} Plugin category
 */
function detectPluginCategory(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('synth') || lowerName.includes('instrument') || 
      lowerName.includes('piano') || lowerName.includes('guitar')) {
    return 'instrument';
  } else if (lowerName.includes('reverb') || lowerName.includes('delay') ||
             lowerName.includes('compressor') || lowerName.includes('eq')) {
    return 'effect';
  } else {
    return 'analyzer';
  }
}

/**
 * Generates mock parameters for testing
 * @returns {Array} Mock parameters
 */
function generateMockParameters() {
  return [
    {
      id: 'gain',
      name: 'Gain',
      type: 'float',
      range: [0, 1],
      defaultValue: 0.5,
      unit: '',
      automationId: 0
    },
    {
      id: 'cutoff',
      name: 'Cutoff',
      type: 'float',
      range: [20, 20000],
      defaultValue: 1000,
      unit: 'Hz',
      automationId: 1
    },
    {
      id: 'resonance',
      name: 'Resonance',
      type: 'float',
      range: [0, 1],
      defaultValue: 0.1,
      unit: '',
      automationId: 2
    }
  ];
}

/**
 * Lists files in a directory (mock implementation)
 * @param {string} directoryPath - Directory to list
 * @returns {Promise<string[]>} Array of file paths
 */
async function listFiles(directoryPath) {
  // In Electron, we would use fs.readdir
  // For now, return mock files
  return [
    `${directoryPath}/Synth1.vst3`,
    `${directoryPath}/ReverbPro.component`,
    `${directoryPath}/EQMaster.dll`,
    `${directoryPath}/AnalyzerTool.vst3`
  ];
}

/**
 * Gets the current platform
 * @returns {string} Platform identifier
 */
function getPlatform() {
  // In Electron, we would use process.platform
  // For now, detect based on user agent or assume development environment
  if (typeof navigator !== 'undefined') {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'windows';
    if (platform.includes('mac')) return 'macos';
    if (platform.includes('linux')) return 'linux';
  }
  
  // Default to current OS detection
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'macos';
  if (process.platform === 'linux') return 'linux';
  
  return 'unknown';
}

/**
 * Removes duplicate plugins based on file path
 * @param {PluginMetadata[]} plugins - Array of plugins
 * @returns {PluginMetadata[]} Deduplicated plugins
 */
function removeDuplicates(plugins) {
  const seen = new Set();
  return plugins.filter(plugin => {
    const key = plugin.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Validates a plugin file before loading
 * @param {string} filePath - Path to plugin file
 * @returns {Promise<{valid: boolean, errors: string[]}>} Validation results
 */
export async function validatePluginFile(filePath) {
  const errors = [];
  
  // Check if file exists
  try {
    // In Electron: await fs.access(filePath, fs.constants.R_OK)
    // For now, assume it exists
  } catch (error) {
    errors.push(`File not found or not readable: ${filePath}`);
    return { valid: false, errors };
  }
  
  // Check file extension
  const format = detectPluginFormat(filePath);
  if (!format) {
    errors.push(`Unsupported file format: ${filePath}`);
  }
  
  // Check file size (max 500MB)
  // In Electron: const stats = await fs.stat(filePath)
  // if (stats.size > 500 * 1024 * 1024) {
  //   errors.push('File too large (max 500MB)');
  // }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  scanForPlugins,
  validatePluginFile
};