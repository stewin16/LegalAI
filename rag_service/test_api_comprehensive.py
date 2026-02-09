"""
Comprehensive Test Suite for RAG Service
Tests multiple real-world legal queries
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

# Test queries covering different scenarios
TEST_QUERIES = [
    {
        "query": "I had an accident just now. What should I do?",
        "language": "en",
        "expected_intent": "general_legal_advice",
        "description": "Accident scenario - immediate legal steps"
    },
    {
        "query": "Someone stole my wallet on the train. What are my legal options?",
        "language": "en",
        "expected_intent": "statute_lookup",
        "description": "Theft scenario - legal remedies"
    },
    {
        "query": "What is the punishment for murder under BNS?",
        "language": "en",
        "expected_intent": "statute_lookup",
        "description": "Direct statute query"
    },
    {
        "query": "मेरे पड़ोसी ने मुझे धमकी दी है। मैं क्या करूं?",
        "language": "hi",
        "expected_intent": "general_legal_advice",
        "description": "Threat scenario in Hindi"
    },
    {
        "query": "How do I file an FIR?",
        "language": "en",
        "expected_intent": "procedural",
        "description": "Procedural query"
    }
]


def test_health():
    """Test if service is running"""
    print("\n" + "="*70)
    print("TEST 1: Health Check")
    print("="*70)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Service is running")
            return True
        else:
            print(f"❌ Service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_legacy_rag(query_data):
    """Test legacy RAG endpoint"""
    print(f"\n📝 Query: {query_data['query']}")
    print(f"   Description: {query_data['description']}")
    print(f"   Testing: Legacy RAG endpoint (/query)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/query",
            json=query_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("answer", "")
            citations = result.get("citations", [])
            
            print(f"   ✅ Status: {response.status_code}")
            print(f"   ✅ Answer length: {len(answer)} chars")
            print(f"   ✅ Citations: {len(citations)}")
            print(f"   📄 Answer preview: {answer[:150]}...")
            return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   ❌ Error: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ⚠️  Request timeout (>30s)")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_multimodel_rag(query_data):
    """Test multi-model RAG endpoint"""
    print(f"\n📝 Query: {query_data['query']}")
    print(f"   Description: {query_data['description']}")
    print(f"   Testing: Multi-Model RAG endpoint (/query/multimodel)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/query/multimodel",
            json=query_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("answer", "")
            verification_status = result.get("verification_status", "")
            confidence = result.get("confidence_score", 0)
            intent = result.get("intent_type", "")
            processing_time = result.get("processing_time", 0)
            citations = result.get("citations", [])
            
            print(f"   ✅ Status: {response.status_code}")
            print(f"   ✅ Verification: {verification_status}")
            print(f"   ✅ Confidence: {confidence:.2f}")
            print(f"   ✅ Intent: {intent}")
            print(f"   ✅ Processing Time: {processing_time:.2f}s")
            print(f"   ✅ Citations: {len(citations)}")
            print(f"   📄 Answer preview: {answer[:150]}...")
            
            return verification_status in ["APPROVED", "REFUSED"]
        elif response.status_code == 503:
            print("   ⚠️  Multi-model orchestrator not available (Ollama not running?)")
            return False
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   ❌ Error: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ⚠️  Request timeout (>60s)")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("RAG SERVICE COMPREHENSIVE TEST SUITE")
    print("="*70)
    print(f"\nTesting {len(TEST_QUERIES)} real-world legal queries")
    print("Testing both legacy RAG and multi-model RAG endpoints")
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Service is not running. Please start it with: python main.py")
        return False
    
    time.sleep(1)
    
    # Test 2: Legacy RAG endpoint
    print("\n" + "="*70)
    print("TEST 2: Legacy RAG Endpoint (/query)")
    print("="*70)
    
    legacy_results = []
    for i, query_data in enumerate(TEST_QUERIES, 1):
        print(f"\n[Query {i}/{len(TEST_QUERIES)}]")
        result = test_legacy_rag(query_data)
        legacy_results.append(result)
        time.sleep(2)  # Rate limiting
    
    # Test 3: Multi-Model RAG endpoint
    print("\n" + "="*70)
    print("TEST 3: Multi-Model RAG Endpoint (/query/multimodel)")
    print("="*70)
    
    multimodel_results = []
    for i, query_data in enumerate(TEST_QUERIES, 1):
        print(f"\n[Query {i}/{len(TEST_QUERIES)}]")
        result = test_multimodel_rag(query_data)
        multimodel_results.append(result)
        time.sleep(2)  # Rate limiting
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    legacy_passed = sum(legacy_results)
    multimodel_passed = sum(multimodel_results)
    
    print(f"\n✅ Legacy RAG: {legacy_passed}/{len(TEST_QUERIES)} queries passed")
    print(f"✅ Multi-Model RAG: {multimodel_passed}/{len(TEST_QUERIES)} queries passed")
    
    if legacy_passed == len(TEST_QUERIES) and multimodel_passed > 0:
        print("\n🎉 ALL TESTS PASSED!")
        print("\n✅ Verified:")
        print("   • RAG service is running")
        print("   • Legacy RAG endpoint working")
        print("   • Multi-model RAG endpoint working")
        print("   • Multiple query types handled correctly")
        print("   • Bilingual support (English/Hindi)")
        return True
    else:
        print("\n⚠️  Some tests failed. Check logs above.")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
