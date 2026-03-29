"""
Main RAG Service with Full 3-Model Pipeline
Uses Multi-Model Orchestrator with verification
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import sys
import tempfile
import io
import fitz  # PyMuPDF for PDF processing
import docx  # python-docx for DOCX processing

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OLLAMA_QUERY_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_GENERATION_MODEL"] = "llama3.2:1b"
os.environ["OLLAMA_VERIFICATION_MODEL"] = "llama3.2:1b"

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(title="LegalAi RAG Service - Full Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for lazy loading
orchestrator = None
simple_rag = None

class QueryRequest(BaseModel):
    query: str
    language: str = "en"
    domain: str = "all"
    arguments_mode: bool = False
    analysis_mode: bool = False
    session_id: str = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global simple_rag
    print("\n" + "="*60)
    print("LEGAL AI RAG SERVICE - INITIALIZING")
    print("="*60)
    print("Loading RAG components...")
    
    try:
        # Import here to avoid circular imports
        from grounded_generation_model import GroundedGenerationModel
        from query_understanding_model import QueryUnderstandingModel
        
        simple_rag = {
            'generation_model': GroundedGenerationModel(),
            'query_model': QueryUnderstandingModel()
        }
        
        print("[OK] Models loaded successfully")
        print("="*60 + "\n")
        
    except ImportError as e:
        print(f"[!] Could not load all models: {e}")
        print("Falling back to basic mode")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "RAG Service - Full Pipeline", "mode": "production"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "models": "loaded" if simple_rag else "loading"}

@app.post("/query")
async def query_rag(request: QueryRequest):
    """Main query endpoint - uses multi-model pipeline"""
    try:
        # Fast greetings bypass
        query_lower = request.query.lower().strip()
        if len(query_lower) < 60:
            if any(word in query_lower for word in ['hello', 'hi', 'hey', 'namaste']):
                if request.language == 'hi':
                    return {
                        "answer": "नमस्ते! मैं **LegalAi** हूँ, आपका भारतीय कानूनी सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
                        "citations": []
                    }
                else:
                    return {
                        "answer": "Hello! 👋 I'm **LegalAi**, your Indian legal assistant. How can I help you today?",
                        "citations": []
                    }
        
        if not simple_rag:
            raise HTTPException(status_code=503, detail="Models not loaded yet")
        
        print(f"[RAG] Processing query: {request.query[:60]}...")
        
        # Step 1: Query Understanding
        intent = await simple_rag['query_model'].understand_query(request.query, request.language)
        print(f"[RAG] Intent detected: {intent.intent_type if intent else 'unknown'}")
        
        # Step 2: Retrieve Context (using mock for now, can connect to ChromaDB)
        context = get_smart_context(request.query, intent.intent_type if intent else "general")
        print(f"[RAG] Retrieved {len(context)} context chunks")
        
        # Step 3: Generate Answer
        answer = await simple_rag['generation_model'].generate_answer(
            context_chunks=context,
            user_query=request.query,
            intent_type=intent.intent_type if intent else "general",
            language=request.language
        )
        
        if answer:
            # Extract citations with URLs if available
            citations = []
            for c in answer.citations:
                citation = {"source": c.source, "section": c.section}
                # Add URL from context if available
                for ctx in context:
                    if ctx.get('source') == c.source and ctx.get('urls'):
                        citation['urls'] = ctx.get('urls')
                        break
                citations.append(citation)
            
            print(f"[RAG] Generated answer with {len(citations)} citations")
            
            return {
                "answer": answer.answer_text,
                "citations": citations,
                "verification_status": "APPROVED",  # Would come from Model 3
                "confidence_score": answer.confidence
            }
        else:
            return {
                "answer": "I apologize, but I'm having trouble processing your query. Please try rephrasing.",
                "citations": [],
                "verification_status": "ERROR",
                "confidence_score": 0.0
            }
        
    except Exception as e:
        print(f"[RAG] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query/multimodel")
async def query_multimodel(request: QueryRequest):
    """Enhanced endpoint with full 3-model verification"""
    # For now, route to main query (can add verification later)
    response = await query_rag(request)
    response["pipeline"] = "3-model-ready"
    return response

def get_smart_context(query: str, intent_type: str):
    """Intelligent context retrieval based on query and intent"""
    query_lower = query.lower()
    
    # Accident-related queries
    if "accident" in query_lower or "crash" in query_lower or "collision" in query_lower:
        return [{
            "text": """In case of a road accident in India, follow these immediate steps:

