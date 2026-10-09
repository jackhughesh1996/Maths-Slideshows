/**
 * @file generate-launchers.js
 * Build script to generate lightweight HTML launchers for all registered lessons.
 * Writes output files to dist/downloads/ (for production distribution)
 * and public/downloads/ (for local dev server serving).
 * Safely removes obsolete generated launcher files when lessons are removed or renamed.
 */

import fs from 'node:fs';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../site.config.js';
import { lessonCatalog } from '../src/generated/lesson-catalog.js';
import {
  getLauncherFileName,
  generateLauncherHtml,
  LAUNCHER_GENERATOR_IDENTIFIER,
} from '../src/slideshow/launcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Safely clean up obsolete generated launcher files from a target directory.
 * Removes only HTML files whose filenames are not in expectedFileNames AND
 * whose contents contain the exact LAUNCHER_GENERATOR_IDENTIFIER comment.
 * Non-recursive: preserves directories, subdirectories, non-HTML files, and unmarked HTML files.
 *
 * @param {string} dirPath Directory path to inspect (e.g. dist/downloads)
 * @param {Set<string>} expectedFileNames Set of valid launcher filenames
 * @returns {Array<string>} List of removed file paths relative to rootDir
 */
function cleanupObsoleteLaunchers(dirPath, expectedFileNames) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const removedFiles = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    // Only inspect top-level files (non-recursive)
    if (!entry.isFile()) {
      continue;
    }

    const fileName = entry.name;
    // Condition 1: Must be an HTML file
    if (!fileName.toLowerCase().endsWith('.html') && !fileName.toLowerCase().endsWith('.htm')) {
      continue;
    }

    // Condition 2: Filename is not among expected filenames
    if (expectedFileNames.has(fileName)) {
      continue;
    }

    const filePath = path.join(dirPath, fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Condition 3: Must contain the exact generator identification comment
      if (!content.includes(LAUNCHER_GENERATOR_IDENTIFIER)) {
        console.log(`  ℹ Preserving unmarked launcher at ${path.relative(rootDir, filePath)}`);
        continue;
      }

      fs.unlinkSync(filePath);
      const relPath = path.relative(rootDir, filePath);
      console.log(`  ✓ Removed obsolete generated launcher: ${relPath}`);
      removedFiles.push(relPath);
    } catch (err) {
      console.warn(`  ⚠ Warning: Could not process file ${fileName} during cleanup:`, err.message);
    }
  }

  return removedFiles;
}

/**
 * Validate the base URL when strict production release mode is requested.
 * Activated when process.env.REQUIRE_PRODUCTION_SITE_URL === '1'.
 *
 * Rejects:
 * - Fallback development URLs
 * - Malformed URLs
 * - Non-HTTPS protocols
 * - Localhost and loopback hostnames
 *
 * @param {string} baseUrl
 * @param {boolean} isFallback
 */
