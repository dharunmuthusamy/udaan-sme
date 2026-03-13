import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = "", label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all group ${className}`}
      aria-label="Go back"
    >
      <svg 
        className="h-5 w-5 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {label}
    </button>
  );
}