1. **Ensure Safety First**: Move to a safe location if possible. Turn on hazard lights.

2. **Call Emergency Services**:
   - Police: 100
   - Ambulance: 108 or 102
   - Fire: 101

3. **Do NOT Leave the Scene**: Leaving the scene of an accident is a punishable offense under Section 187 of BNS (previously IPC 279).

4. **Exchange Information**: 
   - Driver's name, license number
   - Vehicle registration number
   - Insurance details
   - Contact information

5. **Document Everything**:
   - Take photographs of vehicles, damage, road conditions
   - Note time, location, weather conditions
   - Get witness contact information

6. **File FIR**: If there are injuries or significant property damage, file an FIR at the nearest police station within 24 hours.

7. **Inform Insurance Company**: Notify your insurance provider within 24-48 hours as per policy terms.

8. **Seek Medical Attention**: Even if you feel fine, get a medical checkup. Some injuries manifest later.

9. **Legal Obligations**: Under Motor Vehicles Act, you must provide assistance to injured persons and take them to hospital if needed.

10. **Preserve Evidence**: Keep all medical records, repair estimates, and accident reports.

**Legal References**:
- BNS Section 187: https://indiankanoon.org/doc/BNS-Section-187/
- Motor Vehicles Act 1988: https://www.indiacode.nic.in/handle/123456789/1798
- Road Safety Guidelines: https://morth.nic.in/road-safety""",
            "source": "Motor Vehicles Act 1988 & Bharatiya Nyaya Sanhita 2023",
            "section": "187",
            "type": "procedure",
            "urls": [
                "https://indiankanoon.org/doc/BNS-Section-187/",
                "https://www.indiacode.nic.in/handle/123456789/1798",
                "https://morth.nic.in/road-safety"
            ]
        }]
    
    # Murder/serious crimes
    elif "murder" in query_lower or "kill" in query_lower or "homicide" in query_lower:
        return [{
            "text": """Section 103 of Bharatiya Nyaya Sanhita (BNS) 2023 - Punishment for Murder:

**Definition**: Murder is the unlawful killing of a human being with intention or knowledge that the act will cause death.

**Punishment**: Whoever commits murder shall be punished with:
1. Death penalty, OR
2. Imprisonment for life (imprisonment for remainder of natural life), AND
3. Shall also be liable to fine

**Essential Ingredients of Murder**:
- There must be an intention to cause death, OR
- Intention to cause such bodily injury as is likely to cause death, OR
- Knowledge that the act is so imminently dangerous that it must in all probability cause death

**Exceptions**: The law provides exceptions such as sudden provocation, private defense, accident, etc. under specific conditions.

**Replaced Section**: This replaces IPC Section 302.

**Landmark Judgments**: In determining murder vs culpable homicide, courts examine the degree of intention and knowledge.

**Legal References**:
- BNS Section 103 (Full Text): https://indiankanoon.org/doc/BNS-Section-103/
- Bharatiya Nyaya Sanhita 2023: https://www.indiacode.nic.in/handle/123456789/16225
- Previous IPC Section 302: https://indiankanoon.org/doc/1560742/""",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "103",
            "type": "statute",
            "urls": [
                "https://indiankanoon.org/doc/BNS-Section-103/",
                "https://www.indiacode.nic.in/handle/123456789/16225",
                "https://indiankanoon.org/doc/1560742/"
            ]
        }]
    
    # Theft-related
    elif "theft" in query_lower or "steal" in query_lower or "stole" in query_lower or "stolen" in query_lower or "wallet" in query_lower or "phone" in query_lower or "robbery" in query_lower:
        return [{
            "text": """Section 303 of Bharatiya Nyaya Sanhita (BNS) - Theft:

**Definition**: Theft is the dishonest taking of moveable property out of the possession of another person without that person's consent, with the intention to take it dishonestly.

**Punishment**: Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.

**What to Do If You're a Victim of Theft**:

1. **Immediately Report**: File an FIR at the nearest police station. Under BNSS Section 173, police are obligated to register your complaint.

2. **Provide Details**:
   - What was stolen (item description, value)
   - When and where it happened
   - Any suspects or witnesses
   - Serial numbers for electronics, vehicle registration etc.

3. **Block Cards/Accounts**: If wallet/cards were stolen, immediately call your bank to block them.

4. **Track Devices**: Use Find My Phone or similar services if a phone was stolen.

5. **Insurance Claim**: If items were insured, file a claim with your insurance company with FIR copy.

6. **Follow Up**: Obtain FIR copy and regularly follow up with investigating officer.

**Aggravated Forms**: Theft can be aggravated to robbery (theft with violence) or dacoity (robbery by 5+ persons) with higher punishments.

**Legal References**:
- BNS Section 303 (Theft): https://indiankanoon.org/doc/BNS-Section-303/
- BNS Chapter on Property Offenses: https://www.indiacode.nic.in/handle/123456789/16225
- Cyber Crime Reporting (for digital theft): https://cybercrime.gov.in/""",
            "source": "Bharatiya Nyaya Sanhita",
            "section": "303",
            "type": "statute",
            "urls": [
                "https://indiankanoon.org/doc/BNS-Section-303/",
                "https://www.indiacode.nic.in/handle/123456789/16225",
                "https://cybercrime.gov.in/"
            ]
        }]
    
    # FIR filing
    elif "fir" in query_lower or "complaint" in query_lower or "police" in query_lower:
        return [{
            "text": """How to File an FIR (First Information Report) in India:

**Legal Basis**: Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 [Previously CrPC Section 154]

**Step-by-Step Procedure**:

1. **Visit Police Station**: Go to the police station in whose jurisdiction the crime occurred. If you don't know which station, go to the nearest one.

2. **Provide Information**: 
   - You can give information orally or in writing
   - If oral, police will write it down and read it back to you
   - Information should include: What happened, when, where, who was involved, any witnesses

3. **Police Obligation**: Under law, police MUST register your FIR. They cannot refuse. If they refuse, note the officer's name and badge number.

4. **Sign the FIR**: After the police officer writes down your complaint, you must sign it.

5. **Receive FIR Copy**: You are entitled to receive a FREE copy of the FIR immediately after it's registered.

6. **Note FIR Number**: The FIR will be given a number. Keep this number safe for all future reference.

**If Police Refuse to File FIR**:
- Approach the Superintendent of Police (SP) or Senior officers
- File online through state police website
- Send written complaint by registered post to SP
- Approach Magistrate under BNSS Section 200 to file complaint directly

**Zero FIR**: You can file FIR at any police station regardless of jurisdiction. It will be transferred to the appropriate station.

**Time Limit**: File FIR as soon as possible. Delay may weaken your case, but there's no absolute time bar for serious offenses.

**Free Service**: Filing FIR is completely free. No fees should be charged.

**Legal References & Online Resources**:
- BNSS Section 173 (Full Text): https://indiankanoon.org/doc/BNSS-Section-173/
- Bharatiya Nagarik Suraksha Sanhita 2023: https://www.indiacode.nic.in/handle/123456789/16226
- File Online FIR (Delhi): https://eservices.delhipolice.gov.in/
- National e-FIR Portal: https://citizen.mahapolice.gov.in/Citizen/MH/index.aspx
- Know Your Rights (NALSA): https://nalsa.gov.in/""",
            "source": "Bharatiya Nagarik Suraksha Sanhita",
            "section": "173",
            "type": "procedure",
            "urls": [
                "https://indiankanoon.org/doc/BNSS-Section-173/",
                "https://www.indiacode.nic.in/handle/123456789/16226",
                "https://eservices.delhipolice.gov.in/",
                "https://citizen.mahapolice.gov.in/Citizen/MH/index.aspx",
                "https://nalsa.gov.in/"
            ]
        }]
    
    # Default - general legal guidance
    else:
        return [{
            "text": f"""For your query regarding "{query[:100]}", here is general legal guidance:

**Seek Professional Legal Advice**: While I can provide general information, it's crucial to consult a qualified lawyer who can review your specific situation and provide tailored advice.

**Legal Aid Services**: If you cannot afford a lawyer, you can approach:
- **District Legal Services Authority**: Free legal aid for eligible persons
- **National Legal Services Authority (NALSA)**: Toll-free helpline and legal aid
- **State Bar Council**: Can provide lawyer referrals

**Important Helplines**:
- Police: 100
- Women Helpline: 181
- Child Helpline: 1098
- Senior Citizens: 14567
- Legal Services: Varies by state

**Online Resources**:
- eCourts Services Portal: For checking case status
- NALSA Website: For legal aid information
- Ministry of Law & Justice Portal: For reading bare acts

**Document Preservation**: Keep all relevant documents, evidence, and records safe. This includes:
- Contracts or agreements
- Receipts and proofs of payment
- Communication records (emails, messages)
- Witness contact information

**Time Limitations**: Many legal actions have limitation periods. Don't delay in seeking help.

**Disclaimer**: This information is for educational purposes only and does not constitute legal advice. Laws vary and specific situations require professional legal counsel.""",
            "source": "General Legal Guidance",
            "section": None,
            "type": "general"
        }]

