"""
Grounded Answer Generation Model (Model 2)

Responsibilities:
- Generate user-facing answers using ONLY retrieved context
- Extract inline citations for every claim
- Format response with section numbers and act names
- NEVER use external knowledge or make assumptions

Uses Llama3 8B via Ollama
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from ollama_client import get_ollama_client


@dataclass
class Citation:
    """Represents a legal citation"""
    source: str  # Act name or case name
    section: Optional[str] = None
    text_snippet: Optional[str] = None
    url: Optional[str] = None


@dataclass
class GroundedAnswer:
    """Structured output from grounded generation"""
    answer_text: str
    citations: List[Citation]
    context_used: List[str]  # Chunk IDs or snippets used
    confidence: float  # 0.0-1.0


class GroundedGenerationModel:
    """
    Model 2: Grounded Answer Generation
    Uses Llama3 8B via Ollama
    """
    
    def __init__(self):
        self.model_role = "generation"
    
    def _build_prompt(
        self,
        context_chunks: List[Dict],
        user_query: str,
        intent_type: str,
        language: str = "en"
    ) -> str:
        """
        Build prompt for grounded generation
        
        Args:
            context_chunks: Retrieved context chunks
            user_query: User's question
            intent_type: Query intent from Model 1
            language: Response language
            
        Returns:
            Formatted prompt
        """
        # Format context
        context_text = ""
        for i, chunk in enumerate(context_chunks, 1):
            source = chunk.get("source", "Unknown")
            section = chunk.get("section", "")
            text = chunk.get("text", chunk.get("content", ""))
            
            context_text += f"\n[CONTEXT {i}]\n"
            context_text += f"Source: {source}\n"
            if section:
                context_text += f"Section: {section}\n"
            context_text += f"Content: {text[:1500]}\n"  # Limit context length
            context_text += "---\n"
        
        # Base system prompt
        system_prompt = """You are LegalAi, an Indian legal research assistant.

CRITICAL RULES:
1. Answer ONLY using the provided CONTEXT below
2. Every legal claim MUST cite a specific source from CONTEXT
3. Use citation format: "According to Section X of [Act Name], ..."
4. If CONTEXT is insufficient, respond EXACTLY: "Insufficient verified legal context available."
5. Do NOT invent section numbers, penalties, or provisions
6. Do NOT use external knowledge or make assumptions
7. Do NOT compare acts unless explicitly mentioned in CONTEXT

STRUCTURE YOUR ANSWER:
1. Direct Answer (1-2 sentences)
2. Relevant Provisions (with exact section references from CONTEXT)
3. Essential Ingredients (if applicable)
4. Punishment/Penalty (only if in CONTEXT)
5. Source Citations

FORMATTING:
- Use Markdown with clear headings & bullets
- Bold section numbers and Act names
- Include inline citations like [Source: BNS Section 103]

DISCLAIMER:
Add at end: "Note: This is AI-generated information for educational purposes only. Not legal advice. Consult a qualified lawyer."
"""
        
        # Add language-specific instructions
        if language == "hi":
            system_prompt += """

LANGUAGE RULE:
- Respond FULLY in Hindi (Devanagari script)
- Section numbers and Act names may remain in English
- Translate legal terms to Hindi where appropriate
"""
        
        # Add intent-specific instructions
        if intent_type == "comparison":
            system_prompt += """

COMPARISON MODE:
- Only compare if BOTH items are present in CONTEXT
- Highlight key differences clearly
- Cite sources for each side of comparison
"""
        elif intent_type == "summarization":
            system_prompt += """

SUMMARIZATION MODE:
- Provide detailed explanation with context
- Break down complex legal concepts
- Use examples from CONTEXT if available
"""
        
        # Build full prompt
        prompt = f"""{system_prompt}

CONTEXT:
{context_text}

USER QUERY:
{user_query}

ANSWER (with inline citations):"""
        
        return prompt
    
    async def generate_answer(
        self,
        context_chunks: List[Dict],
        user_query: str,
        intent_type: str = "general",
        language: str = "en"
    ) -> Optional[GroundedAnswer]:
        """
        Generate grounded answer from context
        
        Args:
            context_chunks: Retrieved context chunks with metadata
            user_query: User's question
            intent_type: Query intent from Model 1
            language: Response language ("en" | "hi")
            
        Returns:
            GroundedAnswer object or None on failure
        """
        if not context_chunks:
            return GroundedAnswer(
                answer_text="Insufficient verified legal context available.",
                citations=[],
                context_used=[],
                confidence=0.0
            )
        
        try:
            # Get Ollama client
            client = await get_ollama_client()
            
            # Build prompt
            prompt = self._build_prompt(context_chunks, user_query, intent_type, language)
            
            # Determine max tokens based on intent
            max_tokens = 2000
            if intent_type == "summarization":
                max_tokens = 2500
            elif intent_type == "comparison":
                max_tokens = 2200
            
            # Call model
            print(f"[GroundedGeneration] Generating answer for: {user_query[:50]}...")
            answer_text = await client.call_model(
                model_role=self.model_role,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=0.3
            )
            
            if not answer_text:
                print("[GroundedGeneration] Failed to generate answer")
                return None
            
            # Extract citations from answer
            citations = self._extract_citations(answer_text, context_chunks)
            
            # Track which context was used
            context_used = [
                f"{chunk.get('source', 'Unknown')} - {chunk.get('section', 'N/A')}"
                for chunk in context_chunks
            ]
            
            # Estimate confidence based on citation count
            citation_count = len(citations)
            confidence = min(0.9, 0.5 + (citation_count * 0.1))
            
            print(f"[GroundedGeneration] Generated {len(answer_text)} chars with {citation_count} citations")
            
            return GroundedAnswer(
                answer_text=answer_text,
                citations=citations,
                context_used=context_used,
                confidence=confidence
            )
            
        except Exception as e:
            print(f"[GroundedGeneration] Error: {e}")
            return None
    
    def _extract_citations(self, answer_text: str, context_chunks: List[Dict]) -> List[Citation]:
        """
        Extract citations from generated answer
        
        Args:
            answer_text: Generated answer
            context_chunks: Original context chunks
            
        Returns:
            List of Citation objects
        """
        import re
        
        citations = []
        seen = set()
        
        # Pattern 1: "Section X of [Act Name]"
        pattern1 = r'Section\s+(\d+[A-Z]?)\s+of\s+([^,.\n]+)'
        for match in re.finditer(pattern1, answer_text, re.IGNORECASE):
            section = match.group(1)
            act = match.group(2).strip()
            key = f"{act}:{section}"
            
            if key not in seen:
                citations.append(Citation(
                    source=act,
                    section=f"Section {section}"
                ))
                seen.add(key)
        
        # Pattern 2: "[Source: ...]" format
        pattern2 = r'\[Source:\s*([^\]]+)\]'
        for match in re.finditer(pattern2, answer_text):
            source_text = match.group(1).strip()
            if source_text not in seen:
                citations.append(Citation(source=source_text))
                seen.add(source_text)
        
        # Add citations from context metadata
        for chunk in context_chunks:
            source = chunk.get("source", "")
            section = chunk.get("section", "")
            
            if source:
                key = f"{source}:{section}" if section else source
                if key not in seen:
                    citations.append(Citation(
                        source=source,
                        section=f"Section {section}" if section else None,
                        text_snippet=chunk.get("text", "")[:200]
                    ))
                    seen.add(key)
        
        return citations[:5]  # Limit to top 5 citations
