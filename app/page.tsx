import { getTutors } from "@/lib/data";
import { Hero, TrustBar } from "@/components/home/Hero";
import { AgePrograms } from "@/components/home/AgePrograms";
import { PersonalizedSection } from "@/components/home/PersonalizedSection";
import { NativeTutors } from "@/components/home/NativeTutors";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhatWeTeach } from "@/components/home/WhatWeTeach";
import { KinderEnglish, ElementaryEnglish } from "@/components/home/AgeFocusSections";
import { LevelTestPrep } from "@/components/home/LevelTestPrep";
import { ParentReviews } from "@/components/home/ParentReviews";
import { FinalCta } from "@/components/home/FinalCta";

export default async function HomePage() {
  const tutors = await getTutors();

  return (
    <div className="space-y-16 sm:space-y-20">
      <Hero />
      <TrustBar />
      <AgePrograms />
      <PersonalizedSection />
      <NativeTutors tutors={tutors} />
      <HowItWorks />
      <WhatWeTeach />
      <KinderEnglish />
      <ElementaryEnglish />
      <LevelTestPrep />
      <ParentReviews />
      <FinalCta />
    </div>
  );
}
