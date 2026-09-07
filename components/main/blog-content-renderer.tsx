"use client";

import { useMemo, useEffect, useRef } from "react";
import hljs from "highlight.js";
import { cn } from "@/src/app/lib/utils";

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

const DISPLAY_LANG_MAP: Record<string, string> = {
  javascript: "JAVASCRIPT",
  js: "JAVASCRIPT",
  jsx: "JAVASCRIPT",
  mjs: "JAVASCRIPT",
  typescript: "TYPESCRIPT",
  ts: "TYPESCRIPT",
  tsx: "TYPESCRIPT",
  python: "PYTHON",
  py: "PYTHON",
  bash: "BASH",
  sh: "BASH",
  shell: "BASH",
  zsh: "BASH",
  html: "HTML",
  htm: "HTML",
  xml: "HTML/XML",
  css: "CSS",
  scss: "SCSS",
  sass: "SASS",
  json: "JSON",
  sql: "SQL",
  mysql: "SQL",
  pgsql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  markdown: "MARKDOWN",
  md: "MARKDOWN",
  cpp: "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  go: "GO",
  golang: "GO",
  rust: "RUST",
  rs: "RUST",
  java: "JAVA",
  kotlin: "KOTLIN",
  kt: "KOTLIN",
  dart: "DART",
  php: "PHP",
  docker: "DOCKER",
  dockerfile: "DOCKER",
  text: "TEXT",
  txt: "TEXT",
  plaintext: "TEXT",
};

/**
 * Intelligent Language Detector:
 * 1. Checks explicit class/attribute (e.g. language-js, data-language)
 * 2. Checks for folder tree / directory structure heuristics -> TEXT
 * 3. Checks first-line Shebang / comments (e.g. #!/bin/bash, // ts)
 * 4. Checks typical keyword heuristics (import, const, def, class, etc.)
 * 5. Uses highlight.js auto-detection with high confidence threshold
 */
