"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/src/app/lib/utils";

interface RollingDigitProps {
  digit: number;
  animate: boolean;
  delay?: number;
  duration?: number;
}

export function RollingDigit({
  digit,
  animate,
  delay = 0,
  duration = 1.2,
}: RollingDigitProps) {
  return (
    <span className="inline-block relative h-[1.15em] overflow-hidden leading-none align-middle">
      <motion.span
        initial={{ y: "0%" }}
        animate={{ y: animate ? `-${digit * 10}%` : "0%" }}
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
  duration = 1.2,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true);
    }
  }, [isInView, hasStarted]);

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
              key={`digit-${idx}`}
              digit={Number(ch)}
              animate={hasStarted || isInView}
              delay={idx * 0.04}
              duration={duration}
            />
          );
        }
        return (
          <span key={`char-${idx}`} className="inline-block align-middle">
            {ch}
          </span>
        );
      })}
    </span>
  );
}
