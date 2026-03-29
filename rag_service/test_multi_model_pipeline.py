"""
Test Multi-Model RAG Pipeline

Run this to verify the complete 3-model pipeline works correctly
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ollama_client import get_ollama_client, shutdown_ollama_client
from query_understanding_model import QueryUnderstandingModel
from grounded_generation_model import GroundedGenerationModel
from verification_model import VerificationModel


async def test_ollama_connection():
    """Test 1: Ollama connectivity"""
    print("\n" + "="*60)
    print("TEST 1: Ollama Connection")
    print("="*60)
    
    try:
        client = await get_ollama_client()
        print("✅ Ollama client initialized")
        print(f"✅ Models configured: {client.get_model_info()}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


async def test_query_understanding():
    """Test 2: Query Understanding Model"""
    print("\n" + "="*60)
    print("TEST 2: Query Understanding Model")
    print("="*60)
    
    model = QueryUnderstandingModel()
    
    test_queries = [
        ("What is the punishment for murder under BNS?", "en"),
        ("IPC 302 vs BNS 103", "en"),
        ("चोरी की सजा क्या है?", "hi"),
    ]
    
    for query, lang in test_queries:
        print(f"\nQuery: {query}")
        try:
            intent = await model.understand_query(query, lang)
            if intent:
                print(f"  ✅ Intent: {intent.intent_type}")
                print(f"  ✅ Optimized: {intent.optimized_query[:60]}...")
                print(f"  ✅ Entities: {intent.legal_entities}")
                print(f"  ✅ Confidence: {intent.confidence:.2f}")
            else:
                print(f"  ❌ No intent returned")
                return False
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return False
    
    return True


async def test_grounded_generation():
    """Test 3: Grounded Generation Model"""
    print("\n" + "="*60)
    print("TEST 3: Grounded Generation Model")
    print("="*60)
    
    model = GroundedGenerationModel()
    
    # Mock context chunks
    context = [
        {
            "text": "Section 103 of Bharatiya Nyaya Sanhita: Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "103",
            "type": "statute"
        }
    ]
    
    query = "What is the punishment for murder under BNS?"
    
    try:
        answer = await model.generate_answer(
            context_chunks=context,
            user_query=query,
            intent_type="statute_lookup",
            language="en"
        )
        
        if answer:
            print(f"✅ Generated answer ({len(answer.answer_text)} chars)")
            print(f"✅ Citations: {len(answer.citations)}")
            print(f"✅ Confidence: {answer.confidence:.2f}")
            print(f"\nAnswer preview:\n{answer.answer_text[:200]}...")
            return True
        else:
            print("❌ No answer generated")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_verification():
    """Test 4: Verification Model"""
    print("\n" + "="*60)
    print("TEST 4: Verification Model")
    print("="*60)
    
    model = VerificationModel()
    
    # Test case 1: Valid answer
    context = [
        {
            "text": "Section 103 of BNS: Punishment for murder is death or life imprisonment.",
            "source": "BNS",
            "section": "103"
        }
    ]
    
    valid_answer = "According to Section 103 of Bharatiya Nyaya Sanhita, the punishment for murder is death or life imprisonment."
    
    print("\nTest 4a: Valid Answer")
    try:
        result = await model.verify_answer(valid_answer, context)
        if result:
            print(f"  Status: {result.status}")
            print(f"  Confidence: {result.confidence:.2f}")
            if result.status == "APPROVED":
                print("  ✅ Correctly approved valid answer")
            else:
                print(f"  ❌ Should have approved: {result.unsupported_claims}")
                return False
        else:
            print("  ❌ No verification result")
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False
    
    # Test case 2: Hallucinated answer
    hallucinated_answer = "According to Section 999 of IPC, the punishment for murder is 100 years imprisonment."
    
    print("\nTest 4b: Hallucinated Answer")
    try:
        result = await model.verify_answer(hallucinated_answer, context)
        if result:
            print(f"  Status: {result.status}")
            print(f"  Unsupported claims: {len(result.unsupported_claims)}")
            if result.status == "REJECTED" or len(result.unsupported_claims) > 0:
                print("  ✅ Correctly detected hallucination")
            else:
                print("  ⚠️  Warning: Should have detected hallucination")
        else:
            print("  ❌ No verification result")
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False
    
    return True


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("MULTI-MODEL RAG PIPELINE TEST SUITE")
    print("="*60)
    
    tests = [
        ("Ollama Connection", test_ollama_connection),
        ("Query Understanding", test_query_understanding),
        ("Grounded Generation", test_grounded_generation),
        ("Verification", test_verification),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            import traceback
            traceback.print_exc()
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
    
    # Cleanup
    await shutdown_ollama_client()
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
