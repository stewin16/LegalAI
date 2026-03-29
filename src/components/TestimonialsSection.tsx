import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Adv. Priya Sharma",
    role: "Criminal Defense Lawyer",
    content: "LegalAi has completely transformed how I research IPC vs BNS changes. The side-by-side comparison saves me hours every week.",
    avatar: "https://picsum.photos/seed/priya/100/100",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Law Student, NLSIU",
    content: "As a law student, this tool is invaluable for understanding the transition to BNS. The AI explanations are clear and precise.",
    avatar: "https://picsum.photos/seed/rajesh/100/100",
    rating: 5
  },
  {
    name: "Dr. Meera Iyer",
    role: "Legal Consultant",
    content: "The document summarizer is a game-changer. I can now process lengthy judgments in minutes instead of hours.",
    avatar: "https://picsum.photos/seed/meera/100/100",
    rating: 5
  },
  {
    name: "Advocate Arjun Patel",
    role: "High Court Lawyer",
    content: "Instant case law citations and neutral analysis make LegalAi my go-to research tool every single day.",
    avatar: "https://picsum.photos/seed/arjun/100/100",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-saffron/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-india/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-india/5 border border-navy-india/10 text-navy-india text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-navy-india animate-pulse" />
            Testimonials
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-navy-india mb-8 tracking-tight"
          >
            Trusted by <span className="italic text-saffron">Legal Professionals</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 font-light leading-relaxed"
          >
            Join thousands of lawyers, judges, and law students across India who 
            rely on LegalAi for their daily research and analysis.
          </motion.p>
        </div>

        <div className="relative">
          {/* Gradient Masks for Marquee */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-20" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-20" />

          <div className="flex gap-8 animate-marquee py-10">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[400px] p-8 rounded-[2.5rem] border border-gray-100 bg-white shadow-premium hover:shadow-elevated transition-all duration-500 group relative overflow-hidden"
              >
                {/* Quote Icon Background */}
                <Quote className="absolute -top-4 -right-4 w-24 h-24 text-gray-50 opacity-10 group-hover:text-saffron group-hover:opacity-5 transition-all duration-500" />

                <div className="flex items-center gap-2 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-saffron fill-saffron" />
                  ))}
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light italic relative z-10">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-saffron to-green-india rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white relative z-10"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-navy-india text-lg group-hover:text-saffron transition-colors">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