function validateStrictProductionUrl(baseUrl, isFallback) {
  if (process.env.REQUIRE_PRODUCTION_SITE_URL !== '1') {
    return;
  }

  if (isFallback) {
    throw new Error(
      `[Launcher Generator] Strict release mode (REQUIRE_PRODUCTION_SITE_URL=1) requires a configured production SITE_URL, but development fallback was resolved: "${baseUrl}".`
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch (err) {
    throw new Error(
      `[Launcher Generator] Strict release mode (REQUIRE_PRODUCTION_SITE_URL=1) rejected malformed URL: "${baseUrl}". Error: ${err.message}`
    );
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error(
      `[Launcher Generator] Strict release mode (REQUIRE_PRODUCTION_SITE_URL=1) requires an HTTPS URL, but received protocol "${parsedUrl.protocol}": "${baseUrl}".`
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const normalizedHost = hostname.replace(/\.+$/, '');
  const unbracketedHost = (hostname.startsWith('[') && hostname.endsWith(']'))
    ? hostname.slice(1, -1)
    : hostname;

  const isLocalhost = normalizedHost === 'localhost' || normalizedHost.endsWith('.localhost');
  if (isLocalhost) {
    throw new Error(
      `[Launcher Generator] Strict release mode (REQUIRE_PRODUCTION_SITE_URL=1) rejected localhost hostname "${parsedUrl.hostname}": "${baseUrl}".`
    );
  }

  const ipVersion = isIP(unbracketedHost);
  if (ipVersion !== 0) {
    throw new Error(
      `[Launcher Generator] Strict release mode (REQUIRE_PRODUCTION_SITE_URL=1) rejected IP-literal hostname "${parsedUrl.hostname}": "${baseUrl}". Production deployments must use a DNS hostname.`
    );
  }
}

export function generateAllLaunchers() {
  const { url: baseUrl, isFallback } = siteConfig.resolveBaseUrl();

  // Validate strict production release mode before creating, modifying or deleting any files
  validateStrictProductionUrl(baseUrl, isFallback);

  console.log('\n======================================================');
  console.log('   Lesson HTML Launcher Generator');
  console.log('======================================================');

  if (isFallback) {
    console.warn(`[Launcher Generator] Warning: No production SITE_URL configured.`);
    console.warn(`Set SITE_URL environment variable or edit site.config.js for deployed GitHub Pages.`);
    console.warn(`Using development fallback URL: ${baseUrl}\n`);
  } else {
    console.log(`[Launcher Generator] Target production base URL: ${baseUrl}\n`);
  }

  const allLessons = lessonCatalog;
  if (!allLessons || allLessons.length === 0) {
    console.error('[Launcher Generator] Error: No lessons found in catalogue.');
    return [];
  }

  const distDownloadsDir = path.resolve(rootDir, 'dist', 'downloads');
  const publicDownloadsDir = path.resolve(rootDir, 'public', 'downloads');

  // Ensure directories exist
  fs.mkdirSync(distDownloadsDir, { recursive: true });
  fs.mkdirSync(publicDownloadsDir, { recursive: true });

  // Calculate set of expected launcher filenames
  const expectedFileNames = new Set(allLessons.map((lesson) => getLauncherFileName(lesson)));

  const generatedFiles = [];

  for (const lesson of allLessons) {
    const fileName = getLauncherFileName(lesson);
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const targetUrl = new URL(`lessons/${encodeURIComponent(lesson.id)}/`, normalizedBase).href;
    const htmlContent = generateLauncherHtml(lesson, targetUrl);

    const distPath = path.join(distDownloadsDir, fileName);
    const publicPath = path.join(publicDownloadsDir, fileName);

    // Refuse to overwrite manually authored or unmarked files at expected filenames
    for (const targetPath of [distPath, publicPath]) {
      if (fs.existsSync(targetPath)) {
        const existingContent = fs.readFileSync(targetPath, 'utf-8');
        if (!existingContent.includes(LAUNCHER_GENERATOR_IDENTIFIER)) {
          throw new Error(
            `[Launcher Generator] Conflicting manually authored or unmarked file detected at "${path.relative(rootDir, targetPath)}". File does not contain launcher generator identification comment.`
          );
        }
      }
    }

    fs.writeFileSync(distPath, htmlContent, 'utf-8');
    fs.writeFileSync(publicPath, htmlContent, 'utf-8');

    generatedFiles.push({
      lessonId: lesson.id,
      title: lesson.title,
      fileName,
      targetUrl,
      distPath
    });

    console.log(`  ✓ [${lesson.id}] dist/downloads/${fileName} -> ${targetUrl}`);
  }

  // Clean up obsolete generated launchers from both download directories
  const removedDist = cleanupObsoleteLaunchers(distDownloadsDir, expectedFileNames);
  const removedPublic = cleanupObsoleteLaunchers(publicDownloadsDir, expectedFileNames);
  const totalRemoved = removedDist.length + removedPublic.length;

  console.log(`\nSuccessfully generated ${generatedFiles.length} launcher files in dist/downloads/ and public/downloads/.`);
  if (totalRemoved > 0) {
    console.log(`Cleaned up ${totalRemoved} obsolete generated launcher file(s).\n`);
  } else {
    console.log('');
  }

  return generatedFiles;
}

// Execute directly if run as main script
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  try {
    generateAllLaunchers();
  } catch (err) {
    console.error('[Launcher Generator] Fatal error:', err.message || err);
    process.exit(1);
  }
}
