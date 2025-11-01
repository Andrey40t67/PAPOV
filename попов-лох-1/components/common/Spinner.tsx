import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 gap-1',
    md: 'h-6 gap-1.5',
    lg: 'h-10 gap-2',
  };
  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <div className={`animate-pulse-fast ${dotSizeClasses[size]} bg-slate-400 rounded-full`} style={{ animationDelay: '0s' }}></div>
      <div className={`animate-pulse-fast ${dotSizeClasses[size]} bg-slate-400 rounded-full`} style={{ animationDelay: '0.1s' }}></div>
      <div className={`animate-pulse-fast ${dotSizeClasses[size]} bg-slate-400 rounded-full`} style={{ animationDelay: '0.2s' }}></div>
      <style>{`
        @keyframes pulse-fast {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.0); opacity: 1; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1.2s infinite ease-in-out both;
        }
      `}</style>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;