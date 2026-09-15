import {
  LayoutDashboard,
  User,
  Code2,
  Briefcase,
  GraduationCap,
  Users,
  FolderKanban,
  Trophy,
  FileText,
  Mail,
  Mails,
  Inbox,
  Newspaper,
  Link,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  children?: Omit<NavItem, "children" | "icon">[];
};

export const DASHBOARD_NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "About",
    href: "/dashboard/about",
    icon: User,
  },
  {
    title: "Skills",
    href: "/dashboard/skills",
    icon: Code2,
    children: [
      { title: "List", href: "/dashboard/skills/list" },
      { title: "Categories", href: "/dashboard/skills/categories" },
    ],
  },
  {
    title: "Careers",
    href: "/dashboard/careers",
    icon: Briefcase,
  },
  {
    title: "Educations",
    href: "/dashboard/educations",
    icon: GraduationCap,
  },
  {
    title: "Organizations",
    href: "/dashboard/organizations",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    children: [
      { title: "List", href: "/dashboard/projects/list" },
      { title: "Types", href: "/dashboard/projects/types" },
      { title: "Categories", href: "/dashboard/projects/categories" },
    ],
  },
  {
    title: "Achievements",
    href: "/dashboard/achievements",
    icon: Trophy,
    children: [
      { title: "List", href: "/dashboard/achievements/list" },
      { title: "Types", href: "/dashboard/achievements/types" },
      { title: "Categories", href: "/dashboard/achievements/categories" },
    ],
  },
  {
    title: "Blogs",
    href: "/dashboard/blogs",
    icon: FileText,
    children: [
      { title: "List", href: "/dashboard/blogs/list" },
      { title: "Types", href: "/dashboard/blogs/types" },
      { title: "Categories", href: "/dashboard/blogs/categories" },
    ],
  },
  {
    title: "Emails",
    href: "/dashboard/emails",
    icon: Mails,
    children: [
      { title: "Messages", href: "/dashboard/emails/messages" },
      { title: "Newsletter", href: "/dashboard/emails/newsletter" },
      { title: "Templates", href: "/dashboard/emails/templates" },
    ],
  },
  {
    title: "Contact",
    href: "/dashboard/contact",
    icon: Mail,
  },
  {
    title: "Links",
    href: "/dashboard/links",
    icon: Link,
    disabled: true,
  },
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
export const ACCEPTED_PDF_TYPES = ["application/pdf"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const STORAGE_BUCKETS = {
  ASSETS: "assets",
} as const;

export const STORAGE_PATHS = {
  PROFILES: "profiles",
  DOCUMENTS: "documents",
  SKILLS: "skills",
  EXPERIENCES: "experiences",
  PROJECTS: "projects",
  ACHIEVEMENTS: "achievements",
  BLOGS: "blogs",
} as const;
