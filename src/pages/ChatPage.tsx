import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Scale, Zap, BookOpen, Mic, MicOff, Download, Sparkles, Send, Menu, Plus, Trash2, MessageSquare, ExternalLink, Copy, Check } from "lucide-react";
import Header from "@/components/Header";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslations } from "@/lib/translations";

interface Judgment {
  title: string;
  summary: string;
}

interface Arguments {
  for: string[];
  against: string[];
}

interface NeutralAnalysis {
  factors: string[];
  interpretations: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  judgments?: Judgment[];
  arguments?: Arguments;
  neutral_analysis?: NeutralAnalysis;
  citations?: any[];
}

const getQuickPrompts = (t: any) => [
  { textKey: "quickPrompts.murder", query: "Punishment for murder under BNS" },
  { textKey: "quickPrompts.consumer", query: "How to file a consumer complaint" },
  { textKey: "quickPrompts.cheating", query: "Punishment for cheating" },
  { textKey: "quickPrompts.rent", query: "Essentials of a rent agreement" }
];



const ChatPage = () => {
  // Get translations for current language
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const t = useTranslations(language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [domain, setDomain] = useState("all");
  const [argumentsMode, setArgumentsMode] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loadingText, setLoadingText] = useState(t.loadingTexts[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Conversation history state
  const [conversations, setConversations] = useState<Array<{
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
  }>>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversations from localStorage on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('legal-compass-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        // Always start with a new chat instead of loading the most recent one
        // This ensures users get a fresh start every time they open the assistant
        setActiveConversationId(null);
        setMessages([]);
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('legal-compass-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (scrollRef.current && (messages.length > 0 || isLoading)) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % t.loadingTexts.length;
        setLoadingText(t.loadingTexts[i]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  const getKanoonLink = (source: string, section: string) => {
    // Create a smart search query for Indian Kanoon
    const query = encodeURIComponent(`${source} ${section}`);
    return `https://indiankanoon.org/search/?formInput=${query}`;
  };

  const exportPDF = (msg: Message, query: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("LegalAi - Research Report", 15, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()} | Domain: ${domain}`, 15, 28);

    // Query
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Query: ${query}`, 15, 40);

    // Content
    doc.setFontSize(11);

    // Improved simple text cleaner for PDF
    const cleanText = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/##/g, '')              // Headings
        .replace(/^#\s/gm, '')           // H1
        .replace(/^-\s/gm, '• ')         // Bullets
        .trim();
    };

    const splitText = doc.splitTextToSize(cleanText(msg.content), 180);
    doc.text(splitText, 15, 50);

    let yPos = 50 + (splitText.length * 7);

    // Citations
    if (msg.citations && msg.citations.length > 0) {
      doc.addPage(); // Force new page for citations
      yPos = 20;     // Reset Y position

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Legal Citations", 15, yPos);
      yPos += 10;

      const citationData = msg.citations.map(c => [c.source, c.section, c.text]);
      autoTable(doc, {
        startY: yPos,
        head: [['Source', 'Section', 'Text']],
        body: citationData,
        theme: 'grid'
      });
      interface JsPDFWithAutoTable extends jsPDF {
        lastAutoTable: { finalY: number };
      }
      yPos = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;
    }

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Disclaimer: Provide for informational purposes only. Not legal advice.", 15, 280);

    doc.save("legal-research-report.pdf");
  };

  const exportFullChat = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("LegalAi - Conversation History", 15, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()} | Domain: ${domain}`, 15, 28);

    let yPos = 40;

    messages.forEach((msg) => {
      // Page break check
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Role Header
      doc.setFontSize(12);
      if (msg.role === 'user') {
        doc.setTextColor(0, 50, 150); // Muted Blue
        doc.text("You:", 15, yPos);
      } else {
        doc.setTextColor(100, 0, 150); // Muted Purple
        doc.text("LegalAi:", 15, yPos);
      }
      yPos += 7;

      // Content
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      // Robust markdown stripping for full chat
      const cleanContent = msg.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/##/g, '')              // Headings
        .replace(/^#\s/gm, '')           // H1
        .replace(/^-\s/gm, '• ')         // Bullets
        .trim();

      const splitText = doc.splitTextToSize(cleanContent, 180);
      doc.text(splitText, 15, yPos);

      // Calculate new Y position based on text height
      yPos += (splitText.length * 5) + 10;

      // Separator line
      doc.setDrawColor(230, 230, 230);
      doc.line(15, yPos - 5, 195, yPos - 5);
    });

    doc.save("legal-compass-full-chat.pdf");
  };

  // Conversation management functions
  const createNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput("");
  };

  const switchConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setActiveConversationId(conv.id);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) {
      createNewChat();
    }
  };

  const saveCurrentConversation = (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    const title = updatedMessages[0].content.slice(0, 40) + (updatedMessages[0].content.length > 40 ? '...' : '');
    const timestamp = Date.now();

    if (activeConversationId) {
      // Update existing conversation
      setConversations(prev => prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: updatedMessages, timestamp }
          : c
      ));
    } else {
      // Create new conversation
      const newId = `conv_${timestamp}`;
      setActiveConversationId(newId);
      setConversations(prev => [{
        id: newId,
        title,
        messages: updatedMessages,
        timestamp
      }, ...prev]);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Auto-detect language based on input script
    // If Devanagari characters are present, switch to Hindi. Otherwise, default to English.
    const isHindiInput = /[\u0900-\u097F]/.test(text);
    const useLanguage = isHindiInput ? 'hi' : 'en';

    // Update local state to reflect the change visually
    if (useLanguage !== language) {
      setLanguage(useLanguage);
    }

    try {
      const response = await fetch('http://localhost:8000/query', { // Pointing directly to backend for stability
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language: useLanguage, // Use determined language immediately 
          domain,
          arguments_mode: argumentsMode,
          analysis_mode: analysisMode
        })
      });

      const data = await response.json();

      if (data.answer) {
        const newMessages = [...messages, userMsg, {
          role: 'assistant' as const,
          content: data.answer,
          judgments: data.related_judgments,
          arguments: data.arguments,
          neutral_analysis: data.neutral_analysis,
          citations: data.citations
        }];
        setMessages(newMessages);
        saveCurrentConversation(newMessages);
      } else {
        const newMessages = [...messages, userMsg, { role: 'assistant' as const, content: "Sorry, I couldn't process that request." }];
        setMessages(newMessages);
        saveCurrentConversation(newMessages);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const newMessages = [...messages, userMsg, { role: 'assistant' as const, content: "Error connecting to the server. Please ensure the backend is running." }];
      setMessages(newMessages);
      saveCurrentConversation(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900 overflow-x-hidden">
      <TricolorBackground intensity="strong" showOrbs={true} />
      <Header />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden pt-0">

        {/* Sidebar - Premium White with Saffron accent */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[260px] bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shrink-0 z-20 relative tricolor-line"
            >
              <div className="p-3 pt-4">
                <Button
                  onClick={createNewChat}
                  className="w-full justify-start gap-2 btn-saffron text-sm font-medium h-10 px-3 rounded-xl shadow-saffron"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
                {conversations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</h3>
                    <div className="space-y-0.5">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => switchConversation(conv.id)}
                          className={cn(
                            "group relative flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm",
                            activeConversationId === conv.id
                              ? "bg-orange-100 text-gray-900"
                              : "text-gray-600 hover:glass hover:text-gray-800"
                          )}
                        >
                          <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                          <span className="flex-1 truncate font-normal">
                            {conv.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 -mr-1 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-600 hover:text-red-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative min-w-0 glass-saffron">
          {/* Subtle Background Gradients */}
          {/* Subtle Background Gradients - Removed as per user request */}
          {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-0 right-1/4 w-[500px] h-[500px] glass-saffron rounded-full blur-[120px]" />
               <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] glass-green rounded-full blur-[120px]" />
           </div> */}

          {/* Mobile Sidebar Toggle */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-30 text-gray-600 hover:text-gray-900 hover:bg-orange-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Top Controls Bar - Simplified */}
          <div className="w-full border-b border-gray-200/60 px-6 py-3 flex items-center justify-end gap-3 glass-saffron/80 backdrop-blur-sm z-10">
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="mr-auto text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="flex items-center gap-1 glass p-1 rounded-lg border border-gray-200/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArgumentsMode(!argumentsMode)}
                className={cn("h-7 px-3 text-xs rounded-md transition-all", argumentsMode ? "bg-purple-500/10 text-[#FF9933]" : "text-gray-600 hover:text-gray-900")}
              >
                <Zap className="w-3 h-3 mr-1.5" /> Args
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnalysisMode(!analysisMode)}
                className={cn("h-7 px-3 text-xs rounded-md transition-all", analysisMode ? "bg-blue-500/10 text-[#138808]" : "text-gray-600 hover:text-gray-900")}
              >
                <Scale className="w-3 h-3 mr-1.5" /> Analysis
              </Button>
            </div>


            <div className="h-4 w-px bg-orange-100" />

            {/* Language Toggle */}
            <div className="flex items-center gap-1 glass p-1 rounded-lg border border-gray-200/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('en')}
                className={cn("h-7 w-7 p-0 text-xs rounded-md transition-all", language === 'en' ? "bg-white/10 text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900")}
              >
                EN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('hi')}
                className={cn("h-7 w-7 p-0 text-xs rounded-md transition-all", language === 'hi' ? "bg-white/10 text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900")}
              >
                HI
              </Button>
            </div>

            <div className="h-4 w-px bg-orange-100" />

            <Button
              variant="ghost"
              size="sm"
              onClick={exportFullChat}
              disabled={messages.length === 0}
              className="text-gray-600 hover:text-gray-900"
              title="Export Full Chat to PDF"
            >
              <Download className="w-4 h-4" />
            </Button>

            <div className="h-4 w-px bg-orange-100" />

            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="w-[130px] h-8 bg-transparent border-none text-xs text-gray-700 focus:ring-0">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent className="glass border-gray-200/60 text-gray-700">
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="criminal">Criminal Law</SelectItem>
                <SelectItem value="corporate">Corporate Law</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
                  >
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 border border-gray-200/60 shadow-xl">
                      <Sparkles className="w-8 h-8 text-[#ff8800]" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">LegalAi</h2>
                    <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">
                      Your advanced legal research assistant. Ask about IPC, BNS, or analyze specific cases.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                      {Object.entries(t.quickPrompts).map(([key, text], idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(key === 'murder' ? 'What is the punishment for murder under BNS?' :
                            key === 'consumer' ? 'How to file a consumer complaint?' :
                              key === 'cheating' ? 'What are the laws for cheating?' :
                                'How to draft a rent agreement?')}
                          className="text-left p-3 rounded-lg glass border border-gray-200/60 hover:bg-orange-100 hover:border-gray-600 transition-all group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex w-full gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200/40 mt-1">
                        <Scale className="w-4 h-4 text-[#FF9933]" />
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm",
                      msg.role === 'user'
                        ? "msg-user text-gray-900 rounded-br-none"
                        : "msg-ai text-gray-800 pl-4"
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-strong:text-saffron">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>

                          {/* Analysis Cards */}
                          {(msg.neutral_analysis || msg.arguments || (msg.judgments && msg.judgments.length > 0)) && (
                            <div className="mt-6 flex flex-col gap-4 not-prose">
                              {msg.neutral_analysis && (
                                <div className="glass-green border border-green-200/40 rounded-lg p-4">
                                  <h4 className="flex items-center gap-2 text-[#138808] font-medium mb-3 text-xs uppercase tracking-wider">
                                    Neutral Analysis
                                  </h4>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <ul className="text-xs text-green-700/70 list-disc list-inside space-y-1">
                                      {msg.neutral_analysis.factors.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                    <ul className="text-xs text-green-700/70 list-disc list-inside space-y-1">
                                      {msg.neutral_analysis.interpretations.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {msg.arguments && (
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="glass-green border border-green-200/40 rounded-lg p-3">
                                    <h4 className="text-emerald-400 font-medium mb-2 text-xs uppercase">Arguments For</h4>
                                    <ul className="text-xs text-green-700/70 list-disc list-inside space-y-1">
                                      {msg.arguments.for.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                  <div className="bg-red-50 border border-red-200/40 rounded-lg p-3">
                                    <h4 className="text-red-400 font-medium mb-2 text-xs uppercase">Arguments Against</h4>
                                    <ul className="text-xs text-red-700/70 list-disc list-inside space-y-1">
                                      {msg.arguments.against.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-4 not-prose glass border border-gray-200/60 rounded-xl overflow-hidden">
                              <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-green-50 border-b border-gray-200/60 flex items-center justify-between">
                                <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                  <BookOpen className="w-3 h-3" /> Verifiable Sources
                                </h4>
                              </div>
                              <div className="p-1">
                                {msg.citations.map((cite, i) => (
                                  <a
                                    key={i}
                                    href={getKanoonLink(cite.source, cite.section)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-3 py-2 hover:bg-orange-100 rounded-lg group transition-colors text-xs"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium text-[#FF9933] group-hover:text-purple-300 transition-colors">
                                        {cite.section}
                                      </span>
                                      <span className="text-[10px] text-gray-500">{cite.source}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ExternalLink className="w-3 h-3 text-gray-600 hover:text-gray-900" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex gap-2 justify-start opacity-70 hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-gray-500 hover:text-gray-700 px-2"
                              onClick={() => exportPDF(msg, "Legal Query")}
                            >
                              <Download className="h-3 w-3 mr-1.5" /> Save PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-gray-500 hover:text-gray-700 px-2"
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                // Optional: add toast notification here if available
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1.5" /> Copy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 pl-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200/40">
                      <Loader2 className="h-4 w-4 animate-spin text-[#FF9933]" />
                    </div>
                    <span className="text-xs font-mono text-gray-500 animate-pulse">{loadingText}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
            <div className="relative flex items-center gap-2 glass-premium border border-gray-200/60 rounded-2xl p-2.5 shadow-premium focus-within:border-saffron/30 focus-within:shadow-saffron/10 transition-all duration-300">
              <Button
                variant={isListening ? "destructive" : "ghost"}
                size="icon"
                onClick={startListening}
                className={cn("rounded-xl h-10 w-10 shrink-0 transition-all duration-300", isListening ? "bg-red-500 text-white" : "text-gray-500 hover:text-saffron hover:bg-saffron/10")}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Ask your legal question..."}
                className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 h-10 px-2 shadow-none text-[15px]"
              />

              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={cn(
                  "rounded-xl h-10 w-10 shrink-0 transition-all duration-300",
                  input.trim()
                    ? "btn-saffron shadow-saffron"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 text-[11px] text-center text-gray-400">
              AI can make mistakes. Please verify important information.
            </div>
          </div>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPage;
