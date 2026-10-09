/**
 * @file generate-launchers.js
 * Build script to generate lightweight HTML launchers for all registered lessons.
 * Writes output files to dist/downloads/ (for production distribution)
 * and public/downloads/ (for local dev server serving).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../site.config.js';
import { getAllLessons } from '../src/lessons/index.js';
import { getLauncherFileName, generateLauncherHtml } from '../src/slideshow/launcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function generateAllLaunchers() {
  const { url: baseUrl, isFallback } = siteConfig.resolveBaseUrl();

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

  const allLessons = getAllLessons();
  if (!allLessons || allLessons.length === 0) {
    console.error('[Launcher Generator] Error: No lessons found in registry.');
    return [];
  }

  const distDownloadsDir = path.resolve(rootDir, 'dist', 'downloads');
  const publicDownloadsDir = path.resolve(rootDir, 'public', 'downloads');

  // Ensure directories exist
  fs.mkdirSync(distDownloadsDir, { recursive: true });
  fs.mkdirSync(publicDownloadsDir, { recursive: true });

  const generatedFiles = [];

  for (const lesson of allLessons) {
    const fileName = getLauncherFileName(lesson);
    const targetUrl = `${baseUrl}/?lesson=${encodeURIComponent(lesson.id)}`;
    const htmlContent = generateLauncherHtml(lesson, targetUrl);

    const distPath = path.join(distDownloadsDir, fileName);
    const publicPath = path.join(publicDownloadsDir, fileName);

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

  console.log(`\nSuccessfully generated ${generatedFiles.length} launcher files in dist/downloads/ and public/downloads/.\n`);
  return generatedFiles;
}

// Execute directly if run as main script
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  try {
    generateAllLaunchers();
  } catch (err) {
    console.error('[Launcher Generator] Fatal error:', err);
    process.exit(1);
  }
}
