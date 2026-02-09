import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Scale, MessageSquare, Shield } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 px-4 relative">
      {/* Background - Gradient instead of black */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-india via-[#000066] to-navy-india rounded-3xl mx-4 md:mx-8" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        {/* Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
          <Scale className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
          Ready to Transform Your Legal Research?
        </h2>
        <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
          Join thousands of legal professionals navigating the IPC to BNS transition with confidence
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat">
            <Button
              size="lg"
              className="h-14 px-8 text-base rounded-full bg-white text-navy-india hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] font-semibold"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Legal Assistant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link to="/compare">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base rounded-full border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
            >
              <Scale className="mr-2 h-5 w-5" />
              Compare IPC vs BNS
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Updated for 2026
          </span>
          <span className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verified Sources
          </span>
          <span className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure & Private
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
