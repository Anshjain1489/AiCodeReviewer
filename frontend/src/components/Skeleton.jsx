import React from 'react';

const Skeleton = ({ className = '', variant = 'text', count = 1 }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'rounded-xl h-32 w-full';
      case 'button':
        return 'rounded-lg h-9 w-24';
      case 'table-row':
        return 'rounded-md h-12 w-full';
      case 'title':
        return 'rounded-md h-7 w-2/3';
      case 'text':
      default:
        return 'rounded-md h-4 w-full';
    }
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`bg-dark-surface/80 border border-dark-border/50 relative overflow-hidden shimmer-effect ${getVariantStyles()} ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      ))}
    </>
  );
};

export default Skeleton;
