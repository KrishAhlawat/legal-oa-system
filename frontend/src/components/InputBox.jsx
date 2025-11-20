import React from 'react';
import './InputBox.css';

function InputBox({ question, setQuestion, onSubmit, loading, onReset }) {
  return (
    <div className="input-box-container">
      <form onSubmit={onSubmit} className="input-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a legal question (e.g., What is negligence in tort law?)"
            className="input-field"
            disabled={loading}
          />
          <div className="button-group">
            <button
              type="submit"
              className="submit-button"
              disabled={loading || !question.trim()}
            >
              {loading ? 'Searching...' : 'Ask'}
            </button>
            {question && !loading && (
              <button
                type="button"
                onClick={onReset}
                className="reset-button"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default InputBox;
