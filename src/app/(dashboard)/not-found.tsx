"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

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
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
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

export default function DashboardNotFound() {
  let language = "en";
  try {
    const langContext = useLanguage();
    if (langContext?.language) {
      language = langContext.language;
    }
  } catch {
    // Fallback
  }

  const isId = language === "id";
  const title = isId ? "Oops! Halaman Tidak Ditemukan" : "Oops! Page Not Found";
  const description = isId
    ? "Halaman yang Anda cari di dashboard admin tidak ditemukan atau telah dipindahkan."
    : "The page you are looking for in the admin dashboard does not exist or has been moved.";
  const homeText = isId ? "Beranda Dashboard" : "Dashboard Home";
  const backText = isId ? "Kembali" : "Go Back";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center relative overflow-hidden font-sans select-none">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl mx-auto text-center flex flex-col items-center relative z-10"
      >
        {/* Metallic 404 */}
        <motion.h1
          variants={textBlurVariants}
          className="text-7xl sm:text-8xl md:text-[8rem] font-extrabold tracking-tighter bg-linear-to-b from-neutral-800 via-neutral-800/80 via-60% to-background dark:from-white dark:via-white/80 dark:via-60% dark:to-background bg-clip-text text-transparent leading-none select-none"
        >
          404
        </motion.h1>

        {/* Oops Title */}
        <motion.h2
          variants={textBlurVariants}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight relative -mt-3 sm:-mt-5 md:-mt-6 z-10"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={textBlurVariants}
          className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed mb-8 mt-2"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={buttonVariants}
          className="flex flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0"
        >
          <Button
            asChild
            className="flex-1 sm:flex-initial w-auto px-6 h-11 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-2 font-semibold cursor-pointer shadow-none"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              {homeText}
            </Link>
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1 sm:flex-initial w-auto px-6 h-11 border border-neutral-200 bg-transparent text-neutral-900 hover:bg-transparent hover:text-neutral-700 hover:border-neutral-300 active:text-neutral-700 active:border-neutral-300 dark:border-white/10 dark:text-white dark:bg-transparent dark:hover:bg-transparent dark:hover:text-neutral-300 dark:hover:border-white/20 dark:active:text-neutral-300 dark:active:border-white/20 gap-2 font-semibold cursor-pointer shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
