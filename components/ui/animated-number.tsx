"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/src/app/lib/utils";

interface RollingDigitProps {
  digit: number;
  isInView: boolean;
  delay?: number;
  duration?: number;
}

export function RollingDigit({
  digit,
  isInView,
  delay = 0,
  duration = 1.3,
}: RollingDigitProps) {
  return (
    <span className="inline-block relative h-[1.15em] overflow-hidden leading-none align-middle">
      <motion.span
        initial={{ y: "0%" }}
        animate={{ y: isInView ? `-${digit * 10}%` : "0%" }}
        transition={{
          duration,
          ease: [0.16, 1, 0.3, 1],
          delay,
        }}
        className="flex flex-col select-none"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <span key={num} className="h-[1.15em] flex items-center justify-center">
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

interface AnimatedNumberProps {
  value: number | string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 1.3,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const strValue = typeof value === "number" ? value.toLocaleString() : String(value);
  const chars = strValue.split("");

  return (
    <span
      ref={ref}
      className={cn("inline-flex items-center justify-center font-bold select-none", className)}
    >
      {chars.map((ch, idx) => {
        const isNum = !isNaN(Number(ch)) && ch.trim() !== "";
        if (isNum) {
          return (
            <RollingDigit
              key={idx}
              digit={Number(ch)}
              isInView={isInView}
              delay={idx * 0.05}
              duration={duration}
            />
          );
        }
        return (
          <span key={idx} className="inline-block align-middle">
            {ch}
          </span>
        );
      })}
    </span>
  );
}
