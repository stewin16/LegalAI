# LegalAI - AI-Powered Legal Assistant for Indian Law

<div align="center">

![LegalAI Logo](public/logo.jpg)

**Access 20+ AI-powered legal tools for Indian law**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[View Repository](https://github.com/stewin16/LegalAI) · [Documentation](#documentation) · [Report Bug](https://github.com/stewin16/LegalAI/issues)

</div>

---

## 🚀 Features

### Core AI Tools
- **Legal Chat Assistant** - Ask legal questions in natural language and get instant answers with case law citations
- **Document Drafter** - Generate legal documents (complaints, applications, notices) instantly
- **Document Summarizer** - Condense lengthy legal documents into actionable insights
- **IPC vs BNS Comparison** - Side-by-side analysis of Indian Penal Code and Bharatiya Nyaya Sanhita

### AI Analysis Tools
- **Case Outcome Predictor** - Predict likely case outcomes based on similar precedents
- **Legal Risk Analyzer** - Analyze risks in contracts and legal documents
- **Precedent Matcher** - Find similar case precedents from Indian courts

### Document Generation
- **FIR Complaint Generator** - Generate FIR complaint drafts with proper format
- **Consumer Complaint** - File consumer complaints easily
- **RTI Application Generator** - Generate RTI applications with templates

### Legal Guidance
- **Bail Eligibility Checker** - Check bail eligibility for various offenses
- **Section Finder** - Find relevant IPC/BNS sections for your case
- **Legal Cost Estimator** - Estimate legal proceedings costs
- **Lawyer Finder** - Locate lawyers in your area with maps and ratings
- **Legal Jargon Explainer** - Understand complex legal terminology

### Utilities
- **Legal Translation** - Translate legal documents between English and Hindi
- **Judgment Simplifier** - Simplify complex court judgments
- **Property Document Verifier** - Verify property documents

---

## 🛠️ Tech Stack

| Frontend | Backend | AI/ML |
|----------|---------|-------|
| React 18 | FastAPI | OpenRouter API |
| TypeScript | Python 3.11+ | Llama/Phi-3 Models |
| Vite 5 | uvicorn | LangChain |
| TailwindCSS | PostgreSQL | RAG Pipeline |
| Framer Motion | Redis | Vector Embeddings |
| Radix UI | | |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.11+ (for RAG service)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/stewin16/LegalAI.git
cd LegalAI

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

### Full Setup (with RAG Service)

```bash
# 1. Install frontend dependencies
npm install

# 2. Setup Python environment for RAG service
cd rag_service
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Run all services
npm run dev:all
```

---

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# OpenRouter API (for AI models)
OPENROUTER_API_KEY=your_openrouter_api_key

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/legalai

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stewin16/LegalAI)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build and deploy
npm run build
# Drag and drop the 'dist' folder to Netlify
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📁 Project Structure

```
LegalAI/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Base UI components (shadcn/ui)
│   │   └── ...          # Feature components
│   ├── pages/           # Page components
│   │   ├── tools/       # AI tool pages
│   │   └── ...          # Main pages
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── main.tsx         # App entry point
├── rag_service/         # Python RAG backend
│   ├── main.py          # FastAPI server
│   ├── models/          # AI model integrations
│   └── utils/           # Helper utilities
├── server/              # Node.js backend (optional)
└── scripts/             # Build/deployment scripts
```

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

LegalAI is an AI-powered informational tool and does not constitute legal advice. For complex legal matters, always consult a qualified legal professional. For free legal aid in India, visit [NALSA](https://nalsa.gov.in).

---

## 📞 Support

- **GitHub**: [stewin16/LegalAI](https://github.com/stewin16/LegalAI)
- **Issues**: [GitHub Issues](https://github.com/stewin16/LegalAI/issues)

---

<div align="center">

**Made with ❤️ in India**

🇮🇳 Empowering Citizens with Legal Knowledge 🇮🇳

</div>
