"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Mail,
  Eye,
  FileText,
  Code2,
  Send,
  Smartphone,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  LayoutTemplate,
  Save,
  Database,
  Undo2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  htmlToPlainText,
  type EmailTemplateDefinition,
} from "@/src/lib/email-templates";
import { compileTemplate } from "@/src/lib/email-templates/compiler";
import { EmailTemplateService } from "@/src/services/email-template.service";
import type { EmailTemplate as DbEmailTemplate } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/src/app/lib/utils";

type ViewMode = "preview" | "plaintext" | "html";
type Viewport = "desktop" | "mobile";

export default function EmailTemplatesPage() {
  const { t, language } = useLanguage();

  // Active template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    EMAIL_TEMPLATES[0].id
  );
  const [activeCategory, setActiveCategory] = useState<"all" | "Contact" | "Newsletter">("all");

  // View mode tab: preview | plaintext | html
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  // Viewport mode: desktop (600px) | mobile (375px)
  const [viewport, setViewport] = useState<Viewport>("desktop");

  // Template locale: en | id
  const [templateLocale, setTemplateLocale] = useState<"en" | "id">("en");

  // Database-persisted customized templates
  const [dbTemplates, setDbTemplates] = useState<Record<string, DbEmailTemplate>>({});
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Editable HTML and Subject per template
  const [editorHtmlState, setEditorHtmlState] = useState<Record<string, string>>({});
  const [editorSubjectState, setEditorSubjectState] = useState<Record<string, string>>({});

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

        // Populate editor state
        const htmlMap: Record<string, string> = {};
        const subjectMap: Record<string, string> = {};

        for (const tpl of EMAIL_TEMPLATES) {
          if (map[tpl.id] && map[tpl.id].html_content) {
            htmlMap[tpl.id] = map[tpl.id].html_content;
            subjectMap[tpl.id] = map[tpl.id].subject || tpl.defaultSubject;
          } else {
            htmlMap[tpl.id] = tpl.getDefaultRawTemplate("en");
            subjectMap[tpl.id] = tpl.defaultSubject;
          }
        }

        setEditorHtmlState(htmlMap);
        setEditorSubjectState(subjectMap);
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

  // Is current template customized in DB?
  const isCustomizedInDb = !!dbTemplates[activeTemplate.id];

  // Current active HTML in editor
  const currentHtmlCode = editorHtmlState[activeTemplate.id] ?? activeTemplate.getDefaultRawTemplate(templateLocale);
  const currentSubjectCode = editorSubjectState[activeTemplate.id] ?? activeTemplate.defaultSubject;

  // Current template variables
  const currentVariables = useMemo(() => {
    return variablesState[activeTemplate.id] || {};
  }, [variablesState, activeTemplate.id]);

  // Rendered Compiled HTML string for preview
  const renderedHtml = useMemo(() => {
    try {
      return compileTemplate(currentHtmlCode, currentVariables);
    } catch (err) {
      console.error("Template compile error:", err);
      return `<div style="padding: 20px; color: red;">Error compiling template: ${String(err)}</div>`;
    }
  }, [currentHtmlCode, currentVariables]);

  // Rendered Plain Text string
  const renderedPlainText = useMemo(() => {
    return htmlToPlainText(renderedHtml);
  }, [renderedHtml]);

  // Handle variable change
  const handleVariableChange = (key: string, value: any) => {
    setVariablesState((prev) => ({
      ...prev,
      [activeTemplate.id]: {
        ...prev[activeTemplate.id],
        [key]: value,
      },
    }));
  };

  // Handle HTML editor change
  const handleHtmlCodeChange = (newHtml: string) => {
    setEditorHtmlState((prev) => ({
      ...prev,
      [activeTemplate.id]: newHtml,
    }));
  };

  // Handle Subject editor change
  const handleSubjectCodeChange = (newSubject: string) => {
    setEditorSubjectState((prev) => ({
      ...prev,
      [activeTemplate.id]: newSubject,
    }));
  };

  // Insert variable tag into HTML editor at cursor position
  const handleInsertVariableTag = (varKey: string) => {
    const tag = `{{${varKey}}}`;
    const textarea = htmlTextareaRef.current;
    if (!textarea) {
      navigator.clipboard.writeText(tag);
      toast.info(`Tag ${tag} copied to clipboard!`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentHtmlCode;
    const updated = text.substring(0, start) + tag + text.substring(end);

    handleHtmlCodeChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);

    toast.success(`Inserted ${tag}`);
  };

  // Save template directly to Supabase
  const handleSaveTemplateToDb = async () => {
    setIsSaving(true);
    try {
      const saved = await EmailTemplateService.upsert({
        slug: activeTemplate.id,
        name: activeTemplate.name,
        category: activeTemplate.category,
        subject: currentSubjectCode,
        html_content: currentHtmlCode,
        description: activeTemplate.description,
        sender: activeTemplate.sender,
      });

      setDbTemplates((prev) => ({
        ...prev,
        [activeTemplate.id]: saved,
      }));

      toast.success(
        language === "id"
          ? `Templat "${activeTemplate.name}" berhasil disimpan ke database!`
          : `Template "${activeTemplate.name}" successfully saved to database!`,
        {
          description: "All future emails will now use this custom HTML layout.",
        }
      );
    } catch (err: unknown) {
      toast.error(
        language === "id"
          ? "Gagal menyimpan templat ke database"
          : "Failed to save template to database",
        {
          description: err instanceof Error ? err.message : "Unknown error",
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Reset template to default code template
  const handleResetToCodeDefault = async () => {
    setIsResetting(true);
    try {
      if (isCustomizedInDb) {
        await EmailTemplateService.deleteBySlug(activeTemplate.id);
        setDbTemplates((prev) => {
          const updated = { ...prev };
          delete updated[activeTemplate.id];
          return updated;
        });
      }

      const defaultRaw = activeTemplate.getDefaultRawTemplate(templateLocale);
      setEditorHtmlState((prev) => ({
        ...prev,
        [activeTemplate.id]: defaultRaw,
      }));
      setEditorSubjectState((prev) => ({
        ...prev,
        [activeTemplate.id]: activeTemplate.defaultSubject,
      }));

      toast.success(
        language === "id"
          ? "Templat berhasil dikembalikan ke bawaan kode"
          : "Template reset to built-in code default"
      );
    } catch (err: unknown) {
      toast.error(
        language === "id"
          ? "Gagal mereset templat"
          : "Failed to reset template",
        {
          description: err instanceof Error ? err.message : "Unknown error",
        }
      );
    } finally {
      setIsResetting(false);
    }
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
    toast.success(
      language === "id"
        ? "Variabel sampel berhasil direset"
        : "Sample variables reset to defaults"
    );
  };

  // Copy active content
  const handleCopyContent = async () => {
    try {
      const textToCopy = viewMode === "html" ? currentHtmlCode : renderedPlainText;
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast.success(
        viewMode === "html"
          ? language === "id" ? "Kode HTML disalin ke clipboard!" : "HTML code copied to clipboard!"
          : language === "id" ? "Plain text disalin ke clipboard!" : "Plain text copied to clipboard!"
      );
    } catch {
      toast.error("Failed to copy content to clipboard.");
    }
  };

  // Send real test email via API using current editor's HTML
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error(
        language === "id"
          ? "Masukkan alamat email penerima yang valid."
          : "Please enter a valid recipient email address."
      );
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

      toast.success(
        language === "id"
          ? `Email uji coba berhasil dikirim ke ${testRecipient}!`
          : `Test email successfully sent to ${testRecipient}!`,
        {
          description: `Sender: ${activeTemplate.sender}`,
        }
      );
      setIsTestModalOpen(false);
    } catch (err: unknown) {
      toast.error(
        language === "id"
          ? "Gagal mengirim email uji coba"
          : "Failed to send test email",
        {
          description: err instanceof Error ? err.message : "Unknown error",
        }
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filter templates list by category
  const filteredTemplates = useMemo(() => {
    if (activeCategory === "all") return EMAIL_TEMPLATES;
    return EMAIL_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title={language === "id" ? "Templat Email" : "Email Templates"}
        icon={LayoutTemplate}
        description={
          language === "id"
            ? "Kustomisasi tata letak, pratinjau live, dan pengujian email."
            : "Manage layouts, live preview, and email testing."
        }
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Emails"), href: "/dashboard/emails/messages" },
          { label: t("sidebar.Templates") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsTestModalOpen(true)}
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {language === "id" ? "Kirim Uji Coba" : "Send Test Email"}
            </Button>
          </div>
        }
      />

      {/* Category Pills & Template Selector Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/60 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-2">
            {language === "id" ? "Kategori:" : "Category:"}
          </span>
          {(["all", "Contact", "Newsletter"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-white/10"
              )}
            >
              {cat === "all" ? (language === "id" ? "Semua (6)" : "All (6)") : cat}
            </button>
          ))}
        </div>

        {/* Sender Info Badge */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-mono bg-white dark:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700">
            Sender: <strong className="text-neutral-900 dark:text-neutral-100">{activeTemplate.sender}</strong>
          </span>
        </div>
      </div>

      {/* Template Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;
          const isDbCustom = !!dbTemplates[tpl.id];

          return (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplateId(tpl.id)}
              className={cn(
                "text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                isSelected
                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-800 dark:border-neutral-600 shadow-md ring-1 ring-neutral-900/10 dark:ring-white/20"
                  : "bg-white dark:bg-neutral-950/60 border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                      isSelected
                        ? "bg-white/20 text-white"
                        : tpl.category === "Contact"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {tpl.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isDbCustom && (
                      <span
                        title="Stored in Supabase Database"
                        className={cn(
                          "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono",
                          isSelected
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        <Database className="w-2.5 h-2.5" /> DB
                      </span>
                    )}
                    {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                </div>

                <h4
                  className={cn(
                    "text-sm font-semibold mb-1 line-clamp-1",
                    isSelected ? "text-white" : "text-neutral-900 dark:text-white"
                  )}
                >
                  {tpl.name}
                </h4>
                <p
                  className={cn(
                    "text-xs line-clamp-2 leading-relaxed",
                    isSelected ? "text-neutral-300" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {tpl.description}
                </p>
              </div>

              <div
                className={cn(
                  "mt-3 pt-2.5 border-t flex items-center justify-between text-[11px]",
                  isSelected
                    ? "border-white/15 text-neutral-300"
                    : "border-neutral-100 dark:border-white/5 text-neutral-400"
                )}
              >
                <span className="truncate max-w-[200px]">{tpl.sender.split("<")[0]}</span>
                <span className="font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Area: Toolbar + View Container + Variable Editor */}
      <div className="space-y-4">
        {/* Workspace Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-lg">
          {/* USER'S REQUESTED PILL TABS: [ Preview ] [ Plain Text ] [ HTML ] */}
          <div className="inline-flex items-center p-1 bg-neutral-900 rounded-full border border-neutral-800">
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                viewMode === "preview"
                  ? "bg-neutral-800 text-white shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setViewMode("plaintext")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                viewMode === "plaintext"
                  ? "bg-neutral-800 text-white shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Plain Text
            </button>
            <button
              onClick={() => setViewMode("html")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                viewMode === "html"
                  ? "bg-neutral-800 text-white shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              HTML Editor
            </button>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Viewport Toggles (Active in Preview mode) */}
            {viewMode === "preview" && (
              <div className="inline-flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setViewport("desktop")}
                  title="Desktop Viewport (600px)"
                  className={cn(
                    "p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    viewport === "desktop"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  title="Mobile Viewport (375px)"
                  className={cn(
                    "p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    viewport === "mobile"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Locale Switcher if Template supportsLocale */}
            {activeTemplate.supportsLocale && (
              <div className="inline-flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setTemplateLocale("en")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    templateLocale === "en"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setTemplateLocale("id")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    templateLocale === "id"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  ID
                </button>
              </div>
            )}

            {/* Save Template Button (When in HTML mode or anytime customized) */}
            <Button
              size="sm"
              onClick={handleSaveTemplateToDb}
              disabled={isSaving}
              className="bg-emerald-600 text-white hover:bg-emerald-500 text-xs h-8 px-3 shadow-xs"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              {language === "id" ? "Simpan Template" : "Save Template"}
            </Button>

            {/* Revert to Code Default Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToCodeDefault}
              disabled={isResetting}
              title="Revert to built-in code template"
              className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs h-8 px-2.5"
            >
              {isResetting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Undo2 className="w-3.5 h-3.5" />
              )}
            </Button>

            {/* Toggle Customize Variables Panel */}
            <button
              onClick={() => setShowParamsPanel(!showParamsPanel)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer",
                showParamsPanel
                  ? "bg-neutral-800 text-white border-neutral-700"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showParamsPanel
                  ? language === "id" ? "Sembunyikan Variabel" : "Hide Variables"
                  : language === "id" ? "Atur Variabel" : "Edit Variables"}
              </span>
            </button>

            {/* Copy Action Button */}
            {(viewMode === "html" || viewMode === "plaintext") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800 hover:text-white text-xs h-8 px-3"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {viewMode === "html" ? "Copy HTML" : "Copy Plain Text"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Split View: [ Canvas / Editor ] + [ Variable Customizer Panel ] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Viewer Area (8 cols if panel open, 12 cols if collapsed) */}
          <div
            className={cn(
              "transition-all duration-300",
              showParamsPanel ? "lg:col-span-8" : "lg:col-span-12"
            )}
          >
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800/80 shadow-2xl overflow-hidden min-h-[640px] flex flex-col">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-neutral-400 truncate max-w-[280px]">
                    {activeTemplate.id}.email.html
                  </span>
                  {isCustomizedInDb ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      Database Saved
                    </span>
                  ) : (
                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-mono">
                      Code Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {viewMode === "preview"
                      ? viewport === "desktop"
                        ? "600px Frame"
                        : "375px Mobile Frame"
                      : viewMode === "html"
                      ? `${(currentHtmlCode.length / 1024).toFixed(1)} KB HTML`
                      : `${renderedPlainText.length} Chars`}
                  </span>
                </div>
              </div>

              {/* Viewer Content Canvas */}
              <div className="flex-1 p-4 md:p-6 flex items-center justify-center bg-[#070809] overflow-auto">
                {/* 1. PREVIEW TAB */}
                {viewMode === "preview" && (
                  <div
                    className={cn(
                      "transition-all duration-300 mx-auto shadow-2xl rounded-2xl overflow-hidden border border-neutral-800 bg-[#0c0d0e]",
                      viewport === "desktop" ? "w-full max-w-[620px]" : "w-[375px] max-w-full"
                    )}
                  >
                    <iframe
                      srcDoc={renderedHtml}
                      title="Email Preview"
                      className="w-full h-[650px] border-0 bg-transparent block"
                      sandbox="allow-same-origin allow-popups"
                    />
                  </div>
                )}

                {/* 2. PLAIN TEXT TAB */}
                {viewMode === "plaintext" && (
                  <div className="w-full max-w-3xl bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 font-mono text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap select-text shadow-xl">
                    {renderedPlainText}
                  </div>
                )}

                {/* 3. HTML CODE EDITOR TAB */}
                {viewMode === "html" && (
                  <div className="w-full space-y-4">
                    {/* Subject Line Field */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-neutral-300">
                          Email Subject (Supports placeholders like <code className="text-sky-400">&#123;&#123;subject&#125;&#125;</code>)
                        </Label>
                        <span className="text-[11px] text-neutral-500">Live Edited</span>
                      </div>
                      <Input
                        value={currentSubjectCode}
                        onChange={(e) => handleSubjectCodeChange(e.target.value)}
                        placeholder="Email Subject"
                        className="bg-neutral-950 border-neutral-800 text-white font-mono text-xs h-9"
                      />
                    </div>

                    {/* Available Variable Pills Bar */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Tag className="w-3.5 h-3.5 text-sky-400" />
                        <span>Klik untuk menyisipkan variabel ke kode HTML:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {activeTemplate.availableVariables.map((v) => (
                          <button
                            key={v.key}
                            onClick={() => handleInsertVariableTag(v.key)}
                            title={`${v.description} (Click to insert)`}
                            className="bg-neutral-800 hover:bg-neutral-700 active:bg-sky-950 active:text-sky-300 border border-neutral-700 hover:border-neutral-600 text-sky-300 font-mono text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>{v.label}</span>
                            <span className="text-[10px] text-neutral-400">({v.description})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* HTML Textarea Code Editor */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2 shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-xs font-mono text-neutral-400">
                          HTML Markup Editor — edit directly below
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Changes render live in Preview tab
                        </span>
                      </div>
                      <Textarea
                        ref={htmlTextareaRef}
                        value={currentHtmlCode}
                        onChange={(e) => handleHtmlCodeChange(e.target.value)}
                        rows={22}
                        placeholder="<html><body>...</body></html>"
                        className="w-full bg-[#0a0b0c] border-neutral-800 text-neutral-200 font-mono text-xs leading-relaxed resize-y focus-visible:ring-1 focus-visible:ring-neutral-700"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Parameters Customizer Panel (4 cols) */}
          {showParamsPanel && (
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-white/10 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {language === "id" ? "Kustomisasi Variabel" : "Sample Variables"}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetVariables}
                    className="h-7 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-2"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {language === "id" ? "Reset" : "Reset"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeTemplate.fields.map((field) => {
                    const value = currentVariables[field.key] ?? field.defaultValue;

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {field.label}
                        </Label>

                        {field.type === "text" && (
                          <Input
                            value={value}
                            onChange={(e) => handleVariableChange(field.key, e.target.value)}
                            placeholder={field.label}
                            className="text-xs h-9"
                          />
                        )}

                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              handleVariableChange(field.key, Number(e.target.value))
                            }
                            placeholder={field.label}
                            className="text-xs h-9"
                          />
                        )}

                        {field.type === "select" && (
                          <select
                            value={value}
                            onChange={(e) => handleVariableChange(field.key, e.target.value)}
                            className="w-full text-xs h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === "textarea" && (
                          <Textarea
                            value={value}
                            onChange={(e) => handleVariableChange(field.key, e.target.value)}
                            rows={4}
                            placeholder={field.label}
                            className="text-xs font-mono resize-y"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-xs text-neutral-400">
                  <span>Changes apply live in preview.</span>
                  <Button
                    size="sm"
                    onClick={() => setIsTestModalOpen(true)}
                    className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                  >
                    <Send className="w-3 h-3 mr-1.5" />
                    Test Send
                  </Button>
                </div>
              </div>

              {/* Template Technical Info Card */}
              <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/60 dark:border-white/10 p-4 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-between font-semibold text-neutral-800 dark:text-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-500" />
                    <span>Template Specifications</span>
                  </div>
                  {isCustomizedInDb ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-normal">
                      Stored in Supabase
                    </Badge>
                  ) : (
                    <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] font-normal">
                      TypeScript Fallback
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-neutral-400 block">ID:</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{activeTemplate.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Locale Support:</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {activeTemplate.supportsLocale ? "Bilingual (EN / ID)" : "English Only"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-400 block">Verified Sender Identity:</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200 break-all">{activeTemplate.sender}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Test Email Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-neutral-900 dark:text-white" />
              {language === "id" ? "Kirim Email Uji Coba" : "Send Test Email"}
            </DialogTitle>
            <DialogDescription>
              {language === "id"
                ? `Kirim templat "${activeTemplate.name}" dengan kode HTML saat ini ke inbox email Anda.`
                : `Deliver a live test rendering of "${activeTemplate.name}" using current HTML editor code.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Template:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{activeTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Sender Profile:</span>
                <span className="font-mono text-neutral-900 dark:text-white">{activeTemplate.sender}</span>
              </div>
              {activeTemplate.supportsLocale && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Locale:</span>
                  <span className="font-semibold uppercase text-neutral-900 dark:text-white">{templateLocale}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="testEmailRecipient" className="text-xs font-medium">
                {language === "id" ? "Email Penerima Uji Coba" : "Test Recipient Email"}
              </Label>
              <Input
                id="testEmailRecipient"
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="fadil@bafagih.id"
                className="text-sm"
              />
              <p className="text-[11px] text-neutral-500">
                {language === "id"
                  ? "Email akan dikirim secara langsung melalui server Resend."
                  : "Email will be dispatched directly through the Resend API."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTestModalOpen(false)}
              disabled={isSendingTest}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "id" ? "Mengirim..." : "Sending..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === "id" ? "Kirim Sekarang" : "Send Now"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
