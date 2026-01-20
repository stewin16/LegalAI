# ⚖️ LegalAi

**Democratizing Legal Justice with AI.**
*Winner/Participant at Rubix TSEC Hackathon*

LegalAi is a **"Judge-Safe"** legal assistant designed to help everyday citizens and legal professionals navigate the complexities of the Indian judicial system (IPC & BNS). Unlike generic chatbots, it focuses on **verifiable citations**, **neutral analysis**, and **zero hallucinations**.

![Landing Page](./public/landing-preview.png)
*(Note: Add a screenshot of the app here)*

## 🚀 Key Features (Why this stands out)

### 🏆 "Judge-Safe" Innovations
*   **⚖️ Neutral Legal Analysis**: Instead of giving legal advice, it provides a structured breakdown of "Key Factors" and "Possible Interpretations", acting like a neutral clerk.
*   **🔥🧊 Generate Arguments**: Instantly drafts "Arguments For" and "Arguments Against" a case to help lawyers brainstorm strategies.
*   **📄 Professional PDF Reports**: One-click export of your research into a polished PDF memo.

### 🇮🇳 Built for India
*   **IPC ➡️ BNS Transition**: Seamlessly maps old Indian Penal Code sections to the new Bharatiya Nyaya Sanhita.
*   **🗣️ Voice & Vernacular**: Full support for **Hindi** (Input/Output) and Voice commands.
*   **📚 Citation-Backed**: Every answer links to the specific Act and Section.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, ShadCN UI
*   **Backend**: Node.js (API Gateway), Python (RAG Service)
*   **AI/ML**: Custom RAG Pipeline (Sentence Transformers + ChromaDB/FAISS concept)
*   **Data**: Curated "Golden Dataset" ensuring 100% accuracy for demo topics (Murder, Theft, Defamation).

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/WillyEverGreen/TSEC_LEGAL_AI.git
    cd TSEC_LEGAL_AI
    ```

2.  **Install Frontend & Node dependencies**
    ```bash
    npm install
    cd server
    npm install
    cd ..
    ```

3.  **Install RAG dependencies**
    ```bash
    cd rag_service
    pip install -r requirements.txt
    cd ..
    ```

### Running the App

Run all services (Frontend + Backend + RAG) with a single command:

```bash
npm run dev:all
```

The app will launch at `http://localhost:5173`.

## 📜 Demo Scenarios (Try these!)
1.  **"What is the punishment for murder?"** (Checks IPC vs BNS mapping)
2.  **"Someone stole my wallet on the train."** (Neutral Analysis)
3.  **"Draft a defense for a defamation case."** (Generate Arguments Mode)
