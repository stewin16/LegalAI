"""
Legal document drafting with Ollama/Llama
"""
import requests

DOCUMENT_TEMPLATES = {
    "legal_notice": """You are an expert Indian legal document drafter. Generate a professional Legal Notice based on the details provided.

Format the Legal Notice with:
1. Header: "LEGAL NOTICE" centered
2. Date and reference number
3. To: (Recipient details)
4. From: (Sender details)
5. Subject line
6. Body with proper legal language
7. Demands and deadlines
8. Legal consequences if demands not met
9. Contact information

Use formal legal language appropriate for Indian law. Include relevant sections of law if applicable.""",

    "nda": """You are an expert legal contract drafter. Generate a comprehensive Non-Disclosure Agreement (NDA) for Indian jurisdiction.

Include:
1. Title: "NON-DISCLOSURE AGREEMENT"
2. Parties involved
3. Recitals/Background
4. Definitions
5. Confidential Information clause
6. Obligations of Receiving Party
7. Permitted Disclosures
8. Term and Termination
9. Consequences of Breach
10. Governing Law and Jurisdiction
11. Signatures section

Use proper legal terminology and numbered clauses.""",

    "rent_agreement": """You are an expert legal document drafter. Create a comprehensive 11-month Rent Agreement compliant with Indian rental laws.

Include:
1. Title: "RENT AGREEMENT"
2. Date and place
3. Parties (Landlord and Tenant with full details)
4. Property description
5. Term of agreement
6. Rent amount and payment terms
7. Security deposit
8. Maintenance charges
9. Utilities
10. Termination clause
11. Dispute resolution
12. Witnesses section
13. Signatures

Format with proper numbering and legal language.""",

    "affidavit": """You are an expert legal document drafter. Generate a proper Affidavit for Indian courts.

Include:
1. Title: "AFFIDAVIT"
2. Deponent details (name, age, address, occupation)
3. "I, [name], do hereby solemnly affirm and state as follows:"
4. Numbered statements/facts
5. Verification clause: "I verify that the contents of this affidavit are true to the best of my knowledge and belief"
6. Place and date
7. Signature of deponent
8. Notary/Oath commissioner section

Use first person and formal legal language.""",

    "employment_contract": """You are an expert HR legal advisor. Draft a comprehensive Employment Contract under Indian labor laws.

Include:
1. Title: "EMPLOYMENT AGREEMENT"
2. Parties (Employer and Employee)
3. Position and responsibilities
4. Start date
5. Compensation and benefits
6. Working hours
7. Leave policy
8. Confidentiality clause
9. Non-compete (if applicable)
10. Termination clauses
11. Notice period
12. Governing law
13. Signatures

Use professional legal language appropriate for employment contracts.""",

    "posh_complaint": """You are an expert in Indian POSH (Prevention of Sexual Harassment) laws. Draft a formal POSH complaint.

Include:
1. Title: "COMPLAINT UNDER POSH ACT 2013"
2. To: Internal Complaints Committee
3. Complainant details
4. Respondent details
5. Detailed incident description with dates, times, locations
6. Witness information
7. Evidence/documents attached (if any)
8. Relief sought
9. Declaration of truthfulness
10. Signature and date

Use sensitive, professional language. Reference Sexual Harassment of Women at Workplace Act, 2013.""",

    "rti_application": """You are an expert in Right to Information Act, 2005. Draft a proper RTI application.

Include:
1. Title: "APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005"
2. To: Public Information Officer, [Department]
3. Address
4. Subject line
5. Applicant details
6. Information sought (numbered points)
7. Purpose of information (optional)
8. Mode of receiving information
9. Application fee details
10. Signature and contact details

Use formal government correspondence language. Reference RTI Act 2005 provisions."""
}


async def draft_document_with_ollama(
    draft_type: str,
    details: str,
    language: str = "en",
    model: str = "llama3.2:1b"
) -> str:
    """
    Generate legal document using Ollama
    
    Args:
        draft_type: Type of document (legal_notice, nda, etc.)
        details: User-provided details/scenario
        language: 'en' for English, 'hi' for Hindi
        model: Ollama model to use
    
    Returns:
        Generated legal document
    """
    
    # Get template
    template = DOCUMENT_TEMPLATES.get(draft_type, DOCUMENT_TEMPLATES["legal_notice"])
    
    # Add language instruction
    lang_instruction = ""
    if language == "hi":
        lang_instruction = "\n\nIMPORTANT: Generate the ENTIRE document in Hindi language. Use Devanagari script."
    
    # Construct prompt
    prompt = f"""{template}{lang_instruction}

User Details:
{details}

Generate a complete, professional legal document based on the above requirements and details. Make it formal, legally sound, and ready to use. Include all necessary sections and formatting."""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.4,  # Slightly creative but mostly factual
                    "num_predict": 1500  # Allow longer documents
                }
            },
            timeout=180  # 3 minutes for complex documents
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "Error: Unable to generate document.")
        else:
            return f"Error: Ollama API returned status {response.status_code}"
    
    except requests.exceptions.ConnectionError:
        return "Error: Unable to connect to Ollama. Please ensure Ollama is running on http://localhost:11434"
    except requests.exceptions.Timeout:
        return "Error: Document generation timed out. Please try with simpler details."
    except Exception as e:
        return f"Error during document generation: {str(e)}"
