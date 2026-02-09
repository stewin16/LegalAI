import { motion } from 'framer-motion';
import { Scale, MessageSquare, FileText, Search, BookOpen, Shield } from 'lucide-react';

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/10 text-saffron text-sm font-medium mb-6 border border-saffron/20">
            <Scale className="w-4 h-4" />
            Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything You Need for{' '}
            <span className="text-gradient-saffron">Legal Clarity</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-600 leading-relaxed">
            Navigate the transition from IPC to BNS with confidence using our comprehensive AI-powered legal tools
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 md:h-[600px]"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                }}
                className={`
                  ${feature.size} p-6 rounded-2xl cursor-pointer group
                  glass-tricolor-card
                  relative overflow-hidden
                `}
              >
                {/* Gradient border on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-saffron via-white to-green-india opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon Container */}
                  <div className={`icon-container ${feature.iconClass} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5" strokeWidth={1.75} />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Learn more hint on hover */}
                  <div className="mt-auto pt-4">
                    <span className="text-xs font-medium text-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      Learn more
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
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
