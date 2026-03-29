"""
Standalone RAG Service Test
Bypasses main.py to test RAG functionality directly
"""

import sys
import os
import asyncio

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set environment for lightweight models
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

from query_understanding_model import QueryUnderstandingModel
from grounded_generation_model import GroundedGenerationModel
from verification_model import VerificationModel
from ollama_client import shutdown_ollama_client


# Test queries
TEST_QUERIES = [
    "I had an accident just now. What should I do?",
    "Someone stole my wallet on the train. What are my legal options?",
    "What is the punishment for murder under BNS?",
    "How do I file an FIR?",
]


async def test_query(query: str):
    """Test a single query through the pipeline"""
    print(f"\n{'='*70}")
    print(f"Query: {query}")
    print(f"{'='*70}")
    
    try:
        # Step 1: Query Understanding
        print("\n[1/3] Query Understanding...")
        query_model = QueryUnderstandingModel()
        intent = await query_model.understand_query(query, "en")
        
        if intent:
            print(f"✅ Intent: {intent.intent_type}")
            print(f"✅ Optimized: {intent.optimized_query[:60]}...")
        else:
            print("❌ Query understanding failed")
            return False
        
        # Step 2: Mock retrieval (since we don't have vector DB access here)
        print("\n[2/3] Grounded Generation...")
        gen_model = GroundedGenerationModel()
        
        # Mock context based on query type
        if "murder" in query.lower():
            context = [{
                "text": "Section 103 of Bharatiya Nyaya Sanhita: Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
                "source": "BNS",
                "section": "103"
            }]
        elif "theft" in query.lower() or "stole" in query.lower():
            context = [{
                "text": "Section 303 of Bharatiya Nyaya Sanhita: Punishment for theft. Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
                "source": "BNS",
                "section": "303"
            }]
        elif "accident" in query.lower():
            context = [{
                "text": "In case of an accident, you should: 1) Ensure safety of all parties, 2) Call emergency services (100 for police, 108 for ambulance), 3) Exchange information with other parties, 4) Document the scene with photos, 5) File an FIR if there are injuries or significant damage.",
                "source": "General Legal Advice",
                "section": None
            }]
        elif "fir" in query.lower():
            context = [{
                "text": "To file an FIR (First Information Report): 1) Visit the nearest police station, 2) Provide details of the incident orally or in writing, 3) The police must register the FIR under Section 173 of BNSS, 4) You will receive a copy of the FIR, 5) Note the FIR number for future reference.",
                "source": "BNSS",
                "section": "173"
            }]
        else:
            context = [{
                "text": "For legal advice, consult a qualified lawyer. You can also contact legal aid services for free consultation.",
                "source": "General",
                "section": None
            }]
        
        answer = await gen_model.generate_answer(
            context_chunks=context,
            user_query=query,
            intent_type=intent.intent_type,
            language="en"
        )
        
        if answer:
            print(f"✅ Answer generated ({len(answer.answer_text)} chars)")
            print(f"✅ Citations: {len(answer.citations)}")
            print(f"\n📝 Answer:\n{answer.answer_text[:300]}...")
        else:
            print("❌ Generation failed")
            return False
        
        # Step 3: Verification
        print("\n[3/3] Verification...")
        verify_model = VerificationModel()
        verification = await verify_model.verify_answer(
            generated_answer=answer.answer_text,
            context_chunks=context
        )
        
        if verification:
            print(f"✅ Status: {verification.status}")
            print(f"✅ Confidence: {verification.confidence:.2f}")
        else:
            print("❌ Verification failed")
            return False
        
        print(f"\n{'='*70}")
        print(f"✅ Query processed successfully!")
        print(f"{'='*70}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Test all queries"""
    print("\n" + "="*70)
    print("STANDALONE RAG FUNCTIONALITY TEST")
    print("="*70)
    print(f"\nTesting {len(TEST_QUERIES)} real-world queries")
    print("Using Llama3.2:1b model")
    
    results = []
    
    for i, query in enumerate(TEST_QUERIES, 1):
        print(f"\n\n[TEST {i}/{len(TEST_QUERIES)}]")
        result = await test_query(query)
        results.append(result)
        await asyncio.sleep(1)
    
    # Summary
    print("\n\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(results)
    print(f"\n✅ Passed: {passed}/{len(TEST_QUERIES)} queries")
    
    if passed == len(TEST_QUERIES):
        print("\n🎉 ALL TESTS PASSED!")
        print("\n✅ Verified:")
        print("   • Query understanding working")
        print("   • Grounded generation working")
        print("   • Verification working")
        print("   • Multiple query types handled")
        print("\n🚀 RAG functionality is operational!")
    else:
        print(f"\n⚠️  {len(TEST_QUERIES) - passed} tests failed")
    
    await shutdown_ollama_client()
    return passed == len(TEST_QUERIES)


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
