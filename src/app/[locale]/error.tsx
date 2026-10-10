"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tError, type ErrorLocale } from "@/src/lib/error-translations";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const textBlurVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const params = useParams() as { locale?: string };
  const locale = (params?.locale === "id" ? "id" : "en") as ErrorLocale;

  // Update page title metadata dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title =
        locale === "id"
          ? "Oops! Terjadi Kesalahan | Fadil Bafagih"
          : "Oops! Something Went Wrong | Fadil Bafagih";
    }
  }, [locale]);

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background relative overflow-hidden font-sans select-none px-6 py-12">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
      </div>

      {/* Main Centered 500 Hero */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-xl mx-auto text-center flex flex-col items-center"
      >
        {/* Metallic 500 */}
        <motion.h1
          variants={textBlurVariants}
          className="text-8xl sm:text-9xl md:text-[10rem] font-extrabold tracking-tight bg-linear-to-b from-neutral-800 via-neutral-800/80 via-60% to-background dark:from-white dark:via-white/80 dark:via-60% dark:to-background bg-clip-text text-transparent leading-none select-none px-4 inline-block"
        >
          500
        </motion.h1>

        {/* Oops Title */}
        <motion.h2
          variants={textBlurVariants}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight relative -mt-3 sm:-mt-5 md:-mt-6 z-10"
        >
          {tError(locale, "oops_title_500")}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={textBlurVariants}
          className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed mb-8 mt-2"
        >
          {tError(locale, "desc_500")}
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          variants={buttonVariants}
          className="flex flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0"
        >
          <Button
            onClick={() => reset()}
            className="flex-1 sm:flex-initial w-auto px-6 h-11 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-2 font-semibold cursor-pointer shadow-none"
          >
            <RefreshCw className="h-4 w-4" />
            {tError(locale, "try_again")}
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-initial w-auto px-6 h-11 border border-neutral-200 bg-transparent text-neutral-900 hover:bg-transparent hover:text-neutral-700 hover:border-neutral-300 active:text-neutral-700 active:border-neutral-300 dark:border-white/10 dark:text-white dark:bg-transparent dark:hover:bg-transparent dark:hover:text-neutral-300 dark:hover:border-white/20 dark:active:text-neutral-300 dark:active:border-white/20 gap-2 font-semibold cursor-pointer shadow-none"
          >
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4" />
              {tError(locale, "go_home")}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
