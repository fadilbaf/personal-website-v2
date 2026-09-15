// ============================================================
// Database Types — Mirrors Supabase/PostgreSQL schema
// ============================================================

// --- Lookup Tables (shared structure) ---
export interface LookupItem {
  id: string;
  name_id: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillCategory = LookupItem;
export type ProjectType = LookupItem;
export type ProjectCategory = LookupItem;
export type AchievementType = LookupItem;
export type AchievementCategory = LookupItem;
export type BlogType = LookupItem;
export type BlogCategory = LookupItem;

// --- Core Profile & Contact ---
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  photo_url: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface About {
  id: string;
  profile_id: string;
  description_id: string | null;
  description_en: string | null;
  bio_id: string | null;
  bio_en: string | null;
  quotes_id: string | null;
  quotes_en: string | null;
  cv_url: string | null;
  years_of_experience: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name_id: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  role_id: string;
  role_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  email: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  whatsapp_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// --- Skills & Experience ---
export interface Skill {
  id: string;
  category_id: string;
  name: string;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: SkillCategory;
}

export interface Career {
  id: string;
  role_id: string;
  role_en: string;
  company: string;
  url: string | null;
  logo_url: string | null;
  location: string | null;
  type_id: string | null;
  type_en: string | null;
  model_id: string | null;
  model_en: string | null;
  start_date: string;
  end_date: string | null;
  detail_points_id: string[];
  detail_points_en: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  career_skills?: { skill_id: string; skill?: Skill }[];
}

export interface CareerSkill {
  career_id: string;
  skill_id: string;
}

export interface Education {
  id: string;
  school: string;
  url: string | null;
  location: string | null;
  level_major_id: string;
  level_major_en: string;
  logo_url: string | null;
  gpa: number | null;
  max_gpa: number | null;
  start_date: string;
  end_date: string | null;
  detail_points_id: string[];
  detail_points_en: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  organization: string;
  url: string | null;
  location: string | null;
  role_id: string;
  role_en: string;
  logo_url: string | null;
  start_date: string;
  end_date: string | null;
  detail_points_id: string[];
  detail_points_en: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// --- Projects ---
export interface Project {
  id: string;
  slug: string;
  title_id: string;
  title_en: string;
  bio_id: string | null;
  bio_en: string | null;
  type_id: string | null;
  category_id: string | null;
  project_date: string | null;
  github_url: string | null;
  live_url: string | null;
  video_url: string | null;
  overview_id: string | null;
  overview_en: string | null;
  challenge_intro_id: string | null;
  challenge_intro_en: string | null;
  challenge_points_id: string[];
  challenge_points_en: string[];
  result_intro_id: string | null;
  result_intro_en: string | null;
  result_points_id: string[];
  result_points_en: string[];
  lesson_intro_id: string | null;
  lesson_intro_en: string | null;
  lesson_points_id: string[];
  lesson_points_en: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  type?: ProjectType;
  category?: ProjectCategory;
  project_images?: ProjectImage[];
  project_skills?: { skill_id: string; skill?: Skill }[];
  project_responsibilities?: ProjectResponsibility[];
  project_features?: ProjectFeature[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
}

export interface ProjectResponsibility {
  id: string;
  project_id: string;
  content_id: string;
  content_en: string;
  sort_order: number;
}

export interface ProjectFeature {
  id: string;
  project_id: string;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  sort_order: number;
}

export interface ProjectSkill {
  project_id: string;
  skill_id: string;
}

// --- Achievements ---
export interface Achievement {
  id: string;
  title_id: string;
  title_en: string;
  publisher: string | null;
  issue_date: string | null;
  image_url: string | null;
  credential_url: string | null;
  credential_id: string | null;
  type_id: string | null;
  category_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  type?: AchievementType;
  category?: AchievementCategory;
}

// --- Blogs ---
export interface Blog {
  id: string;
  slug: string;
  author_id: string;
  title_id: string;
  title_en: string;
  image_url: string | null;
  content_id: string | null;
  content_en: string | null;
  type_id: string | null;
  category_id: string | null;
  likes_count: number;
  views_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  tags?: string[];
  type?: BlogType;
  category?: BlogCategory;
  author?: Profile;
}

export interface BlogTag {
  id: string;
  blog_id: string;
  tag: string;
}

// --- Statistics (from DB view) ---
export interface Statistics {
  total_projects: number;
  total_achievements: number;
  total_blogs: number;
  years_of_experience: number;
  total_skills: number;
  total_careers: number;
  total_educations: number;
  total_organizations: number;
}

// --- Messages & Newsletter ---
export type MessageStatus = "unread" | "read" | "replied" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  status: MessageStatus;
  replied_at: string | null;
  reply_content: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriberStatus = "active" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignType = "general" | "blog" | "project" | "achievement";
export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  type: CampaignType;
  sent_count: number;
  status: CampaignStatus;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  category: "Contact" | "Newsletter";
  subject: string;
  html_content: string;
  description: string | null;
  sender: string | null;
  created_at: string;
  updated_at: string;
}

