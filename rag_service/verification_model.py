"""
Verification & Hallucination Guard Model (Model 3)

Responsibilities:
- Verify every sentence in generated answer is supported by context
- Detect invented section numbers, penalties, or legal provisions
- Flag speculative language without context support
- Return APPROVED or REJECTED with specific unsupported claims

Uses Phi3 Mini via Ollama
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from ollama_client import get_ollama_client


@dataclass
class VerificationResult:
    """Structured output from verification model"""
    status: str  # "APPROVED" | "REJECTED"
    unsupported_claims: List[str]
    confidence: float  # 0.0-1.0
    reasoning: Optional[str] = None


class VerificationModel:
    """
    Model 3: Verification & Hallucination Guard
    Uses Phi3 Mini via Ollama
    """
    
    def __init__(self):
        self.model_role = "verification"
        
        # Speculative language patterns to flag
        self.speculative_patterns = [
            "might", "could", "possibly", "perhaps", "maybe",
            "likely", "probably", "seems", "appears", "suggests"
        ]
    
    def _build_prompt(
        self,
        generated_answer: str,
        context_chunks: List[Dict]
    ) -> str:
        """
        Build prompt for verification model
        
        Args:
            generated_answer: Answer to verify
            context_chunks: Original context chunks
            
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
            context_text += f"Content: {text[:1200]}\n"
            context_text += "---\n"
        
        prompt = f"""You are a Legal Fact Checker. Your task is to verify that the ANSWER is FULLY SUPPORTED by the CONTEXT.

VERIFICATION RULES:
1. Section numbers must EXACTLY match those in CONTEXT
2. Penalties/punishments must be VERBATIM from CONTEXT
3. Legal interpretations must have explicit support in CONTEXT
4. Reject speculative language ("might", "could", "possibly") unless supported by CONTEXT
5. Reject any claim that adds information not present in CONTEXT
6. Approve only if ALL claims are traceable to CONTEXT

TASK:
For each claim in the ANSWER, check if it is FULLY SUPPORTED by CONTEXT.

CONTEXT:
{context_text}

ANSWER TO VERIFY:
{generated_answer}

OUTPUT FORMAT (JSON only):
{{
  "status": "APPROVED" or "REJECTED",
  "unsupported_claims": ["claim 1", "claim 2"],
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}}

EXAMPLES:
- If answer says "Section 302" but context has "Section 103" → REJECTED
- If answer says "7 years" but context says "5 years" → REJECTED
- If answer adds facts not in context → REJECTED
- If all claims match context exactly → APPROVED

OUTPUT (JSON only):"""
        
        return prompt
    
    async def verify_answer(
        self,
        generated_answer: str,
        context_chunks: List[Dict]
    ) -> Optional[VerificationResult]:
        """
        Verify generated answer against context
        
        Args:
            generated_answer: Answer from Model 2
            context_chunks: Original context chunks
            
        Returns:
            VerificationResult object or None on failure
        """
        if not generated_answer or not context_chunks:
            return VerificationResult(
                status="REJECTED",
                unsupported_claims=["No answer or context provided"],
                confidence=1.0,
                reasoning="Missing input"
            )
        
        # Quick check for refusal message
        if "insufficient" in generated_answer.lower() and "context" in generated_answer.lower():
            return VerificationResult(
                status="APPROVED",
                unsupported_claims=[],
                confidence=1.0,
                reasoning="Appropriate refusal message"
            )
        
        try:
            # Get Ollama client
            client = await get_ollama_client()
            
            # Build prompt
            prompt = self._build_prompt(generated_answer, context_chunks)
            
            # Call model
            print(f"[Verification] Verifying answer ({len(generated_answer)} chars)...")
            result = await client.call_model_json(
                model_role=self.model_role,
                prompt=prompt,
                max_tokens=1000
            )
            
            if not result:
                print("[Verification] Failed to get JSON response, using fallback")
                return self._fallback_verification(generated_answer, context_chunks)
            
            # Parse result
            status = result.get("status", "REJECTED").upper()
            if status not in ["APPROVED", "REJECTED"]:
                status = "REJECTED"
            
            verification = VerificationResult(
                status=status,
                unsupported_claims=result.get("unsupported_claims", []),
                confidence=float(result.get("confidence", 0.5)),
                reasoning=result.get("reasoning", "")
            )
            
            print(f"[Verification] Status: {verification.status}, Confidence: {verification.confidence:.2f}")
            if verification.unsupported_claims:
                print(f"[Verification] Unsupported claims: {len(verification.unsupported_claims)}")
            
            return verification
            
        except Exception as e:
            print(f"[Verification] Error: {e}")
            return self._fallback_verification(generated_answer, context_chunks)
    
    def _fallback_verification(
        self,
        generated_answer: str,
        context_chunks: List[Dict]
    ) -> VerificationResult:
        """
        Fallback rule-based verification if model fails
        
        Args:
            generated_answer: Answer to verify
            context_chunks: Original context chunks
            
        Returns:
            VerificationResult with basic checks
        """
        print("[Verification] Using fallback rule-based verification")
        
        import re
        
        unsupported_claims = []
        
        # Combine all context text
        context_text = " ".join([
            chunk.get("text", chunk.get("content", ""))
            for chunk in context_chunks
        ]).lower()
        
        # Extract section numbers from answer
        answer_sections = set(re.findall(r'section\s+(\d+[A-Z]?)', generated_answer.lower()))
        
        # Check if sections exist in context
        for section in answer_sections:
            if f"section {section}" not in context_text:
                unsupported_claims.append(f"Section {section} not found in context")
        
        # Check for speculative language
        answer_lower = generated_answer.lower()
        for pattern in self.speculative_patterns:
            if pattern in answer_lower:
                # Check if the speculative word is supported by context
                if pattern not in context_text:
                    unsupported_claims.append(f"Speculative language: '{pattern}' without context support")
        
        # Determine status
        if unsupported_claims:
            status = "REJECTED"
            confidence = 0.7
        else:
            status = "APPROVED"
            confidence = 0.6  # Lower confidence for fallback
        
        return VerificationResult(
            status=status,
            unsupported_claims=unsupported_claims,
            confidence=confidence,
            reasoning="Fallback rule-based verification"
        )
