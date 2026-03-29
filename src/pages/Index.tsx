import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesGridBento from "@/components/FeaturesGridBento";
import TimelineSection from "@/components/TimelineSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import LegalNews from "@/components/LegalNews";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  // Set document title for SEO
  useEffect(() => {
    document.title = "LegalAI - AI-Powered Legal Assistant for Indian Law";
  }, []);

  return (
    <div className="min-h-screen text-gray-900">
      <TricolorBackground intensity="strong" showOrbs={true} />
      <Header />
      <main>
        <HeroSection />
        <LegalNews />
        <FeaturesGridBento />
        <HowItWorksSection />
        <TimelineSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
