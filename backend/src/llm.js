import OpenAI from 'openai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

// Initialize clients
let openaiClient = null;
let groqClient = null;

if (LLM_PROVIDER === 'openai') {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found in .env file');
  } else {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
  }
} else if (LLM_PROVIDER === 'groq') {
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not found in .env file');
  } else {
    try {
      groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      console.log('✅ Groq client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Groq client:', error.message);
    }
  }
}

/**
 * Construct RAG prompt with retrieved context
 * @param {Array} retrievedDocs - Array of retrieved documents
 * @param {string} question - User's question
 * @returns {string} Formatted prompt
 */
function constructRAGPrompt(retrievedDocs, question) {
  const context = retrievedDocs
    .map((doc, index) => `[Document ${index + 1}]:\n${doc.text}`)
    .join('\n\n');
  
  return `You are a legal expert assistant. Use ONLY the following retrieved paragraphs to answer the user's question. If the answer cannot be found in the provided context, say so clearly.

<context>
${context}
</context>

Question: ${question}

Please provide a clear, accurate answer based solely on the information provided above.`;
}

/**
 * Call OpenAI API for answer generation
 */
async function callOpenAI(prompt) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful legal assistant that answers questions based on provided legal documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw new Error(`OpenAI API failed: ${error.message}`);
  }
}

/**
 * Call Groq API for answer generation
 */
async function callGroq(prompt) {
  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful legal assistant that answers questions based on provided legal documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error.message);
    if (error.message.includes('connect') || error.message.includes('network')) {
      throw new Error('Failed to connect to Groq API. Please check your internet connection and API key.');
    }
    throw new Error(`Groq API failed: ${error.message}`);
  }
}

/**
 * Generate answer using LLM with RAG context
 * @param {Array} retrievedDocs - Array of retrieved documents
 * @param {string} question - User's question
 * @returns {Promise<string>} Generated answer
 */
export async function generateAnswer(retrievedDocs, question) {
  // Construct RAG prompt
  const prompt = constructRAGPrompt(retrievedDocs, question);
  
  console.log(`🤖 Generating answer using ${LLM_PROVIDER.toUpperCase()}...`);
  
  // Call appropriate LLM based on provider
  let answer;
  if (LLM_PROVIDER === 'openai') {
    if (!openaiClient) {
      throw new Error('OpenAI client not initialized. Check your API key.');
    }
    answer = await callOpenAI(prompt);
  } else if (LLM_PROVIDER === 'groq') {
    if (!groqClient) {
      throw new Error('Groq client not initialized. Check your API key.');
    }
    answer = await callGroq(prompt);
  } else {
    throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`);
  }
  
  console.log(`✅ Answer generated successfully`);
  return answer;
}

/**
 * Check if LLM is properly configured
 */
export function isLLMConfigured() {
  if (LLM_PROVIDER === 'openai') {
    return openaiClient !== null;
  } else if (LLM_PROVIDER === 'groq') {
    return groqClient !== null;
  }
  return false;
}