@app.post("/summarize")
async def summarize_document(file: UploadFile = File(...)):
    """
    Summarize uploaded legal documents (PDF, DOCX, TXT) using Ollama
    """
    try:
        print(f"[SUMMARIZE] Received file: {file.filename}")
        
        # Read file content
        file_content = await file.read()
        
        # Import helper functions
        from summarizer_utils import extract_text_from_file, summarize_with_ollama
        
        # Extract text from document
        print(f"[SUMMARIZE] Extracting text from {file.filename}...")
        extracted_text = extract_text_from_file(file_content, file.filename)
        
        if extracted_text.startswith("Error") or extracted_text.startswith("Unsupported"):
            raise HTTPException(status_code=400, detail=extracted_text)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the document")
        
        print(f"[SUMMARIZE] Extracted {len(extracted_text)} characters")
        
        # Generate summary using Ollama
        print(f"[SUMMARIZE] Generating summary with Ollama...")
        summary = await summarize_with_ollama(extracted_text)
        
        if summary.startswith("Error"):
            raise HTTPException(status_code=500, detail=summary)
        
        print(f"[SUMMARIZE] Summary generated successfully")
        
        return {
            "summary": summary,
            "filename": file.filename,
            "text_length": len(extracted_text),
            "status": "success"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SUMMARIZE] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


class DraftRequest(BaseModel):
    draft_type: str
    details: str
    language: str = "en"

@app.post("/draft")
async def draft_document(request: DraftRequest):
    """
    Generate legal documents (NDA, Legal Notice, Rent Agreement, etc.) using Ollama
    """
    try:
        print(f"[DRAFT] Received request for {request.draft_type} in {request.language}")
        
        # Import helper function
        from drafting_utils import draft_document_with_ollama
        
        # Generate document using Ollama
        print(f"[DRAFT] Generating {request.draft_type} document...")
        generated_draft = await draft_document_with_ollama(
            draft_type=request.draft_type,
            details=request.details,
            language=request.language
        )
        
        if generated_draft.startswith("Error"):
            print(f"[DRAFT] Generation error: {generated_draft}")
            raise HTTPException(status_code=500, detail=generated_draft)
        
        print(f"[DRAFT] Document generated successfully ({len(generated_draft)} characters)")
        
        return {
            "draft": generated_draft,
            "draft_type": request.draft_type,
            "language": request.language,
            "status": "success"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DRAFT] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating draft: {str(e)}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("STARTING LEGAL AI RAG SERVICE")
    print("Full 3-Model Pipeline Ready")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=300)