function resolveCodeLanguage(plainCode: string, explicitLangAttr: string): { langKey: string; displayName: string } {
  const cleanAttr = explicitLangAttr.toLowerCase().trim();

  // 1. Explicit language from class or attribute
  if (cleanAttr) {
    const matched = DISPLAY_LANG_MAP[cleanAttr];
    if (matched) {
      const hljsKey =
        cleanAttr === "js" || cleanAttr === "jsx" || cleanAttr === "mjs" ? "javascript"
        : cleanAttr === "ts" || cleanAttr === "tsx" ? "typescript"
        : cleanAttr === "py" ? "python"
        : cleanAttr === "sh" || cleanAttr === "shell" || cleanAttr === "zsh" ? "bash"
        : cleanAttr === "yml" ? "yaml"
        : cleanAttr === "md" ? "markdown"
        : cleanAttr;
      return { langKey: hljsKey, displayName: matched };
    }
  }

  const trimmed = plainCode.trim();

  // 2. Folder tree / file structure or plain text heuristics -> TEXT
  if (
    /^[├│└─\s]+[a-zA-Z0-9_.-]+/.test(trimmed) ||
    trimmed.includes("├──") ||
    trimmed.includes("└──") ||
    trimmed.includes("│   ") ||
    /^(?:src|app|public|components|pages|lib|dist|node_modules|routes|controllers|models)\/[a-zA-Z0-9_.-]*/m.test(trimmed)
  ) {
    return { langKey: "text", displayName: "TEXT" };
  }

  // 3. Shebang check
  if (trimmed.startsWith("#!/bin/bash") || trimmed.startsWith("#!/bin/sh") || trimmed.startsWith("#!/usr/bin/env bash")) {
    return { langKey: "bash", displayName: "BASH" };
  }
  if (trimmed.startsWith("#!/usr/bin/env python") || trimmed.startsWith("#!/usr/bin/python")) {
    return { langKey: "python", displayName: "PYTHON" };
  }
  if (trimmed.startsWith("#!/usr/bin/env node")) {
    return { langKey: "javascript", displayName: "JAVASCRIPT" };
  }

  // 4. Heuristic Code Patterns
  // JSON
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return { langKey: "json", displayName: "JSON" };
    } catch {}
  }

  // HTML / XML
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html\b/i.test(trimmed) || (/^<[a-zA-Z][^>]*>/m.test(trimmed) && /<\/[a-zA-Z][^>]*>$/m.test(trimmed))) {
    return { langKey: "html", displayName: "HTML" };
  }

  // SQL
  if (/^(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
    return { langKey: "sql", displayName: "SQL" };
  }

  // Bash / CLI
  if (/^(?:npm\s+(?:i|install|run|test|build)|pnpm\s+|yarn\s+|npx\s+|git\s+|docker\s+|docker-compose\s+|curl\s+|cd\s+|mkdir\s+|sudo\s+)/m.test(trimmed)) {
    return { langKey: "bash", displayName: "BASH" };
  }

  // TypeScript / JavaScript
  if (
    /\b(?:import\s+[\s\S]*?from\s+['"]|export\s+(?:default|const|function|class|interface|type)|const\s+[a-zA-Z0-9_$]+\s*=|let\s+[a-zA-Z0-9_$]+\s*=|var\s+[a-zA-Z0-9_$]+\s*=|useState|useEffect|useMemo|useCallback|console\.log)\b/.test(trimmed)
  ) {
    if (
      /\b(?:interface\s+[a-zA-Z0-9_$]+|type\s+[a-zA-Z0-9_$]+\s*=|enum\s+[a-zA-Z0-9_$]+|import\s+type\b|export\s+type\b|as\s+(?:const|string|number|boolean|any|unknown|never|[a-zA-Z0-9_$]+)|satisfies\b|readonly\s+[a-zA-Z0-9_$]+|declare\s+(?:module|const|function|class)|namespace\s+[a-zA-Z0-9_$]+|:\s*(?:string|number|boolean|any|void|unknown|never|ReactNode|Record<|Promise<|Array<|[a-zA-Z0-9_$]+\[\]|[A-Z][a-zA-Z0-9_]*))\b/.test(trimmed)
    ) {
      return { langKey: "typescript", displayName: "TYPESCRIPT" };
    }
    return { langKey: "javascript", displayName: "JAVASCRIPT" };
  }

  // Python
  if (/\b(?:def\s+[a-zA-Z0-9_]+\s*\(|class\s+[a-zA-Z0-9_]+(?:\([a-zA-Z0-9_]+\))?:|import\s+[a-zA-Z0-9_]+|from\s+[a-zA-Z0-9_]+\s+import|if\s+__name__\s*==\s*['"]__main__['"])/.test(trimmed)) {
    return { langKey: "python", displayName: "PYTHON" };
  }

  // 5. Try Highlight.js auto detection with confidence filtering
  try {
    const autoRes = hljs.highlightAuto(trimmed);
    const autoLang = autoRes.language ? autoRes.language.toLowerCase() : "";
    if (autoRes.relevance >= 5 && autoLang && hljs.getLanguage(autoLang)) {
      const mapped = DISPLAY_LANG_MAP[autoLang] || autoLang.toUpperCase();
      const ignoredGuesses = ["ini", "dust", "accesslog", "avrasm", "rib", "armasm", "cos", "ebnf", "gcode", "gams", "clean"];
      if (!ignoredGuesses.includes(autoLang)) {
        return { langKey: autoLang, displayName: mapped };
      }
    }
  } catch {}

  // Fallback to TEXT
  return { langKey: "text", displayName: "TEXT" };
}

/**
 * Pre-processes HTML string to transform code blocks (<pre>) and YouTube embeds
 * into rich, modern UI components with syntax highlighting, language badges, and copy buttons.
 */
function enhanceBlogHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  // 1. Transform Code Blocks (<pre...><code...>...</code></pre> or <pre...>...</pre>)
  let processed = rawHtml.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (_match, preAttrs, innerContent) => {
    let codeAttrs = "";
    let codeText = innerContent;
    const codeMatch = innerContent.match(/^<code([^>]*)>([\s\S]*?)<\/code>$/i);
    if (codeMatch) {
      codeAttrs = codeMatch[1];
      codeText = codeMatch[2];
    }

    // Extract raw plain code by decoding entities & removing any inner html tags
    const rawPlainCode = decodeHtmlEntities(codeText.replace(/<br\s*[\/]?>/gi, "\n").replace(/<[^>]*>/g, ""));
    // Clean trailing newlines to prevent double bottom gap
    const plainCode = rawPlainCode.replace(/[\r\n]+$/, "");

    // Extract language from attributes
    const allAttrs = `${preAttrs} ${codeAttrs}`;
    const langMatch = allAttrs.match(/(?:language-|lang-|data-language=)["']?([a-zA-Z0-9_-]+)/i);
    const explicitLang = langMatch ? langMatch[1].toLowerCase() : "";

    const { langKey, displayName } = resolveCodeLanguage(plainCode, explicitLang);

    let highlightedHtml = "";

    try {
      if (langKey !== "text" && hljs.getLanguage(langKey)) {
        const res = hljs.highlight(plainCode, { language: langKey, ignoreIllegals: true });
        highlightedHtml = res.value;
      } else {
        highlightedHtml = plainCode
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
    } catch {
      highlightedHtml = plainCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const encodedCode = encodeURIComponent(plainCode);

    return `
      <div class="code-block-container my-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#f5f5f5] dark:bg-[#171717] overflow-hidden select-text">
        <div class="code-block-header flex items-center justify-between px-5 py-2.5 text-xs select-none border-b border-[#e0e0e0] dark:border-white/10 bg-[#ebebeb] dark:bg-[#202024]">
          <span class="code-lang-label font-mono text-xs font-semibold tracking-wider text-neutral-600 dark:text-neutral-400 uppercase">
            ${displayName}
          </span>
          <button type="button" class="code-copy-btn flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer select-none" data-code="${encodedCode}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
        <pre class="px-5 py-4 text-xs sm:text-[13px] font-mono leading-relaxed overflow-x-auto text-neutral-800 dark:text-[#abb2bf] bg-transparent m-0 font-normal"><code class="hljs font-mono leading-relaxed bg-transparent p-0 m-0 border-0">${highlightedHtml}</code></pre>
      </div>
    `;
  });

  // 2. Transform YouTube videos (either data-youtube-video or standalone iframes)
  processed = processed.replace(/<div([^>]*data-youtube-video[^>]*)>([\s\S]*?)<\/div>/gi, (_m, _divAttrs, inner) => {
    const cleanIframe = inner.replace(/<iframe([^>]*)>/gi, (_match: string, attrs: string) => {
      const cleanAttrs = attrs.replace(/\s*(width|height)=["'][^"']*["']/gi, "");
      return `<iframe class="w-full h-full border-0 block" ${cleanAttrs}>`;
    });
    return `<div class="youtube-wrapper w-full aspect-video my-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-black">${cleanIframe}</div>`;
  });

  // 3. Transform Content Images to match Thumbnail / Featured Image style exactly (16:9 aspect-video + object-cover + clean rounded border)
  // Remove standalone wrapping <p> or <figure> if image is the only element
  processed = processed.replace(/<(?:p|figure)\b[^>]*>\s*(<img\b[^>]*\/?>)\s*<\/(?:p|figure)>/gi, (_match, innerImg) => {
    return innerImg.trim();
  });

  // Wrap images in content-image-wrapper with aspect-video & object-cover
  processed = processed.replace(/<img\b([^>]*)\/?>/gi, (_match, attrs) => {
    const cleanAttrs = attrs
      .replace(/\s*class=["'][^"']*["']/gi, "")
      .replace(/\s*style=["'][^"']*["']/gi, "");
    return `<div class="content-image-wrapper relative w-full aspect-video my-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900"><img ${cleanAttrs.trim()} class="w-full h-full object-cover block" /></div>`;
  });

  // 4. Transform Tables into a horizontally scrollable container with rounded border and scrollbar-custom
  processed = processed.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, (_match, tableAttrs, innerContent) => {
    return `<div class="table-wrapper my-6 w-full overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10 scrollbar-custom bg-white dark:bg-[#121214]"><table ${tableAttrs} class="w-full min-w-[540px] text-left border-collapse">${innerContent}</table></div>`;
  });

  return processed;
}

const contentAndSyntaxStyles = `
  /* =======================================================
     1. Syntax Highlighting Theme (Adaptive Light & Dark)
     ======================================================= */
  /* Dark Mode Syntax (One Dark) */
  .dark .blog-content .hljs {
    color: #abb2bf;
    background: transparent;
  }
  .dark .blog-content .hljs-comment,
  .dark .blog-content .hljs-quote {
    color: #5c6370;
    font-style: italic;
  }
  .dark .blog-content .hljs-doctag,
  .dark .blog-content .hljs-keyword,
  .dark .blog-content .hljs-formula {
    color: #c678dd;
    font-weight: 600;
  }
  .dark .blog-content .hljs-section,
  .dark .blog-content .hljs-name,
  .dark .blog-content .hljs-selector-tag,
  .dark .blog-content .hljs-deletion,
  .dark .blog-content .hljs-subst {
    color: #e06c75;
    font-weight: 600;
  }
  .dark .blog-content .hljs-literal {
    color: #56b6c2;
  }
  .dark .blog-content .hljs-string,
  .dark .blog-content .hljs-regexp,
  .dark .blog-content .hljs-addition,
  .dark .blog-content .hljs-attribute,
  .dark .blog-content .hljs-meta .hljs-string {
    color: #98c379;
  }
  .dark .blog-content .hljs-attr,
  .dark .blog-content .hljs-variable,
  .dark .blog-content .hljs-template-variable,
  .dark .blog-content .hljs-type,
  .dark .blog-content .hljs-selector-class,
  .dark .blog-content .hljs-selector-attr,
  .dark .blog-content .hljs-selector-pseudo,
  .dark .blog-content .hljs-number {
    color: #d19a66;
  }
  .dark .blog-content .hljs-symbol,
  .dark .blog-content .hljs-bullet,
  .dark .blog-content .hljs-link,
  .dark .blog-content .hljs-meta,
  .dark .blog-content .hljs-selector-id,
  .dark .blog-content .hljs-title {
    color: #61afef;
  }
  .dark .blog-content .hljs-built_in,
  .dark .blog-content .hljs-title.class_,
  .dark .blog-content .hljs-class .hljs-title {
    color: #e5c07b;
  }

  /* Light Mode Syntax (One Light / GitHub Light) */
  .blog-content .hljs {
    color: #24292f;
    background: transparent;
  }
  .blog-content .hljs-comment,
  .blog-content .hljs-quote {
    color: #6e7781;
    font-style: italic;
  }
  .blog-content .hljs-doctag,
  .blog-content .hljs-keyword,
  .blog-content .hljs-formula {
    color: #cf222e;
    font-weight: 600;
  }
  .blog-content .hljs-section,
  .blog-content .hljs-name,
  .blog-content .hljs-selector-tag,
  .blog-content .hljs-deletion,
  .blog-content .hljs-subst {
    color: #953800;
    font-weight: 600;
  }
  .blog-content .hljs-literal {
    color: #0550ae;
  }
  .blog-content .hljs-string,
  .blog-content .hljs-regexp,
  .blog-content .hljs-addition,
  .blog-content .hljs-attribute,
  .blog-content .hljs-meta .hljs-string {
    color: #116329;
  }
  .blog-content .hljs-attr,
  .blog-content .hljs-variable,
  .blog-content .hljs-template-variable,
  .blog-content .hljs-type,
  .blog-content .hljs-selector-class,
  .blog-content .hljs-selector-attr,
  .blog-content .hljs-selector-pseudo,
  .blog-content .hljs-number {
    color: #953800;
  }
  .blog-content .hljs-symbol,
  .blog-content .hljs-bullet,
  .blog-content .hljs-link,
  .blog-content .hljs-meta,
  .blog-content .hljs-selector-id,
  .blog-content .hljs-title {
    color: #8250df;
  }
  .blog-content .hljs-built_in,
  .blog-content .hljs-title.class_,
  .blog-content .hljs-class .hljs-title {
    color: #0550ae;
  }
  .blog-content .hljs-emphasis {
    font-style: italic;
  }
  .blog-content .hljs-strong {
    font-weight: bold;
  }

  /* =======================================================
     2. Comprehensive Light & Dark Mode Content Styling
     ======================================================= */
  .blog-content {
    color: #525252;
    text-align: left;
  }
  .dark .blog-content {
    color: #a3a3a3;
  }

  /* Paragraphs */
  .blog-content p {
    font-size: 0.875rem;
    line-height: 1.625;
    font-weight: 400;
    color: #737373;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .dark .blog-content p {
    color: #a3a3a3;
  }

  /* Headings */
  .blog-content h1,
  .blog-content h2,
  .blog-content h3,
  .blog-content h4,
  .blog-content h5,
  .blog-content h6 {
    color: #171717;
    font-weight: 600;
    line-height: 1.3;
    scroll-margin-top: 5rem;
  }
  .dark .blog-content h1,
  .dark .blog-content h2,
  .dark .blog-content h3,
  .dark .blog-content h4,
  .dark .blog-content h5,
  .dark .blog-content h6 {
    color: #ffffff;
  }

  .blog-content h1 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }
  .blog-content h2 {
    font-size: 1.125rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }
  .blog-content h3 {
    font-size: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 0.625rem;
  }
  .blog-content h4 {
    font-size: 0.875rem;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  /* Strong / Bold Text */
  .blog-content strong,
  .blog-content b {
    font-weight: 600;
    color: #262626;
  }
  .dark .blog-content strong,
  .dark .blog-content b {
    color: #e5e5e5;
  }

  /* Links */
  .blog-content a {
    color: #171717;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .dark .blog-content a {
    color: #ffffff;
  }

  /* Lists (Unordered) */
  .blog-content ul {
    list-style: none;
    padding-left: 0.25rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .blog-content ul > li {
    position: relative;
    padding-left: 1rem;
    font-size: 0.875rem;
    color: #737373;
    line-height: 1.625;
    margin-top: 0.625rem;
    margin-bottom: 0.625rem;
  }
  .dark .blog-content ul > li {
    color: #a3a3a3;
  }
  .blog-content ul > li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 7.5px;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background-color: #262626;
  }
  .dark .blog-content ul > li::before {
    background-color: #e5e5e5;
  }

  /* Lists (Ordered) */
  .blog-content ol {
    list-style-type: decimal;
    padding-left: 1.25rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .blog-content ol > li {
    font-size: 0.875rem;
    color: #737373;
    line-height: 1.625;
    margin-top: 0.625rem;
    margin-bottom: 0.625rem;
  }
  .dark .blog-content ol > li {
    color: #a3a3a3;
  }
  .blog-content ol > li::marker {
    font-weight: 600;
    color: #262626;
  }
  .dark .blog-content ol > li::marker {
    color: #e5e5e5;
  }

  /* Blockquote / Callout */
  .blog-content blockquote {
    border-left: 3px solid #171717;
    background-color: #f5f5f5;
    padding: 0.75rem 1rem;
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    border-radius: 0 0.75rem 0.75rem 0;
    font-style: normal;
    font-size: 0.875rem;
    color: #404040;
    line-height: 1.625;
  }
  .dark .blog-content blockquote {
    border-left-color: #ffffff;
    background-color: #171717;
    color: #d4d4d4;
  }
  .blog-content blockquote p {
    margin: 0;
    color: inherit;
    font-size: inherit;
  }
  .dark .blog-content blockquote p {
    color: inherit;
  }

  /* =======================================================
     Tables (Zebra Striping, Full Borders, Custom Scrollbar)
     ======================================================= */
  .blog-content .table-wrapper {
    width: 100%;
    margin-top: 1.75rem;
    margin-bottom: 1.75rem;
    border-radius: 1rem;
    overflow-x: auto;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    -webkit-overflow-scrolling: touch;
  }
  .dark .blog-content .table-wrapper {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #121214;
  }

  .blog-content table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 0.875rem;
    line-height: 1.65;
    margin: 0;
  }

  /* Table Header (th) - Pure Monochrome */
  .blog-content thead,
  .blog-content thead tr,
  .blog-content tr:has(th) {
    background-color: #eaeaea !important;
  }
  .dark .blog-content thead,
  .dark .blog-content thead tr,
  .dark .blog-content tr:has(th) {
    background-color: #27272a !important;
  }

  .blog-content th,
  .blog-content thead td {
    background-color: #eaeaea !important;
    color: #171717 !important;
    padding: 0.875rem 1.25rem !important;
    text-align: left;
    font-weight: 700 !important;
    font-size: 0.875rem !important;
    border-bottom: 1px solid #d4d4d4 !important;
    border-right: 1px solid #d4d4d4 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    white-space: nowrap;
    vertical-align: middle;
  }
  .dark .blog-content th,
  .dark .blog-content thead td {
    background-color: #27272a !important;
    color: #ffffff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
  .blog-content th:last-child,
  .blog-content thead td:last-child {
    border-right: none !important;
  }

  /* Reset inner paragraph inside header th */
  .blog-content th p,
  .blog-content thead td p,
  .blog-content th strong,
  .blog-content thead td strong {
    margin: 0 !important;
    padding: 0 !important;
    color: #171717 !important;
    font-weight: 700 !important;
    font-size: 0.875rem !important;
    line-height: 1.4 !important;
    text-transform: none !important;
  }
  .dark .blog-content th p,
  .dark .blog-content thead td p,
  .dark .blog-content th strong,
  .dark .blog-content thead td strong {
    color: #ffffff !important;
  }

  /* Zebra striping on body rows - Pure Monochrome */
  .blog-content tbody tr:nth-child(odd),
  .blog-content tr:not(:has(th)):nth-child(odd) {
    background-color: #ffffff !important;
  }
  .dark .blog-content tbody tr:nth-child(odd),
  .dark .blog-content tr:not(:has(th)):nth-child(odd) {
    background-color: #121214 !important;
  }

  .blog-content tbody tr:nth-child(even),
  .blog-content tr:not(:has(th)):nth-child(even) {
    background-color: #f5f5f5 !important;
  }
  .dark .blog-content tbody tr:nth-child(even),
  .dark .blog-content tr:not(:has(th)):nth-child(even) {
    background-color: #18181b !important;
  }

  /* Table Body Cells (td) */
  .blog-content td {
    padding: 1rem 1.25rem !important;
    border-bottom: 1px solid #e5e5e5 !important;
    border-right: 1px solid #e5e5e5 !important;
    color: #525252 !important;
    font-size: 0.875rem !important;
    line-height: 1.65 !important;
    vertical-align: top;
  }
  .dark .blog-content td {
    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
    border-right-color: rgba(255, 255, 255, 0.08) !important;
    color: #a3a3a3 !important;
  }
  .blog-content td:last-child {
    border-right: none !important;
  }

  .blog-content tbody tr:last-child td,
  .blog-content tr:not(:has(th)):last-child td {
    border-bottom: none !important;
  }

  /* Paragraphs and line spacing inside td (Jarak enter) */
  .blog-content td p {
    margin-top: 0 !important;
    margin-bottom: 0.5rem !important;
    color: inherit !important;
    font-size: 0.875rem !important;
    line-height: 1.65 !important;
  }
  .blog-content td p:last-child {
    margin-bottom: 0 !important;
  }

  .blog-content td strong,
  .blog-content td b {
    color: #171717 !important;
    font-weight: 600 !important;
  }
  .dark .blog-content td strong,
  .dark .blog-content td b {
    color: #ffffff !important;
  }

  /* Inline Code (Pill badge matching user mockup) */
  .blog-content code:not(pre code) {
    background-color: #f0f0f2;
    color: #171717;
    padding: 0.15rem 0.45rem;
    border-radius: 0.375rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid #e2e2e5;
    white-space: nowrap;
    display: inline-block;
    vertical-align: baseline;
    line-height: 1.4;
  }
  .dark .blog-content code:not(pre code) {
    background-color: #242428;
    color: #f4f4f5;
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* Images and Image Wrapper (matching Thumbnail / Featured Image style exactly with hover scale up) */
  .blog-content .content-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    background-color: #fafafa;
  }
  .dark .blog-content .content-image-wrapper {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #171717;
  }
  .blog-content .content-image-wrapper img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    display: block !important;
    transition: transform 0.5s ease-out !important;
  }
  .blog-content .content-image-wrapper:hover img,
  .blog-content .content-image-wrapper img:hover {
    transform: scale(1.05);
  }
  .blog-content img:not(.content-image-wrapper img) {
    border-radius: 1rem;
    max-width: 100%;
    height: auto;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e5e5e5;
    overflow: hidden;
    display: block;
    transition: transform 0.5s ease-out !important;
  }
  .blog-content img:not(.content-image-wrapper img):hover {
    transform: scale(1.05);
  }
  .dark .blog-content img:not(.content-image-wrapper img) {
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Horizontal Rule */
  .blog-content hr {
    border: 0;
    border-top: 1px solid #e5e5e5;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  .dark .blog-content hr {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  /* YouTube Embed Container */
  .blog-content .youtube-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    background-color: #000000;
  }
  .dark .blog-content .youtube-wrapper {
    border-color: rgba(255, 255, 255, 0.1);
  }
  .blog-content .youtube-wrapper iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  /* Code Block Container and Pre (Eliminate double layering & ensure single unified card) */
  .blog-content .code-block-container {
    width: 100%;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    background-color: #f5f5f5;
  }
  .dark .blog-content .code-block-container {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #171717;
  }

  .blog-content .code-block-header {
    background-color: #ebebeb;
    border-bottom: 1px solid #e0e0e0;
  }
  .dark .blog-content .code-block-header {
    background-color: #202024;
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .blog-content .code-block-header .code-lang-label {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
  }

  .blog-content .code-block-container pre {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 1rem 1.25rem 1.25rem 1.25rem !important;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8125rem;
    line-height: 1.65;
    color: #171717 !important;
  }
  .dark .blog-content .code-block-container pre {
    color: #abb2bf !important;
  }

  .blog-content .code-block-container pre code {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    font-family: inherit !important;
    font-size: inherit !important;
    color: inherit !important;
  }

  /* Bare Pre Fallback */
  .blog-content pre:not(.code-block-container pre) {
    background-color: #f5f5f5;
    color: #171717;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    border: 1px solid #e5e5e5;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8125rem;
    line-height: 1.65;
    margin: 1.5rem 0;
  }
  .dark .blog-content pre:not(.code-block-container pre) {
    background-color: #171717;
    color: #abb2bf;
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

export function BlogContentRenderer({ content, className }: BlogContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-process HTML content
  const processedContent = useMemo(() => enhanceBlogHtml(content), [content]);

  // Handle Copy button clicks via Event Delegation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const btn = target.closest(".code-copy-btn") as HTMLButtonElement | null;
      if (!btn) return;

      const encodedCode = btn.dataset.code || "";
      const code = decodeURIComponent(encodedCode);

      navigator.clipboard.writeText(code).then(() => {
        const textSpan = btn.querySelector(".copy-text");
        const originalText = textSpan?.textContent || "Copy";
        if (textSpan) textSpan.textContent = "Copied!";

        const svg = btn.querySelector("svg");
        if (svg) {
          svg.outerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
          `;
        }

        setTimeout(() => {
          if (textSpan) textSpan.textContent = originalText;
          const currentSvg = btn.querySelector("svg");
          if (currentSvg) {
            currentSvg.outerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            `;
          }
        }, 2000);
      });
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [processedContent]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: contentAndSyntaxStyles }} />
      <div
        ref={containerRef}
        className={cn("blog-content w-full max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </>
  );
}
