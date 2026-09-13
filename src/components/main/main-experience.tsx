"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Users,
  ChevronRight,
  Calendar,
  MapPin,
  Eye,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Career, Education, Organization } from "@/src/types/database";
import { toStorageUrl } from "@/src/lib/storage-url";

interface MainExperienceProps {
  careers: Career[];
  educations: Education[];
  organizations: Organization[];
  locale: MainLocale;
}

type TabType = "career" | "education" | "organizations";

// Helper to check if a YYYY-MM-DD date is in the future compared to the current month/year
function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 2) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1-indexed

  if (year > todayYear) return true;
  if (year === todayYear && month > todayMonth) return true;
  return false;
}

// Timezone-safe date formatting helper (YYYY-MM-DD to "MMM YYYY")
function formatDate(dateStr: string, locale: MainLocale): string {
  if (!dateStr) return "";
  
  const normalized = dateStr.trim().toLowerCase();
  if (normalized === "present" || normalized === "sekarang" || normalized === "current" || normalized === "") {
    return tMain(locale, "present");
  }

  if (isFutureDate(dateStr)) {
    return tMain(locale, "present");
  }

  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;

  const year = parts[0];
  const monthVal = parseInt(parts[1], 10);

  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

  const monthNames = locale === "id" ? monthNamesId : monthNamesEn;
  const monthName = monthNames[monthVal - 1] || "";

  return `${monthName} ${year}`;
}

// Localized duration calculation helper
function calculateDuration(startDateStr: string, endDateStr: string | null, locale: MainLocale): string {
  if (!startDateStr) return "";
  const startParts = startDateStr.split("-");
  if (startParts.length < 2) return "";
  const startYear = parseInt(startParts[0], 10);
  const startMonth = parseInt(startParts[1], 10);

  let endYear: number;
  let endMonth: number;

  const isPresent = !endDateStr || 
                    endDateStr.trim().toLowerCase() === "present" || 
                    endDateStr.trim().toLowerCase() === "sekarang" || 
                    endDateStr.trim().toLowerCase() === "current" || 
                    endDateStr.trim() === "" ||
                    isFutureDate(endDateStr);

  if (isPresent) {
    const today = new Date();
    endYear = today.getFullYear();
    endMonth = today.getMonth() + 1; // 1-indexed
  } else {
    const endParts = endDateStr!.split("-");
    if (endParts.length < 2) {
      const today = new Date();
      endYear = today.getFullYear();
      endMonth = today.getMonth() + 1;
    } else {
      endYear = parseInt(endParts[0], 10);
      endMonth = parseInt(endParts[1], 10);
    }
  }

  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  if (totalMonths <= 0) return "";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yrText = locale === "id" ? tMain(locale, "year") : (years === 1 ? tMain(locale, "year") : tMain(locale, "years"));
  const moText = locale === "id" ? tMain(locale, "month") : (months === 1 ? tMain(locale, "month") : tMain(locale, "months"));

  if (years > 0) {
    if (months > 0) {
      return `${years} ${yrText} ${months} ${moText}`;
    }
    return `${years} ${yrText}`;
  }
  return `${totalMonths} ${moText}`;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {}
};

const itemVariants: Variants = {
  hidden: {},
  visible: {}
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: (index: number) => ({
    scaleY: 1,
    transition: { duration: 0.45, ease: "linear", delay: index * 0.38 }
  })
};

const dotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.25,
      delay: index * 0.38 + 0.18
    }
  })
};

const contentVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 15 },
  visible: (index: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: index * 0.38 + 0.22 }
  })
};

