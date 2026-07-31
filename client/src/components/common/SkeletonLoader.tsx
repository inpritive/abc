import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  type?: 'card' | 'table' | 'line';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  type = 'line',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <>
        {items.map((key) => (
          <div
            key={key}
            className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 p-4 space-y-3"
          >
            <div className="w-full h-48 rounded-xl animate-shimmer" />
            <div className="w-2/3 h-4 rounded animate-shimmer" />
            <div className="w-1/2 h-4 rounded animate-shimmer" />
            <div className="flex justify-between items-center pt-2">
              <div className="w-20 h-6 rounded animate-shimmer" />
              <div className="w-24 h-10 rounded-lg animate-shimmer" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-3">
        <div className="w-full h-10 rounded-lg animate-shimmer bg-slate-800/50" />
        {items.map((key) => (
          <div
            key={key}
            className="w-full h-16 rounded-xl animate-shimmer bg-slate-900/60"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((key) => (
        <div
          key={key}
          className={`h-4 rounded-md animate-shimmer ${className || 'w-full'}`}
        />
      ))}
    </>
  );
};
