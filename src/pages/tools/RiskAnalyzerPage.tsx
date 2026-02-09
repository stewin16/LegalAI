import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft, Sparkles, Loader2, CheckCircle, AlertTriangle,
    ExternalLink, Copy, Shield, FileText, Upload
} from "lucide-react";

const RiskAnalyzerPage = () => {
    const [contractText, setContractText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!contractText.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch("http://localhost:8000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `[Legal Risk Analysis] Analyze the following contract/agreement for potential legal risks, unfavorable clauses, missing protections, and compliance issues. Provide a risk score (Low/Medium/High), list specific risks, and suggest improvements:\n\n${contractText}`,
                    language: "en"
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.answer);
            } else {
                setResult("Error processing your request. Please try again.");
            }
        } catch (error) {
            setResult("Connection error. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyResult = () => {
        if (result) navigator.clipboard.writeText(result);
    };

    return (
        <div className="min-h-screen text-gray-900">
            <TricolorBackground intensity="strong" showOrbs={true} />
            <Header />

            <div className="container max-w-4xl mx-auto pt-24 pb-20 px-4 md:px-6">

                {/* Back Button */}
                <Link
                    to="/features"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-saffron mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to AI Tools
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="icon-container icon-container-lg icon-navy">
                            <Shield className="w-6 h-6" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Legal Risk Analyzer
                            </h1>
                            <p className="text-gray-500">AI-powered contract risk assessment</p>
                        </div>
                    </div>
                </motion.div>

                {/* Input Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-tricolor-card p-6 mb-6"
                >
                    {/* Contract Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-saffron" />
                                Paste Contract or Agreement Text
                            </div>
                        </label>
                        <Textarea
                            value={contractText}
                            onChange={(e) => setContractText(e.target.value)}
                            placeholder="Paste your contract, agreement, or legal document here for analysis...

For best results, include:
• All terms and conditions
• Payment terms
• Liability clauses
• Termination provisions
• Any annexures or schedules"
                            className="min-h-[250px] bg-white border-gray-200"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Your document will be analyzed for legal risks, unfavorable terms, and compliance issues.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !contractText.trim()}
                        className="w-full h-12 btn-saffron rounded-xl"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Analyzing Contract...
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5 mr-2" />
                                Analyze Risks
                            </>
                        )}
                    </Button>
                </motion.div>

                {/* Result Display */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-tricolor-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-600">Risk Analysis Complete</span>
                            </div>
                            <Button
                                onClick={copyResult}
                                variant="outline"
                                size="sm"
                                className="text-gray-500"
                            >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                            </Button>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {result}
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Important Disclaimer</p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        This AI analysis is for informational purposes only.
                                        Always consult a qualified legal professional before signing any contract.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Related Resources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 grid grid-cols-2 gap-4"
                >
                    <Link
                        to="/draft"
                        className="p-4 rounded-xl glass-premium border border-gray-100 hover:border-saffron/30 transition-all group"
                    >
                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-saffron mb-2" />
                        <span className="block font-medium text-gray-900">Document Drafter</span>
                        <span className="text-xs text-gray-500">Create new contracts</span>
                    </Link>

                    <a
                        href="https://indiankanoon.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl glass-premium border border-gray-100 hover:border-saffron/30 transition-all group"
                    >
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-saffron mb-2" />
                        <span className="block font-medium text-gray-900">Indian Kanoon</span>
                        <span className="text-xs text-gray-500">Search contract law cases</span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default RiskAnalyzerPage;
