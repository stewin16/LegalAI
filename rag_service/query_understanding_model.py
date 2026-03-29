"""
Query Understanding Model (Model 1)

Responsibilities:
- Detect query intent (statute | case_law | comparison | summarization)
- Normalize bilingual/Hinglish input to legal English
- Expand legal abbreviations
- Generate optimized retrieval query
- Extract legal entities

CRITICAL: This model MUST NOT generate answers or see retrieved context
"""

import re
from typing import Optional
from dataclasses import dataclass
from ollama_client import get_ollama_client


@dataclass
class QueryIntent:
    """Structured output from query understanding"""
    intent_type: str  # "statute_lookup" | "case_law" | "comparison" | "summarization" | "general"
    optimized_query: str  # Cleaned query for vector search
    legal_entities: list  # Extracted section numbers, act names
    confidence: float  # 0.0-1.0
    original_language: str  # "en" | "hi" | "hinglish"


class QueryUnderstandingModel:
    """
    Model 1: Query Understanding and Optimization
    Uses Mistral 7B via Ollama
    """
    
    def __init__(self):
        self.model_role = "query_understanding"
        
        # Legal abbreviation expansions
        self.abbreviations = {
            "IPC": "Indian Penal Code",
            "BNS": "Bharatiya Nyaya Sanhita",
            "CrPC": "Criminal Procedure Code",
            "BNSS": "Bharatiya Nagarik Suraksha Sanhita",
            "SC": "Supreme Court",
            "HC": "High Court",
            "FIR": "First Information Report",
            "POSH": "Prevention of Sexual Harassment",
            "RTI": "Right to Information",
            "IT Act": "Information Technology Act"
        }
    
    def _build_prompt(self, user_query: str, language: str) -> str:
        """
        Build prompt for query understanding model
        
        Args:
            user_query: Raw user query
            language: Detected or specified language
            
        Returns:
            Formatted prompt
        """
        prompt = f"""You are a Legal Query Analyzer for Indian law (IPC, BNS, Supreme Court judgments).

TASK:
Analyze the user's query and extract structured information.

OUTPUT REQUIREMENTS (JSON format):
{{
  "intent_type": "statute_lookup" | "case_law" | "comparison" | "summarization" | "general",
  "optimized_query": "cleaned query in legal English with expanded abbreviations",
  "legal_entities": ["list", "of", "extracted", "entities"],
  "confidence": 0.0 to 1.0,
  "original_language": "en" | "hi" | "hinglish"
}}

INTENT TYPES:
- statute_lookup: User asks about specific law sections, penalties, provisions
- case_law: User asks about court judgments, precedents
- comparison: User compares IPC vs BNS, or multiple sections
- summarization: User asks to explain/elaborate on a topic
- general: Greetings, meta questions about the system

RULES:
1. Expand abbreviations: "IPC" → "Indian Penal Code", "BNS" → "Bharatiya Nyaya Sanhita"
2. Normalize Hinglish: "murder ka saza" → "punishment for murder"
3. Extract entities: section numbers, act names, legal terms
4. Optimize for vector search: remove filler words, keep legal keywords
5. DO NOT generate answers to the query
6. DO NOT make assumptions about legal facts

USER QUERY:
{user_query}

USER LANGUAGE:
{language}

OUTPUT (JSON only, no explanation):"""
        
        return prompt
    
    async def understand_query(
        self,
        user_query: str,
        language: str = "en"
    ) -> Optional[QueryIntent]:
        """
        Analyze user query and extract intent
        
        Args:
            user_query: Raw user query
            language: Language hint ("en" | "hi")
            
        Returns:
            QueryIntent object or None on failure
        """
        if not user_query or not user_query.strip():
            return None
        
        try:
            # Get Ollama client
            client = await get_ollama_client()
            
            # Build prompt
            prompt = self._build_prompt(user_query, language)
            
            # Call model
            print(f"[QueryUnderstanding] Analyzing query: {user_query[:50]}...")
            result = await client.call_model_json(
                model_role=self.model_role,
                prompt=prompt,
                max_tokens=500
            )
            
            if not result:
                print("[QueryUnderstanding] Failed to get JSON response")
                return self._fallback_understanding(user_query, language)
            
            # Parse result
            intent = QueryIntent(
                intent_type=result.get("intent_type", "general"),
                optimized_query=result.get("optimized_query", user_query),
                legal_entities=result.get("legal_entities", []),
                confidence=float(result.get("confidence", 0.5)),
                original_language=result.get("original_language", language)
            )
            
            print(f"[QueryUnderstanding] Intent: {intent.intent_type}, Confidence: {intent.confidence:.2f}")
            print(f"[QueryUnderstanding] Optimized: {intent.optimized_query[:80]}...")
            
            return intent
            
        except Exception as e:
            print(f"[QueryUnderstanding] Error: {e}")
            return self._fallback_understanding(user_query, language)
    
    def _fallback_understanding(self, user_query: str, language: str) -> QueryIntent:
        """
        Fallback rule-based query understanding if model fails
        
        Args:
            user_query: Raw user query
            language: Language hint
            
        Returns:
            QueryIntent with basic analysis
        """
        print("[QueryUnderstanding] Using fallback rule-based understanding")
        
        query_lower = user_query.lower()
        
        # Detect intent
        intent_type = "general"
        if any(word in query_lower for word in ["section", "punishment", "penalty", "offense", "crime"]):
            intent_type = "statute_lookup"
        elif any(word in query_lower for word in ["case", "judgment", "court", "precedent"]):
            intent_type = "case_law"
        elif any(word in query_lower for word in ["compare", "difference", "vs", "versus"]):
            intent_type = "comparison"
        elif any(word in query_lower for word in ["explain", "elaborate", "detail", "what is"]):
            intent_type = "summarization"
        
        # Extract entities
        entities = []
        
        # Section numbers
        section_matches = re.findall(r'section\s+(\d+[A-Z]?)', query_lower)
        entities.extend([f"Section {s}" for s in section_matches])
        
        # Act names
        for abbr in self.abbreviations.keys():
            if abbr.lower() in query_lower:
                entities.append(abbr)
        
        # Expand abbreviations in query
        optimized = user_query
        for abbr, full in self.abbreviations.items():
            optimized = re.sub(
                r'\b' + re.escape(abbr) + r'\b',
                full,
                optimized,
                flags=re.IGNORECASE
            )
        
        return QueryIntent(
            intent_type=intent_type,
            optimized_query=optimized,
            legal_entities=list(set(entities)),
            confidence=0.6,  # Lower confidence for fallback
            original_language=language
        )
