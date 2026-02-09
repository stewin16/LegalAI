import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Languages, FileText, PenTool, Loader2, Maximize2, X, Sparkles } from 'lucide-react';
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const exampleScenarios: Record<string, string> = {
    legal_notice: "Sender: Ramesh Kumar, 123 MG Road, Mumbai.\nRecipient: Suresh Patel, 456 Link Road, Mumbai.\nIssue: Non-repair of rented property despite multiple reminders.\nDemand: Repair damages worth Rs. 50,000 within 15 days or face legal action.",
    nda: "Party A: TechSolutions Pvt Ltd, Bangalore.\nParty B: Rahul Verma, Consultant.\nPurpose: Exploring potential software development partnership.\nConfidential Info: Source code, business strategies, client lists.\nDuration: 2 years.",
    rent_agreement: "Landlord: Amit Singh, Delhi.\nTenant: Priya Sharma, Delhi.\nProperty: Flat 301, Green Apartments, Rohini, Delhi.\nRent: Rs. 25,000/month.\nSecurity Deposit: Rs. 50,000.\nDuration: 11 months.\nStart Date: 1st February 2024.",
    affidavit: "Deponent: Vijay Singh, aged 35, residing in Pune.\nStatement: I declare that I have lost my original driving license (DL No. MH123456) on 10th Jan 2024 while travelling from Pune to Mumbai. I have not misused it.",
    employment_contract: "Employer: Innovate AI Ltd, Hyderabad.\nEmployee: Anjali Das.\nDesignation: Senior Data Scientist.\nSalary: Rs. 1,50,000/month.\nNotice Period: 60 days.\nJoining Date: 1st March 2024.",
    posh_complaint: "Complainant: Neha Gupta, Marketing Manager.\nRespondent: Ravi Kumar, Team Lead.\nIncident: Unsolicited inappropriate comments made during lunch break on 15th Jan 2024 at the office cafeteria.\nWitnesses: Priya (HR), Rahul (Sales).",
    rti_application: "Department: Ministry of Road Transport & Highways.\nInformation Sought: 1. Status of road construction project on NH-44 near Nagpur. 2. Total funds allocated and utilized for this project in 2023-24.\n Applicant: Suresh Patil, Nagpur."
};

