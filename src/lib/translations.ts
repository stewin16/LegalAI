// Bilingual translations for LegalAi
export const translations = {
    en: {
        // Navigation
        newChat: "New Chat",
        recent: "Recent",

        // Main Interface
        appTitle: "LegalAi",
        appSubtitle: "Your advanced legal research assistant. Ask about IPC, BNS, or analyze specific cases.",

        // Quick Prompts
        quickPrompts: {
            murder: "Punishment for Murder 🔪",
            consumer: "File Consumer Complaint 🛒",
            cheating: "Check Cheating Laws 🤥",
            rent: "Draft Rent Agreement 🏠"
        },

        // Input & Actions
        inputPlaceholder: "Ask your legal question...",
        listening: "Listening...",
        sendButton: "Send",
        voiceInput: "Voice Input",
        exportPDF: "Save PDF",
        exportFullChat: "Export Full Chat to PDF",

        // Modes
        args: "Args",
        analysis: "Analysis",

        // Domain
        allDomains: "All Domains",
        criminalLaw: "Criminal Law",
        corporateLaw: "Corporate Law",

        // Citations
        verifiableSources: "Verifiable Sources",

        // Loading States
        loadingTexts: [
            "Scanning BNS Section 103...",
            "Cross-referencing Judgments...",
            "Analyzing IPC vs BNS...",
            "Verifying Legal Precedents...",
            "Synthesizing Neutral Analysis..."
        ],

        // Analysis Labels
        neutralAnalysis: "Neutral Analysis",
        argumentsFor: "Arguments For",
        argumentsAgainst: "Arguments Against",

        // Disclaimer
        disclaimer: "AI can make mistakes. Please verify important information.",
        pdfDisclaimer: "Disclaimer: Provided for informational purposes only. Not legal advice.",

        // PDF Export
        pdfTitle: "LegalAi - Research Report",
        pdfChatTitle: "LegalAi - Conversation History",
        legalCitations: "Legal Citations",
        date: "Date",
        domain: "Domain",
        query: "Query",
        you: "You",
        legalAi: "LegalAi"
    },

    hi: {
        // Navigation
        newChat: "नई बातचीत",
        recent: "हाल ही",

        // Main Interface
        appTitle: "लीगल एआई",
        appSubtitle: "आपका उन्नत कानूनी शोध सहायक। आईपीसी, बीएनएस के बारे में पूछें या विशिष्ट मामलों का विश्लेषण करें।",

        // Quick Prompts
        quickPrompts: {
            murder: "हत्या की सजा 🔪",
            consumer: "उपभोक्ता शिकायत दर्ज करें 🛒",
            cheating: "धोखाधड़ी कानून जांचें 🤥",
            rent: "किराया समझौता तैयार करें 🏠"
        },

        // Input & Actions
        inputPlaceholder: "अपना कानूनी सवाल पूछें...",
        listening: "सुन रहा हूं...",
        sendButton: "भेजें",
        voiceInput: "आवाज़ इनपुट",
        exportPDF: "पीडीएफ सहेजें",
        exportFullChat: "पूर्ण चैट पीडीएफ में निर्यात करें",

        // Modes
        args: "तर्क",
        analysis: "विश्लेषण",

        // Domain
        allDomains: "सभी क्षेत्र",
        criminalLaw: "आपराधिक कानून",
        corporateLaw: "कॉर्पोरेट कानून",

        // Citations
        verifiableSources: "सत्यापन योग्य स्रोत",

        // Loading States
        loadingTexts: [
            "BNS धारा 103 स्कैन कर रहे हैं...",
            "निर्णयों का सत्यापन कर रहे हैं...",
            "IPC बनाम BNS विश्लेषण कर रहे हैं...",
            "कानूनी उदाहरणों की जांच कर रहे हैं...",
            "तटस्थ विश्लेषण तैयार कर रहे हैं..."
        ],

        // Analysis Labels
        neutralAnalysis: "तटस्थ विश्लेषण",
        argumentsFor: "पक्ष में तर्क",
        argumentsAgainst: "विपक्ष में तर्क",

        // Disclaimer
        disclaimer: "AI गलतियाँ कर सकता है। कृपया महत्वपूर्ण जानकारी सत्यापित करें।",
        pdfDisclaimer: "अस्वीकरण: केवल सूचनात्मक उद्देश्यों के लिए प्रदान किया गया। कानूनी सलाह नहीं।",

        // PDF Export
        pdfTitle: "लीगल एआई - शोध रिपोर्ट",
        pdfChatTitle: "लीगल एआई - बातचीत इतिहास",
        legalCitations: "कानूनी उद्धरण",
        date: "तारीख",
        domain: "क्षेत्र",
        query: "प्रश्न",
        you: "आप",
        legalAi: "लीगल एआई"
    }
};

// Helper function to get translation
export const t = (key: string, lang: 'en' | 'hi' = 'en') => {
    const keys = key.split('.');
    let value: Record<string, unknown> | string | undefined = translations[lang] as Record<string, unknown>;

    for (const k of keys) {
        if (typeof value === 'object' && value !== null) {
            value = (value as Record<string, unknown>)[k] as Record<string, unknown> | string | undefined;
        } else {
            value = undefined;
            break;
        }
    }

    return (typeof value === 'string' ? value : key);
};

// Helper to get current language translations
export const useTranslations = (lang: 'en' | 'hi') => {
    return translations[lang];
};
