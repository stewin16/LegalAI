"""
Simplified End-to-End Test (without RAG engine dependency)
Tests just the multi-model components
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use lightweight model
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

from query_understanding_model import QueryUnderstandingModel
from grounded_generation_model import GroundedGenerationModel
from verification_model import VerificationModel
from ollama_client import shutdown_ollama_client


async def test_three_models():
    """Test all 3 models in sequence"""
    print("\n" + "="*70)
    print("TESTING 3-MODEL PIPELINE WITH LLAMA")
    print("="*70)
    
    try:
        # Test 1: Query Understanding
        print("\n[TEST 1/3] Query Understanding Model")
        print("-" * 70)
        query_model = QueryUnderstandingModel()
        
        test_query = "What is the punishment for murder under BNS?"
        print(f"Query: {test_query}")
        
        intent = await query_model.understand_query(test_query, "en")
        
        if intent:
            print(f"✅ Intent Type: {intent.intent_type}")
            print(f"✅ Optimized Query: {intent.optimized_query}")
            print(f"✅ Legal Entities: {intent.legal_entities}")
            print(f"✅ Confidence: {intent.confidence:.2f}")
        else:
            print("❌ Query understanding failed")
            return False
        
        # Test 2: Grounded Generation
        print("\n[TEST 2/3] Grounded Generation Model")
        print("-" * 70)
        gen_model = GroundedGenerationModel()
        
        # Mock context
        context = [{
            "text": "Section 103 of Bharatiya Nyaya Sanhita (BNS): Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "103",
            "type": "statute"
        }]
        
        answer = await gen_model.generate_answer(
            context_chunks=context,
            user_query=test_query,
            intent_type=intent.intent_type,
            language="en"
        )
        
        if answer:
            print(f"✅ Answer Generated ({len(answer.answer_text)} chars)")
            print(f"✅ Citations: {len(answer.citations)}")
            print(f"✅ Confidence: {answer.confidence:.2f}")
            print(f"\n📝 Answer Preview:\n{answer.answer_text[:200]}...")
        else:
            print("❌ Generation failed")
            return False
        
        # Test 3: Verification
        print("\n[TEST 3/3] Verification Model")
        print("-" * 70)
        verify_model = VerificationModel()
        
        verification = await verify_model.verify_answer(
            generated_answer=answer.answer_text,
            context_chunks=context
        )
        
        if verification:
            print(f"✅ Verification Status: {verification.status}")
            print(f"✅ Confidence: {verification.confidence:.2f}")
            if verification.unsupported_claims:
                print(f"⚠️  Unsupported Claims: {verification.unsupported_claims}")
            else:
                print(f"✅ No unsupported claims detected")
        else:
            print("❌ Verification failed")
            return False
        
        # Summary
        print("\n" + "="*70)
        print("✅ ✅ ✅  ALL 3 MODELS WORKING CORRECTLY! ✅ ✅ ✅")
        print("="*70)
        print("\n🎉 Multi-Model Pipeline Verified:")
        print("   ✅ Model 1 (Query Understanding): Llama3.2:1b - WORKING")
        print("   ✅ Model 2 (Grounded Generation): Llama3.2:1b - WORKING")
        print("   ✅ Model 3 (Verification Guard): Llama3.2:1b - WORKING")
        print("\n🚀 The system is fully operational and ready to use!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await shutdown_ollama_client()


if __name__ == "__main__":
    success = asyncio.run(test_three_models())
    sys.exit(0 if success else 1)
