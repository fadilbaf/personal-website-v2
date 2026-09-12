"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface LinksContactProps {
  locale: LinksLocale;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const textBlurVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/**
 * Get in Touch section with contact form.
 * Sends email via Web3Forms API.
 */
export function LinksContact({ locale }: LinksContactProps) {
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

  const onSubmit = async (data: ContactFormData) => {
    try {
      const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      if (!accessKey) {
        toast.error(tLinks(locale, "message_failed"));
        return;
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name: data.name,
          email: data.email,
          subject: `[Get In Touch] ${data.subject}`,
          message: data.message,
          from_name: "Fadil Bafagih | Personal Website",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(tLinks(locale, "message_sent"), {
          description: tLinks(locale, "message_sent_desc"),
        });
        reset();
      } else {
        throw new Error(result.message);
      }
    } catch {
      toast.error(tLinks(locale, "message_failed"), {
        description: tLinks(locale, "message_failed_desc"),
      });
    }
  };

  const onInvalid = () => {
    toast.error(tLinks(locale, "validation_error"));
  };

  const subjectOptions = [
    { value: tLinks(locale, "subject_collaboration"), label: tLinks(locale, "subject_collaboration") },
    { value: tLinks(locale, "subject_job"), label: tLinks(locale, "subject_job") },
    { value: tLinks(locale, "subject_freelance"), label: tLinks(locale, "subject_freelance") },
    { value: tLinks(locale, "subject_other"), label: tLinks(locale, "subject_other") },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.section
      className="px-3.5 pt-6 pb-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.div 
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        className="link-card-custom group relative overflow-hidden rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-5 dark:border-white/10 dark:bg-neutral-900/80"
      >
        {/* Spotlight cursor overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--spotlight-color), transparent 80%)`,
          }}
        />

        {/* Icon + Heading */}
        <motion.div 
          variants={iconVariants}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 mb-4 dark:bg-white/10 dark:text-neutral-400"
        >
          <Mail className="h-5 w-5" />
        </motion.div>
        <motion.h2 
          variants={textBlurVariants}
          className="text-lg font-bold text-neutral-900 dark:text-white"
        >
          {tLinks(locale, "get_in_touch")}
        </motion.h2>
        <motion.p 
          variants={textBlurVariants}
          className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 mb-5"
        >
          {tLinks(locale, "get_in_touch_desc")}
        </motion.p>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          {/* Name */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tLinks(locale, "name")}
            </Label>
            <Input
              {...register("name")}
              placeholder={tLinks(locale, "name_placeholder")}
              className="h-10"
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tLinks(locale, "email")}
            </Label>
            <Input
              {...register("email")}
              type="email"
              placeholder={tLinks(locale, "email_placeholder")}
              className="h-10"
            />
          </motion.div>

          {/* Subject */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tLinks(locale, "subject")}
            </Label>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  searchable={false}
                >
                  <SelectTrigger className="h-10!">
                    <SelectValue placeholder={tLinks(locale, "select_subject")} />
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
          </motion.div>

          {/* Message */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tLinks(locale, "message")}
            </Label>
            <Textarea
              {...register("message")}
              placeholder={tLinks(locale, "message_placeholder")}
              rows={4}
              className="min-h-[80px] resize-none"
            />
          </motion.div>

          {/* Submit */}
          <motion.div variants={fieldVariants}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-2 font-semibold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tLinks(locale, "sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {tLinks(locale, "send_message")}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.section>
  );
}
