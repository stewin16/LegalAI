import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Scale, MessageSquare, Shield, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 rounded-[3rem] overflow-hidden bg-navy-india shadow-2xl border border-white/10"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-saffron/20 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-india/20 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

          {/* Content Wrapper */}
          <div className="relative z-20 px-8 py-20 md:px-20 md:py-32 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[11px] font-mono font-bold uppercase tracking-[0.3em] mb-12 shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-saffron animate-spin-slow" />
              Join the Legal Revolution
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-7xl font-serif font-bold mb-10 text-white leading-[1.1] tracking-tight"
            >
              Empowering the <span className="italic text-saffron">Future</span> <br className="hidden md:block" />
              of <span className="text-green-india">Indian</span> Justice
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-16 text-white/70 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Experience the most advanced AI legal intelligence platform built specifically for the Indian legal ecosystem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/chat">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg rounded-2xl bg-white text-navy-india hover:bg-gray-100 transition-all shadow-premium hover:shadow-elevated font-bold group"
                >
                  <MessageSquare className="mr-3 h-6 w-6 text-saffron" />
                  Start Legal Assistant
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>

              <Link to="/compare">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-10 text-lg rounded-2xl border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-xl font-bold transition-all"
                >
                  <Scale className="mr-3 h-6 w-6 text-green-india" />
                  Compare IPC vs BNS
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-20 flex flex-wrap items-center justify-center gap-10 text-white/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
            >
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                  <Shield className="w-5 h-5 text-saffron" />
                </div>
                <span>Updated for 2026</span>
              </div>
              
              <div className="w-1 h-1 bg-white/20 rounded-full hidden md:block" />
              
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span>Verified Sources</span>
              </div>
              
              <div className="w-1 h-1 bg-white/20 rounded-full hidden md:block" />
              
              <div className="flex items-center gap-3 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                  <Shield className="w-5 h-5 text-green-india" />
                </div>
                <span>Secure & Private</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
