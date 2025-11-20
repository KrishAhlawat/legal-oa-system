import React from 'react';
import './AnswerCard.css';

function AnswerCard({ answer }) {
  return (
    <div className="answer-card">
      <div className="answer-header">
        <h2 className="answer-title">🤖 AI Generated Answer</h2>
      </div>
      <div className="answer-content">
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default AnswerCard;
