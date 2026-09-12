import axios from 'axios';

// Base Wikipedia API configuration
const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Axios instance for Wikipedia API
const wikipediaApi = axios.create({
  baseURL: WIKIPEDIA_API_BASE,
  params: {
    format: 'json',
    origin: '*',
    action: 'query',
  }
});

/**
 * Fetch a Wikipedia article by title and language
 * @param {string} title - Article title
 * @param {string} lang - Language code (default: 'en')
 * @returns {Promise<Object>} Article data
 */
export const fetchWikipediaArticle = async (title, lang = 'en') => {
  try {
    const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        prop: 'extracts|info|links|categories',
        titles: title,
        format: 'json',
        origin: '*',
        explaintext: false,
        exsectionformat: 'wiki',
        exintro: false,
        inprop: 'url',
        pllimit: 10,
        cllimit: 5,
      }
    });

    const pages = response.data.query?.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      throw new Error('Article not found');
    }

    return {
      title: page.title,
      content: page.extract || '',
      pageid: page.pageid,
      language: lang,
      url: page.fullurl,
      timestamp: page.touched,
      categories: page.categories?.map(cat => cat.title.replace('Category:', '')),
      links: page.links?.map(link => link.title),
    };
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    throw error;
  }
};

/**
 * Fetch available languages for a Wikipedia article
 * @param {string} title - Article title
 * @returns {Promise<Array>} List of available languages
 */
export const fetchArticleLanguages = async (title) => {
  try {
    const response = await wikipediaApi.get('', {
      params: {
        action: 'query',
        prop: 'langlinks',
        titles: title,
        lllimit: 500,
        format: 'json',
      }
    });

    const pages = response.data.query?.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || !page.langlinks) {
      return [];
    }

    // Add English as the base language
    const languages = [
      { code: 'en', name: 'English', '*': title }
    ];

    // Add all available translations
    page.langlinks.forEach((langLink) => {
      languages.push({
        code: langLink.lang,
        name: langLink.autonym || langLink.lang,
        '*': langLink['*'],
      });
    });

    return languages.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching article languages:', error);
    return [];
  }
};

/**
 * Search Wikipedia articles by query
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Search results
 */
export const searchWikipediaArticles = async (query, limit = 10) => {
  try {
    const response = await wikipediaApi.get('', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: limit,
        format: 'json',
      }
    });

    return response.data.query?.search?.map(result => ({
      title: result.title,
      snippet: result.snippet,
      description: result.snippet.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
    })) || [];
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return [];
  }
};

/**
 * Get article summary for quick preview
 * @param {string} title - Article title
 * @param {string} lang - Language code (default: 'en')
 * @returns {Promise<Object>} Article summary
 */
export const fetchArticleSummary = async (title, lang = 'en') => {
  try {
    const response = await axios.get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching article summary:', error);
    throw error;
  }
};

/**
 * Get list of all Wikipedia languages
 * @returns {Promise<Array>} List of all Wikipedia languages
 */
export const fetchAllLanguages = async () => {
  try {
    const response = await wikipediaApi.get('', {
      params: {
        action: 'query',
        meta: 'siteinfo',
        siprop: 'languages',
        format: 'json',
      }
    });

    return response.data.query?.languages || [];
  } catch (error) {
    console.error('Error fetching all languages:', error);
    return [];
  }
};