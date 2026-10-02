"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Eye,
  Code2,
  Send,
  Smartphone,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Undo2,
  Redo2,
  Info,
  Loader2,
  SlidersHorizontal,
  LayoutTemplate,
  Save,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  EMAIL_TEMPLATES,
  type EmailTemplateDefinition,
} from "@/src/lib/email-templates";
import { compileTemplate } from "@/src/lib/email-templates/compiler";
import { EmailTemplateService } from "@/src/services/email-template.service";
import type { EmailTemplate as DbEmailTemplate } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "next-themes";
import { cn } from "@/src/app/lib/utils";

type ViewMode = "preview" | "html";
type Viewport = "desktop" | "mobile";

export default function EmailTemplatesPage() {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Active template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    EMAIL_TEMPLATES[0].id
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Search & Filter state for Template Cards (inside modal)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // View mode tab: preview | html | plaintext
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  // Viewport mode: desktop (600px) | mobile (375px)
  const [viewport, setViewport] = useState<Viewport>("desktop");

  // Template locale: en | id
  const [templateLocale, setTemplateLocale] = useState<"en" | "id">("en");

  // Database-persisted customized templates
  const [dbTemplates, setDbTemplates] = useState<Record<string, DbEmailTemplate>>({});
  const [, setIsLoadingDb] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable HTML and Subject per template
  const [editorHtmlState, setEditorHtmlState] = useState<Record<string, string>>({});
  const [editorSubjectState, setEditorSubjectState] = useState<Record<string, string>>({});

  // Undo / Redo history state stack per template
  const [htmlHistory, setHtmlHistory] = useState<Record<string, string[]>>({});
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({});

  // Dynamic sample variable values per template ID
  const [variablesState, setVariablesState] = useState<Record<string, Record<string, any>>>(() => {
    const initial: Record<string, Record<string, any>> = {};
    for (const tpl of EMAIL_TEMPLATES) {
      initial[tpl.id] = {};
      for (const field of tpl.fields) {
        initial[tpl.id][field.key] = field.defaultValue;
      }
    }
    return initial;
  });

  // Dynamic Full-Height Preview measurement
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHeight, setPreviewHeight] = useState(600);
  const iframeResizeObserverRef = useRef<any>(null);

  const measureIframeHeight = () => {
    if (previewIframeRef.current?.contentWindow) {
      const doc = previewIframeRef.current.contentWindow.document;
      const targetEl =
        (doc.body?.firstElementChild as HTMLElement) ||
        doc.body?.querySelector("table") ||
        doc.body;

      if (targetEl) {
        const exactHeight = Math.ceil(
          targetEl.getBoundingClientRect().height ||
          targetEl.offsetHeight ||
          0
        );
        if (exactHeight > 0) {
          setPreviewHeight(exactHeight);
        }
      }
    }
  };

  const handlePreviewIframeLoad = () => {
    if (previewIframeRef.current?.contentWindow) {
      const win = previewIframeRef.current.contentWindow;
      const doc = win.document;

      if (doc?.documentElement) {
        doc.documentElement.style.backgroundColor = "transparent";
        doc.documentElement.style.colorScheme = isDark ? "dark" : "light";
      }
      if (doc?.body) {
        doc.body.style.backgroundColor = "transparent";
        doc.body.style.colorScheme = isDark ? "dark" : "light";
      }

      const targetEl =
        (doc.body?.firstElementChild as HTMLElement) ||
        doc.body?.querySelector("table") ||
        doc.body;

      measureIframeHeight();

      if (iframeResizeObserverRef.current) {
        try {
          iframeResizeObserverRef.current.disconnect();
        } catch {}
      }

      const winAny = win as any;
      if (typeof winAny.ResizeObserver !== "undefined" && targetEl) {
        try {
          const ro = new winAny.ResizeObserver(() => {
            measureIframeHeight();
          });
          ro.observe(targetEl);
          if (doc.body && doc.body !== targetEl) {
            ro.observe(doc.body);
          }
          iframeResizeObserverRef.current = ro;
        } catch {}
      }

      win.addEventListener("resize", measureIframeHeight);
    }
  };

  // Test Email Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("fadil@bafagih.id");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Copy state feedback
  const [hasCopied, setHasCopied] = useState(false);

  // Parameters panel collapse toggle
  const [showParamsPanel, setShowParamsPanel] = useState(true);

  // HTML Textarea ref for inserting variable tags
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (historyDebounceRef.current) {
        clearTimeout(historyDebounceRef.current);
      }
    };
  }, []);

  // Click outside listener for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load customized templates from Supabase on mount
  useEffect(() => {
    async function loadTemplatesFromDb() {
      setIsLoadingDb(true);
      try {
        const templates = await EmailTemplateService.getAll();
        const map: Record<string, DbEmailTemplate> = {};
        for (const item of templates) {
          map[item.slug] = item;
        }
        setDbTemplates(map);

        // Populate editor state & history
        const htmlMap: Record<string, string> = {};
        const subjectMap: Record<string, string> = {};
        const initialHist: Record<string, string[]> = {};
        const initialIdx: Record<string, number> = {};

        for (const tpl of EMAIL_TEMPLATES) {
          const content = map[tpl.id]?.html_content || tpl.getDefaultRawTemplate("en");
          htmlMap[tpl.id] = content;
          subjectMap[tpl.id] = map[tpl.id]?.subject || tpl.defaultSubject;
          initialHist[tpl.id] = [content];
          initialIdx[tpl.id] = 0;
        }

        setEditorHtmlState(htmlMap);
        setEditorSubjectState(subjectMap);
        setHtmlHistory(initialHist);
        setHistoryIndex(initialIdx);
      } catch (err) {
        console.warn("Could not fetch database templates:", err);
      } finally {
        setIsLoadingDb(false);
      }
    }

    loadTemplatesFromDb();
  }, []);

  // Find active template definition
  const activeTemplate: EmailTemplateDefinition = useMemo(() => {
    return (
      EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      EMAIL_TEMPLATES[0]
    );
  }, [selectedTemplateId]);

  // Current editable subject
  const currentSubjectCode = useMemo(() => {
    if (editorSubjectState[activeTemplate.id] !== undefined) {
      return editorSubjectState[activeTemplate.id];
    }
    return activeTemplate.defaultSubject;
  }, [editorSubjectState, activeTemplate]);

  // Current editable HTML
  const currentHtmlCode = useMemo(() => {
    if (editorHtmlState[activeTemplate.id] !== undefined) {
      return editorHtmlState[activeTemplate.id];
    }
    return activeTemplate.getDefaultRawTemplate(templateLocale);
  }, [editorHtmlState, activeTemplate, templateLocale]);

  // Current variables for active template
  const currentVariables = useMemo(() => {
    return variablesState[activeTemplate.id] || {};
  }, [variablesState, activeTemplate.id]);

  // Compiled Subject for live preview
  const renderedSubject = useMemo(() => {
    return compileTemplate(currentSubjectCode, currentVariables);
  }, [currentSubjectCode, currentVariables]);

  // Compiled HTML for live preview with custom scrollbar injected into iframe matching active theme
  const renderedHtml = useMemo(() => {
    const raw = compileTemplate(currentHtmlCode, currentVariables);
    const scrollbarColor = isDark
      ? "rgba(255, 255, 255, 0.85) transparent"
      : "rgba(0, 0, 0, 0.8) transparent";
    const thumbColor = isDark
      ? "rgba(255, 255, 255, 0.8)"
      : "rgba(0, 0, 0, 0.85)";
    const thumbHoverColor = isDark
      ? "#ffffff"
      : "#000000";

    const previewStyle = `<style>
      :root, html, body {
        background-color: transparent !important;
        background: transparent !important;
        color-scheme: ${isDark ? "dark" : "light"} !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    </style>`;
    if (raw.includes("</head>")) {
      return raw.replace("</head>", `${previewStyle}</head>`);
    }
    return previewStyle + raw;
  }, [currentHtmlCode, currentVariables, isDark]);

  useEffect(() => {
    measureIframeHeight();
    const t1 = setTimeout(measureIframeHeight, 40);
    const t2 = setTimeout(measureIframeHeight, 150);
    const t3 = setTimeout(measureIframeHeight, 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [renderedHtml, viewport]);

  // Is customized in DB
  const isCustomizedInDb = !!dbTemplates[activeTemplate.id];

  // Saved states in database / default
  const savedSubject = useMemo(() => {
    return dbTemplates[activeTemplate.id]?.subject ?? activeTemplate.defaultSubject;
  }, [dbTemplates, activeTemplate]);

  const savedHtml = useMemo(() => {
    return (
      dbTemplates[activeTemplate.id]?.html_content ??
      activeTemplate.getDefaultRawTemplate(templateLocale)
    );
  }, [dbTemplates, activeTemplate, templateLocale]);

  // Is editor dirty compared to saved state
  const isDirty = useMemo(() => {
    return (
      currentSubjectCode !== savedSubject || currentHtmlCode !== savedHtml
    );
  }, [currentSubjectCode, savedSubject, currentHtmlCode, savedHtml]);

  // Is current editor content identical to pristine code default
  const isAlreadyDefault = useMemo(() => {
    return (
      currentSubjectCode === activeTemplate.defaultSubject &&
      currentHtmlCode === activeTemplate.getDefaultRawTemplate(templateLocale)
    );
  }, [currentSubjectCode, currentHtmlCode, activeTemplate, templateLocale]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryFilter !== "all") count++;
    if (selectedStatusFilter !== "all") count++;
    return count;
  }, [selectedCategoryFilter, selectedStatusFilter]);

  // Filter templates list by search & filters
  const filteredTemplates = useMemo(() => {
    return EMAIL_TEMPLATES.filter((t) => {
      // Category filter
      if (
        selectedCategoryFilter !== "all" &&
        t.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()
      ) {
        return false;
      }

      // Status filter
      const isCustom = !!dbTemplates[t.id];
      if (selectedStatusFilter === "custom" && !isCustom) return false;
      if (selectedStatusFilter === "default" && isCustom) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const subject = (editorSubjectState[t.id] || t.defaultSubject).toLowerCase();
        const name = t.name.toLowerCase();
        const desc = t.description.toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !subject.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategoryFilter, selectedStatusFilter, searchQuery, dbTemplates, editorSubjectState]);

  // Update a single variable
  const handleVariableChange = (key: string, value: any) => {
    setVariablesState((prev) => ({
      ...prev,
      [activeTemplate.id]: {
        ...(prev[activeTemplate.id] || {}),
        [key]: value,
      },
    }));
  };

  // Push a state into undo/redo history stack
  const pushToHistory = (newHtml: string) => {
    setHtmlHistory((prevHistory) => {
      const currentList = prevHistory[activeTemplate.id] || [];
      const currentIndex = historyIndex[activeTemplate.id] ?? (currentList.length - 1);
      // Don't push identical consecutive entries
      if (currentList[currentIndex] === newHtml) return prevHistory;

      const nextList = [...currentList.slice(0, currentIndex + 1), newHtml];
      if (nextList.length > 50) nextList.shift();

      setHistoryIndex((prevIndex) => ({
        ...prevIndex,
        [activeTemplate.id]: nextList.length - 1,
      }));
      return { ...prevHistory, [activeTemplate.id]: nextList };
    });
  };

  // Update HTML content immediately in state, and debounce history stack commit
  const handleHtmlChange = (newHtml: string, immediate = false) => {
    setEditorHtmlState((prev) => ({
      ...prev,
      [activeTemplate.id]: newHtml,
    }));

    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
    }

    if (immediate) {
      pushToHistory(newHtml);
    } else {
      historyDebounceRef.current = setTimeout(() => {
        pushToHistory(newHtml);
      }, 500);
    }
  };

  // Undo / Redo controls
  const canUndo = (historyIndex[activeTemplate.id] ?? 0) > 0;
  const canRedo =
    (historyIndex[activeTemplate.id] ?? 0) <
    (htmlHistory[activeTemplate.id]?.length ?? 1) - 1;

  const handleUndo = () => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
    }
    const currentIndex = historyIndex[activeTemplate.id] ?? 0;
    if (currentIndex <= 0) return;
    const newIndex = currentIndex - 1;
    const targetList = htmlHistory[activeTemplate.id];
    if (targetList && targetList[newIndex] !== undefined) {
      setHistoryIndex((prev) => ({ ...prev, [activeTemplate.id]: newIndex }));
      setEditorHtmlState((prev) => ({
        ...prev,
        [activeTemplate.id]: targetList[newIndex],
      }));
    }
  };

  const handleRedo = () => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
    }
    const currentIndex = historyIndex[activeTemplate.id] ?? 0;
    const targetList = htmlHistory[activeTemplate.id];
    if (!targetList || currentIndex >= targetList.length - 1) return;
    const newIndex = currentIndex + 1;
    if (targetList[newIndex] !== undefined) {
      setHistoryIndex((prev) => ({ ...prev, [activeTemplate.id]: newIndex }));
      setEditorHtmlState((prev) => ({
        ...prev,
        [activeTemplate.id]: targetList[newIndex],
      }));
    }
  };

  // Handle template locale change
  const handleLocaleChange = (newLocale: "en" | "id") => {
    setTemplateLocale(newLocale);
    if (!isCustomizedInDb) {
      const raw = activeTemplate.getDefaultRawTemplate(newLocale);
      setEditorHtmlState((prev) => ({
        ...prev,
        [activeTemplate.id]: raw,
      }));
      setHtmlHistory((prev) => ({
        ...prev,
        [activeTemplate.id]: [raw],
      }));
      setHistoryIndex((prev) => ({
        ...prev,
        [activeTemplate.id]: 0,
      }));
    }
  };

  // Handle textarea keyboard shortcuts and Tab indentation
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Undo: Ctrl+Z or Cmd+Z (without shift)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    // Redo: Ctrl+Y or Cmd+Shift+Z or Ctrl+Shift+Z
    if (
      ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }
    // Tab key: insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const tabSpaces = "  ";

      const updated = value.substring(0, start) + tabSpaces + value.substring(end);
      handleHtmlChange(updated, true);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
      }, 0);
    }
  };

  // Save customized template to Supabase DB
  const handleSaveToDatabase = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const defaultRaw = activeTemplate.getDefaultRawTemplate(templateLocale);
      const isDefaultContent =
        currentSubjectCode === activeTemplate.defaultSubject &&
        currentHtmlCode === defaultRaw;

      if (isDefaultContent) {
        if (isCustomizedInDb) {
          await EmailTemplateService.deleteBySlug(activeTemplate.id);
          setDbTemplates((prev) => {
            const updated = { ...prev };
            delete updated[activeTemplate.id];
            return updated;
          });
        }
      } else {
        const saved = await EmailTemplateService.upsert({
          slug: activeTemplate.id,
          name: activeTemplate.name,
          subject: currentSubjectCode,
          html_content: currentHtmlCode,
          category: activeTemplate.category,
        });

        setDbTemplates((prev) => ({
          ...prev,
          [activeTemplate.id]: saved,
        }));
      }

      toast.success(t("templates.saved_success"));
    } catch {
      toast.error(t("templates.saved_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset template buffer in editor to default code template (requires manual Save to persist)
  const handleResetToCodeDefault = () => {
    const defaultRaw = activeTemplate.getDefaultRawTemplate(templateLocale);
    handleHtmlChange(defaultRaw, true);
    setEditorSubjectState((prev) => ({
      ...prev,
      [activeTemplate.id]: activeTemplate.defaultSubject,
    }));

    toast.info(t("templates.reset_info"));
  };

  // Reset variables of current template to default values
  const handleResetVariables = () => {
    const defaults: Record<string, any> = {};
    for (const f of activeTemplate.fields) {
      defaults[f.key] = f.defaultValue;
    }
    setVariablesState((prev) => ({
      ...prev,
      [activeTemplate.id]: defaults,
    }));
    toast.success(t("templates.variables_reset"));
  };

  // Copy HTML content
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(currentHtmlCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast.success(t("templates.copy_html_success"));
    } catch {
      toast.error(t("common.failed"));
    }
  };

  // Send real test email via API using current editor's HTML
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error(t("newsletter.invalid_email"));
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/emails/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          recipientEmail: testRecipient,
          variables: currentVariables,
          locale: templateLocale,
          customHtml: currentHtmlCode,
          customSubject: currentSubjectCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send test email");
      }

      toast.success(t("templates.test_success", { recipient: testRecipient }));
      setIsTestModalOpen(false);
    } catch {
      toast.error(t("templates.test_failed"));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t("templates.title")}
        icon={LayoutTemplate}
        description={t("templates.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Emails"), href: "/dashboard/emails/newsletter" },
          { label: t("templates.title") },
        ]}
      />

      {/* Top Control Bar: Active Template Selector Button on Left, Send Test Email Button on Right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Template Selector Button (Opens Modal) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTemplateModalOpen(true)}
          className="h-9 px-3 gap-2 text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-white/10 transition-all cursor-pointer shadow-xs max-w-full truncate"
        >
          <span className="font-semibold truncate">{activeTemplate.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 ml-0.5" />
        </Button>

        {/* Send Test Email Button (Placed at top right) */}
        <Button
          onClick={() => setIsTestModalOpen(true)}
          size="sm"
          className="h-9 px-3.5 gap-2 text-xs font-medium cursor-pointer transition-all bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-xs shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{t("templates.send_test")}</span>
        </Button>
      </div>

      {/* Main Workspace Area: Canvas + Optional Variables Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Viewer & Code Editor */}
        <div
          className={cn(
            "space-y-4",
            showParamsPanel ? "lg:col-span-8" : "lg:col-span-12"
          )}
        >
          <div className="rounded-xl border border-neutral-200/60 bg-white dark:border-white/10 dark:bg-neutral-900 overflow-hidden shadow-sm">
            {/* Workspace Header Toolbar (Symmetrical py-2.5) */}
            <div className="py-2.5 px-4 border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* View Mode Tabs (Preview vs HTML Editor) */}
                <div className="flex items-center gap-1 p-1 bg-neutral-200/60 dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-white/10">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                      viewMode === "preview"
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t("templates.tab_preview")}
                  </button>
                  <button
                    onClick={() => setViewMode("html")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                      viewMode === "html"
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {t("templates.tab_html")}
                  </button>
                </div>

                {/* Right Toolbar Actions */}
                <div className="flex items-center gap-2">
                  {/* PREVIEW MODE CONTROLS */}
                  {viewMode === "preview" && (
                    <>
                      {/* Viewport Toggles */}
                      <div className="flex items-center p-0.5 bg-neutral-200/60 dark:bg-neutral-900 rounded-md border border-neutral-200/80 dark:border-white/10">
                        <button
                          onClick={() => setViewport("desktop")}
                          title="Desktop (600px)"
                          className={cn(
                            "p-1.5 rounded text-xs transition-colors cursor-pointer",
                            viewport === "desktop"
                              ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-800 dark:text-white"
                              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                          )}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewport("mobile")}
                          title="Mobile (375px)"
                          className={cn(
                            "p-1.5 rounded text-xs transition-colors cursor-pointer",
                            viewport === "mobile"
                              ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-800 dark:text-white"
                              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                          )}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Locale Switcher (EN / ID) - Always rendered, disabled for single-language templates */}
                      <div
                        className={cn(
                          "flex items-center p-0.5 rounded-md border text-xs transition-colors",
                          activeTemplate.supportsLocale
                            ? "bg-neutral-200/60 dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10"
                            : "bg-neutral-100/80 dark:bg-neutral-900/60 border-neutral-200/60 dark:border-white/10 cursor-not-allowed"
                        )}
                        title={!activeTemplate.supportsLocale ? "Template ini hanya mendukung satu bahasa (Single Language)" : undefined}
                      >
                        <button
                          type="button"
                          disabled={!activeTemplate.supportsLocale}
                          onClick={() => handleLocaleChange("en")}
                          className={cn(
                            "px-2 py-1 rounded font-medium transition-colors text-xs select-none",
                            !activeTemplate.supportsLocale
                              ? "cursor-not-allowed text-neutral-400 dark:text-neutral-500 hover:text-neutral-400 dark:hover:text-neutral-500 hover:bg-transparent"
                              : templateLocale === "en"
                              ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-800 dark:text-white cursor-pointer"
                              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                          )}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          disabled={!activeTemplate.supportsLocale}
                          onClick={() => handleLocaleChange("id")}
                          className={cn(
                            "px-2 py-1 rounded font-medium transition-colors text-xs select-none",
                            !activeTemplate.supportsLocale
                              ? "cursor-not-allowed text-neutral-400 dark:text-neutral-500 hover:text-neutral-400 dark:hover:text-neutral-500 hover:bg-transparent"
                              : templateLocale === "id"
                              ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-800 dark:text-white cursor-pointer"
                              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                          )}
                        >
                          ID
                        </button>
                      </div>

                      {/* Variables Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowParamsPanel(!showParamsPanel)}
                        className={cn(
                          "h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer border select-none transition-none",
                          showParamsPanel
                            ? "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 dark:border-white shadow-2xs"
                            : "bg-white hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:border-white/10"
                        )}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {showParamsPanel
                            ? t("templates.hide_variables")
                            : t("templates.show_variables")}
                        </span>
                      </button>


                    </>
                  )}

                  {/* HTML MODE CONTROLS */}
                  {viewMode === "html" && (
                    <div className="flex items-center gap-1.5">
                      {/* Undo */}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title="Undo (Ctrl+Z)"
                        className={cn(
                          "h-8 w-8 transition-colors",
                          canUndo
                            ? "cursor-pointer bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                            : "cursor-not-allowed text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-white/10 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 hover:text-neutral-400 dark:hover:text-neutral-500 shadow-none disabled:opacity-100"
                        )}
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Redo */}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleRedo}
                        disabled={!canRedo}
                        title="Redo (Ctrl+Y)"
                        className={cn(
                          "h-8 w-8 transition-colors",
                          canRedo
                            ? "cursor-pointer bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                            : "cursor-not-allowed text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-white/10 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 hover:text-neutral-400 dark:hover:text-neutral-500 shadow-none disabled:opacity-100"
                        )}
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Copy HTML (Icon Only) */}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleCopyContent}
                        title={hasCopied ? "Copied HTML!" : "Copy HTML"}
                        className="h-8 w-8 cursor-pointer bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                      >
                        {hasCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      {/* Reset to Code Default (Icon Only - Red Themed) */}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleResetToCodeDefault}
                        disabled={isAlreadyDefault}
                        title={t("templates.reset_template")}
                        className={cn(
                          "h-8 w-8 transition-colors",
                          !isAlreadyDefault
                            ? "cursor-pointer text-red-600 border-red-200/80 bg-red-50/50 hover:bg-red-100/80 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-900/40 dark:bg-red-950/30 dark:hover:bg-red-950/60 dark:hover:border-red-800"
                            : "cursor-not-allowed text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-white/10 bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 hover:text-neutral-400 dark:hover:text-neutral-500 shadow-none disabled:opacity-100"
                        )}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>

                      {/* Save Template Button */}
                      <Button
                        size="sm"
                        onClick={handleSaveToDatabase}
                        disabled={!isDirty || isSaving}
                        className={cn(
                          "h-8 text-xs gap-1.5 font-medium ml-0.5 transition-colors",
                          isDirty && !isSaving
                            ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer shadow-xs"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-500 dark:border-white/5 cursor-not-allowed shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-400 dark:hover:text-neutral-500 disabled:opacity-100"
                        )}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t("templates.saving_template")}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{t("templates.save_template")}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas Viewport / Editor Body */}
            <div>
              {viewMode === "preview" && (
                /* LIVE EMAIL PREVIEW CANVAS (Pure template card rendering) */
                <div className="p-4 sm:p-5 bg-neutral-100/60 dark:bg-neutral-950/60 flex justify-center">
                  <div
                    className={cn(
                      "w-full transition-[max-width] duration-200 ease-in-out flex justify-center",
                      viewport === "desktop" ? "max-w-[600px]" : "max-w-[375px]"
                    )}
                  >
                    <iframe
                      ref={previewIframeRef}
                      srcDoc={renderedHtml}
                      onLoad={handlePreviewIframeLoad}
                      title="Email Preview"
                      scrolling="no"
                      {...{ allowtransparency: "true" }}
                      style={{
                        height: `${previewHeight}px`,
                        backgroundColor: "transparent",
                        colorScheme: isDark ? "dark" : "light",
                      }}
                      className="w-full border-0 bg-transparent block overflow-hidden"
                      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    />
                  </div>
                </div>
              )}

              {viewMode === "html" && (
                /* HTML CODE EDITOR (Seamless without divider between Subject & Editor) */
                <div className="p-4 space-y-3 bg-neutral-50/40 dark:bg-neutral-950/40">
                  {/* Subject Input Bar */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 shrink-0">
                      {t("templates.subject_label")}:
                    </span>
                    <Input
                      value={currentSubjectCode}
                      onChange={(e) =>
                        setEditorSubjectState((prev) => ({
                          ...prev,
                          [activeTemplate.id]: e.target.value,
                        }))
                      }
                      placeholder={activeTemplate.defaultSubject}
                      className="h-8 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 shadow-none"
                    />
                  </div>

                  {/* Monospaced Code Textarea (100 lines limit before scrollbar appears) */}
                  <Textarea
                    ref={htmlTextareaRef}
                    value={currentHtmlCode}
                    onChange={(e) => handleHtmlChange(e.target.value)}
                    onBlur={(e) => handleHtmlChange(e.target.value, true)}
                    onKeyDown={handleTextareaKeyDown}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="font-mono text-xs leading-relaxed min-h-[560px] max-h-[1950px] overflow-y-auto bg-white dark:bg-neutral-950 border-neutral-200/80 dark:border-white/10 resize-y p-3.5 scrollbar-custom"
                    placeholder="Enter email HTML markup..."
                  />

                  {/* Editor Status Bar */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-mono px-1">
                    <span>{currentHtmlCode.split("\n").length} lines</span>
                    <span>{(new Blob([currentHtmlCode]).size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Sample Variables Customizer */}
        {showParamsPanel && (
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-neutral-200/60 bg-white dark:border-white/10 dark:bg-neutral-900 shadow-sm overflow-hidden">
              <div className="py-2.5 px-4 border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {t("templates.sample_variables")}
                    </span>
                  </div>
                  <button
                    onClick={handleResetVariables}
                    title="Reset to defaults"
                    className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3.5">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {t("templates.variables_desc")}
                </p>

                <div className="space-y-3">
                  {activeTemplate.fields.map((field) => {
                    const val = currentVariables[field.key] ?? field.defaultValue;

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                            {field.label}
                          </Label>
                          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                            {`{{${field.key}}}`}
                          </span>
                        </div>

                        {field.type === "textarea" ? (
                          <Textarea
                            value={val}
                            onChange={(e) =>
                              handleVariableChange(field.key, e.target.value)
                            }
                            rows={3}
                            className="text-xs bg-neutral-50 dark:bg-neutral-950 border-neutral-200/80 dark:border-white/10 scrollbar-custom"
                          />
                        ) : field.type === "select" && field.options ? (
                          <Select
                            value={String(val)}
                            onValueChange={(newVal) =>
                              handleVariableChange(field.key, newVal)
                            }
                            searchable={false}
                          >
                            <SelectTrigger
                              size="sm"
                              className="h-8 text-xs bg-neutral-50 dark:bg-neutral-950 border-neutral-200/80 dark:border-white/10 w-full cursor-pointer px-2.5"
                            >
                              <SelectValue className="text-xs" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 scrollbar-custom">
                              {field.options.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs cursor-pointer py-1.5"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={val}
                            onChange={(e) =>
                              handleVariableChange(field.key, e.target.value)
                            }
                            className="h-8 text-xs bg-neutral-50 dark:bg-neutral-950 border-neutral-200/80 dark:border-white/10"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Test Email Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto scrollbar-custom">
          <DialogHeader className="pr-10 sm:pr-12">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="w-4 h-4 text-neutral-500" />
              {t("templates.test_modal_title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {t("templates.test_modal_desc", { name: activeTemplate.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="test-recipient" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {t("templates.test_recipient")}
              </Label>
              <Input
                id="test-recipient"
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="you@example.com"
                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10"
                autoFocus
              />
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {t("templates.test_recipient_desc")}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50/80 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/60 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Template:</span>
                <span className="font-medium text-neutral-900 dark:text-white truncate max-w-[220px]">
                  {activeTemplate.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Subject:</span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate max-w-[220px] text-[11px]">
                  {renderedSubject}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Sender:</span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300 text-[11px] truncate max-w-[220px]">
                  {activeTemplate.sender}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTestModalOpen(false)}
              disabled={isSendingTest}
              className={cn(
                "h-9 px-4 text-xs font-medium transition-colors",
                !isSendingTest
                  ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  : "cursor-not-allowed opacity-40 hover:bg-transparent"
              )}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className={cn(
                "h-9 px-4 text-xs gap-1.5 font-medium transition-colors",
                !isSendingTest
                  ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
                  : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-white cursor-not-allowed opacity-40"
              )}
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {t("templates.send_test")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Template Selection Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[85vh] flex flex-col p-6 gap-5 bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
              <LayoutTemplate className="h-4.5 w-4.5 text-neutral-500" />
              {t("templates.select_template")}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("templates.select_template_desc")}
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar & Filter Row inside Modal */}
          <div className="flex items-center justify-between gap-3">
            {/* Search Bar on the Left (Full Width up to Filter) */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("templates.search_placeholder") || "Search templates..."}
                className="pl-9 h-9 bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 text-xs placeholder:text-neutral-400"
              />
            </div>

            {/* Filter Button on the Right */}
            <div className="relative z-30 shrink-0" ref={filterDropdownRef}>
              <Button
                variant={activeFilterCount > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 cursor-pointer border",
                  activeFilterCount > 0
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white hover:bg-neutral-800 active:bg-neutral-800 dark:hover:bg-neutral-200 dark:active:bg-neutral-200"
                    : "bg-white hover:bg-neutral-100 active:bg-neutral-100 text-neutral-700 border-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 dark:text-neutral-300 dark:border-white/10"
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("common.filter")}</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Filter Dropdown Panel */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/10">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {t("common.filters")}
                      </span>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCategoryFilter("all");
                            setSelectedStatusFilter("all");
                            setIsFilterOpen(false);
                          }}
                          className="text-[10px] flex items-center gap-1 text-neutral-400 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {t("common.clear_all")}
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                        {t("sidebar.Categories")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: t("templates.category_all") || "All", value: "all" },
                          { label: t("templates.category_contact") || "Contact", value: "contact" },
                          { label: t("templates.category_newsletter") || "Newsletter", value: "newsletter" },
                        ].map((opt) => {
                          const isSelected = selectedCategoryFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSelectedCategoryFilter(opt.value)}
                              className={cn(
                                "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                                isSelected
                                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                  : "bg-neutral-100/80 hover:bg-neutral-200 text-neutral-600 border-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 dark:text-neutral-300 dark:border-neutral-700/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                        {t("common.status")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: t("common.all") || "All", value: "all" },
                          { label: t("templates.status_customized") || "Custom", value: "custom" },
                          { label: t("templates.status_default") || "Default", value: "default" },
                        ].map((opt) => {
                          const isSelected = selectedStatusFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSelectedStatusFilter(opt.value)}
                              className={cn(
                                "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                                isSelected
                                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                  : "bg-neutral-100/80 hover:bg-neutral-200 text-neutral-600 border-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 dark:text-neutral-300 dark:border-neutral-700/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Cards Grid inside Modal (2 Columns for clean layout) */}
          <div className="overflow-y-auto max-h-[55vh] pr-1 -mr-1">
            {filteredTemplates.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
                {t("common.no_data")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTemplates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  const isDbCustom = !!dbTemplates[tpl.id];

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setIsTemplateModalOpen(false);
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 shadow-xs",
                        isSelected
                          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/20"
                          : "bg-white dark:bg-neutral-900/90 border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold whitespace-nowrap">
                          {tpl.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-mono font-medium shrink-0 border transition-colors",
                            isSelected
                              ? isDbCustom
                                ? "bg-white/20 text-white border-white/25 dark:bg-neutral-900/20 dark:text-neutral-900 dark:border-neutral-900/25"
                                : "bg-white/10 text-neutral-300 border-white/15 dark:bg-neutral-900/10 dark:text-neutral-600 dark:border-neutral-900/15"
                              : isDbCustom
                              ? "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                              : "bg-neutral-50 text-neutral-500 border-neutral-200/80 dark:bg-neutral-900/60 dark:text-neutral-400 dark:border-white/10"
                          )}
                        >
                          {isDbCustom ? "Custom" : "Default"}
                        </span>
                      </div>

                      <p
                        className={cn(
                          "text-xs leading-relaxed",
                          isSelected
                            ? "text-neutral-300 dark:text-neutral-600"
                            : "text-neutral-500 dark:text-neutral-400"
                        )}
                      >
                        {tpl.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
