"""
Helper functions for document text extraction and summarization
"""
import tempfile
import os
import fitz  # PyMuPDF
import docx

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """
    Extract text from PDF, DOCX, or TXT files
    
    Args:
        file_content: Raw file bytes
        filename: Name of the file (to determine type)
    
    Returns:
        Extracted text as string
    """
    try:
        file_extension = filename.split(".")[-1].lower()
        
        # Handle PDFs
        if file_extension == "pdf":
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
                temp_pdf.write(file_content)
                temp_pdf_path = temp_pdf.name
            
            # Open the PDF and extract text
            doc = fitz.open(temp_pdf_path)
            extracted_text = "\n".join([page.get_text("text") for page in doc])
            doc.close()
            
            # Clean up temp file
            os.remove(temp_pdf_path)
            return extracted_text
        
        # Handle DOCX files
        elif file_extension == "docx":
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_docx:
                temp_docx.write(file_content)
                temp_docx_path = temp_docx.name
            
            doc = docx.Document(temp_docx_path)
            extracted_text = "\n".join([para.text for para in doc.paragraphs])
            
            # Clean up temp file
            os.remove(temp_docx_path)
            return extracted_text
        
        # Handle TXT files
        elif file_extension == "txt":
            return file_content.decode("utf-8")
        
        else:
            return f"Unsupported file format: {file_extension}"
    
    except Exception as e:
        return f"Error extracting text: {str(e)}"


async def summarize_with_ollama(text: str, model: str = "llama3.2:1b") -> str:
    """
    Summarize legal document text using Ollama
    
    Args:
        text: Document text to summarize
        model: Ollama model to use
    
    Returns:
        Structured summary
    """
    import requests
    
    # Truncate text if too long (keep first 8000 chars for context)
    if len(text) > 8000:
        text = text[:8000] + "\n\n[Document truncated for processing...]"
    
    prompt = f"""You are a legal AI assistant specialized in summarizing legal documents. Extract a structured summary from the following legal document.

Format your response exactly as follows:

**Title:** [Document title or type]

**Key Clauses:**
1. [First key clause or provision]
2. [Second key clause or provision]
3. [Third key clause or provision]

**Obligations:**
- **Party A:** [Obligation description]
- **Party B:** [Obligation description]

**Limitations:**
- [Limitation 1]
- [Limitation 2]

**Key Takeaways:**
- [Key takeaway 1]
- [Key takeaway 2]
- [Key takeaway 3]

Document Text:
{text}

Provide ONLY the formatted summary. Do not include any JSON or extra commentary."""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 800
                }
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "Unable to generate summary.")
        else:
            return f"Ollama API error: {response.status_code}"
    
    except requests.exceptions.ConnectionError:
        return "Error: Unable to connect to Ollama. Please ensure Ollama is running on http://localhost:11434"
    except Exception as e:
        return f"Error during summarization: {str(e)}"
