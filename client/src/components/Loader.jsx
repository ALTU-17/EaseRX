// src/components/Loader.jsx
import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col items-center justify-center z-50">
      <div className="relative w-32 h-32 mb-8">
        {/* Rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-ping" />
        
        {/* Tooth icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-16 h-16 text-teal-600 animate-bounce" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            style={{ animationDuration: '1.5s' }}
          >
            <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1 4.5 2 6.5V17c0 1.5 1 2.5 2.5 2.5.5 0 1-.1 1.5-.4.5.3 1 .4 1.5.4 1.5 0 2.5-1 2.5-2.5v-2.5c1-2 2-4 2-6.5 0-3.5-2.5-6-6-6zm-2 17c0 .8-.7 1.5-1.5 1.5S7 19.8 7 19v-2h3v2zm7 0c0 .8-.7 1.5-1.5 1.5S14 19.8 14 19v-2h3v2z" />
          </svg>
        </div>
        
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-teal-400 animate-orbit"
            style={{
              animation: `orbit 2s linear infinite`,
              animationDelay: `${i * 0.66}s`,
              top: '50%',
              left: '50%',
            }}
          />
        ))}
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-800 mb-2 animate-pulse">
          EaseRX
        </h1>
        <p className="text-teal-600 text-sm">Preparing your practice...</p>
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-teal-100 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full animate-loading" />
      </div>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(40px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(40px) rotate(-360deg);
          }
        }
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-orbit {
          animation: orbit 2s linear infinite;
        }
        .animate-loading {
          animation: loading 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}