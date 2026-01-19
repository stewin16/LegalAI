import os
import json
# from openai import OpenAI # Uncomment when ready
from typing import List, Dict, Any

class RAGEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        # Load Golden Dataset
        try:
            with open(os.path.join(os.path.dirname(__file__), "data", "golden_dataset.json"), "r", encoding="utf-8") as f:
                self.dataset = json.load(f)
            print("[RAGEngine] Golden Dataset loaded successfully.")
        except Exception as e:
            print(f"[RAGEngine] Error loading dataset: {e}")
            self.dataset = []

    async def query(self, query: str, language: str = "en", arguments_mode: bool = False, analysis_mode: bool = False) -> Dict[str, Any]:
        """
        Handles the full RAG pipeline using the Golden Dataset for MVP.
        """
        print(f"[RAGEngine] Processing query: {query} (Lang: {language}, Args: {arguments_mode}, Analysis: {analysis_mode})")
        
        # Simple Keyword Search for MVP
        query_lower = query.lower()
        match = None
        for item in self.dataset:
            if any(k in query_lower for k in item["keywords"]):
                match = item
                break
        
        if match:
            response = {
                "citations": [
                    {"source": "Bhartiya Nyaya Sanhita, 2023", "section": match["bns"]["section"], "text": match["bns"]["text"]},
                    {"source": "Indian Penal Code, 1860", "section": match["ipc"]["section"], "text": match["ipc"]["text"]}
                ],
                "related_judgments": match.get("case_laws", []),
                "arguments": match.get("arguments") if arguments_mode else None,
                "neutral_analysis": match.get("neutral_analysis") if analysis_mode else None,
                "disclaimer": "Informational purposes only. Not legal advice. Final interpretation rests with the judiciary."
            }

            if language == "hi":
                response["answer"] = match["hindi_response"]
                response["disclaimer"] = "जानकारी केवल सूचना के लिए है। कानूनी सलाह नहीं। अंतिम व्याख्या न्यायपालिका के पास है।"
                # Citations stay english largely for legal accuracy provided in source text
                response["citations"] = [
                     {"source": "Bhartiya Nyaya Sanhita, 2023", "section": match["bns"]["section"], "text": match["bns"]["text"]}
                ]
            else:
                 response["answer"] = f"Based on your query regarding '{query}', here is the relevant law:\n\n**{match['bns']['section']} (BNS)**: {match['bns']['text']}\n\n*Previously covered under {match['ipc']['section']} (IPC)*."

            return response

        # Fallback if no keyword match
        return {
            "answer": "I could not find a specific legal section matching your query in the current database. Please try asking about 'murder', 'theft', or 'defamation'.",
            "citations": [],
            "related_judgments": [],
            "disclaimer": "Informational purposes only. Not legal advice."
        }

    async def summarize(self, file_content: bytes, filename: str) -> str:
        """
        Summarizes the uploaded document content using heuristic extraction (MVP).
        """
        print(f"[RAGEngine] Summarizing file: {filename} ({len(file_content)} bytes)")
        
        text = ""
        try:
            # 1. Extract Text
            if filename.lower().endswith(".pdf"):
                import io
                from pypdf import PdfReader
                try:
                    reader = PdfReader(io.BytesIO(file_content))
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
                except ImportError:
                    return "Error: 'pypdf' library not installed. Please install it to process PDFs."
            else:
                # Assume text/markdown
                text = file_content.decode("utf-8", errors="ignore")

            # 2. Heuristic Summary (Extract meaningful sentences)
            sentences = text.split('.')
            summary_points = []
            keywords = ["held", "concluded", "judgment", "order", "whereas", "therefore", "guilty", "liable", "penalty", "section", "act"]
            
            # Always take the first non-empty line as title/context
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            if lines:
                summary_points.append(f"**Document**: {lines[0]}")

            # Find relevant sentences
            for sent in sentences:
                sent = sent.strip()
                if len(sent) > 20 and any(k in sent.lower() for k in keywords):
                    # Clean up basic formatting
                    summary_points.append(f"- {sent}.")
                    if len(summary_points) >= 5: # Limit to 5 key points
                        break
            
            if not summary_points or len(summary_points) == 1:
                # Fallback if no keywords found - take first few sentences
                summary_points.extend([f"- {s.strip()}." for s in sentences[:3] if len(s.strip()) > 20])

            final_summary = "\n".join(summary_points)
            
            return f"""
# Summary Report: {filename}

## 📄 Key Insights extracted from Legal Document
{final_summary}

---
*Note: This summary is generated by an automated extractor based on key legal terminologies.*
            """

        except Exception as e:
            print(f"Error processing file: {e}")
            return f"Error processing document: {str(e)}"

    def compare_clauses(self, topic: str) -> Dict[str, Any]:
        # Implementation for Comparison Logic (can rely on static JSON for MVP)
        return {}
