/**
 * Language utilities for Wikipedia article translator
 * Provides language codes, names, flags, and helper functions
 */

// Common Wikipedia language codes and their native names
export const languageData = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  ur: { name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  fa: { name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  fi: { name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  no: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  da: { name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  he: { name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  hu: { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  cs: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  sk: { name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  ro: { name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  bg: { name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  be: { name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' },
  sr: { name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  sl: { name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  lt: { name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  lv: { name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  et: { name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  ga: { name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  gd: { name: 'Scottish Gaelic', nativeName: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  cy: { name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  eu: { name: 'Basque', nativeName: 'Euskara', flag: '🏴󠁢󠁥󠁺󠁿' },
  ca: { name: 'Catalan', nativeName: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  gl: { name: 'Galician', nativeName: 'Galego', flag: '🏴󠁥󠁳󠁧󠁡󠁿' },
  af: { name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  yo: { name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  ha: { name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  ig: { name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  am: { name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  ti: { name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷' },
  so: { name: 'Somali', nativeName: 'Soomaaliga', flag: '🇸🇴' },
  ku: { name: 'Kurdish', nativeName: 'Kurdî', flag: '🏴󠁫󠁲󠁧󠁿' },
};

/**
 * Get language name by language code
 * @param {string} code - Language code (e.g., 'en', 'es', 'fr')
 * @returns {string} Language name in English
 */
export const getLanguageName = (code) => {
  const language = languageData[code];
  return language ? language.name : code.toUpperCase();
};

/**
 * Get native language name by language code
 * @param {string} code - Language code
 * @returns {string} Native language name
 */
export const getNativeLanguageName = (code) => {
  const language = languageData[code];
  return language ? language.nativeName : code.toUpperCase();
};

/**
 * Get flag emoji for a language
 * @param {string} code - Language code
 * @returns {string} Flag emoji or language code
 */
export const getLanguageFlag = (code) => {
  const language = languageData[code];
  return language ? language.flag : `[${code.toUpperCase()}]`;
};

/**
 * Get all supported languages
 * @returns {Array} Array of language objects
 */
export const getAllLanguages = () => {
  return Object.entries(languageData).map(([code, data]) => ({
    code,
    name: data.name,
    nativeName: data.nativeName,
    flag: data.flag,
  }));
};

/**
 * Check if a language code is supported
 * @param {string} code - Language code to check
 * @returns {boolean} True if language is supported
 */
export const isLanguageSupported = (code) => {
  return !!languageData[code];
};

/**
 * Format language display text
 * @param {string} code - Language code
 * @param {string} format - Display format ('name', 'native', 'code', 'full')
 * @returns {string} Formatted language string
 */
export const formatLanguage = (code, format = 'full') => {
  const language = languageData[code];
  
  if (!language) {
    return code.toUpperCase();
  }

  switch (format) {
    case 'name':
      return language.name;
    case 'native':
      return language.nativeName;
    case 'code':
      return code.toUpperCase();
    case 'full':
    default:
      return `${language.flag} ${language.name} (${code.toUpperCase()})`;
  }
};

/**
 * Get language direction (LTR or RTL)
 * @param {string} code - Language code
 * @returns {string} 'ltr' or 'rtl'
 */
export const getLanguageDirection = (code) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(code) ? 'rtl' : 'ltr';
};

/**
 * Sort languages alphabetically by name
 * @param {Array} languages - Array of language objects
 * @returns {Array} Sorted languages
 */
export const sortLanguagesByName = (languages) => {
  return [...languages].sort((a, b) => {
    const nameA = getLanguageName(a.code || a);
    const nameB = getLanguageName(b.code || b);
    return nameA.localeCompare(nameB);
  });
};

/**
 * Filter languages by search term
 * @param {Array} languages - Array of language objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered languages
 */
export const filterLanguages = (languages, searchTerm) => {
  if (!searchTerm) return languages;
  
  const term = searchTerm.toLowerCase();
  return languages.filter(lang => {
    const code = lang.code || lang;
    const name = getLanguageName(code).toLowerCase();
    const nativeName = getNativeLanguageName(code).toLowerCase();
    return name.includes(term) || nativeName.includes(term) || code.includes(term);
  });
};