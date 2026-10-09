/**
 * Static translations for the public /links page.
 * Separated from dashboard translations (translations.ts) since
 * the links page uses URL-based locale routing, not LanguageProvider.
 */

export type LinksLocale = "en" | "id";

const linksTranslations: Record<LinksLocale, Record<string, string>> = {
  en: {
    // Profile section
    open_to_remote: "Open to Remote",

    // Section labels
    main: "Main",
    social_media: "Social Media",

    // Main links
    main_website_title: "Main Website",
    main_website_desc: "Personal Website & Portfolio",
    bafdev_title: "Build with Bafdev",
    bafdev_desc: "Develop Your Ideas. Digitize Your Identity.",

    // Social media links
    linkedin_title: "LinkedIn",
    linkedin_desc: "Connect with me professionally",
    github_title: "GitHub",
    github_desc: "Explore my open-source work",
    instagram_title: "Instagram",
    instagram_desc: "Follow my creative journey",
    tiktok_title: "TikTok",
    tiktok_desc: "Watch engaging and fun content",

    // Get in Touch
    get_in_touch: "Get In Touch",
    get_in_touch_desc:
      "Feel free to reach out for collaborations or just a friendly hello",
    name: "Name",
    name_placeholder: "John Doe",
    email: "Email",
    email_placeholder: "johndoe@example.com",
    subject: "Subject",
    message: "Message",
    message_placeholder: "Tell me about your project or just say hi!",
    send_message: "Send Message",
    sending: "Sending...",

    // Subject options
    select_subject: "Select subject",
    subject_collaboration: "Collaboration",
    subject_job: "Job Opportunity",
    subject_freelance: "Freelance",
    subject_other: "Other",

    // Toast messages
    message_sent: "Message sent successfully!",
    message_sent_desc:
      "Thank you for reaching out. I'll get back to you soon.",
    message_failed: "Failed to send message",
    message_failed_desc: "Something went wrong. Please try again later.",
    validation_error: "Please fill in all required fields",

    // Share modal
    share_links: "Share links",
    copy_url: "Copy URL",
    copied: "Copied!",
    copied_desc: "Link copied to clipboard",

    // Footer
    all_rights: "All Rights Reserved.",
    build_with: "Build with",

    // Header tooltips
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    switch_lang: "Bahasa Indonesia",
    share: "Share",
  },
  id: {
    // Profile section
    open_to_remote: "Open to Remote",

    // Section labels
    main: "Utama",
    social_media: "Media Sosial",

    // Main links
    main_website_title: "Situs Utama",
    main_website_desc: "Situs Web & Portofolio Pribadi",
    bafdev_title: "Bangun bersama Bafdev",
    bafdev_desc: "Kembangkan Idemu. Digitalisasi Identitasmu.",

    // Social media links
    linkedin_title: "LinkedIn",
    linkedin_desc: "Terhubung secara profesional",
    github_title: "GitHub",
    github_desc: "Jelajahi karya open-source saya",
    instagram_title: "Instagram",
    instagram_desc: "Ikuti perjalanan kreatif saya",
    tiktok_title: "TikTok",
    tiktok_desc: "Tonton konten menarik dan seru",

    // Get in Touch
    get_in_touch: "Hubungi Saya",
    get_in_touch_desc:
      "Jangan ragu untuk menghubungi untuk kolaborasi atau sekadar menyapa",
    name: "Nama",
    name_placeholder: "John Doe",
    email: "Email",
    email_placeholder: "johndoe@example.com",
    subject: "Subjek",
    message: "Pesan",
    message_placeholder: "Ceritakan tentang proyek Anda atau sekadar menyapa!",
    send_message: "Kirim Pesan",
    sending: "Mengirim...",

    // Subject options
    select_subject: "Pilih subjek",
    subject_collaboration: "Kolaborasi",
    subject_job: "Peluang Kerja",
    subject_freelance: "Freelance",
    subject_other: "Lainnya",

    // Toast messages
    message_sent: "Pesan berhasil terkirim!",
    message_sent_desc:
      "Terima kasih telah menghubungi. Saya akan segera membalas.",
    message_failed: "Gagal mengirim pesan",
    message_failed_desc: "Terjadi kesalahan. Silakan coba lagi nanti.",
    validation_error: "Harap isi semua kolom yang wajib diisi",

    // Share modal
    share_links: "Bagikan tautan",
    copy_url: "Salin URL",
    copied: "Tersalin!",
    copied_desc: "Tautan disalin ke clipboard",

    // Footer
    all_rights: "Hak Cipta Dilindungi.",
    build_with: "Dibangun dengan",

    // Header tooltips
    theme_light: "Mode Terang",
    theme_dark: "Mode Gelap",
    switch_lang: "English",
    share: "Bagikan",
  },
};

/**
 * Get a translation string for the links page.
 * Falls back to English if the key is not found.
 */
export function tLinks(locale: LinksLocale, key: string): string {
  const dict = linksTranslations[locale] || linksTranslations.en;
  return dict[key] || linksTranslations.en[key] || key;
}
