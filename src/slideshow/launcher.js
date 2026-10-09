/**
 * @file launcher.js
 * Shared HTML launcher generator and filename resolver.
 * Used by build-time generation scripts and teacher-facing library download buttons.
 * 
 * Strict architectural rule:
 * Launchers are lightweight entry points (~1 KB) that redirect to the hosted lesson.
 * They NEVER duplicate the slideshow engine, KaTeX, or styling system.
 */

/**
 * Generate a safe, descriptive filename for a lesson launcher.
 * e.g. "8E" and "Stem-and-Leaf Plots" -> "8E-stem-and-leaf-plots.html"
 * @param {Object} lesson
 * @returns {string}
 */
export function getLauncherFileName(lesson) {
  const code = String(lesson?.id || 'lesson').trim();
  const slug = String(lesson?.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${code}${slug ? '-' + slug : ''}.html`;
}

/**
 * Generate lightweight launcher HTML content for a lesson.
 * 
 * @param {Object} lesson
 * @param {string} targetUrl Full target URL including ?lesson= parameter
 * @returns {string}
 */
export function generateLauncherHtml(lesson, targetUrl) {
  const lessonCode = String(lesson?.id || '').trim();
  const lessonTitle = String(lesson?.title || '').trim();
  const subject = lesson?.subject || 'Mathematics';
  const yearLevel = lesson?.yearLevel !== undefined
    ? (typeof lesson.yearLevel === 'number' ? `Year ${lesson.yearLevel}` : lesson.yearLevel)
    : 'Year 7';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${lessonCode} — ${lessonTitle} | ${yearLevel} ${subject}</title>
    <meta http-equiv="refresh" content="0; url=${targetUrl}" />
    <style>
      :root {
        --bg: #fbfbf9;
        --card: #ffffff;
        --text: #18181b;
        --muted: #71717a;
        --border: #d4d4d8;
        --primary: #1e3a8a;
        --primary-hover: #172554;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: var(--bg);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
        line-height: 1.5;
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        padding: 32px 28px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        text-align: center;
      }
      .badge {
        display: inline-block;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 700;
        font-size: 0.85rem;
        background: #eff6ff;
        color: var(--primary);
        border: 1px solid #bfdbfe;
        padding: 3px 10px;
        border-radius: 4px;
        margin-bottom: 16px;
      }
      h1 {
        font-size: 1.35rem;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text);
        line-height: 1.3;
      }
      p {
        font-size: 0.95rem;
        color: var(--muted);
        margin-bottom: 22px;
      }
      .btn {
        display: inline-block;
        background: var(--primary);
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 10px 22px;
        border-radius: 8px;
        transition: background 0.15s ease;
      }
      .btn:hover {
        background: var(--primary-hover);
      }
      .subtext {
        margin-top: 20px;
        margin-bottom: 0;
        font-size: 0.8rem;
        color: var(--muted);
      }
    </style>
    <script>
      // Immediate client-side redirection
      window.location.replace("${targetUrl}");
    </script>
  </head>
  <body>
    <div class="card">
      <span class="badge">${lessonCode} · ${yearLevel} ${subject}</span>
      <h1>Opening ${lessonCode} — ${lessonTitle}…</h1>
      <p>If the lesson does not open automatically, <a href="${targetUrl}" style="color: var(--primary); font-weight: 600;">click here</a>.</p>
      <a href="${targetUrl}" class="btn">Open Lesson Now ▶</a>
      <p class="subtext">${yearLevel} ${subject} Classroom Slideshows</p>
    </div>
  </body>
</html>
`;
}
