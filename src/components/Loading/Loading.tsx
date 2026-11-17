import React from 'react';
import './Loading.css';

/* Presentation only: a sun whose rays turn while a route or the auth check
   is genuinely loading. */
const Loading = () => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="sun-spinner" aria-hidden="true">
        <svg className="sun-rays" viewBox="0 0 72 72" fill="none" focusable="false">
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="36"
              y1="3"
              x2="36"
              y2="11"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 36 36)`}
            />
          ))}
        </svg>
        <span className="sun-core" />
      </div>
      <p>Loading</p>
    </div>
  );
};

export default Loading;
