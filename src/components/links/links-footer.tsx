"use client";

import { motion } from "framer-motion";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";

interface LinksFooterProps {
  locale: LinksLocale;
}

/**
 * Footer for the /links page.
 * Shows copyright and "Build with Bafdev" credit — same style as login page footer.
 */
const footerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LinksFooter({ locale }: LinksFooterProps) {
  return (
    <motion.footer
      className="py-6 px-3.5 space-y-1 text-center"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
    >
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        © {new Date().getFullYear()} Fadil Bafagih. {tLinks(locale, "all_rights")}
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {tLinks(locale, "build_with")}{" "}
        <a
          href="https://bafdev.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block align-baseline relative font-bold text-neutral-900 dark:text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 active:after:scale-x-100"
        >
          Bafdev
        </a>
      </p>
    </motion.footer>
  );
}
