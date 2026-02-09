import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
    Scale, Shield, Unlock, FileWarning, Languages, BookOpen, Search,
    IndianRupee, GitCompare, ShoppingBag, FileQuestion, Home, Heart,
    HeartCrack, Briefcase, Newspaper, Calendar, HelpCircle, Files,
    ExternalLink, ArrowRight, Sparkles, FileText, Upload, MessageSquare, MapPin
} from "lucide-react";

// All AI Tools with their dedicated routes
const AI_TOOLS = [
    // Core Tools (existing pages)
    { id: "chat", name: "Legal Chat Assistant", icon: MessageSquare, description: "Ask legal questions & get instant answers", route: "/chat", color: "from-saffron to-orange-400", category: "core" },
    { id: "draft", name: "Document Drafter", icon: FileText, description: "Generate legal documents instantly", route: "/draft", color: "from-green-600 to-green-500", category: "core" },
    { id: "summarize", name: "Document Summarizer", icon: BookOpen, description: "Summarize complex legal documents", route: "/summarize", color: "from-blue-600 to-blue-500", category: "core" },
    { id: "compare", name: "BNS vs IPC Compare", icon: GitCompare, description: "Compare old and new criminal codes", route: "/compare", color: "from-purple-600 to-purple-500", category: "core" },

    // AI Analysis Tools
    { id: "case_predictor", name: "Case Outcome Predictor", icon: Scale, description: "Predict likely case outcomes", route: "/tools/case-predictor", color: "from-saffron to-orange-400", category: "analysis" },
    { id: "risk_analyzer", name: "Legal Risk Analyzer", icon: Shield, description: "Analyze risks in contracts", route: "/tools/risk-analyzer", color: "from-red-500 to-red-400", category: "analysis" },
    { id: "precedent_matcher", name: "Precedent Matcher", icon: Search, description: "Find similar case precedents", route: "/tools/precedent-matcher", color: "from-indigo-600 to-indigo-500", category: "analysis" },

    // Document Generation
    { id: "fir_generator", name: "FIR Complaint Generator", icon: FileWarning, description: "Generate FIR complaint drafts", route: "/tools/fir-generator", color: "from-red-600 to-red-500", category: "documents" },
    { id: "consumer_complaint", name: "Consumer Complaint", icon: ShoppingBag, description: "File consumer complaints", route: "/tools/consumer-complaint", color: "from-saffron to-orange-400", category: "documents" },
    { id: "rti_generator", name: "RTI Application", icon: FileQuestion, description: "Generate RTI applications", route: "/tools/rti-generator", color: "from-blue-600 to-blue-500", category: "documents" },

    // Legal Guidance
    { id: "bail_checker", name: "Bail Eligibility Checker", icon: Unlock, description: "Check bail eligibility for offenses", route: "/tools/bail-checker", color: "from-green-600 to-green-500", category: "guidance" },
    { id: "section_finder", name: "Section Finder", icon: Search, description: "Find relevant IPC/BNS sections", route: "/tools/section-finder", color: "from-saffron to-orange-400", category: "guidance" },
    { id: "cost_estimator", name: "Legal Cost Estimator", icon: IndianRupee, description: "Estimate legal proceedings costs", route: "/tools/cost-estimator", color: "from-green-600 to-green-500", category: "guidance" },
    { id: "lawyer_finder", name: "Find Nearby Lawyers", icon: MapPin, description: "Locate lawyers in your area with maps", route: "/tools/lawyer-finder", color: "from-blue-600 to-blue-500", category: "guidance" },
    { id: "jargon_explainer", name: "Legal Jargon Explainer", icon: HelpCircle, description: "Understand legal terminology", route: "/tools/jargon-explainer", color: "from-purple-600 to-purple-500", category: "guidance" },

    // Utilities
    { id: "translator", name: "Legal Translation", icon: Languages, description: "Translate legal docs EN↔HI", route: "/tools/translator", color: "from-blue-600 to-blue-500", category: "utilities" },
    { id: "judgment_simplifier", name: "Judgment Simplifier", icon: BookOpen, description: "Simplify complex judgments", route: "/tools/judgment-simplifier", color: "from-green-600 to-green-500", category: "utilities" },
    { id: "property_verifier", name: "Property Document Verifier", icon: Home, description: "Verify property documents", route: "/tools/property-verifier", color: "from-saffron to-orange-400", category: "utilities" },
    { id: "cyber_complaint", name: "Cyber Crime Reporter", icon: Shield, description: "Report cyber crimes", route: "/tools/cyber-complaint", color: "from-red-500 to-red-400", category: "utilities" },

    // Family & Labor
    { id: "marriage_guide", name: "Marriage Registration", icon: Heart, description: "Marriage registration guidance", route: "/tools/marriage-guide", color: "from-pink-500 to-pink-400", category: "personal" },
    { id: "divorce_guide", name: "Divorce Procedure", icon: HeartCrack, description: "Divorce procedure guidance", route: "/tools/divorce-guide", color: "from-gray-600 to-gray-500", category: "personal" },
    { id: "labor_advisor", name: "Labor Law Advisor", icon: Briefcase, description: "Workplace rights advisor", route: "/tools/labor-advisor", color: "from-saffron to-orange-400", category: "personal" },
];

