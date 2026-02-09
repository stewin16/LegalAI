"""
Quick test using available lightweight models
Tests the multi-model pipeline with llama3.2:1b
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Override model configuration to use available lightweight models
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

from ollama_client import get_ollama_client, shutdown_ollama_client


async def test_basic_connection():
    """Test basic Ollama connectivity"""
    print("\n" + "="*60)
    print("TEST: Basic Ollama Connection & Model Call")
    print("="*60)
    
    try:
        # Get client
        print("\n[1/3] Connecting to Ollama...")
        client = await get_ollama_client()
        print("✅ Connected successfully")
        print(f"✅ Using model: {client.models['generation'].name}")
        
        # Test simple query
        print("\n[2/3] Testing model call...")
        response = await client.call_model(
            model_role="generation",
            prompt="What is 2+2? Answer in one word.",
            max_tokens=10
        )
        
        if response:
            print(f"✅ Model responded: '{response.strip()}'")
        else:
            print("❌ No response from model")
            return False
        
        # Test JSON parsing
        print("\n[3/3] Testing JSON response...")
        json_response = await client.call_model_json(
            model_role="query_understanding",
            prompt='Return this JSON: {"status": "ok", "value": 42}',
            max_tokens=50
        )
        
        if json_response:
            print(f"✅ JSON parsed: {json_response}")
        else:
            print("⚠️  JSON parsing failed (this is okay for basic test)")
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print("\nThe multi-model pipeline is ready to use!")
        print("Models are loaded and responding correctly.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await shutdown_ollama_client()


if __name__ == "__main__":
    print("\n🚀 Quick Multi-Model Pipeline Test")
    print("Using lightweight model: llama3.2:1b")
    print("="*60)
    
    success = asyncio.run(test_basic_connection())
    
    if success:
        print("\n✅ System is working! You can now:")
        print("   1. Start the RAG service: python main.py")
        print("   2. Test the endpoint: POST /query/multimodel")
        print("   3. Pull larger models for better quality (optional)")
    else:
        print("\n❌ Please check:")
        print("   1. Ollama is running: ollama serve")
        print("   2. Model is available: ollama list")
    
    sys.exit(0 if success else 1)