const DraftingPage = () => {
    const [draftType, setDraftType] = useState<string>("legal_notice");
    const [details, setDetails] = useState<string>("");
    const [language, setLanguage] = useState<string>("en");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState<string>("");
    const [isFocusMode, setIsFocusMode] = useState(false);

    const handleGenerate = async () => {
        if (!details.trim()) {
            toast.error("Please provide some details for the draft.");
            return;
        }

        setIsGenerating(true);
        // Clear previous draft to show fresh generation
        setGeneratedDraft("");

        try {
            // Use the general query endpoint since /draft doesn't exist
            const response = await fetch('http://localhost:8000/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `[Legal Drafting] Draft a professional ${draftType.replace(/_/g, " ")} based on the following details:\n\n${details}\n\nEnsure standard legal formatting, clear clauses, and professional tone.`,
                    language: language
                })
            });

            if (response.ok) {
                const data = await response.json();
                // The API returns 'answer' for the query endpoint
                if (data.answer) {
                    setGeneratedDraft(data.answer);
                    toast.success("Draft generated! You can now edit it.");
                } else {
                    toast.error("Received empty response from AI.");
                }
            } else {
                toast.error("Failed to generate draft. Please try again.");
            }
        } catch (error) {
            console.error("Error generating draft:", error);
            toast.error("Connection error. Is the backend running?");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!generatedDraft) return;

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("LegalAi Draft", 105, 20, { align: "center" });

        // Add Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Type: ${draftType.replace(/_/g, " ").toUpperCase()}`, 15, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 35);

        // Add Content
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        const splitText = doc.splitTextToSize(generatedDraft, 180);

        // Handle pagination if text is too long (basic implementation)
        let y = 50;
        if (splitText.length > 50) {
            // For very long documents, this simple loop might need enhancement
            doc.text(splitText, 15, y);
        } else {
            doc.text(splitText, 15, y);
        }

        // Add Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by LegalAi - Not a substitute for professional legal advice.", 105, pageHeight - 10, { align: 'center' });

        doc.save(`${draftType}_draft.pdf`);
        toast.success("PDF Downloaded!");
    };

    return (
        <div className="min-h-screen text-gray-900">
            <TricolorBackground intensity="strong" showOrbs={true} />
            <Header />

            {/* Focus Mode Overlay */}
            {isFocusMode && (
                <div className="fixed inset-0 z-[100] bg-white p-6 animate-in fade-in duration-300">
                    <div className="container max-w-5xl mx-auto h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-medium text-gray-700">Focus Mode</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="btn-saffron"
                                >
                                    <Download className="w-4 h-4 mr-2" /> PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsFocusMode(false)}
                                    className="text-gray-500 hover:text-gray-900"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            value={generatedDraft}
                            onChange={(e) => setGeneratedDraft(e.target.value)}
                            className="flex-1 bg-gray-50 border-gray-200 text-gray-900 font-serif text-lg leading-loose p-8 resize-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron rounded-xl"
                            placeholder="Your draft will appear here..."
                        />
                    </div>
                </div>
            )}

            <div className="container max-w-6xl mx-auto pt-8 pb-20 px-4 md:px-6">

                {/* Hero Header */}
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <div className="p-3 rounded-2xl bg-saffron-light border border-saffron/20 mb-6 shadow-saffron">
                        <PenTool className="w-8 h-8 text-saffron" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        AI Legal <span className="text-saffron">Drafter</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
                        Generate professional legal documents in seconds. Edit them to perfection before downloading.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Input Section */}
                    <div className="h-full">
                        <div className="glass-tricolor-card p-6 h-full flex flex-col">
                            <div className="mb-6 border-b border-gray-100 pb-4">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <FileText className="w-5 h-5 text-saffron" />
                                    Draft Configuration
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Customize your document requirements
                                </p>
                            </div>

                            <div className="space-y-6 flex-1">

                                {/* Type Selection */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Document Type</Label>
                                    <Select value={draftType} onValueChange={setDraftType}>
                                        <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-saffron/20 focus:border-saffron">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                                            <SelectItem value="legal_notice">Legal Notice</SelectItem>
                                            <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                                            <SelectItem value="rent_agreement">Rent Agreement</SelectItem>
                                            <SelectItem value="affidavit">Affidavit</SelectItem>
                                            <SelectItem value="employment_contract">Employment Contract</SelectItem>
                                            <SelectItem value="posh_complaint">POSH Complaint</SelectItem>
                                            <SelectItem value="rti_application">RTI Application</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Situation Input */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Situation / Details</span>
                                            <span className="text-xs text-gray-400 font-normal">Be specific (names, dates, amounts)</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setDetails(exampleScenarios[draftType] || "");
                                                toast(" ✨ Example details filled!");
                                            }}
                                            className="h-7 text-xs border-saffron/30 text-saffron hover:bg-saffron-light"
                                        >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Quick Fill
                                        </Button>
                                    </Label>
                                    <Textarea
                                        placeholder="E.g., I want to send a legal notice to Mr. Sharma for not returning my security deposit of ₹50,000 for Flat 302..."
                                        className="min-h-[220px] bg-white border-gray-200 text-gray-900 resize-none focus:ring-saffron/20 focus:border-saffron"
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                    />
                                </div>

                                {/* Language & Action */}
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                                        <Languages className="w-4 h-4 text-gray-500" />
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${language === 'en' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>EN</span>
                                            <Switch
                                                checked={language === 'hi'}
                                                onCheckedChange={(checked) => setLanguage(checked ? 'hi' : 'en')}
                                                className="data-[state=checked]:bg-saffron"
                                            />
                                            <span className={`text-sm ${language === 'hi' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>HI</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !details}
                                        className="btn-saffron px-6 rounded-full font-medium transition-all shadow-saffron"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Drafting...
                                            </>
                                        ) : (
                                            <>
                                                Generate Draft
                                                <PenTool className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="h-full">
                        <Card className="card-premium shadow-premium h-full flex flex-col animate-in fade-in zoom-in-95 duration-300 min-h-[500px]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
                                <div>
                                    <CardTitle className="text-gray-900">Draft Editor</CardTitle>
                                    <CardDescription className="text-gray-500 text-xs mt-1">
                                        Edit the content directly below.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsFocusMode(true)}
                                        disabled={!generatedDraft}
                                        className="text-gray-400 hover:text-gray-900"
                                        title="Focus Mode"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (generatedDraft) {
                                                navigator.clipboard.writeText(generatedDraft);
                                                toast.success("Draft copied to clipboard!");
                                            }
                                        }}
                                        disabled={!generatedDraft}
                                        className="text-gray-500 hover:text-gray-900"
                                        title="Copy Draft"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadPDF}
                                        disabled={!generatedDraft}
                                        className="gap-2 border-green-india/30 bg-green-light text-green-india hover:bg-green-india hover:text-white"
                                    >
                                        <Download className="w-4 h-4" />
                                        PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden relative">
                                {generatedDraft ? (
                                    <Textarea
                                        value={generatedDraft}
                                        onChange={(e) => setGeneratedDraft(e.target.value)}
                                        className="w-full h-full min-h-[400px] border-0 bg-gray-50 text-gray-900 font-serif text-sm leading-relaxed p-6 resize-none focus:ring-0 rounded-b-xl"
                                        placeholder="Generated draft will appear here..."
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-50">
                                        <div className="p-4 rounded-full bg-saffron-light mb-4">
                                            <FileText className="w-8 h-8 text-saffron" />
                                        </div>
                                        <h3 className="text-gray-700 font-medium mb-2">Ready to Draft</h3>
                                        <p className="text-gray-500 text-sm max-w-xs">
                                            Your legal document will appear here, fully editable and ready to export.
                                        </p>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DraftingPage;
