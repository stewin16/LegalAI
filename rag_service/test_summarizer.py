"""
Test the /summarize endpoint with a sample legal document
"""
import requests
import io

# Create a simple test document
test_content = """
RENT AGREEMENT

This Rent Agreement is made on January 21, 2026, between:

LANDLORD: Mr. Rajesh Kumar, residing at 123 MG Road, Mumbai - 400001
TENANT: Ms. Priya Sharma, residing at 456 Park Street, Kolkata - 700016

PREMISES: Flat No. 301, Sunrise Apartments, Andheri West, Mumbai - 400058

TERMS AND CONDITIONS:

1. RENT: The monthly rent is Rs. 25,000 (Twenty-Five Thousand Rupees Only), payable on or before the 5th day of each month.

2. SECURITY DEPOSIT: The Tenant has paid a refundable security deposit of Rs. 75,000 (Seventy-Five Thousand Rupees Only).

3. DURATION: This agreement is valid for a period of 11 months starting from February 1, 2026, to December 31, 2026.

4. MAINTENANCE: Monthly maintenance charges of Rs. 2,000 shall be borne by the Tenant.

5. UTILITIES: Electricity, water, and gas bills shall be paid by the Tenant.

6. TERMINATION: Either party may terminate this agreement by giving 2 months' written notice.

7. SUBLETTING: The Tenant shall not sublet the premises without written permission from the Landlord.

8. DAMAGES: The Tenant shall be responsible for any damages to the property beyond normal wear and tear.

Signed:
_______________ (Landlord)
_______________ (Tenant)

Witnesses:
1. _______________
2. _______________
"""

def test_summarize_txt():
    """Test with a TXT file"""
    print("\n" + "="*60)
    print("TESTING DOCUMENT SUMMARIZER - TXT FILE")
    print("="*60)
    
    # Create a file-like object
    files = {
        'file': ('rent_agreement.txt', io.BytesIO(test_content.encode('utf-8')), 'text/plain')
    }
    
    try:
        print("\n📤 Sending request to /summarize endpoint...")
        response = requests.post(
            'http://localhost:8000/summarize',
            files=files,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Summary generated:")
            print("\n" + "-"*60)
            print(result['summary'])
            print("-"*60)
            print(f"\n📊 Stats:")
            print(f"   - Filename: {result['filename']}")
            print(f"   - Text length: {result['text_length']} characters")
            print(f"   - Status: {result['status']}")
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(response.text)
    
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend.")
        print("   Make sure the FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_summarize_txt()
