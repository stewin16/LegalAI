import { useState, useEffect } from "react";
import html2canvas from 'html2canvas';
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle, Sparkles, AlertCircle, Loader2, Download, History, Trash2, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';

interface SummaryHistory {
    id: string;
    fileName: string;
    summary: string;
    timestamp: number;
}

const SummarizePage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [history, setHistory] = useState<SummaryHistory[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem("summaryHistory");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const saveToHistory = (fileName: string, summaryText: string) => {
        const newEntry: SummaryHistory = {
            id: Date.now().toString(),
            fileName,
            summary: summaryText,
            timestamp: Date.now(),
        };
        const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
        setHistory(updatedHistory);
        localStorage.setItem("summaryHistory", JSON.stringify(updatedHistory));
    };

    const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem("summaryHistory", JSON.stringify(updatedHistory));
    };

    const loadHistoryItem = (item: SummaryHistory) => {
        setSummary(item.summary);
        setFile({ name: item.fileName, size: 0 } as File); // Mock file object for display
        setIsHistoryOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSummary(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/summarize', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            const summaryText = data.summary || "No summary generated.";
            setSummary(summaryText);
            saveToHistory(file.name, summaryText);
        } catch (error) {
            console.error("Upload Error:", error);
            setSummary("Error uploading file. Please ensure the backend is running.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!summary) return;

        // Create a hidden wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '0';
        wrapper.style.height = '0';
        wrapper.style.overflow = 'hidden'; // Hide content
        wrapper.style.zIndex = '-9999';
        document.body.appendChild(wrapper);

        // Create distinct PDF container inside wrapper
        const pdfContainer = document.createElement('div');
        pdfContainer.style.width = '595px'; // A4 width in pt
        pdfContainer.style.padding = '40px';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.color = '#000000';
        pdfContainer.style.opacity = '1';
        pdfContainer.style.position = 'relative'; // Relative to wrapper

        // Force standard font
        pdfContainer.style.fontFamily = 'Arial, Helvetica, sans-serif';

        // Header - Using Table for robust layout to avoid overlaps
        const header = document.createElement('div');
        header.innerHTML = `
            <div style="margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #000000; font-family: Arial, sans-serif;">Legal Document Summary</h1>
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
                    <tr>
                        <td style="width: 100px; font-size: 11px; color: #444; font-weight: bold; padding: 2px 0;">Source File:</td>
                        <td style="font-size: 11px; color: #000; padding: 2px 0;">${file?.name || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px; font-size: 11px; color: #444; font-weight: bold; padding: 2px 0;">Generated:</td>
                        <td style="font-size: 11px; color: #000; padding: 2px 0;">${new Date().toLocaleString()}</td>
                    </tr>
                </table>
            </div>
        `;
        pdfContainer.appendChild(header);

        // Content
        const contentSource = document.getElementById('summary-content');
        if (contentSource) {
            const contentClone = contentSource.cloneNode(true) as HTMLElement;
            // Force styles for PDF
            contentClone.className = ''; // Remove all classes
            contentClone.style.color = '#1a1a1a';
            contentClone.style.fontSize = '12px';
            contentClone.style.lineHeight = '1.6';

            // Clean up children styles manually since we removed classes
            const allElements = contentClone.querySelectorAll('*');
            allElements.forEach((el: any) => {
                // Style cleanup
                el.style.color = '#1a1a1a';
                if (el.tagName === 'H1') { el.style.fontSize = '20px'; el.style.fontWeight = 'bold'; el.style.marginTop = '15px'; }
                if (el.tagName === 'H2') { el.style.fontSize = '18px'; el.style.fontWeight = 'bold'; el.style.marginTop = '12px'; }
                if (el.tagName === 'H3') { el.style.fontSize = '16px'; el.style.fontWeight = 'bold'; el.style.marginTop = '10px'; }
                if (el.tagName === 'P') { el.style.marginBottom = '10px'; }
                if (el.tagName === 'UL') { el.style.paddingLeft = '20px'; el.style.marginBottom = '10px'; }
                if (el.tagName === 'OL') { el.style.paddingLeft = '20px'; el.style.marginBottom = '10px'; }
                if (el.tagName === 'LI') { el.style.marginBottom = '5px'; }

                // Content Sanitization: Remove emojis and garbage chars
                if (el.childNodes && el.childNodes.length > 0) {
                    el.childNodes.forEach((node: any) => {
                        if (node.nodeType === 3) { // Text node
                            // Remove emojis and non-basic punctuation/alphanumeric
                            // Keep basic latin, numbers, punctuation, common symbols
                            // Strip out ranges usually associated with emojis and symbols
                            let text = node.textContent;
                            // Simplistic emoji stripper
                            text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
                            node.textContent = text;
                        }
                    });
                }
            });

            pdfContainer.appendChild(contentClone);
        }

        wrapper.appendChild(pdfContainer);

        // Allow render (even though hidden)
        await new Promise(resolve => setTimeout(resolve, 100));

        const doc = new jsPDF('p', 'pt', 'a4');

        try {
            await doc.html(pdfContainer, {
                callback: function (doc) {
                    doc.save(`Summary_${file?.name.replace(/\.[^/.]+$/, "") || 'Legal_Document'}.pdf`);
                    if (document.body.contains(wrapper)) {
                        document.body.removeChild(wrapper);
                    }
                },
                x: 0,
                y: 0,
                width: 595, // Match container width
                windowWidth: 595,
                margin: [20, 0, 20, 0],
                autoPaging: 'text',
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    logging: false
                }
            });
        } catch (e) {
            console.error("PDF Generation failed", e);
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
        }
    };

    const handleReset = () => {
        setFile(null);
        setSummary(null);
    };

    return (
        <div className="min-h-screen flex flex-col text-gray-900 overflow-x-hidden">
            <TricolorBackground intensity="strong" showOrbs={true} />
            <Header />

            {/* History Sidebar Button */}
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="fixed left-6 top-24 z-30 flex items-center gap-2 px-4 py-3 glass-tricolor-card hover:shadow-saffron border border-gray-200 rounded-full transition-all group"
            >
                <History className="w-5 h-5 text-gray-400 group-hover:text-saffron" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 hidden md:inline">History</span>
            </button>

            {/* History Sidebar */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHistoryOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />
                        {/* Sidebar Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 p-6 shadow-elevated overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                    <History className="w-5 h-5 text-saffron" />
                                    History
                                </h2>
                                <button
                                    onClick={() => setIsHistoryOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No recent summaries</p>
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => loadHistoryItem(item)}
                                            className="group relative p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-saffron/30 hover:bg-saffron-light transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <FileText className="w-4 h-4 text-saffron shrink-0" />
                                                <p className="text-sm font-medium text-gray-700 truncate">{item.fileName}</p>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>

                                            <button
                                                onClick={(e) => deleteHistoryItem(item.id, e)}
                                                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 pt-8 pb-24 flex-1 relative z-10 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-12 text-center"
                >

                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-saffron via-gray-800 to-green-india">
                        Legal Document Summarizer
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        Upload complex judgments, petitions, or contracts and get concise, actionable summaries in seconds.
                    </p>
                </motion.div>

                <div className="flex flex-col items-center gap-8 w-full">
                    {/* Upload Section */}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf,.docx,.txt"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {!file ? (
                                <>
                                    <label
                                        htmlFor="file-upload"
                                        className="group relative inline-flex items-center gap-3 px-8 py-4 btn-saffron rounded-full font-semibold text-lg cursor-pointer shadow-saffron hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Upload Document
                                    </label>

                                    {/* Placeholder when no file/summary */}
                                    <div className="mt-12 w-full max-w-md p-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-saffron-light flex items-center justify-center mb-4">
                                            <FileText className="w-8 h-8 text-saffron" />
                                        </div>
                                        <p className="text-lg font-serif text-gray-600">View your summary here</p>
                                        <p className="text-sm text-gray-400 mt-2">Upload a document to see the AI-generated analysis.</p>
                                    </div>
                                </>
                            ) : (
                                !summary && (
                                    <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                            <div className="w-10 h-10 rounded-lg bg-saffron-light flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-saffron" />
                                            </div>
                                            <div className="min-w-0 text-left">
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                onClick={() => { setFile(null); setSummary(null); }}
                                                className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <AlertCircle className="w-4 h-4 rotate-45" />
                                            </button>
                                        </div>

                                        <Button
                                            size="lg"
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="h-12 px-8 rounded-full btn-green shadow-green"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Summarizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Generate Summary
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>

                    {/* Result Section */}
                    <AnimatePresence>
                        {summary && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full mt-8"
                            >
                                <div className="card-premium shadow-premium rounded-3xl p-8 relative overflow-hidden min-h-[60vh] border-2 border-navy-india/20 hover:border-navy-india/40 transition-colors">
                                    <div className="flex items-center justify-between mb-8 relative z-10 border-b border-gray-100 pb-4">
                                        <h3 className="text-2xl font-serif font-bold flex items-center gap-3 text-gray-900">
                                            <Sparkles className="w-6 h-6 text-saffron" />
                                            AI Summary
                                        </h3>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => {
                                                    if (summary) navigator.clipboard.writeText(summary);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="hidden sm:flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                                            >
                                                <History className="w-4 h-4 rotate-0 transform scale-x-[-1]" /> {/* Reused icon for copy since lucide 'Copy' wasn't imported, but wait, let me check imports */}
                                                Copy Text
                                            </Button>
                                            <Button
                                                onClick={handleDownload}
                                                variant="outline"
                                                size="sm"
                                                className="hidden sm:flex items-center gap-2 border-green-india/30 bg-green-light text-green-india hover:bg-green-india hover:text-white"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download PDF
                                            </Button>
                                        </div>
                                    </div>

                                    <div id="summary-content" className="prose prose-lg max-w-none text-gray-700 leading-relaxed z-10 relative">
                                        <ReactMarkdown>{summary}</ReactMarkdown>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                                        <p className="text-sm text-gray-400">
                                            Generated by LegalAi
                                        </p>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsHistoryOpen(true)}
                                                className="border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                            >
                                                <History className="w-4 h-4 mr-2" />
                                                View History
                                            </Button>
                                            <Button
                                                onClick={handleReset}
                                                className="btn-saffron"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Try Another Document
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Decorative Glow */}
                                    {/* Decorative Glow - Removed */}
                                    {/* <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" /> */}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default SummarizePage;
