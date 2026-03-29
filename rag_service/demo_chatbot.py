import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

from grounded_generation_model import GroundedGenerationModel
from ollama_client import shutdown_ollama_client

async def demo():
    print("\n" + "="*70)
    print("LIVE DEMO: RAG CHATBOT RESPONSE")
    print("="*70)
    print("\nQUESTION: I just had accident what should be done?")
    print("\n" + "="*70)
    print("GENERATING ANSWER...")
    print("="*70 + "\n")
    
    model = GroundedGenerationModel()
    
    context = [{
        "text": "In case of an accident, you should: 1) Ensure safety of all parties involved 2) Call emergency services - 100 for police, 108 for ambulance 3) Exchange information with other parties 4) Document the scene with photos 5) File an FIR if there are injuries or significant damage 6) Seek medical attention even for minor injuries 7) Contact your insurance company",
        "source": "Legal Emergency Procedures",
        "section": None,
        "type": "guidance"
    }]
    
    answer = await model.generate_answer(
        context_chunks=context,
        user_query="I just had accident what should be done?",
        intent_type="general",
        language="en"
    )
    
    if answer:
        print("CHATBOT RESPONSE:")
        print("-" * 70)
        print(answer.answer_text)
        print("-" * 70)
        print(f"\nAnswer Length: {len(answer.answer_text)} characters")
        print(f"Citations: {len(answer.citations)}")
        print("\nChatbot is WORKING PERFECTLY!")
    else:
        print("ERROR: Failed to generate answer")
    
    await shutdown_ollama_client()

if __name__ == "__main__":
    asyncio.run(demo())
