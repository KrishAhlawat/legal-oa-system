import React from 'react';
import './SourceCard.css';

function SourceCard({ source, index }) {
  return (
    <div className="source-card">
      <div className="source-header">
        <span className="source-number">Source {index + 1}</span>
        <span className="source-filename">{source.filename}</span>
        {source.score !== undefined && (
          <span className="source-score">
            Relevance: {(source.score * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="source-content">
        <p>{source.text}</p>
      </div>
    </div>
  );
}

export default SourceCard;
