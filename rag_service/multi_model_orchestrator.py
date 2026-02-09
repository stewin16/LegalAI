"""
Multi-Model RAG Pipeline Orchestrator

Coordinates the 3-model pipeline with strict flow control:
1. Query Understanding (Model 1)
2. Vector Retrieval + Confidence Check
3. Grounded Generation (Model 2)
4. Verification (Model 3)
5. Return approved answer or refusal

Enforces RAG compliance and hallucination prevention
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import time

from query_understanding_model import QueryUnderstandingModel, QueryIntent
from grounded_generation_model import GroundedGenerationModel, GroundedAnswer
from verification_model import VerificationModel, VerificationResult


@dataclass
class QueryResponse:
    """Final response to user query"""
    answer: str
    verification_status: str  # "APPROVED" | "REJECTED" | "REFUSED"
    confidence_score: float
    citations: List[Dict]
    unsupported_claims: List[str]
    intent_type: str
    processing_time: float
    context_used: List[str]


class MultiModelOrchestrator:
    """
    Orchestrates the 3-model RAG pipeline with strict flow control
    """
    
    def __init__(self, retrieval_engine):
        """
        Initialize orchestrator
        
        Args:
            retrieval_engine: Instance of RAGEngine for vector retrieval
        """
        self.retrieval_engine = retrieval_engine
        
        # Initialize models
        self.query_model = QueryUnderstandingModel()
        self.generation_model = GroundedGenerationModel()
        self.verification_model = VerificationModel()
        
        # Configuration
        self.min_retrieval_confidence = 0.6
        self.max_context_chunks = 3
        
        print("[Orchestrator] Multi-Model RAG Pipeline initialized")
    
    async def process_query(
        self,
        query: str,
        language: str = "en",
        session_id: Optional[str] = None
    ) -> QueryResponse:
        """
        Process user query through full 3-model pipeline
        
        Args:
            query: User's question
            language: Response language ("en" | "hi")
            session_id: Optional session ID for conversation memory
            
        Returns:
            QueryResponse with answer or refusal
        """
        start_time = time.time()
        
        print(f"\n{'='*60}")
        print(f"[Orchestrator] Processing query: {query[:80]}...")
        print(f"{'='*60}\n")
        
        try:
            # ============================================================
            # STEP 1: Query Understanding (Model 1)
            # ============================================================
            print("[Orchestrator] STEP 1: Query Understanding")
            intent = await self.query_model.understand_query(query, language)
            
            if not intent:
                return self._create_error_response(
                    "Failed to understand query",
                    time.time() - start_time
                )
            
            print(f"[Orchestrator] ✓ Intent: {intent.intent_type}, Confidence: {intent.confidence:.2f}")
            
            # ============================================================
            # STEP 2: Vector Retrieval
            # ============================================================
            print("[Orchestrator] STEP 2: Vector Retrieval")
            
            # Use optimized query from Model 1
            retrieval_query = intent.optimized_query
            
            # Perform vector search
            context_chunks, retrieval_confidence = await self._retrieve_context(
                retrieval_query,
                intent.intent_type
            )
            
            print(f"[Orchestrator] ✓ Retrieved {len(context_chunks)} chunks, Confidence: {retrieval_confidence:.2f}")
            
            # ============================================================
            # STEP 3: Confidence Gate
            # ============================================================
            print("[Orchestrator] STEP 3: Confidence Check")
            
            if retrieval_confidence < self.min_retrieval_confidence:
                print(f"[Orchestrator] ✗ Confidence too low ({retrieval_confidence:.2f} < {self.min_retrieval_confidence})")
                return self._create_refusal_response(
                    "Insufficient authoritative legal sources to answer this query.",
                    intent.intent_type,
                    retrieval_confidence,
                    time.time() - start_time
                )
            
            print(f"[Orchestrator] ✓ Confidence acceptable ({retrieval_confidence:.2f})")
            
            # ============================================================
            # STEP 4: Grounded Generation (Model 2)
            # ============================================================
            print("[Orchestrator] STEP 4: Grounded Generation")
            
            grounded_answer = await self.generation_model.generate_answer(
                context_chunks=context_chunks,
                user_query=query,
                intent_type=intent.intent_type,
                language=language
            )
            
            if not grounded_answer:
                return self._create_error_response(
                    "Failed to generate answer",
                    time.time() - start_time
                )
            
            print(f"[Orchestrator] ✓ Generated answer ({len(grounded_answer.answer_text)} chars)")
            
            # ============================================================
            # STEP 5: Verification (Model 3)
            # ============================================================
            print("[Orchestrator] STEP 5: Verification")
            
            verification = await self.verification_model.verify_answer(
                generated_answer=grounded_answer.answer_text,
                context_chunks=context_chunks
            )
            
            if not verification:
                return self._create_error_response(
                    "Verification failed",
                    time.time() - start_time
                )
            
            print(f"[Orchestrator] ✓ Verification: {verification.status}, Confidence: {verification.confidence:.2f}")
            
            # ============================================================
            # STEP 6: Final Decision
            # ============================================================
            print("[Orchestrator] STEP 6: Final Decision")
            
            processing_time = time.time() - start_time
            
            if verification.status == "REJECTED":
                print(f"[Orchestrator] ✗ Answer REJECTED due to unsupported claims")
                return self._create_rejection_response(
                    verification.unsupported_claims,
                    intent.intent_type,
                    processing_time
                )
            
            # Success!
            print(f"[Orchestrator] ✓ Answer APPROVED")
            print(f"[Orchestrator] Total processing time: {processing_time:.2f}s\n")
            
            return QueryResponse(
                answer=grounded_answer.answer_text,
                verification_status="APPROVED",
                confidence_score=min(retrieval_confidence, verification.confidence),
                citations=[asdict(c) for c in grounded_answer.citations],
                unsupported_claims=[],
                intent_type=intent.intent_type,
                processing_time=processing_time,
                context_used=grounded_answer.context_used
            )
            
        except Exception as e:
            print(f"[Orchestrator] ✗ Pipeline error: {e}")
            import traceback
            traceback.print_exc()
            return self._create_error_response(str(e), time.time() - start_time)
    
    async def _retrieve_context(
        self,
        query: str,
        intent_type: str
    ) -> tuple[List[Dict], float]:
        """
        Retrieve context from vector database with confidence scoring
        
        Args:
            query: Optimized search query
            intent_type: Query intent
            
        Returns:
            Tuple of (context_chunks, confidence_score)
        """
        try:
            # Use existing RAG engine's collection
            if not self.retrieval_engine.collection:
                return [], 0.0
            
            # Adjust n_results based on intent
            n_results = self.max_context_chunks
            if intent_type == "comparison":
                n_results = 5  # Need more context for comparisons
            elif intent_type == "summarization":
                n_results = 4
            
            # Perform vector search
            results = self.retrieval_engine.collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            if not results or not results['documents'] or not results['documents'][0]:
                return [], 0.0
            
            docs = results['documents'][0]
            metas = results['metadatas'][0]
            dists = results['distances'][0]
            
            # Calculate confidence score
            if not dists:
                confidence = 0.0
            else:
                min_dist = min(dists)
                max_dist = max(dists)
                avg_dist = sum(dists) / len(dists)
                
                # Confidence = 1 - normalized_distance
                # Lower distance = higher confidence
                if max_dist > 0:
                    confidence = 1.0 - (avg_dist / max_dist)
                else:
                    confidence = 1.0
                
                # Apply stricter threshold
                if min_dist > 0.4:  # Absolute distance threshold
                    confidence *= 0.5
            
            # Build context chunks
            chunks = []
            for i, doc in enumerate(docs):
                meta = metas[i]
                dist = dists[i]
                
                # Skip low-quality results
                if dist > 0.5:
                    continue
                
                chunk = {
                    "text": doc,
                    "content": doc,
                    "source": meta.get("source", "Unknown"),
                    "section": meta.get("section") or meta.get("bns_section") or meta.get("ipc_section"),
                    "type": meta.get("type", "general"),
                    "distance": dist,
                    "metadata": meta
                }
                chunks.append(chunk)
            
            # Rank chunks by authority and recency
            chunks = self._rank_chunks(chunks)
            
            # Limit to max chunks
            chunks = chunks[:self.max_context_chunks]
            
            return chunks, confidence
            
        except Exception as e:
            print(f"[Orchestrator] Retrieval error: {e}")
            return [], 0.0
    
    def _rank_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """
        Rank chunks by authority and recency
        
        Args:
            chunks: List of context chunks
            
        Returns:
            Ranked chunks
        """
        def rank_score(chunk):
            score = 0.0
            
            # Distance (lower is better)
            score -= chunk.get("distance", 1.0) * 10
            
            # Source authority
            source = chunk.get("source", "").lower()
            if "supreme court" in source:
                score += 5
            elif "high court" in source:
                score += 3
            elif "bns" in source or "bharatiya nyaya sanhita" in source:
                score += 4  # Prefer BNS over IPC (more recent)
            elif "ipc" in source:
                score += 2
            
            # Type priority
            chunk_type = chunk.get("type", "")
            if chunk_type == "statute":
                score += 3
            elif chunk_type == "judgment":
                score += 2
            
            return score
        
        return sorted(chunks, key=rank_score, reverse=True)
    
    def _create_refusal_response(
        self,
        message: str,
        intent_type: str,
        confidence: float,
        processing_time: float
    ) -> QueryResponse:
        """Create refusal response for low confidence"""
        return QueryResponse(
            answer=message,
            verification_status="REFUSED",
            confidence_score=confidence,
            citations=[],
            unsupported_claims=[],
            intent_type=intent_type,
            processing_time=processing_time,
            context_used=[]
        )
    
    def _create_rejection_response(
        self,
        unsupported_claims: List[str],
        intent_type: str,
        processing_time: float
    ) -> QueryResponse:
        """Create rejection response for failed verification"""
        message = "The generated answer contained unsupported claims and was rejected for accuracy. "
        message += "Please rephrase your question or try a different query."
        
        return QueryResponse(
            answer=message,
            verification_status="REJECTED",
            confidence_score=0.0,
            citations=[],
            unsupported_claims=unsupported_claims,
            intent_type=intent_type,
            processing_time=processing_time,
            context_used=[]
        )
    
    def _create_error_response(
        self,
        error_message: str,
        processing_time: float
    ) -> QueryResponse:
        """Create error response"""
        return QueryResponse(
            answer=f"An error occurred while processing your query: {error_message}",
            verification_status="ERROR",
            confidence_score=0.0,
            citations=[],
            unsupported_claims=[],
            intent_type="error",
            processing_time=processing_time,
            context_used=[]
        )
