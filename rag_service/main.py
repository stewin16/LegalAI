from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false" # Prevent deadlock

from dotenv import load_dotenv
import pathlib
from rag_engine import RAGEngine

# Load .env from parent directory (root of project)
base_path = pathlib.Path(__file__).parent.parent
load_dotenv(dotenv_path=base_path / ".env")

app = FastAPI(title="LegalAi RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = None

@app.on_event("startup")
async def startup_event():
    global engine
    print("[Main] Initializing RAG Engine...", flush=True)
    engine = RAGEngine()
    print("[Main] RAG Engine Initialized", flush=True)

class QueryRequest(BaseModel):
    query: str
    language: str = "en"
    domain: str = "all"
    arguments_mode: bool = False
    analysis_mode: bool = False
    session_id: str = None  # NEW: For conversation memory

@app.get("/")
def read_root():
    return {"status": "ok", "service": "RAG Service"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

class DraftRequest(BaseModel):
    draft_type: str
    details: str
    language: str = "en"

@app.post("/draft")
async def generate_draft(request: DraftRequest):
    try:
        print(f"[Main] Drafting request received: {request.draft_type} in {request.language}", flush=True)
        draft_text = engine.generate_draft(
            draft_type=request.draft_type,
            details=request.details,
            language=request.language
        )
        return {"draft": draft_text}
    except Exception as e:
        print(f"[Main] Error generating draft: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_rag(request: QueryRequest):
    try:
        # Fast path for simple greetings - bypass RAG
        query_lower = request.query.lower().strip()
        # Increased length limit to catch longer Hindi/Hinglish sentences
        if len(query_lower) < 60:
            if any(word in query_lower for word in ['hello', 'hi', 'hey', 'namaste', 'pranam', 'halo']):
                if request.language == 'hi':
                    return {
                        "answer": "नमस्ते! 👋 मैं **LegalAi** हूँ, आपका भारतीय कानूनी सहायक।\n\nमेरी विशेषज्ञता:\n- 🏛️ **आपराधिक कानून** (IPC/BNS)\n- 💻 **आईटी और साइबर कानून**\n- 🏢 **कॉर्पोरेट कानून**\n- 🛡️ **उपभोक्ता कानून**\n- 🚗 **परिवहन कानून**\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
                        "citations": [],
                        "related_judgments": []
                    }
                else:
                    return {
                        "answer": "Hello! 👋 I'm **LegalAi**, your Indian legal assistant.\n\nI specialize in:\n- 🏛️ **Criminal Law** (IPC/BNS)\n- 💻 **IT & Cyber Law**\n- 🏢 **Corporate Law**\n- 🛡️ **Consumer Law**\n- 🚗 **Transport Law**\n\nHow can I help you today?",
                        "citations": [],
                        "related_judgments": []
                    }
            elif any(phrase in query_lower for phrase in ['how can you help', 'what do you do', 'what can you do', 'help me', 'madad', 'sahayata', 'kya tum', 'sakte ho']):
                if request.language == 'hi':
                    return {
                        "answer": "मैं **LegalAi** हूँ, और मैं आपकी मदद कर सकता हूँ:\n\n1. **कानूनी प्रश्न**: विशिष्ट कानूनों के बारे में पूछें (जैसे, 'चोरी की सजा', 'कंपनी कैसे रजिस्टर करें')\n2. **तुलना**: पुराने बनाम नए कानूनों की तुलना करें (जैसे, 'IPC 302 बनाम BNS 103')\n3. **दस्तावेज़ सारांश**: सारांश के लिए कानूनी दस्तावेज़ अपलोड करें\n4. **केस लॉ**: ऐतिहासिक फैसलों पर जानकारी प्राप्त करें\n\nबस अपना प्रश्न टाइप करें!",
                        "citations": [],
                        "related_judgments": []
                    }
                else:
                    return {
                        "answer": "I'm **LegalAi**, and I can help you with:\n\n1. **Legal Queries**: Ask about specific laws (e.g., 'punishment for theft', 'how to register a company')\n2. **Comparisons**: Compare old vs. new laws (e.g., 'IPC 302 vs BNS 103')\n3. **Document Summarization**: Upload legal docs for a summary\n4. **Case Law**: Get information on landmark judgments\n\nJust type your question!",
                        "citations": [],
                        "related_judgments": []
                    }
            elif any(phrase in query_lower for phrase in ['who are you', 'your name', 'about you', 'kaun ho', 'tumhara naam']):
                if request.language == 'hi':
                     return {
                        "answer": "मैं **LegalAi** हूँ, एक बुद्धिमान कानूनी सहायक जिसे भारतीय कानून को सरल बनाने के लिए डिज़ाइन किया गया है। मैं सटीक कानूनी मार्गदर्शन प्रदान करने के लिए IPC/BNS, IT अधिनियम, कंपनी अधिनियम आदि जैसे प्रमुख अधिनियमों को कवर करता हूँ।",
                        "citations": [],
                        "related_judgments": []
                    }
                else:
                    return {
                        "answer": "I am **LegalAi**, an intelligent legal assistant designed to simplify Indian law. I cover major acts like IPC/BNS, IT Act, Companies Act, and more to provide accurate legal guidance.",
                        "citations": [],
                        "related_judgments": []
                    }
            elif any(word in query_lower for word in ['thank', 'thanks', 'dhanyavad', 'shukriya']):
                if request.language == 'hi':
                    return {
                        "answer": "आपका स्वागत है! 😊 अगर आपके पास और कानूनी प्रश्न हैं तो बेझिझक पूछें।",
                        "citations": [],
                        "related_judgments": []
                    }
                else:
                    return {
                        "answer": "You're welcome! 😊 Feel free to ask if you have more legal questions.",
                        "citations": [],
                        "related_judgments": []
                    }
        
        # Add user message to conversation memory if session exists
        if request.session_id:
            engine.conversation_memory.add_message(request.session_id, "user", request.query)
        
        response = await engine.query(
            request.query, 
            request.language, 
            request.arguments_mode, 
            request.analysis_mode,
            request.session_id  # Pass session_id to engine
        )
        
        # Add assistant response to conversation memory
        if request.session_id and "answer" in response:
            engine.conversation_memory.add_message(request.session_id, "assistant", response["answer"])
        
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
async def handle_summarize(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    try:
        content = await file.read()
        summary = await engine.summarize(content, file.filename)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CompareRequest(BaseModel):
    text1: str
    text2: str

@app.post("/compare")
async def handle_compare(request: CompareRequest):
    try:
        comparison = await engine.compare_clauses(request.text1, request.text2)
        return {"comparison": comparison}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# NEW: Session Management Endpoints
@app.post("/session/create")
async def create_session():
    """Create a new conversation session"""
    try:
        session_id = engine.conversation_memory.create_session()
        return {"session_id": session_id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/session/clear")
async def clear_session(session_id: str):
    """Clear conversation history for a session"""
    try:
        engine.conversation_memory.clear_session(session_id)
        return {"session_id": session_id, "status": "cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/session/{session_id}/history")
async def get_session_history(session_id: str, max_messages: int = 10):
    """Get conversation history for a session"""
    try:
        history = engine.conversation_memory.get_history(session_id, max_messages)
        metadata = engine.conversation_memory.get_session_info(session_id)
        return {"session_id": session_id, "history": history, "metadata": metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a conversation session"""
    try:
        engine.conversation_memory.delete_session(session_id)
        return {"session_id": session_id, "status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=300)
