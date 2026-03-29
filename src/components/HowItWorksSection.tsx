import { MessageSquare, Search, FileCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Ask a Question",
    description: "Type your legal question in English or Hindi, or upload a legal document for analysis.",
    color: "from-saffron/20 to-saffron/5"
  },
  {
    number: "02",
    icon: Search,
    title: "AI Retrieves Information",
    description: "Our system searches through statutes, amendments, and relevant case laws from official sources.",
    color: "from-navy-india/20 to-navy-india/5"
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Get Cited Response",
    description: "Receive a clear, structured answer with verifiable citations to official legal documents.",
    color: "from-green-india/20 to-green-india/5"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-india/5 border border-navy-india/10 text-navy-india text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-navy-india animate-pulse" />
            The Process
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-navy-india mb-8 tracking-tight"
          >
            How <span className="italic text-saffron">LegalAi</span> Works
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 font-light leading-relaxed"
          >
            Our advanced AI engine processes complex legal data to provide you with 
            accurate, cited, and easy-to-understand legal information in seconds.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-px bg-dashed-line opacity-20 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              {/* Step Number Background */}
              <div className="absolute -top-12 -left-4 text-[120px] font-serif font-black text-gray-50 opacity-[0.03] select-none group-hover:opacity-[0.06] transition-opacity">
                {step.number}
              </div>

              <div className="relative z-10">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} border border-white shadow-premium flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                  <step.icon className="w-8 h-8 text-navy-india" />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono font-bold text-saffron uppercase tracking-widest">Step {step.number}</span>
                  <div className="h-px w-8 bg-gray-100" />
                </div>

                <h3 className="text-2xl font-serif font-bold text-navy-india mb-4 group-hover:text-saffron transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed font-light">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-8 flex md:hidden items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-200 rotate-90" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
