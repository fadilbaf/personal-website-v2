"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Send, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Contact } from "@/src/types/database";
import bafdevLogo from "@/src/assets/images/bafdev-logo.svg";

// Inline SVG brand icons — copied exactly from main-hero.tsx
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface MainContactProps {
  contact: Contact | null;
  locale: MainLocale;
}

const cardVariants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function MainContact({ contact, locale }: MainContactProps) {
  const [isShimmering, setIsShimmering] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scrollFlag = sessionStorage.getItem("scroll_to_contact") === "true" || sessionStorage.getItem("scroll-target") === "contact";
      if (scrollFlag) {
        setTimeout(() => {
          const element = document.getElementById("contact");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
      e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          locale,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(tMain(locale, "message_sent"), {
          description: tMain(locale, "message_sent_desc"),
        });
        reset({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch {
      toast.error(tMain(locale, "message_failed"), {
        description: tMain(locale, "message_failed_desc"),
      });
    }
  };

  const onInvalid = () => {
    toast.error(tMain(locale, "validation_error"));
  };

  const subjectOptions = [
    { value: tMain(locale, "subject_collaboration"), label: tMain(locale, "subject_collaboration") },
    { value: tMain(locale, "subject_job"), label: tMain(locale, "subject_job") },
    { value: tMain(locale, "subject_freelance"), label: tMain(locale, "subject_freelance") },
    { value: tMain(locale, "subject_other"), label: tMain(locale, "subject_other") },
  ];

  const socialLinks = [
    { url: contact?.linkedin_url, icon: LinkedInIcon, label: "LinkedIn" },
    { url: contact?.github_url, icon: GitHubIcon, label: "GitHub" },
    { url: contact?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: contact?.tiktok_url, icon: TikTokIcon, label: "TikTok" },
  ].filter((link) => link.url);

  return (
    <section id="contact" className="scroll-mt-20 w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-4 pb-6 md:pt-6 md:pb-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Section Header — matched exactly with projects, achievements, and blogs */}
        <div className="flex flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-1.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Mail className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
              <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
                {tMain(locale, "contact_title")}
              </h2>
            </div>
            <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "contact_desc")}
            </p>
          </motion.div>
        </div>

        {/* Form & Social Layout */}
        <div className="flex flex-col gap-6">
          {/* Form Card — matched exactly with project/achievement cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={cardVariants}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchMove}
            onTouchMove={handleTouchMove}
            className="link-card-custom group relative flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden p-5 text-left"
          >
            {/* Spotlight cursor overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--spotlight-color), transparent 80%)`,
              }}
            />
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="relative space-y-4">
              {/* Row: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <Label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    {tMain(locale, "name")}
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder={tMain(locale, "name_placeholder")}
                    className="h-10"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 text-left">
                  <Label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    {tMain(locale, "email")}
                  </Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder={tMain(locale, "email_placeholder")}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5 text-left">
                <Label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {tMain(locale, "subject")}
                </Label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} searchable={false}>
                      <SelectTrigger className="h-10!">
                        <SelectValue placeholder={tMain(locale, "select_subject")} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 text-left">
                <Label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {tMain(locale, "message")}
                </Label>
                <Textarea
                  {...register("message")}
                  placeholder={tMain(locale, "message_placeholder")}
                  rows={4}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-2 font-semibold cursor-pointer rounded-lg inline-flex items-center justify-center transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{tMain(locale, "sending")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{tMain(locale, "send_message")}</span>
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Social Links Row */}
          {socialLinks.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2 text-left">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-[13px] font-normal text-neutral-500 dark:text-neutral-400 shrink-0"
              >
                {tMain(locale, "find_me_socmed")}
              </motion.span>
              <TooltipProvider>
                <div className="flex items-center gap-3 flex-wrap">
                  {socialLinks.map(({ url, icon: Icon, label }, index) => (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                        <motion.a
                          href={url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            duration: 0.35,
                            ease: "easeOut" as const,
                            delay: index * 0.06,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-700"
                          aria-label={label}
                          onClick={(e) => {
                            e.currentTarget.blur();
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          )}

          {/* Build with Bafdev Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            whileTap={{ y: -3 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            onMouseEnter={() => setIsShimmering(true)}
            onTouchStart={() => setIsShimmering(true)}
            className="group relative p-[1.5px] sm:p-[2px] rounded-[16px] border-none bg-linear-to-br from-neutral-300 via-neutral-100 to-neutral-800 dark:bg-[radial-gradient(circle_300px_at_80%_-10%,#ffffff,#181b1b)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-none block w-full mt-2"
          >
            {/* Glow behind button (Top-Right) */}
            <div className="absolute top-0 right-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] group-hover:shadow-[0_0_40px_#ffffff30] group-active:shadow-[0_0_40px_#ffffff30] transition-all duration-300 ease-out -z-10" />

            {/* Glow behind button (Bottom-Left) */}
            <div className="absolute bottom-0 left-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] group-hover:shadow-[0_0_40px_#ffffff30] group-active:shadow-[0_0_40px_#ffffff30] transition-all duration-300 ease-out -z-10" />

            {/* Inner content */}
            <div className="relative flex flex-col gap-5 rounded-[14px] bg-[radial-gradient(circle_300px_at_80%_-50%,#a3a3a3,#0f1111)] dark:bg-[radial-gradient(circle_300px_at_80%_-50%,#777777,#0f1111)] p-6 sm:p-8 md:p-10 transition-colors duration-300 z-10 overflow-hidden w-full">
              {/* Shimmer sweep layer */}
              {isShimmering && (
                <div
                  className="main-card-shimmer pointer-events-none"
                  onAnimationEnd={() => setIsShimmering(false)}
                />
              )}

              {/* Inner glow layer */}
              <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_220px_at_0%_100%,#ffffff33,#ffffff0d,transparent)] z-[-1]" />

              {/* Left Side: Title, Subtitle, Button */}
              <div className="flex flex-col gap-5 text-left max-w-[85%] sm:max-w-[75%]">
                <div>
                  <h3 className="text-xl md:text-2xl font-normal text-white">
                    {locale === "id" ? (
                      <>Bangun bersama <span className="font-bold">Bafdev</span></>
                    ) : (
                      <>Build with <span className="font-bold">Bafdev</span></>
                    )}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-400 mt-2 leading-relaxed">
                    {tMain(locale, "build_with_bafdev_desc")}
                  </p>
                </div>

                <a
                  href="https://bafdev.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 w-fit rounded-lg bg-white px-5 h-10 text-xs md:text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:bg-neutral-100 cursor-pointer"
                >
                  <span>{tMain(locale, "go_to_bafdev")}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              </div>

              {/* Right Side: Logo (Absolute bottom-right, aligned with padding) */}
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 shrink-0 pointer-events-none select-none z-10">
                <img
                  src={bafdevLogo.src}
                  alt="Bafdev Logo"
                  className="h-7 sm:h-9 md:h-11 w-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
