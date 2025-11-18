import React from 'react';

interface BadgeProps {
  count: number;
  variant?: 'default' | 'active';
  size?: 'small' | 'medium';
}

const Badge: React.FC<BadgeProps> = ({ count, variant = 'default', size = 'small' }) => {
  if (count <= 0) return null;

  const sizeClasses = {
    small: 'w-5 h-5 text-xs',
    medium: 'w-6 h-6 text-sm'
  };

  const variantClasses = {
    default: 'bg-red-500 text-white',
    active: 'bg-red-600 text-white'
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center 
        rounded-full font-semibold 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ml-2
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge;