import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeRetrieval, retrieveDocuments } from './retrieve.js';
import { generateAnswer, isLLMConfigured } from './llm.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://legal-qa-system.vercel.app', 'https://*.vercel.app']
    : '*',
  credentials: true
}));
app.use(express.json());

// Initialize retrieval system on startup
console.log('🚀 Initializing RAG Legal QA System...');
try {
  const docCount = initializeRetrieval();
  console.log(`📚 System ready with ${docCount} legal documents`);
} catch (error) {
  console.error('❌ Failed to initialize retrieval system:', error.message);
  process.exit(1);
}

// Check LLM configuration
if (!isLLMConfigured()) {
  console.error('❌ LLM not configured properly. Please check your .env file.');
  console.error('   Set either OPENAI_API_KEY or GROQ_API_KEY');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    llmConfigured: isLLMConfigured(),
    timestamp: new Date().toISOString()
  });
});

// Main RAG endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Question is required and must be a non-empty string'
      });
    }
    
    // Check LLM configuration
    if (!isLLMConfigured()) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'LLM is not configured. Please set API keys in .env file.'
      });
    }
    
    console.log(`\n📥 Received question: "${question}"`);
    
    // Step 1: Retrieve relevant documents using TF-IDF
    const retrievedDocs = retrieveDocuments(question, 3);
    
    // Check if we got any relevant documents
    if (retrievedDocs.length === 0 || retrievedDocs[0].score === 0) {
      return res.json({
        answer: "I couldn't find any relevant information in the legal documents to answer your question.",
        sources: []
      });
    }
    
    // Step 2: Generate answer using LLM with retrieved context
    const answer = await generateAnswer(retrievedDocs, question);
    
    // Step 3: Format and return response
    const response = {
      answer: answer,
      sources: retrievedDocs.map(doc => ({
        text: doc.text,
        filename: doc.filename,
        score: doc.score
      }))
    };
    
    console.log(`✅ Response sent successfully\n`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/ask`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
});
