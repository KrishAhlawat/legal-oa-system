import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TfIdf = natural.TfIdf;

// Initialize TF-IDF instance
let tfidf = null;
let documents = [];


// Load all documents from the documents folder and build TF-IDF corpus
export function loadDocuments() {
  const documentsPath = path.join(__dirname, '../documents');
  const files = fs.readdirSync(documentsPath).filter(file => file.endsWith('.txt'));
  
  tfidf = new TfIdf();
  documents = [];
  
  files.forEach(file => {
    const filePath = path.join(documentsPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Add document to TF-IDF corpus
    tfidf.addDocument(content);
    
    // Store document metadata
    documents.push({
      filename: file,
      text: content
    });
  });
  
  console.log(`✅ Loaded ${documents.length} documents into TF-IDF corpus`);
  return documents.length;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  keys.forEach(key => {
    const val1 = vec1[key] || 0;
    const val2 = vec2[key] || 0;
    
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Retrieve top K most relevant documents for a given query
 * @param {string} question - User's question
 * @param {number} topK - Number of documents to retrieve (default: 3)
 * @returns {Array} Array of top documents with similarity scores
 */
export function retrieveDocuments(question, topK = 3) {
  if (!tfidf || documents.length === 0) {
    throw new Error('Documents not loaded. Call loadDocuments() first.');
  }
  
  // Create TF-IDF vector for the query
  const queryTfidf = new TfIdf();
  queryTfidf.addDocument(question);
  
  // Get query vector as object
  const queryVector = {};
  queryTfidf.listTerms(0).forEach(item => {
    queryVector[item.term] = item.tfidf;
  });
  
  // Calculate similarity scores for each document
  const scores = documents.map((doc, index) => {
    // Get document vector
    const docVector = {};
    tfidf.listTerms(index).forEach(item => {
      docVector[item.term] = item.tfidf;
    });
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(queryVector, docVector);
    
    return {
      text: doc.text,
      filename: doc.filename,
      score: similarity
    };
  });
  
  // Sort by score (descending) and return top K
  const topDocuments = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  console.log(`📊 Retrieved ${topDocuments.length} documents for query: "${question}"`);
  topDocuments.forEach((doc, i) => {
    console.log(`   ${i + 1}. ${doc.filename} (score: ${doc.score.toFixed(4)})`);
  });
  
  return topDocuments;
}

/**
 * Initialize the retrieval system
 */
export function initializeRetrieval() {
  return loadDocuments();
}
