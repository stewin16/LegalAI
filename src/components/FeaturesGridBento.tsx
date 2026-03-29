import { motion } from 'framer-motion';
import { Scale, MessageSquare, FileText, Search, BookOpen, Shield, ArrowRight } from 'lucide-react';

const FeaturesGridBento = () => {
  const features = [
    {
      title: 'IPC vs BNS Comparison',
      description: 'Side-by-side analysis of Indian Penal Code and Bharatiya Nyaya Sanhita with instant diff highlighting',
      icon: Scale,
      iconClass: 'icon-navy',
      size: 'col-span-2 row-span-1',
    },
    {
      title: 'AI Legal Assistant',
      description: 'Ask questions in natural language and get precise answers with case law citations',
      icon: MessageSquare,
      iconClass: 'icon-navy',
      size: 'col-span-1 row-span-2',
    },
    {
      title: 'Document Summarizer',
      description: 'Condense lengthy legal documents into actionable insights in seconds',
      icon: FileText,
      iconClass: 'icon-navy',
      size: 'col-span-1 row-span-1',
    },
    {
      title: 'Neutral Analysis',
      description: 'Unbiased AI-powered interpretation of legal changes and implications',
      icon: Search,
      iconClass: 'icon-navy',
      size: 'col-span-1 row-span-1',
    },
    {
      title: 'Case Law Search',
      description: 'Instantly search through landmark Supreme Court judgments and precedents',
      icon: BookOpen,
      iconClass: 'icon-navy',
      size: 'col-span-1 row-span-1',
    },
    {
      title: 'Secure & Private',
      description: 'Enterprise-grade security with full data privacy compliance for all queries',
      icon: Shield,
      iconClass: 'icon-navy',
      size: 'col-span-2 row-span-1',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <section id="features" className="py-24 px-4 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-saffron/5 via-transparent to-green-india/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/10 text-saffron text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-saffron/20">
            <Scale className="w-3 h-3" />
            Powerful Features
          </span>
          <h2 className="editorial-title mb-6">
            Everything You Need for{' '}
            <span className="premium-gradient-text">Legal Clarity</span>
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            Navigate the transition from IPC to BNS with confidence using our comprehensive AI-powered legal tools
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 border border-navy-india/10 rounded-[3rem] overflow-hidden bg-white/60 backdrop-blur-xl shadow-premium-lg"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ backgroundColor: "rgba(10, 25, 47, 1)" }}
                className={`
                  ${feature.size} p-12 cursor-pointer group
                  border-r border-b border-navy-india/10
                  transition-all duration-700
                  relative overflow-hidden
                `}
              >
                {/* Monospace index */}
                <div className="absolute top-10 right-10 flex flex-col items-end">
                  <span className="font-mono text-[10px] text-navy-india/30 group-hover:text-white/30 transition-colors tracking-[0.3em] uppercase mb-1">
                    Feature_ID
                  </span>
                  <span className="font-mono text-xs font-bold text-navy-india/60 group-hover:text-white/60 transition-colors">
                    0{index + 1}
                  </span>
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-[1.5rem] bg-navy-india/5 flex items-center justify-center mb-10 group-hover:bg-white/10 transition-all duration-500 group-hover:rotate-12 border border-navy-india/5 group-hover:border-white/20">
                    <IconComponent className="w-8 h-8 text-navy-india group-hover:text-white" strokeWidth={1} />
                  </div>

                  <h3 className="text-3xl font-serif font-bold mb-5 text-gray-900 group-hover:text-white transition-colors leading-tight tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-gray-500 group-hover:text-white/70 transition-colors font-light mb-12">
                    {feature.description}
                  </p>

                  {/* Monospace detail */}
                  <div className="mt-auto pt-10 border-t border-navy-india/5 group-hover:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-navy-india/40 group-hover:text-white/40 mb-2">
                          System_Protocol
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-india group-hover:bg-green-400 animate-pulse" />
                          <span className="text-[11px] font-mono text-navy-india group-hover:text-white font-bold tracking-widest">
                            {index % 2 === 0 ? "ENCRYPTED_ACTIVE" : "NEURAL_SYNC_READY"}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-navy-india/10 group-hover:border-white/20 flex items-center justify-center group-hover:bg-white/5 transition-all duration-500">
                        <ArrowRight className="w-4 h-4 text-navy-india group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGridBento;
