import { LinksService } from "@/src/services/links.service";
import { SkillService } from "@/src/services/skill.service";
import { StatisticsService } from "@/src/services/statistics.service";
import { CareerService } from "@/src/services/career.service";
import { EducationService } from "@/src/services/education.service";
import { OrganizationService } from "@/src/services/organization.service";
import { ProjectService } from "@/src/services/project.service";
import { AchievementService } from "@/src/services/achievement.service";
import { BlogService } from "@/src/services/blog.service";
import { MainHeader } from "@/src/components/main/main-header";
import { MainHero } from "@/src/components/main/main-hero";
import { ScrollIndicator } from "@/src/components/main/scroll-indicator";
import { MainAbout } from "@/src/components/main/main-about";
import { MainExperience } from "@/src/components/main/main-experience";
import { MainProjects } from "@/src/components/main/main-projects";
import { MainAchievements } from "@/src/components/main/main-achievements";
import { MainBlogs } from "@/src/components/main/main-blogs";
import { MainContact } from "@/src/components/main/main-contact";
import { MainFooter } from "@/src/components/main/main-footer";
import type { MainLocale } from "@/src/lib/main-translations";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as MainLocale;
  
  // Fetch all required data concurrently
  const [
    { profile, roles, badges, about, contact },
    statistics,
    skills,
    skillCategories,
    careers,
    educations,
    organizations,
    projects,
    achievements,
    blogs
  ] = await Promise.all([
    LinksService.getAll(),
    StatisticsService.getAll(),
    SkillService.getAll(),
    SkillService.getCategories(),
    CareerService.getAll(),
    EducationService.getAll(),
    OrganizationService.getAll(),
    ProjectService.getAll(),
    AchievementService.getAll(),
    BlogService.getAll(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950 font-sans transition-colors duration-300 overflow-x-hidden max-w-full">
      <MainHeader locale={locale} hireMeEmail={contact?.email ?? null} />
      
      <main className="flex-1 w-full overflow-x-hidden">
        <MainHero 
          profile={profile}
          roles={roles}
          badges={badges}
          about={about}
          contact={contact}
          locale={locale}
        />
        
        <ScrollIndicator />
        
        <MainAbout
          profile={profile}
          roles={roles}
          about={about}
          contact={contact}
          statistics={statistics}
          skills={skills}
          skillCategories={skillCategories}
          locale={locale}
        />

        <MainExperience
          careers={careers}
          educations={educations}
          organizations={organizations}
          locale={locale}
        />

        <MainProjects
          projects={projects}
          locale={locale}
        />

        <MainAchievements
          achievements={achievements}
          locale={locale}
        />

        <MainBlogs
          blogs={blogs}
          locale={locale}
        />

        <MainContact
          contact={contact}
          locale={locale}
        />
      </main>

      <MainFooter 
        about={about}
        contact={contact}
        locale={locale}
      />
      <ScrollToTop />
    </div>
  );
}