// Government Portals
const GOVT_PORTALS = [
    { name: "Indian Kanoon", url: "https://indiankanoon.org", description: "Case Laws & Statutes" },
    { name: "eCourts", url: "https://ecourts.gov.in", description: "Case Status Lookup" },
    { name: "Cyber Crime", url: "https://cybercrime.gov.in", description: "Report Cyber Crimes" },
    { name: "RTI Online", url: "https://rtionline.gov.in", description: "RTI Applications" },
    { name: "NALSA", url: "https://nalsa.gov.in", description: "Free Legal Aid" },
    { name: "Consumer Helpline", url: "https://consumerhelpline.gov.in", description: "Consumer Complaints" },
];

const CATEGORIES = [
    { id: "all", name: "All Tools" },
    { id: "core", name: "Core Features" },
    { id: "analysis", name: "AI Analysis" },
    { id: "documents", name: "Documents" },
    { id: "guidance", name: "Legal Guidance" },
    { id: "utilities", name: "Utilities" },
    { id: "personal", name: "Personal Law" },
];

const AIToolsHub = () => {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredTools = activeCategory === "all"
        ? AI_TOOLS
        : AI_TOOLS.filter(tool => tool.category === activeCategory);

    return (
        <div className="min-h-screen text-gray-900">
            <TricolorBackground intensity="strong" showOrbs={true} />
            <Header />

            <div className="container max-w-7xl mx-auto pt-8 pb-20 px-4 md:px-6">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-saffron/10 to-green-600/10 border border-saffron/20 mb-6">
                        <Sparkles className="w-4 h-4 text-saffron" />
                        <span className="text-sm font-medium bg-gradient-to-r from-saffron to-green-600 bg-clip-text text-transparent">
                            20+ AI-Powered Legal Tools
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                        <span className="text-gray-900">AI Legal </span>
                        <span className="text-saffron">Tools Hub</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Access powerful AI tools designed specifically for Indian law. From document generation to case analysis.
                    </p>
                </motion.div>

                {/* Category Filter Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-2 mb-10"
                >
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${activeCategory === cat.id
                                ? "bg-gradient-to-r from-saffron to-orange-400 text-white shadow-lg shadow-saffron/30"
                                : "bg-white/80 text-gray-600 hover:bg-white hover:shadow-md border border-gray-200"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </motion.div>

                {/* Tools Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16"
                >
                    {filteredTools.map((tool, index) => {
                        const Icon = tool.icon;
                        const isCore = tool.category === "core";

                        // Use consistent navy blue icon theme across all tools
                        const iconContainerClass = 'icon-navy';

                        return (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.03 * index, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <Link
                                    to={tool.route}
                                    className="group block p-5 rounded-2xl glass-tricolor-card relative overflow-hidden"
                                >
                                    {/* Gradient accent on hover */}
                                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-saffron via-transparent to-green-india opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className={`icon-container icon-container-lg ${iconContainerClass} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-gray-800 transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                        {tool.description}
                                    </p>

                                    {isCore && (
                                        <span className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 text-xs font-medium bg-saffron/10 text-saffron rounded-full border border-saffron/15">
                                            <Sparkles className="w-3 h-3" />
                                            Core Feature
                                        </span>
                                    )}

                                    {/* Arrow indicator */}
                                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                                        <ArrowRight className="w-4 h-4 text-saffron" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Government Portals Quick Access */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Government Legal Portals</h2>
                    <p className="text-gray-500 mb-6">Direct links to official Indian government legal resources</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {GOVT_PORTALS.map((portal) => (
                            <a
                                key={portal.name}
                                href={portal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-4 rounded-xl glass-premium border border-gray-100 hover:border-saffron/20 hover:shadow-premium transition-all duration-300 text-center hover:-translate-y-1"
                            >
                                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-saffron/10 transition-colors">
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-saffron transition-colors" />
                                </div>
                                <span className="block text-sm font-semibold text-gray-900">{portal.name}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">{portal.description}</span>
                            </a>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-center text-white relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-saffron/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-600/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <h3 className="text-2xl font-serif font-bold mb-3">
                            Need Personalized Legal Advice?
                        </h3>
                        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                            Our AI tools provide information and guidance. For complex legal matters, consult a qualified advocate.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <a
                                href="https://nalsa.gov.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full font-medium transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Free Legal Aid (NALSA)
                            </a>
                            <Link
                                to="/chat"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-saffron hover:bg-saffron/90 rounded-full font-medium transition-colors"
                            >
                                Chat with LegalAI
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default AIToolsHub;
