"""
Quick working RAG API for hackathon - bypasses pydantic issue
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import asyncio

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

# Import working models
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from grounded_generation_model import GroundedGenerationModel
from query_understanding_model import QueryUnderstandingModel

app = FastAPI(title="LegalAi RAG Service - Hackathon")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
generation_model = GroundedGenerationModel()
query_model = QueryUnderstandingModel()

class QueryRequest(BaseModel):
    query: str
    language: str = "en"
    domain: str = "all"
    arguments_mode: bool = False
    analysis_mode: bool = False
    session_id: str = None

@app.get("/")
def read_root():
    return {"status": "ok", "service": "RAG Service - Hackathon Mode"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "mode": "hackathon"}

@app.post("/query")
async def query_rag(request: QueryRequest):
    try:
        # Fast greetings bypass
        query_lower = request.query.lower().strip()
        if len(query_lower) < 60:
            if any(word in query_lower for word in ['hello', 'hi', 'hey', 'namaste']):
                if request.language == 'hi':
                    return {
                        "answer": "नमस्ते! मैं **LegalAi** हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
                        "citations": []
                    }
                else:
                    return {
                        "answer": "Hello! I'm **LegalAi**, your Indian legal assistant. How can I help you today?",
                        "citations": []
                    }
        
        # Understand query
        print(f"[API] Processing: {request.query[:50]}...")
        intent = await query_model.understand_query(request.query, request.language)
        
        # Mock context based on query
        context = get_mock_context(request.query)
        
        # Generate answer
        answer = await generation_model.generate_answer(
            context_chunks=context,
            user_query=request.query,
            intent_type=intent.intent_type if intent else "general",
            language=request.language
        )
        
        if answer:
            citations = [{"source": c.source, "section": c.section} for c in answer.citations]
            return {
                "answer": answer.answer_text,
                "citations": citations
            }
        else:
            return {
                "answer": "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question.",
                "citations": []
            }
        
    except Exception as e:
        print(f"[API] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def get_mock_context(query: str):
    """Get relevant mock context based on query"""
    query_lower = query.lower()
    
    if "accident" in query_lower:
        return [{
            "text": "In case of an accident in India: 1) Ensure safety of all parties 2) Call emergency services - 100 for police, 108 for ambulance 3) Exchange information with other parties involved 4) Document the scene with photographs 5) File an FIR at the nearest police station if there are injuries or significant damage 6) Seek immediate medical attention even for minor injuries 7) Inform your insurance company within 24 hours 8) Preserve all evidence and medical records",
            "source": "Motor Vehicles Act & Legal Emergency Procedures",
            "section": None,
            "type": "guidance"
        }]
    elif "murder" in query_lower:
        return [{
            "text": "Section 103 of Bharatiya Nyaya Sanhita (BNS 2023): Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. This section replaces IPC Section 302.",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "103",
            "type": "statute"
        }]
    elif "theft" in query_lower or "stole" in query_lower or "wallet" in query_lower:
        return [{
            "text": "Section 303 of Bharatiya Nyaya Sanhita: Punishment for theft. Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both. To file a complaint, visit the nearest police station immediately and file an FIR with all relevant details.",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "303",
            "type": "statute"
        }]
    elif "fir" in query_lower:
        return [{
            "text": "To file an FIR (First Information Report) in India under BNSS: 1) Visit the nearest police station in whose jurisdiction the crime occurred 2) Provide details of the incident either orally or in writing 3) Under Section 173 of BNSS (Bharatiya Nagarik Suraksha Sanhita), police are legally obligated to register your FIR 4) You will receive a copy of the FIR free of charge 5) Note down the FIR number for future reference 6) If police refuse to file FIR, you can approach higher authorities or file online through state police websites",
            "source": "Bharatiya Nagarik Suraksha Sanhita",
            "section": "173",
            "type": "procedure"
        }]
    elif "rent" in query_lower or "agreement" in query_lower:
        return [{
            "text": "A rent agreement in India should include: 1) Names and addresses of landlord and tenant 2) Property details and rent amount 3) Duration of tenancy 4) Terms of payment and deposit 5) Maintenance responsibilities 6) Notice period for termination. The agreement should be on stamp paper of appropriate value as per state laws and registered if tenure exceeds 11 months.",
            "source": "Indian Contract Act & Transfer of Property Act",
            "section": None,
            "type": "guidance"
        }]
    else:
        return [{
            "text": "For specific legal advice on your situation, it is recommended to consult with a qualified lawyer who can review all relevant details. You can also reach out to legal aid services for free consultation. Key government helplines: Legal Services Authority (toll-free), Police (100), Women Helpline (1091).",
            "source": "General Legal Guidance",
            "section": None,
            "type": "general"
        }]

if __name__ == "__main__":
    print("\n" + "="*60)
    print("LEGAL AI RAG SERVICE - HACKATHON MODE")
    print("="*60)
    print("Starting FastAPI server on port 8000...")
    print("Using Llama3.2:1b models")
    print("Ready for queries!")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=300)
