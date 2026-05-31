/**
 * TypeScript interface definitions for the Plugin System
 * These interfaces define the structure for plugin metadata, parameters, and state
 */

/**
 * Plugin format types
 * @typedef {'VST3' | 'AU' | 'VST2' | 'CLAP'} PluginFormat
 */

/**
 * Plugin category types
 * @typedef {'instrument' | 'effect' | 'analyzer'} PluginCategory
 */

/**
 * Plugin parameter types
 * @typedef {'float' | 'int' | 'bool' | 'enum'} ParameterType
 */

/**
 * Plugin metadata interface
 * @typedef {Object} PluginMetadata
 * @property {string} id - Unique identifier for the plugin
 * @property {string} name - Display name of the plugin
 * @property {string} vendor - Plugin vendor/developer
 * @property {string} version - Plugin version
 * @property {PluginFormat} format - Plugin format (VST3, AU, VST2, CLAP)
 * @property {PluginCategory} category - Plugin category (instrument, effect, analyzer)
 * @property {PluginParameter[]} parameters - Array of plugin parameters
 * @property {PluginPreset[]} presets - Array of plugin presets
 */

/**
 * Plugin parameter interface
 * @typedef {Object} PluginParameter
 * @property {string} id - Unique parameter identifier
 * @property {string} name - Display name of the parameter
 * @property {ParameterType} type - Parameter data type
 * @property {[number, number]} range - Minimum and maximum values
 * @property {number} defaultValue - Default parameter value
 * @property {string} unit - Measurement unit (Hz, dB, %, etc.)
 * @property {number} automationId - ID for automation mapping
 */

/**
 * Plugin preset metadata
 * @typedef {Object} PresetMetadata
 * @property {string} author - Preset author
 * @property {string} description - Preset description
 * @property {string[]} tags - Search tags
 * @property {Date} created - Creation date
 * @property {Date} modified - Last modification date
 */

/**
 * Plugin preset interface
 * @typedef {Object} PluginPreset
 * @property {string} id - Unique preset identifier
 * @property {string} name - Display name of the preset
 * @property {string} pluginId - ID of the plugin this preset belongs to
 * @property {Record<string, number>} parameterValues - Parameter values keyed by parameter ID
 * @property {PresetMetadata} metadata - Preset metadata
 */

/**
 * Plugin instance interface
 * @typedef {Object} PluginInstance
 * @property {string} id - Unique instance identifier
 * @property {PluginMetadata} metadata - Plugin metadata
 * @property {boolean} isLoaded - Whether the plugin is successfully loaded
 * @property {boolean} isBypassed - Whether the plugin is bypassed
 * @property {AudioNode} audioNode - Web Audio API node for the plugin
 * @property {Function} setParameter - Function to set a parameter value
 * @property {Function} getParameter - Function to get a parameter value
 * @property {Function} loadPreset - Function to load a preset
 * @property {Function} savePreset - Function to save current state as preset
 */

/**
 * Plugin error types
 * @typedef {'LOAD_FAILED' | 'INIT_FAILED' | 'PARAMETER_ERROR' | 'UNSUPPORTED_FORMAT' | 'FILE_NOT_FOUND'} PluginErrorType
 */

/**
 * Plugin error interface
 * @typedef {Object} PluginError
 * @property {PluginErrorType} type - Type of error
 * @property {string} message - Human-readable error message
 * @property {string} [pluginPath] - Path to the plugin file (if applicable)
 * @property {string} [details] - Additional error details
 * @property {Date} timestamp - When the error occurred
 */

/**
 * PluginHost component props interface
 * @typedef {Object} PluginHostProps
 * @property {string} pluginPath - Path to the plugin file
 * @property {function(PluginInstance): void} onPluginLoaded - Callback when plugin loads successfully
 * @property {function(PluginError): void} onPluginError - Callback when plugin fails to load
 * @property {AudioContext} audioContext - Web Audio API context
 * @property {string} [pluginId] - Optional plugin ID for existing instances
 * @property {boolean} [autoLoad] - Whether to auto-load the plugin on mount
 */

/**
 * PluginHost component state interface
 * @typedef {Object} PluginHostState
 * @property {PluginInstance | null} pluginInstance - Loaded plugin instance
 * @property {boolean} isLoaded - Whether plugin is loaded
 * @property {PluginParameter[]} parameters - Plugin parameters
 * @property {PluginPreset} preset - Current preset
 * @property {boolean} isLoading - Whether plugin is currently loading
 * @property {PluginError | null} error - Current error state
 */

/**
 * Plugin scanning result
 * @typedef {Object} PluginScanResult
 * @property {PluginMetadata[]} plugins - Array of discovered plugins
 * @property {string[]} errors - Array of error messages
 * @property {number} scanTime - Time taken to scan (ms)
 */

/**
 * Plugin registry interface
 * @typedef {Object} PluginRegistry
 * @property {Record<string, PluginMetadata>} plugins - Map of plugin ID to metadata
 * @property {Record<string, PluginInstance>} instances - Map of instance ID to instance
 * @property {Record<string, PluginPreset[]>} presets - Map of plugin ID to presets
 */

export {};