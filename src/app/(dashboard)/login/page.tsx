"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthService } from "@/src/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/src/app/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { motion } from "framer-motion";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

/**
 * Admin login page — clean centered card with glassmorphism.
 * Matches the B&W minimalist design with theme-aware logo.
 */
export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setMounted(true), []);

  const loginSchema = z.object({
    email: z.string().optional(),
    password: z.string().optional(),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const email = data.email?.trim();
    const password = data.password;

    if (!email || !password) {
      toast.error(
        language === "en"
          ? "Please enter your email and password"
          : "Harap isi email dan password"
      );
      return;
    }

    try {
      await AuthService.signIn(email, password);
      toast.success(t("login.welcome_back"));
      router.push("/dashboard");
    } catch {
      toast.error(
        language === "en"
          ? "Invalid credentials"
          : "Kredensial tidak valid"
      );
    }
  };

  const logo = resolvedTheme === "dark" ? logoWhite : logoBlack;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950 relative">

      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="relative w-full max-w-md"
      >
        <Card className="border border-neutral-200/60 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-white/5">
          <CardHeader className="flex flex-col items-center pb-0 pt-8 text-center">
            {mounted && (
              <Image
                src={logo}
                alt="Fadil Bafagih"
                width={160}
                height={36}
                priority
                className="mb-5"
                style={{ height: "auto" }}
              />
            )}
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("login.title")}
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-6 pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  autoComplete="email"
                  {...register("email")}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 active:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:active:text-neutral-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                <Button type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-1.5">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("login.signing_in")}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span className="font-semibold">{t("login.sign_in")}</span>
                    </>
                  )}
                </Button>

                <div className="flex justify-center">
                  <a
                    href={
                      typeof window !== "undefined" && window.location.hostname.startsWith("admin.")
                        ? `https://fadil.bafagih.id/${language}`
                        : `/${language}`
                    }
                    className="flex items-center text-sm text-neutral-500 transition-colors hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    {t("login.back_to_home")}
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} Fadil Bafagih. {t("login.all_rights")}
        </p>
      </motion.div>
    </div>
  );
}
