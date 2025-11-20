# ⚖️ RAG Legal QA System

A sophisticated Retrieval-Augmented Generation (RAG) system for answering legal questions using TF-IDF document retrieval and Large Language Models (OpenAI/Groq).

## 🎯 Project Overview

This system combines traditional information retrieval techniques (TF-IDF) with modern Large Language Models to provide accurate, context-aware answers to legal questions. The system retrieves relevant legal documents and uses them as context for the LLM to generate precise answers.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + Vite Frontend)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─ POST /api/ask { question }
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      EXPRESS SERVER                             │
│                      (Node.js Backend)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
┌───────────▼───────────┐          ┌─────────▼──────────┐
│  RETRIEVAL MODULE     │          │   LLM MODULE       │
│  (TF-IDF + Cosine)    │          │  (OpenAI/Groq)     │
│                       │          │                    │
│  1. Load Documents    │          │  1. Construct      │
│  2. Build TF-IDF      │          │     RAG Prompt     │
│  3. Calculate Scores  │─────────▶│  2. Call LLM API   │
│  4. Return Top K      │          │  3. Return Answer  │
└───────────┬───────────┘          └────────────────────┘
            │
            │
┌───────────▼───────────┐
│  LEGAL DOCUMENTS      │
│  (.txt files)         │
│                       │
│  - contract_law.txt   │
│  - tort_law.txt       │
│  - criminal_law.txt   │
│  - property_law.txt   │
│  - constitutional.txt │
└───────────────────────┘
```

## 🔍 How TF-IDF + Cosine Similarity Work

### TF-IDF (Term Frequency-Inverse Document Frequency)

**TF-IDF** is a numerical statistic that reflects how important a word is to a document in a collection of documents.

**Formula:**
- **TF (Term Frequency):** How often a term appears in a document
  ```
  TF(t, d) = (Number of times term t appears in document d) / (Total terms in document d)
  ```

- **IDF (Inverse Document Frequency):** How rare/common a term is across all documents
  ```
  IDF(t) = log(Total number of documents / Number of documents containing term t)
  ```

- **TF-IDF Score:**
  ```
  TF-IDF(t, d) = TF(t, d) × IDF(t)
  ```

**Example:**
- Common words like "the", "is", "and" have low IDF (appear in many documents)
- Specific terms like "negligence", "tort", "contract" have high IDF (appear in fewer documents)
- This helps identify documents that are truly relevant to specific legal concepts

### Cosine Similarity

**Cosine Similarity** measures the similarity between two vectors by calculating the cosine of the angle between them.

**Formula:**
```
cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product of vectors A and B
- ||A|| = magnitude of vector A
- ||B|| = magnitude of vector B
```

**Range:** 0 to 1
- **0** = completely dissimilar
- **1** = identical

**How it works in our system:**
1. Convert user question → TF-IDF vector
2. Each document has its own TF-IDF vector
3. Calculate cosine similarity between question vector and each document vector
4. Sort documents by similarity score
5. Return top 2-3 most relevant documents

## 🔄 RAG Flow

```
1. USER ASKS QUESTION
   "What is negligence in tort law?"
   
2. TF-IDF RETRIEVAL
   ├─ Convert question to TF-IDF vector
   ├─ Calculate cosine similarity with all documents
   ├─ Score: tort_law.txt (0.89), criminal_law.txt (0.12), ...
   └─ Return top 3 documents
   
3. CONTEXT CONSTRUCTION
   Create prompt:
   "Use ONLY the following retrieved paragraphs:
    [Document 1]: <tort_law.txt content>
    [Document 2]: <contract_law.txt content>
    Question: What is negligence in tort law?"
   
4. LLM GENERATION
   ├─ Send prompt to OpenAI/Groq
   ├─ Model: gpt-4o-mini or mixtral-8x7b
   └─ Generate answer using ONLY provided context
   
5. RETURN RESPONSE
   {
     "answer": "Negligence occurs when...",
     "sources": [
       { "text": "...", "filename": "tort_law.txt", "score": 0.89 },
       { "text": "...", "filename": "contract_law.txt", "score": 0.34 }
     ]
   }
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key** OR **Groq API Key**

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy example env file
   cp .env.example .env
   ```

4. **Edit `.env` file:**
   ```env
   # Choose your LLM provider
   LLM_PROVIDER=openai
   # LLM_PROVIDER=groq
   
   # Add your API key
   OPENAI_API_KEY=sk-your-key-here
   # OR
   GROQ_API_KEY=your-groq-key-here
   
   PORT=5000
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

### Accessing the Application

1. Open your browser and go to: `http://localhost:3000`
2. Enter a legal question (e.g., "What is negligence?")
3. Click "Ask" to get AI-generated answers with source documents

## 📁 Project Structure

```
legal-oa-system/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server & API routes
│   │   ├── retrieve.js       # TF-IDF + Cosine similarity logic
│   │   └── llm.js            # OpenAI/Groq LLM integration
│   ├── documents/
│   │   ├── contract_law.txt
│   │   ├── tort_law.txt
│   │   ├── criminal_law.txt
│   │   ├── property_law.txt
│   │   └── constitutional_law.txt
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── InputBox.jsx      # Question input component
    │   │   ├── InputBox.css
    │   │   ├── AnswerCard.jsx    # AI answer display
    │   │   ├── AnswerCard.css
    │   │   ├── SourceCard.jsx    # Retrieved sources display
    │   │   └── SourceCard.css
    │   ├── App.jsx               # Main application
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .gitignore
```

## 🔧 API Reference

### POST `/api/ask`

Ask a legal question and receive an AI-generated answer with sources.

**Request Body:**
```json
{
  "question": "What is consideration in contract law?"
}
```

**Response:**
```json
{
  "answer": "Consideration is something of value exchanged between parties...",
  "sources": [
    {
      "text": "Contract law governs agreements between parties...",
      "filename": "contract_law.txt",
      "score": 0.8234
    },
    {
      "text": "Property law governs ownership...",
      "filename": "property_law.txt",
      "score": 0.2341
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Invalid request",
  "message": "Question is required and must be a non-empty string"
}
```

### GET `/api/health`

Check server health and configuration status.

**Response:**
```json
{
  "status": "ok",
  "llmConfigured": true,
  "timestamp": "2025-11-21T12:34:56.789Z"
}
```

## 🎨 Frontend Features

- **Beautiful gradient UI** inspired by case-law-search project
- **Real-time loading states** with spinner animation
- **Error handling** with user-friendly messages
- **Responsive design** for mobile and desktop
- **Clear/Reset functionality** to start new queries
- **Source highlighting** with relevance scores
- **Smooth animations** and hover effects

## 🧪 Example Questions to Try

1. "What is negligence in tort law?"
2. "What are the elements of a valid contract?"
3. "What is the difference between felony and misdemeanor?"
4. "What is fee simple absolute in property law?"
5. "What does the First Amendment protect?"

## 🔐 Security Notes

- **Never commit `.env` files** with real API keys
- API keys are stored server-side only
- Frontend makes requests through backend proxy
- Input validation on both frontend and backend

## 📊 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **natural** - TF-IDF implementation
- **OpenAI SDK** - GPT-4o-mini integration
- **Groq SDK** - Mixtral-8x7b integration
- **dotenv** - Environment configuration
- **cors** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

## 🚧 Future Enhancements

- [ ] Add more legal documents and categories
- [ ] Implement vector database (Pinecone, Weaviate)
- [ ] Add semantic search with embeddings
- [ ] User authentication and query history
- [ ] Export answers as PDF
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Citation tracking and references

## 📝 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Built with ❤️ for legal professionals and AI enthusiasts**
