import React from 'react';

export default function AILogo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="aiTutorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id="aiTutorGradInner" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagon Base representing structured knowledge */}
      <path 
        d="M60 10 L103.3 35 L103.3 85 L60 110 L16.7 85 L16.7 35 Z" 
        fill="url(#aiTutorGrad)" 
        fillOpacity="0.15" 
        stroke="url(#aiTutorGrad)" 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />

      {/* Inner Hexagon representing AI core */}
      <path 
        d="M60 25 L86 40 L86 70 L60 85 L34 70 L34 40 Z" 
        fill="url(#aiTutorGradInner)" 
        filter="url(#glow)"
      />

      {/* Network Nodes representing neural connections & learning */}
      <circle cx="60" cy="55" r="8" fill="white" />
      <circle cx="45" cy="40" r="4" fill="white" fillOpacity="0.8" />
      <circle cx="75" cy="40" r="4" fill="white" fillOpacity="0.8" />
      <circle cx="45" cy="70" r="4" fill="white" fillOpacity="0.8" />
      <circle cx="75" cy="70" r="4" fill="white" fillOpacity="0.8" />
      <circle cx="60" cy="25" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="60" cy="85" r="3" fill="white" fillOpacity="0.6" />

      {/* Connecting Lines */}
      <path d="M48 43 L57 52" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 43 L63 52" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 67 L57 58" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 67 L63 58" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 30 L60 45" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M60 80 L60 65" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M45 46 L45 64" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M75 46 L75 64" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  );
}
