import React from 'react';

export default function Card({ pattern, isPlaying, onToggle }) {
  return (
    <div
      className={`card${isPlaying ? ' is-playing' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={isPlaying}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="card-title">{pattern.title}</div>
      <div className="card-file">{pattern.file}</div>
      <div className="card-cta">{isPlaying ? '◼ STOP' : '▶ PLAY'}</div>
    </div>
  );
}
