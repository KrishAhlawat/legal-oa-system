import React, { useState } from 'react';
import axios from 'axios';
import InputBox from './components/InputBox';
import AnswerCard from './components/AnswerCard';
import SourceCard from './components/SourceCard';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const response = await axios.post('/api/ask', {
        question: question.trim()
      });

      setAnswer(response.data.answer);
      setSources(response.data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to get answer. Please check if the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setAnswer(null);
    setSources([]);
    setError(null);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Legal QA System</h1>
          <p className="subtitle">Ask legal questions and get AI-powered answers</p>
        </header>

        <InputBox
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          loading={loading}
          onReset={handleReset}
        />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Retrieving relevant documents and generating answer...</p>
          </div>
        )}

        {answer && !loading && (
          <>
            <AnswerCard answer={answer} />
            
            {sources.length > 0 && (
              <div className="sources-section">
                <h2 className="sources-title">📚 Retrieved Sources</h2>
                <div className="sources-grid">
                  {sources.map((source, index) => (
                    <SourceCard
                      key={index}
                      source={source}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
