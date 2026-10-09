/**
 * @file site.config.js
 * Central site configuration for Year 7 Mathematics Classroom Slideshows.
 * 
 * Configures the deployed base URL used by auto-generated student HTML launchers.
 * 
 * Configuration options:
 * 1. Environment variable: Set SITE_URL (e.g. export SITE_URL="https://username.github.io/year-7-mathematics-slideshows")
 * 2. Or set `productionUrl` directly below.
 */

const envUrl = (typeof process !== 'undefined' && process?.env?.SITE_URL)
  || (typeof process !== 'undefined' && process?.env?.VITE_SITE_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL)
  || '';

export const siteConfig = {
  /**
   * The deployed base URL of your website (e.g. GitHub Pages or custom domain).
   * Example: 'https://username.github.io/year-7-mathematics-slideshows'
   * Note: Do not include a trailing slash.
   */
  productionUrl: envUrl ? String(envUrl).trim().replace(/\/+$/, '') : '',

  /**
   * Default fallback used during local testing if productionUrl is unset.
   */
  developmentUrl: 'http://localhost:3000',

  /**
   * Resolve the active base URL for launchers.
   * @param {string} [runtimeOrigin] Optional window.location origin at runtime
   * @returns {{ url: string, isFallback: boolean }}
   */
  resolveBaseUrl(runtimeOrigin = '') {
    if (this.productionUrl) {
      return { url: this.productionUrl, isFallback: false };
    }
    if (runtimeOrigin && runtimeOrigin.trim()) {
      return { url: runtimeOrigin.trim().replace(/\/+$/, ''), isFallback: false };
    }
    return { url: this.developmentUrl, isFallback: true };
  }
};

export default siteConfig;