export function MainExperience({
  careers,
  educations,
  organizations,
  locale
}: MainExperienceProps) {
  const [activeTab, setActiveTab] = useState<TabType>("career");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<{
    logoUrl?: string | null;
    name: string;
    role: string;
    skills: any[];
  } | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isModalOpen]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter published items
  const publishedCareers = careers.filter((c) => c.is_published);
  const publishedEducations = educations.filter((e) => e.is_published);
  const publishedOrganizations = organizations.filter((o) => o.is_published);

  // Tab definitions
  const tabs = [
    { id: "career", label: tMain(locale, "tab_career"), icon: Briefcase, count: publishedCareers.length },
    { id: "education", label: tMain(locale, "tab_education"), icon: GraduationCap, count: publishedEducations.length },
    { id: "organizations", label: tMain(locale, "tab_organizations"), icon: Users, count: publishedOrganizations.length },
  ] as const;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scrollFlag = sessionStorage.getItem("scroll_to_experiences") === "true" || sessionStorage.getItem("scroll-target") === "experiences";
      if (scrollFlag) {
        setTimeout(() => {
          const element = document.getElementById("experiences");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, []);

  return (
    <section id="experiences" className="scroll-mt-20 w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-4 pb-6 md:pt-6 md:pb-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
            <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
              {tMain(locale, "experiences_title")}
            </h2>
          </div>
          <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
            {tMain(locale, "experiences_desc")}
          </p>
        </motion.div>

        {/* Section Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 pt-3 pb-6 px-4 sm:pt-4 sm:pb-6 sm:px-6"
        >

          {/* Tab Navigation */}
          <div className="flex flex-row flex-nowrap items-center gap-2 mb-0 overflow-x-auto pb-3 sm:pb-4 scrollbar-custom -mx-4 sm:-mx-6 px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    setActiveTab(tab.id as TabType);
                    setExpandedItems({});
                    e.currentTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center"
                    });
                  }}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors whitespace-nowrap px-4 py-2 rounded-lg ${activeTab === tab.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <hr className="border-neutral-200 dark:border-white/10 -mx-4 sm:-mx-6 mb-6 mt-0" />

          {/* Experience List Container */}
          <div className="relative">

            {/* Active Tab Content with Staggered Entry Animation */}
            <AnimatePresence mode="wait">

              {/* Tab: Careers */}
              {activeTab === "career" && (
                <motion.div
                  key="career-tab"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                  className="relative flex flex-col"
                >
                  {publishedCareers.map((item, index) => {
                    const isExpanded = !!expandedItems[item.id];
                    const dateRange = `${formatDate(item.start_date, locale)} - ${item.end_date ? formatDate(item.end_date, locale) : tMain(locale, "present")
                      }`;
                    const duration = calculateDuration(item.start_date, item.end_date, locale);
                    const isLast = index === publishedCareers.length - 1;

                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="relative pl-4 sm:pl-6 pb-8 last:pb-0"
                      >
                        {/* Timeline Line Segment */}
                        <motion.div
                          custom={index}
                          variants={lineVariants}
                          style={{ originY: 0 }}
                          className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-white/10"
                        />

                        {/* Bullet Dot */}
                        <motion.div
                          custom={index}
                          variants={dotVariants}
                          className="absolute left-[-5px] top-[23px] sm:top-[31px] w-2.5 h-2.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-neutral-900 z-10 aspect-square shrink-0"
                        />

                        <motion.div
                          custom={index}
                          variants={contentVariants}
                          className="w-full flex flex-col"
                        >
                          {/* Top Metadata & Header Info */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-start gap-4">
                              {/* Logo */}
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/logo-link h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0"
                                >
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.company}
                                      className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover/logo-link:scale-105"
                                    />
                                  ) : (
                                    <Briefcase className="h-5 w-5 text-neutral-400" />
                                  )}
                                </a>
                              ) : (
                                <div className="h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.company}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <Briefcase className="h-5 w-5 text-neutral-400" />
                                  )}
                                </div>
                              )}

                              {/* Job & Company Info */}
                              <div className="flex flex-col text-left">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                                  {locale === "id" ? item.role_id : item.role_en}
                                </h3>
                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                                  {item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 active:underline active:text-neutral-800 dark:active:text-neutral-200 transition-colors"
                                    >
                                      {item.company}
                                    </a>
                                  ) : (
                                    item.company
                                  )}
                                  {item.location && (
                                    <>
                                      <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                                      {item.location}
                                    </>
                                  )}
                                </p>

                                {/* Work Type & Model Badges */}
                                <div className="flex items-center gap-1.5 mt-2">
                                  {(locale === "id" ? item.type_id : item.type_en) && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {locale === "id" ? item.type_id : item.type_en}
                                    </span>
                                  )}
                                  {(locale === "id" ? item.model_id : item.model_en) && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {locale === "id" ? item.model_id : item.model_en}
                                    </span>
                                  )}
                                </div>

                                {/* Date Range & Duration Badge (Mobile only) */}
                                <div className="flex flex-row items-center gap-2 mt-2 sm:hidden">
                                  <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                    {dateRange}
                                  </span>
                                  {duration && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {duration}
                                    </span>
                                  )}
                                </div>

                                {/* Interactive Toggle Button */}
                                <div className="mt-2.5">
                                  <button
                                    onClick={() => toggleItem(item.id)}
                                    className="inline-flex items-center gap-1 -ml-1 text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer outline-none select-none"
                                  >
                                    <motion.span
                                      animate={{ rotate: isExpanded ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="inline-flex items-center justify-center"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </motion.span>
                                    <span>
                                      {isExpanded ? tMain(locale, "hide_details") : tMain(locale, "show_details")}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Date Range & Duration Badge (Desktop only) */}
                            <div className="hidden sm:flex flex-row items-center gap-2 mt-0">
                              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                {dateRange}
                              </span>
                              {duration && (
                                <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                  {duration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detail Drawer Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden pl-[72px] sm:pl-[88px]"
                              >
                                <div className="pt-0.5 flex flex-col gap-3">
                                  {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).length > 0 && (
                                    <ul className="list-disc list-outside pl-4 text-[13px] font-light text-neutral-700 dark:text-neutral-300 space-y-0.5 leading-relaxed marker:text-[10px]">
                                      {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).map((point, i) => (
                                        <li key={i}>{point}</li>
                                      ))}
                                    </ul>
                                  )}

                                  {item.career_skills && item.career_skills.length > 0 && (
                                    <>
                                      {/* Desktop view skill pills */}
                                      <div className="hidden sm:flex flex-wrap gap-2 pt-0.5">
                                        {item.career_skills.slice(0, 5).map((cs) => {
                                          if (!cs.skill) return null;
                                          return (
                                            <div
                                              key={cs.skill.id}
                                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-transparent dark:border-white/10 text-xs font-normal text-neutral-600 dark:text-neutral-400 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
                                            >
                                              {cs.skill.icon_url ? (
                                                <img
                                                  src={toStorageUrl(cs.skill.icon_url)}
                                                  alt={cs.skill.name}
                                                  className="w-3 h-3 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover:scale-110"
                                                />
                                              ) : (
                                                <Code2 className="w-3 h-3 text-neutral-400" />
                                              )}
                                              <span>{cs.skill.name}</span>
                                            </div>
                                          );
                                        })}
                                        {item.career_skills.length > 5 && (
                                          <button
                                            onClick={() => {
                                              setActiveModalItem({
                                                logoUrl: item.logo_url,
                                                name: item.company,
                                                role: locale === "id" ? item.role_id : item.role_en,
                                                skills: item.career_skills || []
                                              });
                                              setIsAnimating(true);
                                              setIsModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-white/10 bg-transparent text-xs font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-white/5 dark:active:bg-white/5 transition-colors cursor-pointer select-none"
                                          >
                                            <Eye className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                            <span>+{item.career_skills.length - 5}</span>
                                            <span>{tMain(locale, "view_all")}</span>
                                          </button>
                                        )}
                                      </div>

                                      {/* Mobile view skill pills */}
                                      <div className="flex sm:hidden flex-wrap gap-2 pt-0.5">
                                        {item.career_skills.slice(0, 3).map((cs) => {
                                          if (!cs.skill) return null;
                                          return (
                                            <div
                                              key={cs.skill.id}
                                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-transparent dark:border-white/10 text-xs font-normal text-neutral-600 dark:text-neutral-400 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
                                            >
                                              {cs.skill.icon_url ? (
                                                <img
                                                  src={toStorageUrl(cs.skill.icon_url)}
                                                  alt={cs.skill.name}
                                                  className="w-3 h-3 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover:scale-110"
                                                />
                                              ) : (
                                                <Code2 className="w-3 h-3 text-neutral-400" />
                                              )}
                                              <span>{cs.skill.name}</span>
                                            </div>
                                          );
                                        })}
                                        {item.career_skills.length > 3 && (
                                          <button
                                            onClick={() => {
                                              setActiveModalItem({
                                                logoUrl: item.logo_url,
                                                name: item.company,
                                                role: locale === "id" ? item.role_id : item.role_en,
                                                skills: item.career_skills || []
                                              });
                                              setIsAnimating(true);
                                              setIsModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-white/10 bg-transparent text-xs font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-white/5 dark:active:bg-white/5 transition-colors cursor-pointer select-none"
                                          >
                                            <Eye className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                            <span>+{item.career_skills.length - 3}</span>
                                            <span>{tMain(locale, "view_all")}</span>
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {publishedCareers.length === 0 && (
                    <p className="text-sm text-neutral-500 italic text-center py-12">
                      {tMain(locale, "no_career_found")}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Tab: Education */}
              {activeTab === "education" && (
                <motion.div
                  key="education-tab"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                  className="relative flex flex-col"
                >
                  {publishedEducations.map((item, index) => {
                    const isExpanded = !!expandedItems[item.id];
                    const dateRange = `${formatDate(item.start_date, locale)} - ${item.end_date ? formatDate(item.end_date, locale) : tMain(locale, "present")
                      }`;
                    const duration = calculateDuration(item.start_date, item.end_date, locale);
                    const isLast = index === publishedEducations.length - 1;

                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="relative pl-4 sm:pl-6 pb-8 last:pb-0"
                      >
                        {/* Timeline Line Segment */}
                        <motion.div
                          custom={index}
                          variants={lineVariants}
                          style={{ originY: 0 }}
                          className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-white/10"
                        />

                        {/* Bullet Dot */}
                        <motion.div
                          custom={index}
                          variants={dotVariants}
                          className="absolute left-[-5px] top-[23px] sm:top-[31px] w-2.5 h-2.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-neutral-900 z-10 aspect-square shrink-0"
                        />

                        <motion.div
                          custom={index}
                          variants={contentVariants}
                          className="w-full flex flex-col"
                        >
                          {/* Top Metadata & Header Info */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-start gap-4">
                              {/* Logo */}
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/logo-link h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0"
                                >
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.school}
                                      className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover/logo-link:scale-105"
                                    />
                                  ) : (
                                    <GraduationCap className="h-5 w-5 text-neutral-400" />
                                  )}
                                </a>
                              ) : (
                                <div className="h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.school}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <GraduationCap className="h-5 w-5 text-neutral-400" />
                                  )}
                                </div>
                              )}

                              {/* Degree & School Info */}
                              <div className="flex flex-col text-left">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                                  {locale === "id" ? item.level_major_id : item.level_major_en}
                                </h3>
                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                                  {item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 active:underline active:text-neutral-800 dark:active:text-neutral-200 transition-colors"
                                    >
                                      {item.school}
                                    </a>
                                  ) : (
                                    item.school
                                  )}
                                  {item.location && (
                                    <>
                                      <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                                      {item.location}
                                    </>
                                  )}
                                </p>

                                {/* GPA Badge */}
                                {item.gpa !== null && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {tMain(locale, "gpa")}: {item.gpa.toFixed(2)}/{item.max_gpa ? item.max_gpa.toFixed(2) : "4.00"}
                                    </span>
                                  </div>
                                )}

                                {/* Date Range & Duration Badge (Mobile only) */}
                                <div className="flex flex-row items-center gap-2 mt-2 sm:hidden">
                                  <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                    {dateRange}
                                  </span>
                                  {duration && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {duration}
                                    </span>
                                  )}
                                </div>

                                {/* Interactive Toggle Button */}
                                <div className="mt-2.5">
                                  <button
                                    onClick={() => toggleItem(item.id)}
                                    className="inline-flex items-center gap-1 -ml-1 text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer outline-none select-none"
                                  >
                                    <motion.span
                                      animate={{ rotate: isExpanded ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="inline-flex items-center justify-center"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </motion.span>
                                    <span>
                                      {isExpanded ? tMain(locale, "hide_details") : tMain(locale, "show_details")}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Date Range & Duration Badge (Desktop only) */}
                            <div className="hidden sm:flex flex-row items-center gap-2 mt-0">
                              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                {dateRange}
                              </span>
                              {duration && (
                                <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                  {duration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detail Drawer Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden pl-[72px] sm:pl-[88px]"
                              >
                                <div className="pt-0.5 flex flex-col">
                                  {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).length > 0 && (
                                    <ul className="list-disc list-outside pl-4 text-[13px] font-light text-neutral-700 dark:text-neutral-300 space-y-0.5 leading-relaxed marker:text-[10px]">
                                      {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).map((point, i) => (
                                        <li key={i}>{point}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {publishedEducations.length === 0 && (
                    <p className="text-sm text-neutral-500 italic text-center py-12">
                      {tMain(locale, "no_education_found")}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Tab: Organizations */}
              {activeTab === "organizations" && (
                <motion.div
                  key="organizations-tab"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                  className="relative flex flex-col"
                >
                  {publishedOrganizations.map((item, index) => {
                    const isExpanded = !!expandedItems[item.id];
                    const dateRange = `${formatDate(item.start_date, locale)} - ${item.end_date ? formatDate(item.end_date, locale) : tMain(locale, "present")
                      }`;
                    const duration = calculateDuration(item.start_date, item.end_date, locale);
                    const isLast = index === publishedOrganizations.length - 1;

                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="relative pl-4 sm:pl-6 pb-8 last:pb-0"
                      >
                        {/* Timeline Line Segment */}
                        <motion.div
                          custom={index}
                          variants={lineVariants}
                          style={{ originY: 0 }}
                          className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-white/10"
                        />

                        {/* Bullet Dot */}
                        <motion.div
                          custom={index}
                          variants={dotVariants}
                          className="absolute left-[-5px] top-[23px] sm:top-[31px] w-2.5 h-2.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-neutral-900 z-10 aspect-square shrink-0"
                        />

                        <motion.div
                          custom={index}
                          variants={contentVariants}
                          className="w-full flex flex-col"
                        >
                          {/* Top Metadata & Header Info */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-start gap-4">
                              {/* Logo */}
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/logo-link h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0"
                                >
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.organization}
                                      className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover/logo-link:scale-105"
                                    />
                                  ) : (
                                    <Users className="h-5 w-5 text-neutral-400" />
                                  )}
                                </a>
                              ) : (
                                <div className="h-14 w-14 sm:h-18 sm:w-18 p-1.5 sm:p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.logo_url ? (
                                    <img
                                      src={toStorageUrl(item.logo_url)}
                                      alt={item.organization}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <Users className="h-5 w-5 text-neutral-400" />
                                  )}
                                </div>
                              )}

                              {/* Role & Org Info */}
                              <div className="flex flex-col text-left">
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                                  {locale === "id" ? item.role_id : item.role_en}
                                </h3>
                                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                                  {item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 active:underline active:text-neutral-800 dark:active:text-neutral-200 transition-colors"
                                    >
                                      {item.organization}
                                    </a>
                                  ) : (
                                    item.organization
                                  )}
                                  {item.location && (
                                    <>
                                      <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                                      {item.location}
                                    </>
                                  )}
                                </p>

                                {/* Date Range & Duration Badge (Mobile only) */}
                                <div className="flex flex-row items-center gap-2 mt-2 sm:hidden">
                                  <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                    {dateRange}
                                  </span>
                                  {duration && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                      {duration}
                                    </span>
                                  )}
                                </div>

                                {/* Interactive Toggle Button */}
                                <div className="mt-2.5">
                                  <button
                                    onClick={() => toggleItem(item.id)}
                                    className="inline-flex items-center gap-1 -ml-1 text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer outline-none select-none"
                                  >
                                    <motion.span
                                      animate={{ rotate: isExpanded ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="inline-flex items-center justify-center"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </motion.span>
                                    <span>
                                      {isExpanded ? tMain(locale, "hide_details") : tMain(locale, "show_details")}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Date Range & Duration Badge (Desktop only) */}
                            <div className="hidden sm:flex flex-row items-center gap-2 mt-0">
                              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                {dateRange}
                              </span>
                              {duration && (
                                <span className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                  {duration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detail Drawer Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden pl-[72px] sm:pl-[88px]"
                              >
                                <div className="pt-0.5 flex flex-col">
                                  {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).length > 0 && (
                                    <ul className="list-disc list-outside pl-4 text-[13px] font-light text-neutral-700 dark:text-neutral-300 space-y-0.5 leading-relaxed marker:text-[10px]">
                                      {((locale === "id" ? item.detail_points_id : item.detail_points_en) || []).map((point, i) => (
                                        <li key={i}>{point}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {publishedOrganizations.length === 0 && (
                    <p className="text-sm text-neutral-500 italic text-center py-12">
                      {tMain(locale, "no_organization_found")}
                    </p>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </motion.div>

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-white/10 ring-0 shadow-2xl p-6 rounded-2xl">
          {activeModalItem && (
            <div className="flex flex-col gap-3.5">
              <DialogHeader className="mb-0 text-left">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {activeModalItem.logoUrl ? (
                      <img
                        src={activeModalItem.logoUrl}
                        alt={activeModalItem.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Briefcase className="h-4.5 w-4.5 text-neutral-500" />
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-none">
                    {tMain(locale, "all_skills_title")}
                  </DialogTitle>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {tMain(locale, "skills_at")} {activeModalItem.name} &middot; {activeModalItem.role}
                </p>
              </DialogHeader>

              <div className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-white/10 dark:bg-neutral-950/20 overflow-hidden">
                <motion.div
                  key={activeModalItem.name}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.03
                      }
                    }
                  }}
                  className={`flex flex-wrap items-center gap-2 max-h-[40vh] scrollbar-custom p-4 sm:p-5 ${isAnimating ? "overflow-hidden" : "overflow-y-auto"}`}
                >
                  {activeModalItem.skills.map((cs) => {
                    if (!cs.skill) return null;
                    return (
                      <motion.div
                        key={cs.skill.id}
                        variants={{
                          hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
                          visible: {
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                            transition: {
                              duration: 0.4,
                              ease: "easeOut"
                            }
                          }
                        }}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-transparent dark:border-white/10 text-sm font-normal text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
                      >
                        {cs.skill.icon_url ? (
                          <img
                            src={toStorageUrl(cs.skill.icon_url)}
                            alt={cs.skill.name}
                            className="w-3.5 h-3.5 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover:scale-110"
                          />
                        ) : (
                          <Code2 className="w-3.5 h-3.5 text-black dark:text-white transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                        )}
                        <span>{cs.skill.name}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
