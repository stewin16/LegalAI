import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { ContainerScroll } from "./ui/container-scroll-animation";

const HeroSection = () => {
  return (
    <div className="relative flex flex-col items-center justify-start overflow-visible bg-gradient-hero pt-12 md:pt-20 pb-0">
      {/* Background Gradients - Enhanced tricolor glows */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-saffron/12 rounded-full blur-[140px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-green-india/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      {/* Content Container */}
      <div className="container relative z-10 px-4 md:px-6 text-center max-w-5xl mx-auto pt-12">

        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-gray-200/50 text-sm font-medium text-gray-700 shadow-premium-sm">
            <Sparkles className="w-4 h-4 text-saffron" />
            AI-Powered Legal Intelligence
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-india opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-india"></span>
            </span>
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
        >
          Legal Clarity in{' '}
          <br className="hidden md:block" />
          <span className="text-gradient-premium">Milliseconds</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The most advanced AI assistant for Indian Law. Compare statutes, analyze case laws, and get criminal justice insights{' '}
          <span className="text-gray-900 font-medium">instantly</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/chat">
            <Button size="lg" className="h-14 px-8 text-base rounded-full btn-saffron group shadow-saffron-glow">
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Describe a Crime
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full btn-outline-premium">
              Compare BNS vs IPC
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-india" />
            Verified Criminal Datasets
          </span>
          <span className="w-1.5 h-1.5 bg-saffron rounded-full hidden sm:block" />
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-india" />
            Updated for 2025
          </span>
          <span className="w-1.5 h-1.5 bg-saffron rounded-full hidden sm:block" />
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-india" />
            100% Private & Secure
          </span>
        </motion.div>

      </div>

      {/* Scroll Animation Container for Demo Screenshot */}
      <div className="w-full -mt-12 md:-mt-24">
        <ContainerScroll
          titleComponent={<></>}
        >
          <img
            src="/demo-screenshot.png"
            alt="LegalAi Demo Interface"
            className="mx-auto rounded-2xl object-cover h-full object-left-top shadow-elevated"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </div>
  );
};

export default HeroSection;
