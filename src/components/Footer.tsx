import { Link } from "react-router-dom";
import { Scale, MessageSquare, FileText, BookOpen, MapPin, Shield, Mail, Phone, Globe, ExternalLink, Heart } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const features = [
        { name: "Legal Chat", path: "/chat", icon: MessageSquare },
        { name: "Document Drafter", path: "/draft", icon: FileText },
        { name: "Summarizer", path: "/summarize", icon: BookOpen },
        { name: "IPC vs BNS", path: "/compare", icon: Scale },
        { name: "Lawyer Finder", path: "/tools/lawyer-finder", icon: MapPin },
        { name: "Risk Analyzer", path: "/tools/risk-analyzer", icon: Shield },
    ];

    const resources = [
        { name: "Indian Kanoon", url: "https://indiankanoon.org", external: true },
        { name: "eCourts", url: "https://ecourts.gov.in", external: true },
        { name: "NALSA (Free Legal Aid)", url: "https://nalsa.gov.in", external: true },
        { name: "Cyber Crime Portal", url: "https://cybercrime.gov.in", external: true },
        { name: "RTI Online", url: "https://rtionline.gov.in", external: true },
        { name: "Consumer Helpline", url: "https://consumerhelpline.gov.in", external: true },
    ];

    const legalLinks = [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Disclaimer", path: "/disclaimer" },
    ];

    return (
        <footer className="relative bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
            {/* Tricolor Top Border */}
            <div className="h-1 bg-gradient-to-r from-saffron via-white to-green-india" />

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-india to-navy-india/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                <Scale className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-serif font-bold text-gray-900">LegalAI</span>
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            AI-powered legal assistance for Indian citizens. Navigate the legal system with confidence using 20+ intelligent tools.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            <span>in India</span>
                        </div>
                    </div>

                    {/* Features Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Features</h3>
                        <ul className="space-y-3">
                            {features.map((feature) => (
                                <li key={feature.path}>
                                    <Link
                                        to={feature.path}
                                        className="group flex items-center gap-2 text-gray-600 hover:text-navy-india transition-colors text-sm"
                                    >
                                        <feature.icon className="w-4 h-4 text-gray-400 group-hover:text-navy-india transition-colors" />
                                        {feature.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    to="/features"
                                    className="inline-flex items-center gap-1 text-navy-india font-medium text-sm hover:underline"
                                >
                                    View All Tools →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Government Resources Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Legal Resources</h3>
                        <ul className="space-y-3">
                            {resources.map((resource) => (
                                <li key={resource.url}>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-2 text-gray-600 hover:text-navy-india transition-colors text-sm"
                                    >
                                        <Globe className="w-4 h-4 text-gray-400 group-hover:text-navy-india transition-colors" />
                                        {resource.name}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:support@legalai.in"
                                    className="flex items-center gap-2 text-gray-600 hover:text-navy-india transition-colors text-sm"
                                >
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    support@legalai.in
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+911234567890"
                                    className="flex items-center gap-2 text-gray-600 hover:text-navy-india transition-colors text-sm"
                                >
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    +91 12345 67890
                                </a>
                            </li>
                        </ul>

                        {/* Legal Links */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <ul className="space-y-2">
                                {legalLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="text-xs text-gray-500 hover:text-navy-india transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto leading-relaxed">
                        <strong>Disclaimer:</strong> LegalAI is an AI-powered informational tool and does not constitute legal advice.
                        Information provided should not be relied upon as a substitute for professional legal counsel.
                        For complex legal matters, accidents, criminal cases, or any serious legal issues,
                        please consult a qualified advocate. For free legal aid, contact
                        <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="text-navy-india hover:underline ml-1">NALSA</a>.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} LegalAI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            All systems operational
                        </span>
                        <div className="tricolor-line w-16 h-1 rounded" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
