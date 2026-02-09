import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Sparkles, Loader2, Scale, AlertTriangle, BookOpen, Gavel, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LawSearch, LawSection } from "@/components/LawSearch";


interface ComparisonResult {
    change_type: string;
    legal_impact: string;
    penalty_difference: string;
    key_changes: string[];
    verdict: string;
}

const ComparisonPage = () => {
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedSection, setSelectedSection] = useState<LawSection | null>(null);
    const { toast } = useToast();

    // Helper to normalize text for comparison (ignore whitespace/case)
    const normalizeText = (t: string) => t.toLowerCase().replace(/\s+/g, '').trim();

    const handleCompare = async () => {
        if (!text1 || !text2) {
            toast({
                title: "Missing Input",
                description: "Please enter text for both IPC and BNS sections.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError("");

        // Define fallback logic for curated data
        const useCuratedFallback = () => {
            if (selectedSection &&
                selectedSection.summary_of_change &&
                normalizeText(selectedSection.text_ipc || "") === normalizeText(text1) &&
                normalizeText(selectedSection.text_bns || "") === normalizeText(text2)
            ) {
                console.log("Using curated fallback for", selectedSection.bns);
                toast({
                    title: "AI Service Busy",
                    description: "Using verified high-impact analysis instead.",
                    duration: 3000,
                });

                setResult({
                    change_type: selectedSection.change_type || "Analysis",
                    legal_impact: selectedSection.summary_of_change,
                    penalty_difference: "Refer to full text for specific penalty matrix.",
                    key_changes: [selectedSection.summary_of_change],
                    verdict: "High Impact Legislative Change"
                });
                setIsLoading(false);
                return true;
            }
            return false;
        };

        try {
            // Priority: Try AI Analysis First using the backend
            const response = await fetch('http://localhost:8000/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text1: text1,
                    text2: text2
                }),
            });

            if (!response.ok) {
                throw new Error('Analysis service unavailable');
            }

            const data = await response.json();

            if (data.comparison) {
                if (typeof data.comparison === 'string') {
                    setResult({
                        change_type: "Analysis",
                        legal_impact: data.comparison,
                        penalty_difference: "N/A",
                        key_changes: ["Legacy text format received"],
                        verdict: "Please re-run for structured data"
                    });
                } else {
                    setResult(data.comparison);
                }
            } else {
                throw new Error("Invalid response format");
            }

        } catch (error) {
            console.error("AI Analysis failed:", error);

            // Fallback: Try curated data
            const fallbackSuccess = useCuratedFallback();

            if (!fallbackSuccess) {
                toast({
                    title: "Analysis Failed",
                    description: "Could not analyze the text. Please try again.",
                    variant: "destructive"
                });
                setError("Analysis failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };



    const handleSectionSelect = (section: LawSection) => {
        setText2(section.text_bns || "");
        setSelectedSection(section);

        if (section.text_ipc) {
            setText1(section.text_ipc);
            toast({
                title: "Section Loaded",
                description: `Loaded BNS ${section.bns} and corresponding IPC section.`,
            });
        } else {
            setText1("");
            toast({
                title: "IPC Text Unavailable",
                description: "The corresponding IPC text is missing from our database. Please paste the Old Law text manually.",
                variant: "default",
            });
        }
        setResult(null);
    };

    const getChangeTypeInfo = (type: string) => {
        const normalizeType = (t: string) => {
            if (t.includes("Same")) return "Same";
            if (t.includes("Modified")) return "Modified";
            if (t.includes("Expanded")) return "Expanded";
            if (t.includes("Restructured")) return "Restructured";
            if (t.includes("Replaced")) return "Replaced";
            if (t.includes("Omitted")) return "Omitted";
            return "Unknown";
        };

        const typeKey = normalizeType(type);

        switch (typeKey) {
            case "Same":
                return {
                    desc: "The legal substance remains unchanged.",
                    explanation: "The provision is substantively unchanged. Wording is nearly identical, punishment structure remains the same, or only minor formatting changes."
                };
            case "Modified":
                return {
                    desc: "Provision retained with textual and structural modifications.",
                    explanation: "The core offence exists, but wording or punishment is adjusted (e.g., gender-neutral language, refined punishment)."
                };
            case "Expanded":
                return {
                    desc: "Scope widened to cover additional circumstances.",
                    explanation: "New acts included, additional punishments added (e.g., community service), or new categories of offenders covered."
                };
            case "Restructured":
                return {
                    desc: "Provision reorganized for clarity without altering core intent.",
                    explanation: "Multiple IPC sections merged, definitions separated from punishments, or new sub-sections introduced."
                };
            case "Replaced":
                return {
                    desc: "Provision replaced with a newly defined offence.",
                    explanation: "The IPC provision is removed and replaced with a different formulation (e.g., Sedition removed, new offence defined)."
                };
            case "Omitted":
                return {
                    desc: "Provision omitted without direct replacement.",
                    explanation: "The IPC provision no longer exists in BNS."
                };
            default:
                return {
                    desc: "Legislative change classification.",
                    explanation: "This describes the structural or textual change between the IPC and BNS provisions."
                };
        }
    };

    return (
        <div className="min-h-screen flex flex-col text-gray-900">
            <TricolorBackground intensity="strong" showOrbs={true} />
            <Header />

            <div className="container mx-auto px-4 pt-8 pb-12 flex-1 max-w-6xl relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                        From <span className="text-saffron">IPC</span> to <span className="text-green-india">BNS</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Paste any two text blocks to instantly identify legal shifts, penalty updates, and semantic changes.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="max-w-md mx-auto mb-8"
                >
                    <LawSearch onSelect={handleSectionSelect} />
                </motion.div>

                {/* Inputs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative"
                >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg">
                        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* IPC Section */}
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-saffron/30 p-6 shadow-premium">
                        <div className="flex items-center gap-2 mb-4 text-saffron font-semibold uppercase tracking-wider text-xs">
                            <BookOpen className="w-4 h-4" /> Old Law (IPC)
                        </div>
                        <Textarea
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                            placeholder="Paste IPC section here..."
                            className="min-h-[220px] bg-gray-50 border-gray-200 resize-none text-gray-900 placeholder:text-gray-400 text-base font-serif leading-relaxed"
                        />
                    </div>

                    {/* BNS Section */}
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-green-india/30 p-6 shadow-premium">
                        <div className="flex items-center gap-2 mb-4 text-green-india font-semibold uppercase tracking-wider text-xs">
                            <Scale className="w-4 h-4" /> New Law (BNS)
                        </div>
                        <Textarea
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                            placeholder="Paste BNS section here..."
                            className="min-h-[220px] bg-gray-50 border-gray-200 resize-none text-gray-900 placeholder:text-gray-400 text-base font-serif leading-relaxed"
                        />
                    </div>
                </motion.div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center mb-12"
                >
                    <Button
                        size="lg"
                        onClick={handleCompare}
                        disabled={isLoading}
                        className="h-14 px-10 rounded-full btn-saffron shadow-saffron text-base font-medium transition-all hover:scale-105"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        {isLoading ? "Analyzing Differences..." : "Analyze Impact"}
                    </Button>
                </motion.div>

                {/* Results Area */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-end mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const analysisText = `Verdict: ${result.verdict}\n\nLegal Impact: ${result.legal_impact}\n\nKey Changes:\n${result.key_changes.map(c => `- ${c}`).join('\n')}\n\nPenalty Impact: ${result.penalty_difference}`;
                                        navigator.clipboard.writeText(analysisText);
                                        toast({ title: "Analysis copied!" });
                                    }}
                                    className="text-gray-500 hover:text-navy-india"
                                >
                                    <span className="mr-2">Copy Analysis</span>
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Verdict Banner */}
                            <div className={cn(
                                "p-6 rounded-2xl border flex items-start gap-5 backdrop-blur-sm",
                                result.change_type.includes("Major") ? "bg-red-50 border-red-200 text-red-800" :
                                    result.change_type.includes("Modified") ? "bg-blue-50 border-blue-200 text-blue-800" :
                                        "bg-green-50 border-green-200 text-green-800"
                            )}>
                                <div className={cn(
                                    "p-3 rounded-xl shrink-0",
                                    result.change_type.includes("Major") ? "bg-red-100" :
                                        result.change_type.includes("Modified") ? "bg-blue-100" :
                                            "bg-green-100"
                                )}>
                                    <Gavel className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">{result.verdict}</h3>
                                    <p className="opacity-80 leading-relaxed">{result.legal_impact}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Key Changes List */}
                                <div className="md:col-span-2 bg-white/90 border-2 border-navy-india/20 rounded-2xl p-6 backdrop-blur-sm shadow-premium hover:border-navy-india/40 transition-colors">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Changes</h4>
                                    <ul className="space-y-3">
                                        {result.key_changes.map((change, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy-india shrink-0" />
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Penalty & Details */}
                                <div className="space-y-6">
                                    <div className="bg-white/90 border-2 border-navy-india/20 rounded-2xl p-6 backdrop-blur-sm shadow-premium hover:border-navy-india/40 transition-colors">
                                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Penalty Impact</h4>
                                        <div className={cn(
                                            "text-lg font-bold",
                                            result.penalty_difference.includes("Increased") ? "text-red-600" :
                                                result.penalty_difference.includes("Decreased") ? "text-green-600" :
                                                    "text-gray-800"
                                        )}>
                                            {result.penalty_difference}
                                        </div>
                                    </div>

                                    <div className="bg-white/90 border-2 border-navy-india/20 rounded-2xl p-6 backdrop-blur-sm shadow-premium hover:border-navy-india/40 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Change Type</h4>
                                            {/* ... Tooltip ... */}
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-help p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                            <Lightbulb className="w-3.5 h-3.5 text-navy-india" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[280px] p-4 bg-white border-navy-india/20 text-gray-900">
                                                        <div className="space-y-2">
                                                            <p className="font-semibold text-sm text-navy-india">
                                                                {getChangeTypeInfo(result.change_type).desc}
                                                            </p>
                                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                                {getChangeTypeInfo(result.change_type).explanation}
                                                            </p>
                                                            <div className="pt-2 border-t border-gray-200 mt-2">
                                                                <p className="text-[10px] text-gray-400 italic">
                                                                    *Structural classification based on statutory text comparison. Not legal advice.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Badge variant="outline" className="text-base py-1 px-3 border-navy-india/30 text-navy-india bg-navy-india/5">
                                            {result.change_type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Inline Disclaimer */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-white/80 p-3 rounded-lg border border-navy-india/10">
                                <AlertTriangle className="w-3 h-3 text-navy-india" />
                                <span>This comparison highlights textual and structural changes only. It does not constitute legal advice.</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <Footer />
        </div>
    );
};

export default ComparisonPage;
