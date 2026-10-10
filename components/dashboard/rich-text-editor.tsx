"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image as ImageIcon,
  Terminal,
  Grid3X3,
  Rows,
  Columns,
  Trash2,
  Video as YoutubeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RemoveFormatting,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/src/app/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/language-context";

/**
 * List of supported programming languages in CodeBlock
 */
export const CODE_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "php", label: "PHP" },
  { value: "docker", label: "Docker" },
  { value: "plaintext", label: "TEXT" },
] as const;

/**
 * Custom CodeBlock NodeView Component
 * Renders an independent header + custom Radix language dropdown for EACH code block in the content.
 */
function CustomCodeBlockNodeView({ node, updateAttributes }: any) {
  const currentLang = (node.attrs.language || "typescript").toLowerCase();
  const matched = CODE_LANGUAGES.find((l) => l.value === currentLang);
  const displayLabel = matched ? matched.label.toUpperCase() : currentLang.toUpperCase();

  return (
    <NodeViewWrapper className="code-block-container my-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#f5f5f5] dark:bg-[#171717] overflow-hidden select-text">
      <div
        className="code-block-header flex items-center justify-between px-5 py-2.5 border-b border-[#e0e0e0] dark:border-white/10 bg-[#ebebeb] dark:bg-[#202024] select-none"
        contentEditable={false}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="code-lang-btn flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white uppercase transition-colors focus:outline-none cursor-pointer"
            >
              <span>{displayLabel}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto scrollbar-custom min-w-44 z-70">
            <DropdownMenuLabel className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">
              Select Language
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {CODE_LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.value}
                onClick={() => updateAttributes({ language: l.value })}
                className={cn(
                  "flex items-center justify-between text-xs cursor-pointer font-mono py-1.5",
                  currentLang === l.value && "bg-neutral-100 dark:bg-neutral-800 font-bold"
                )}
              >
                <span>{l.label}</span>
                {currentLang === l.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="font-mono text-[10px] font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
          CODE BLOCK
        </span>
      </div>
      <pre className="px-5 py-4 text-xs sm:text-[13px] font-mono leading-relaxed overflow-x-auto text-neutral-800 dark:text-[#abb2bf] bg-transparent m-0 border-0">
        <NodeViewContent as={"code" as any} className={cn("hljs font-mono leading-relaxed bg-transparent p-0 m-0 border-0", `language-${currentLang}`)} />
      </pre>
    </NodeViewWrapper>
  );
}

/**
 * Custom CSS for syntax highlighting and full typography synchronization
 * matching blog-content-renderer.tsx exactly.
 */
const editorStyles = `
  /* =======================================================
     1. Syntax Highlighting Theme (Adaptive Light & Dark)
     ======================================================= */
  /* Dark Mode Syntax (One Dark) */
  .dark .tiptap .hljs {
    color: #abb2bf;
    background: transparent;
  }
  .dark .tiptap .hljs-comment,
  .dark .tiptap .hljs-quote {
    color: #5c6370;
    font-style: italic;
  }
  .dark .tiptap .hljs-doctag,
  .dark .tiptap .hljs-keyword,
  .dark .tiptap .hljs-formula {
    color: #c678dd;
    font-weight: 600;
  }
  .dark .tiptap .hljs-section,
  .dark .tiptap .hljs-name,
  .dark .tiptap .hljs-selector-tag,
  .dark .tiptap .hljs-deletion,
  .dark .tiptap .hljs-subst {
    color: #e06c75;
    font-weight: 600;
  }
  .dark .tiptap .hljs-literal {
    color: #56b6c2;
  }
  .dark .tiptap .hljs-string,
  .dark .tiptap .hljs-regexp,
  .dark .tiptap .hljs-addition,
  .dark .tiptap .hljs-attribute,
  .dark .tiptap .hljs-meta .hljs-string {
    color: #98c379;
  }
  .dark .tiptap .hljs-attr,
  .dark .tiptap .hljs-variable,
  .dark .tiptap .hljs-template-variable,
  .dark .tiptap .hljs-type,
  .dark .tiptap .hljs-selector-class,
  .dark .tiptap .hljs-selector-attr,
  .dark .tiptap .hljs-selector-pseudo,
  .dark .tiptap .hljs-number {
    color: #d19a66;
  }
  .dark .tiptap .hljs-symbol,
  .dark .tiptap .hljs-bullet,
  .dark .tiptap .hljs-link,
  .dark .tiptap .hljs-meta,
  .dark .tiptap .hljs-selector-id,
  .dark .tiptap .hljs-title {
    color: #61afef;
  }
  .dark .tiptap .hljs-built_in,
  .dark .tiptap .hljs-title.class_,
  .dark .tiptap .hljs-class .hljs-title {
    color: #e5c07b;
  }

  /* Light Mode Syntax (One Light / GitHub Light) */
  .tiptap .hljs {
    color: #24292f;
    background: transparent;
  }
  .tiptap .hljs-comment,
  .tiptap .hljs-quote {
    color: #6e7781;
    font-style: italic;
  }
  .tiptap .hljs-doctag,
  .tiptap .hljs-keyword,
  .tiptap .hljs-formula {
    color: #cf222e;
    font-weight: 600;
  }
  .tiptap .hljs-section,
  .tiptap .hljs-name,
  .tiptap .hljs-selector-tag,
  .tiptap .hljs-deletion,
  .tiptap .hljs-subst {
    color: #953800;
    font-weight: 600;
  }
  .tiptap .hljs-literal {
    color: #0550ae;
  }
  .tiptap .hljs-string,
  .tiptap .hljs-regexp,
  .tiptap .hljs-addition,
  .tiptap .hljs-attribute,
  .tiptap .hljs-meta .hljs-string {
    color: #116329;
  }
  .tiptap .hljs-attr,
  .tiptap .hljs-variable,
  .tiptap .hljs-template-variable,
  .tiptap .hljs-type,
  .tiptap .hljs-selector-class,
  .tiptap .hljs-selector-attr,
  .tiptap .hljs-selector-pseudo,
  .tiptap .hljs-number {
    color: #953800;
  }
  .tiptap .hljs-symbol,
  .tiptap .hljs-bullet,
  .tiptap .hljs-link,
  .tiptap .hljs-meta,
  .tiptap .hljs-selector-id,
  .tiptap .hljs-title {
    color: #8250df;
  }
  .tiptap .hljs-built_in,
  .tiptap .hljs-title.class_,
  .tiptap .hljs-class .hljs-title {
    color: #0550ae;
  }
  .tiptap .hljs-emphasis {
    font-style: italic;
  }
  .tiptap .hljs-strong {
    font-weight: bold;
  }

  /* =======================================================
     2. Editor Typography & Spacing (Exact Sync with Public View)
     ======================================================= */
  .tiptap {
    color: #525252;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.625;
  }
  .dark .tiptap {
    color: #a3a3a3;
  }

  /* Eliminate initial top margin on first element inside editor */
  .tiptap > *:first-child,
  .tiptap h1:first-child,
  .tiptap h2:first-child,
  .tiptap h3:first-child,
  .tiptap p:first-child,
  .tiptap ul:first-child,
  .tiptap ol:first-child,
  .tiptap blockquote:first-child,
  .tiptap pre:first-child,
  .tiptap .code-block-container:first-child,
  .tiptap .tableWrapper:first-child,
  .tiptap div:first-child {
    margin-top: 0 !important;
  }

  /* TipTap Placeholder - ONLY shown on the first paragraph when the entire editor is empty */
  .tiptap.is-editor-empty > p:first-child::before,
  .tiptap.is-editor-empty > p.is-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #a3a3a3;
    pointer-events: none;
    height: 0;
  }
  .dark .tiptap.is-editor-empty > p:first-child::before,
  .dark .tiptap.is-editor-empty > p.is-empty:first-child::before {
    color: #737373;
  }

  /* Paragraphs */
  .tiptap p {
    font-size: 0.875rem;
    line-height: 1.625;
    font-weight: 400;
    color: #737373;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .dark .tiptap p {
    color: #a3a3a3;
  }
  .tiptap p:last-child {
    margin-bottom: 0;
  }

  /* Headings */
  .tiptap h1,
  .tiptap h2,
  .tiptap h3 {
    color: #171717;
    font-weight: 600;
    line-height: 1.3;
  }
  .dark .tiptap h1,
  .dark .tiptap h2,
  .dark .tiptap h3 {
    color: #ffffff;
  }

  .tiptap h1 {
    font-size: 1.5rem;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
  }
  .tiptap h2 {
    font-size: 1.125rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .tiptap h3 {
    font-size: 1rem;
    margin-top: 1.25rem;
    margin-bottom: 0.625rem;
  }

  /* Strong / Bold */
  .tiptap strong,
  .tiptap b {
    font-weight: 600;
    color: #262626;
  }
  .dark .tiptap strong,
  .dark .tiptap b {
    color: #e5e5e5;
  }

  /* Links */
  .tiptap a {
    color: #171717;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .dark .tiptap a {
    color: #ffffff;
  }

  /* Lists (Unordered) */
  .tiptap ul {
    list-style: none;
    padding-left: 0.25rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .tiptap ul > li {
    position: relative;
    padding-left: 1rem;
    font-size: 0.875rem;
    color: #737373;
    line-height: 1.625;
    margin-top: 0.625rem;
    margin-bottom: 0.625rem;
  }
  .dark .tiptap ul > li {
    color: #a3a3a3;
  }
  .tiptap ul > li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 7.5px;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background-color: #262626;
  }
  .dark .tiptap ul > li::before {
    background-color: #e5e5e5;
  }

  /* Lists (Ordered) */
  .tiptap ol {
    list-style-type: decimal;
    padding-left: 1.25rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .tiptap ol > li {
    font-size: 0.875rem;
    color: #737373;
    line-height: 1.625;
    margin-top: 0.625rem;
    margin-bottom: 0.625rem;
  }
  .dark .tiptap ol > li {
    color: #a3a3a3;
  }
  .tiptap ol > li::marker {
    font-weight: 600;
    color: #262626;
  }
  .dark .tiptap ol > li::marker {
    color: #e5e5e5;
  }

  /* Blockquote */
  .tiptap blockquote {
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
  .dark .tiptap blockquote {
    border-left-color: #ffffff;
    background-color: #171717;
    color: #d4d4d4;
  }
  .tiptap blockquote p {
    margin: 0;
    color: inherit;
    font-size: inherit;
  }

  /* Inline Code (Pill badge matching user mockup) */
  .tiptap code:not(pre code) {
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
  .dark .tiptap code:not(pre code) {
    background-color: #242428;
    color: #f4f4f5;
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* =======================================================
     3. Code Blocks (Single Unified Card & Transparent Pre)
     ======================================================= */
  .tiptap .code-block-container {
    width: 100%;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    background-color: #f5f5f5;
  }
  .dark .tiptap .code-block-container {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #171717;
  }

  .tiptap .code-block-header {
    background-color: #ebebeb;
    border-bottom: 1px solid #e0e0e0;
  }
  .dark .tiptap .code-block-header {
    background-color: #202024;
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .tiptap .code-block-header .code-lang-btn {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
  }

  .tiptap pre {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 1rem 1.25rem 1.25rem 1.25rem !important;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    font-size: 0.8125rem;
    line-height: 1.65;
    color: #171717 !important;
  }
  .dark .tiptap pre {
    color: #abb2bf !important;
  }

  .tiptap pre code {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    font-family: inherit !important;
    font-size: inherit !important;
    color: inherit !important;
    display: block;
    white-space: pre;
  }

  /* =======================================================
     4. Tables (Zebra Striping, Monochrome, Full Border, Scroll)
     ======================================================= */
  .tiptap .tableWrapper {
    width: 100%;
    margin-top: 1.75rem;
    margin-bottom: 1.75rem;
    border-radius: 1rem;
    overflow-x: auto;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    -webkit-overflow-scrolling: touch;
  }
  .dark .tiptap .tableWrapper {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #121214;
  }

  .tiptap table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 0.875rem;
    line-height: 1.65;
    margin: 0;
  }

  /* Table Header (th) */
  .tiptap thead,
  .tiptap thead tr,
  .tiptap tr:has(th) {
    background-color: #eaeaea !important;
  }
  .dark .tiptap thead,
  .dark .tiptap thead tr,
  .dark .tiptap tr:has(th) {
    background-color: #27272a !important;
  }

  .tiptap th,
  .tiptap thead td {
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
  .dark .tiptap th,
  .dark .tiptap thead td {
    background-color: #27272a !important;
    color: #ffffff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
  .tiptap th:last-child,
  .tiptap thead td:last-child {
    border-right: none !important;
  }

  .tiptap th p,
  .tiptap thead td p {
    margin: 0 !important;
    padding: 0 !important;
    color: #171717 !important;
    font-weight: 700 !important;
    font-size: 0.875rem !important;
    line-height: 1.4 !important;
  }
  .dark .tiptap th p,
  .dark .tiptap thead td p {
    color: #ffffff !important;
  }

  /* Table Body (td) Zebra Striping */
  .tiptap tbody tr:nth-child(odd),
  .tiptap tr:not(:has(th)):nth-child(odd) {
    background-color: #ffffff !important;
  }
  .dark .tiptap tbody tr:nth-child(odd),
  .dark .tiptap tr:not(:has(th)):nth-child(odd) {
    background-color: #121214 !important;
  }

  .tiptap tbody tr:nth-child(even),
  .tiptap tr:not(:has(th)):nth-child(even) {
    background-color: #f5f5f5 !important;
  }
  .dark .tiptap tbody tr:nth-child(even),
  .dark .tiptap tr:not(:has(th)):nth-child(even) {
    background-color: #18181b !important;
  }

  .tiptap td {
    padding: 1rem 1.25rem !important;
    border-bottom: 1px solid #e5e5e5 !important;
    border-right: 1px solid #e5e5e5 !important;
    color: #525252 !important;
    font-size: 0.875rem !important;
    line-height: 1.65 !important;
    vertical-align: top;
  }
  .dark .tiptap td {
    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
    border-right-color: rgba(255, 255, 255, 0.08) !important;
    color: #a3a3a3 !important;
  }
  .tiptap td:last-child {
    border-right: none !important;
  }
  .tiptap tbody tr:last-child td,
  .tiptap tr:not(:has(th)):last-child td {
    border-bottom: none !important;
  }

  .tiptap td p {
    margin-top: 0 !important;
    margin-bottom: 0.5rem !important;
    color: inherit !important;
    font-size: 0.875rem !important;
    line-height: 1.65 !important;
  }
  .tiptap td p:last-child {
    margin-bottom: 0 !important;
  }

  /* YouTube Video Responsiveness */
  .tiptap div[data-youtube-video] {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 1.5rem auto;
    aspect-ratio: 16 / 9;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e5e5e5;
  }
  .dark .tiptap div[data-youtube-video] {
    border-color: rgba(255, 255, 255, 0.1);
  }
  .tiptap div[data-youtube-video] iframe {
    width: 100% !important;
    height: 100% !important;
    border: none;
  }

  /* Images */
  .tiptap img {
    border-radius: 1rem;
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    border: 1px solid #e5e5e5;
  }
  .dark .tiptap img {
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const { t } = useLanguage();
  const activePlaceholder = placeholder || t("common.editor.placeholder");
  const placeholderRef = useRef(activePlaceholder);
  placeholderRef.current = activePlaceholder;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CustomCodeBlockNodeView);
        },
      }).configure({
        lowlight,
        defaultLanguage: "typescript",
      }),
      TiptapLink.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-neutral-900 underline underline-offset-4 dark:text-white",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-2xl border border-neutral-200 dark:border-white/10 max-w-full h-auto my-6",
        },
      }),
      Placeholder.configure({
        placeholder: () => placeholderRef.current,
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "scrollbar-custom",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 480,
        height: 320,
      }),
      CharacterCount,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      transformPastedHTML(html) {
        if (!html) return "";
        return html
          .replace(/<!--[\s\S]*?-->/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<meta[\s\S]*?>/gi, "")
          .replace(/<link[\s\S]*?>/gi, "")
          .replace(/<font\b[^>]*>/gi, "")
          .replace(/<\/font>/gi, "")
          .replace(/\s*style="[^"]*"/gi, "")
          .replace(/\s*class="(?!(?:language-[a-zA-Z0-9_-]+|hljs\b)[^"]*)"[^"]*"/gi, "")
          .replace(/&nbsp;/g, " ");
      },
      attributes: {
        class: cn(
          "tiptap min-h-[300px] px-5 py-3.5 focus:outline-none scrollbar-custom max-w-none"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      queueMicrotask(() => {
        if (!editor.isDestroyed) {
          editor.view.dispatch(editor.state.tr);
        }
      });
    }
  }, [activePlaceholder, editor]);

  // Keep editor content in sync with external content prop changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.isFocused) return;

    if (content !== editor.getHTML()) {
      queueMicrotask(() => {
        if (!editor.isDestroyed && !editor.isFocused) {
          editor.commands.setContent(content || "", { emitUpdate: false });
        }
      });
    }
  }, [content, editor]);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleLinkSubmit = () => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    setIsYoutubeModalOpen(true);
  }, [editor]);

  const handleYoutubeSubmit = () => {
    if (youtubeUrl) {
      editor?.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    }
    setIsYoutubeModalOpen(false);
    setYoutubeUrl("");
  };

  const addImage = useCallback(() => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const loadingToast = toast.loading(t("common.editor.uploading"));
      try {
        const { StorageService } = await import("@/src/services/storage.service");
        const { STORAGE_PATHS } = await import("@/src/lib/constants");

        const result = await StorageService.uploadImage(STORAGE_PATHS.BLOGS, file);
        editor.chain().focus().setImage({ src: result.publicUrl }).run();
        toast.success(t("common.editor.upload_success"), { id: loadingToast });
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error(t("common.editor.upload_failed"), { id: loadingToast });
      }
    };

    input.click();
  }, [editor, t]);

  const handleInsertCodeBlock = (langValue: string = "typescript") => {
    if (!editor) return;
    if (editor.isActive("codeBlock")) {
      editor.chain().focus().updateAttributes("codeBlock", { language: langValue }).run();
    } else {
      editor.chain().focus().toggleCodeBlock({ language: langValue }).run();
    }
  };

  // Table action helpers that ensure editor has focus
  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };
  const addRowBefore = () => {
    if (editor?.isActive("table")) {
      editor.chain().focus().addRowBefore().run();
    } else {
      insertTable();
    }
  };
  const addRowAfter = () => {
    if (editor?.isActive("table")) {
      editor.chain().focus().addRowAfter().run();
    } else {
      insertTable();
    }
  };
  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };
  const addColBefore = () => {
    if (editor?.isActive("table")) {
      editor.chain().focus().addColumnBefore().run();
    } else {
      insertTable();
    }
  };
  const addColAfter = () => {
    if (editor?.isActive("table")) {
      editor.chain().focus().addColumnAfter().run();
    } else {
      insertTable();
    }
  };
  const deleteCol = () => {
    editor?.chain().focus().deleteColumn().run();
  };
  const toggleHeader = () => {
    editor?.chain().focus().toggleHeaderRow().run();
  };
  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  if (!editor) return null;

  const currentCodeLang = editor.isActive("codeBlock")
    ? editor.getAttributes("codeBlock").language || "typescript"
    : "typescript";

  const matchedLang = CODE_LANGUAGES.find((l) => l.value === currentCodeLang.toLowerCase());
  const currentLangLabel = matchedLang ? matchedLang.label : currentCodeLang.toUpperCase();

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
    className,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors",
        active && "bg-neutral-200 text-neutral-900 font-bold dark:bg-white/20 dark:text-white",
        className
      )}
    >
      {children}
    </Button>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#121214] overflow-hidden",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50/80 p-2 dark:border-white/10 dark:bg-[#18181b]/80">
        {/* Heading Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "h-8 px-2.5 text-xs font-bold tracking-tight text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-white/10",
            editor.isActive("heading", { level: 1 }) && "bg-neutral-200 text-neutral-900 dark:bg-white/20 dark:text-white"
          )}
          title={t("common.editor.heading_1")}
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-8 px-2.5 text-xs font-semibold tracking-tight text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-white/10",
            editor.isActive("heading", { level: 2 }) && "bg-neutral-200 text-neutral-900 dark:bg-white/20 dark:text-white"
          )}
          title={t("common.editor.heading_2")}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "h-8 px-2.5 text-xs font-medium tracking-tight text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-white/10",
            editor.isActive("heading", { level: 3 }) && "bg-neutral-200 text-neutral-900 dark:bg-white/20 dark:text-white"
          )}
          title={t("common.editor.heading_3")}
        >
          H3
        </Button>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Basic Formats */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title={t("common.editor.bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("common.editor.italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title={t("common.editor.strikethrough")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        {/* Inline Code (Pill badge format for selected text) */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title={t("common.editor.inline_code")}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Lists & Quotes */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("common.editor.bullet_list")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title={t("common.editor.ordered_list")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title={t("common.editor.blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Code Block with Language Dropdown */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => handleInsertCodeBlock("typescript")}
            active={editor.isActive("codeBlock")}
            title={t("common.editor.code_block")}
            className={cn(editor.isActive("codeBlock") && "rounded-r-none")}
          >
            <Terminal className="h-4 w-4" />
          </ToolbarButton>

          {/* Language Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 gap-1 text-xs font-mono text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/10",
                  editor.isActive("codeBlock") &&
                    "bg-neutral-200 font-semibold text-neutral-900 rounded-l-none border-l border-neutral-300 dark:bg-white/20 dark:text-white dark:border-white/10"
                )}
                title={t("common.editor.language")}
              >
                <span>{editor.isActive("codeBlock") ? currentLangLabel : "Code Lang"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto scrollbar-custom min-w-40 z-70">
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {t("common.editor.language")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CODE_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => handleInsertCodeBlock(lang.value)}
                  className={cn(
                    "flex items-center justify-between text-xs cursor-pointer font-mono",
                    editor.isActive("codeBlock") &&
                      currentCodeLang.toLowerCase() === lang.value &&
                      "bg-neutral-100 dark:bg-neutral-800 font-bold"
                  )}
                >
                  <span>{lang.label}</span>
                  {editor.isActive("codeBlock") && currentCodeLang.toLowerCase() === lang.value && (
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ToolbarButton onClick={addYoutubeVideo} title={t("common.editor.youtube")}>
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title={t("common.editor.align_left")}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title={t("common.editor.align_center")}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title={t("common.editor.align_right")}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title={t("common.editor.justify")}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Table Controls (Always visible in dropdown) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 gap-1.5 text-xs text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-white/10",
                editor.isActive("table") &&
                  "bg-neutral-200 text-neutral-900 font-semibold dark:bg-white/20 dark:text-white"
              )}
              title={t("common.editor.table_options")}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>{t("common.editor.table_options")}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-52 z-70">
            <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {t("common.editor.table_options")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={insertTable}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>{t("common.editor.insert_table")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={addRowBefore}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              <span>{t("common.editor.add_row_before")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={addRowAfter}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              <span>{t("common.editor.add_row_after")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={deleteRow}
              className="cursor-pointer text-xs flex items-center gap-2 text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("common.editor.delete_row")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={addColBefore}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("common.editor.add_col_before")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={addColAfter}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>{t("common.editor.add_col_after")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={deleteCol}
              className="cursor-pointer text-xs flex items-center gap-2 text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("common.editor.delete_col")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={toggleHeader}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t("common.editor.toggle_header")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={deleteTable}
              className="cursor-pointer text-xs flex items-center gap-2 text-rose-600 focus:text-rose-600 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("common.editor.delete_table")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        {/* Links & Media */}
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title={t("common.editor.add_link")}>
          <Link className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title={t("common.editor.add_image")}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title={t("common.editor.clear_formatting")}
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title={t("common.editor.undo")}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title={t("common.editor.redo")}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      <EditorContent editor={editor} />

      {/* Floating Menu for quick paragraph start */}
      <FloatingMenu
        editor={editor}
        shouldShow={({ editor, state }: { editor: any; state: any }) => {
          if (!editor.isFocused) return false;
          const { selection } = state;
          const { $from } = selection;
          return $from.parent.content.size === 0;
        }}
      >
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#18181b]/95">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-7 px-2 text-xs font-bold"
            title={t("common.editor.heading_1")}
          >
            H1
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-7 px-2 text-xs font-semibold"
            title={t("common.editor.heading_2")}
          >
            H2
          </Button>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title={t("common.editor.bullet_list")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => handleInsertCodeBlock("typescript")}
            title={t("common.editor.code_block")}
          >
            <Terminal className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title={t("common.editor.add_image")}>
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </FloatingMenu>

      {/* Bubble Menu for Selected / Blocked Text */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }: { editor: any }) => {
          return editor.isFocused && !editor.state.selection.empty;
        }}
        className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#18181b]/95 z-40"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title={t("common.editor.bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("common.editor.italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        {/* Inline Code in BubbleMenu for selected text pill badge */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title={t("common.editor.inline_code")}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        {/* Code Block in BubbleMenu */}
        <ToolbarButton
          onClick={() => handleInsertCodeBlock("typescript")}
          active={editor.isActive("codeBlock")}
          title={t("common.editor.code_block")}
        >
          <Terminal className="h-4 w-4" />
        </ToolbarButton>

        {/* Blockquote in BubbleMenu */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title={t("common.editor.blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title={t("common.editor.add_link")}>
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </BubbleMenu>

      {/* Custom Link Dialog */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("common.editor.link_title")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              {t("common.editor.cancel")}
            </Button>
            <Button
              onClick={handleLinkSubmit}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              {t("common.editor.apply_link")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom YouTube Dialog */}
      <Dialog open={isYoutubeModalOpen} onOpenChange={setIsYoutubeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("common.editor.embed_youtube")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleYoutubeSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsYoutubeModalOpen(false)}>
              {t("common.editor.cancel")}
            </Button>
            <Button
              onClick={handleYoutubeSubmit}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              {t("common.editor.embed_video")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Info (Word & Character Count) */}
      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-500 dark:border-white/10 dark:text-neutral-400 bg-neutral-50/50 dark:bg-[#18181b]/50">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <Terminal className="h-3 w-3" />
          {editor.isActive("codeBlock") ? `Selected Code: ${currentLangLabel}` : "Rich Text Editor"}
        </span>
        <div className="flex gap-4">
          <span>{t("common.editor.words", { count: editor.storage.characterCount.words().toString() })}</span>
          <span>{t("common.editor.characters", { count: editor.storage.characterCount.characters().toString() })}</span>
        </div>
      </div>
    </div>
  );
}
