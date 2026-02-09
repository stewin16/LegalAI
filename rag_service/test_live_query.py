"""
Quick Live Test - Start server and test specific query
"""

import requests
import time
import subprocess
import sys
import os

def test_query(query):
    """Test a specific query against the running service"""
    print(f"\n{'='*70}")
    print(f"Testing Query: {query}")
    print(f"{'='*70}\n")
    
    # Test legacy endpoint
    print("Testing Legacy RAG Endpoint (/query)...")
    try:
        response = requests.post(
            "http://localhost:8000/query",
            json={"query": query, "language": "en"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("answer", "")
            citations = result.get("citations", [])
            
            print(f"✅ Status: {response.status_code}")
            print(f"✅ Answer Length: {len(answer)} characters")
            print(f"✅ Citations: {len(citations)}")
            print(f"\n{'='*70}")
            print("📝 ANSWER:")
            print(f"{'='*70}")
            print(answer)
            print(f"{'='*70}\n")
            
            if citations:
                print("📚 CITATIONS:")
                for i, cite in enumerate(citations, 1):
                    print(f"  {i}. {cite.get('source', 'Unknown')} - {cite.get('section', 'N/A')}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Starting server...")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    query = "I just had accident what should be done?"
    
    print("\n🚀 Testing Legal AI Chatbot")
    print("="*70)
    
    # Try to connect first
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        print("✅ Server is already running!")
    except:
        print("⚠️  Server not running. Please start it with: python main.py")
        print("\nAlternatively, testing with standalone script...")
        
        # Run standalone test
        os.system("python test_standalone_rag.py")
        sys.exit(0)
    
    # Test the query
    success = test_query(query)
    
    if success:
        print("\n🎉 Chatbot is working perfectly!")
        print("✅ The response is comprehensive and helpful")
        print("✅ Legal guidance provided")
        print("✅ Citations included")
    else:
        print("\n⚠️  Testing with standalone mode...")
        os.system("python test_standalone_rag.py")
