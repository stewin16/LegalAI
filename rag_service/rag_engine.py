import os
import json
# from openai import OpenAI # Uncomment when ready
from typing import List, Dict, Any

class RAGEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        # Load Datasets
        self.dataset = []
        self.statutes = []
        
        # 1. Golden Dataset (Case Laws)
        try:
            with open(os.path.join(os.path.dirname(__file__), "data", "golden_dataset.json"), "r", encoding="utf-8") as f:
                self.dataset = json.load(f)
            print("[RAGEngine] Golden Dataset (Case Laws) loaded successfully.")
        except Exception as e:
            print(f"[RAGEngine] Error loading Golden Dataset: {e}")

        # 2. Statute Map (IPC <-> BNS)
        try:
            with open(os.path.join(os.path.dirname(__file__), "data", "ipc_bns_mapping.json"), "r", encoding="utf-8") as f:
                self.statutes = json.load(f)
            print(f"[RAGEngine] Statute Map loaded successfully ({len(self.statutes)} sections).")
        except Exception as e:
            print(f"[RAGEngine] Error loading Statute Map: {e}")

    async def query(self, query: str, language: str = "en", arguments_mode: bool = False, analysis_mode: bool = False) -> Dict[str, Any]:
        """
        Handles the full RAG pipeline using the Hybrid Dataset (Statutes + Case Laws).
        """
        print(f"[RAGEngine] Processing query: {query} (Lang: {language})")
        
        query_lower = query.lower()
        match = None
        
        # 1. Search in Statutes (Primary Source for "Sections")
        for item in self.statutes:
            # Check BNS number, IPC number, or Topic/Description match
            if (item.get("bns") and item["bns"] in query_lower) or \
               (item.get("ipc") and item["ipc"] in query_lower) or \
               (item.get("topic") and item["topic"].lower() in query_lower) or \
               (item.get("description") and item["description"].lower() in query_lower):
                match = item
                break
        
        # 2. If no statute match, check Golden Dataset (Case Laws)
        case_law_match = None
        if not match:
            for item in self.dataset:
                # Assuming golden dataset has keywords
                if "keywords" in item and any(k in query_lower for k in item["keywords"]):
                    case_law_match = item
                    break
        
        if match:
            # Construct response from Statute Match
            bns_text = match.get("text_bns", "Text not available.")
            ipc_text = match.get("text_ipc", "Text not available.")
            
            answer_text = f"**BNS Section {match['bns']}** covers **{match['topic']}**.\n\n"
            answer_text += f"**Legal Text (BNS):**\n_{bns_text}_\n\n"
            
            if match.get("ipc"):
                 answer_text += f"**Corresponding Old Law (IPC {match['ipc']}):**\n_{ipc_text}_"
            else:
                 answer_text += f"*This is a new provision in BNS with no direct IPC equivalent.*"

            response = {
                "answer": answer_text,
                "citations": [
                    {"source": "Bhartiya Nyaya Sanhita, 2023", "section": f"Section {match['bns']}", "text": bns_text[:200] + "..."}
                ],
                "related_judgments": [], # Could look up cases related to this topic later
                "arguments": None,
                "neutral_analysis": None,
                "disclaimer": "Informational purposes only. Not legal advice."
            }
            
            if match.get("ipc"):
                 response["citations"].append({"source": "Indian Penal Code, 1860", "section": f"Section {match['ipc']}", "text": ipc_text[:200] + "..."})

            return response

        elif case_law_match:
            # Legacy/Case Law Match (using Golden Dataset logic)
            response = {
                "citations": [
                    {"source": "Bhartiya Nyaya Sanhita, 2023", "section": case_law_match.get("bns", {}).get("section", "N/A"), "text": case_law_match.get("bns", {}).get("text", "")},
                ],
                "related_judgments": case_law_match.get("case_laws", []),
                "arguments": case_law_match.get("arguments") if arguments_mode else None,
                "neutral_analysis": case_law_match.get("neutral_analysis") if analysis_mode else None,
                "disclaimer": "Informational purposes only. Not legal advice."
            }
             
            if language == "hi":
                response["answer"] = case_law_match.get("hindi_response", "Translation not available.")
            else:
                response["answer"] = f"Based on your query, here is the relevant case law info..."

            return response

        # Fallback
        return {
            "answer": "I could not find a specific legal section or case law matching your query. Try asking about 'Murder', 'Theft', or specific sections like 'BNS 103'.",
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
