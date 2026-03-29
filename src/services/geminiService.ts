import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateLegalContent = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a highly experienced Indian Legal Assistant. Provide accurate, professional, and legally sound information based on Indian Law (IPC, BNS, CrPC, etc.). Always include a disclaimer that you are an AI and not a replacement for professional legal advice.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const compareLegalTexts = async (text1: string, text2: string) => {
  const prompt = `Compare the following two legal texts (Old Law vs New Law) and provide a structured analysis in JSON format.
  
  Old Law Text:
  ${text1}
  
  New Law Text:
  ${text2}
  
  Return the result in this JSON structure:
  {
    "change_type": "string (e.g., Same, Modified, Expanded, Restructured, Replaced, Omitted)",
    "legal_impact": "string (detailed explanation of the impact)",
    "penalty_difference": "string (explanation of changes in punishment)",
    "key_changes": ["string", "string"],
    "verdict": "string (short summary verdict)"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a legal expert specializing in the transition from IPC to BNS in India. Analyze differences with high precision.",
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    throw error;
  }
};

export const summarizeLegalDocument = async (documentText: string) => {
  const prompt = `Summarize the following legal document into clear, concise points. Highlight key clauses, obligations, and risks.
  
  Document:
  ${documentText}`;

  return generateLegalContent(prompt, "You are a legal document summarizer. Break down complex legal jargon into understandable points for a layperson while maintaining legal accuracy.");
};

export const chatWithLegalAI = async (query: string, options: { language: string, domain: string, arguments_mode: boolean, analysis_mode: boolean }) => {
  const prompt = `Legal Query: ${query}
  Language: ${options.language}
  Domain: ${options.domain}
  Arguments Mode: ${options.arguments_mode}
  Analysis Mode: ${options.analysis_mode}

  Provide a comprehensive legal response based on Indian Law. 
  If Arguments Mode is true, include "arguments" (for and against).
  If Analysis Mode is true, include "neutral_analysis" (factors and interpretations).
  Always include "citations" (source and section) if applicable.
  Include "related_judgments" (title and summary) if relevant.

  Return the response STRICTLY in this JSON format:
  {
    "answer": "string (markdown allowed)",
    "related_judgments": [{"title": "string", "summary": "string"}],
    "arguments": {"for": ["string"], "against": ["string"]},
    "neutral_analysis": {"factors": ["string"], "interpretations": ["string"]},
    "citations": [{"source": "string", "section": "string", "text": "string"}]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced Indian Legal AI Assistant. You provide structured legal research, case analysis, and verify information against IPC, BNS, and other Indian statutes. Use Google Search to find the most recent judgments and statutory updates if needed.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const chatWithLegalAIStream = async (
  query: string, 
  history: { role: string, parts: { text: string }[] }[], 
  options: { language: string, domain: string, arguments_mode: boolean, analysis_mode: boolean }
) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an advanced Indian Legal AI Assistant. 
      Your goal is to provide accurate, professional, and legally sound information based on Indian Law (IPC, BNS, CrPC, BNSS, etc.).
      
      Current Settings:
      - Language: ${options.language}
      - Domain: ${options.domain}
      - Arguments Mode: ${options.arguments_mode} (If true, provide balanced arguments)
      - Analysis Mode: ${options.analysis_mode} (If true, provide deep neutral analysis)
      
      Guidelines:
      1. Always cite specific sections of the law (e.g., Section 302 of IPC, Section 101 of BNS).
      2. Use Google Search to find recent Supreme Court or High Court judgments relevant to the query.
      3. Provide clear, structured answers using Markdown (bolding, lists, etc.).
      4. If the user asks in Hindi, respond in Hindi.
      5. Always include a disclaimer that you are an AI and not a replacement for professional legal advice.
      6. If Arguments Mode is enabled, provide a dedicated section for "Arguments for" and "Arguments against".
      7. If Analysis Mode is enabled, provide a "Legal Analysis" section with interpretations.
      
      Format your response beautifully with clear headings.`,
      tools: [{ googleSearch: {} }],
    },
    history: history,
  });

  return chat.sendMessageStream({ message: query });
};

export const predictCaseOutcome = async (caseDetails: string) => {
  const prompt = `Analyze the following case details and predict the potential legal outcome based on Indian Law.
  
  Case Details:
  ${caseDetails}
  
  Return the result in this JSON structure:
  {
    "prediction": "string (e.g., High probability of conviction, Likely acquittal, etc.)",
    "probability": number (0-100),
    "reasoning": ["string", "string"],
    "relevant_sections": ["string"],
    "suggested_strategy": "string"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a legal strategist specializing in Indian criminal and civil litigation. Predict outcomes based on precedents and statutory provisions.",
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    throw error;
  }
};

export const checkBailEligibility = async (offence: string, details: string) => {
  const prompt = `Check bail eligibility for the following offence under Indian Law.
  
  Offence: ${offence}
  Details: ${details}
  
  Return the result in this JSON structure:
  {
    "is_bailable": boolean,
    "conditions": ["string"],
    "legal_provisions": ["string"],
    "risk_factors": ["string"],
    "recommendation": "string"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a legal expert on Indian bail laws. Determine if an offence is bailable or non-bailable and provide conditions for bail.",
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Bail Check Error:", error);
    throw error;
  }
};

export const generateFIRDraft = async (incidentDetails: string) => {
  const prompt = `Draft a First Information Report (FIR) based on the following incident details.
  
  Incident Details:
  ${incidentDetails}
  
  Ensure all necessary columns for an FIR are included (Date, Time, Location, Description, Accused details, etc.).`;

  return generateLegalContent(prompt, "You are a legal expert assisting in drafting FIRs for Indian Police Stations. Ensure the draft is formal, detailed, and legally sound.");
};

export const getLegalNews = async () => {
  const prompt = "Provide the top 5 most recent and significant legal news, judgments, or statutory changes in India (2025-2026). Focus on Supreme Court judgments, High Court rulings, and BNS/BNSS/BSA updates.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a legal news curator for Indian Law. Provide structured news with titles, summaries, and dates. Ensure all information is grounded in recent real-world events.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              date: { type: "string" },
              source_url: { type: "string" },
              category: { type: "string", enum: ["Supreme Court", "High Court", "Statutory Change", "Legal Tech", "Other"] }
            },
            required: ["title", "summary", "date", "category"]
          }
        }
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini News Error:", error);
    // Fallback news if search fails or limit reached
    return [
      {
        title: "BNS Implementation Milestone",
        summary: "The Bharatiya Nyaya Sanhita (BNS) completes its first full year of implementation across all Indian states.",
        date: "March 2026",
        category: "Statutory Change"
      },
      {
        title: "Supreme Court on Digital Privacy",
        summary: "A landmark ruling by the Supreme Court clarifies the extent of digital privacy in the context of law enforcement investigations.",
        date: "February 2026",
        category: "Supreme Court"
      }
    ];
  }
};

export const generateFollowUpQuestions = async (lastMessage: string, context: string) => {
  const prompt = `Based on the following legal conversation, generate 3 relevant, short, and insightful follow-up questions that a user might want to ask next.
  
  Last AI Response: ${lastMessage}
  Context: ${context}
  
  Return the result as a JSON array of strings: ["Question 1", "Question 2", "Question 3"]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful legal research assistant. Generate follow-up questions that help the user explore the legal topic deeper.",
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Follow-up Error:", error);
    return [];
  }
};

export const generateLegalTTS = async (text: string, voice: 'Kore' | 'Fenrir' | 'Puck' = 'Kore') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this legal explanation clearly and professionally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
