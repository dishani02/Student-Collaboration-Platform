
import React from 'react';

const Avatar = ({ 
  src, 
  alt = 'User avatar', 
  size = 'md', 
  className = '',
  role = 'student' // used for border color if needed
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl'
  };

  const roleColors = {
    student: 'border-blue-200',
    expert: 'border-amber-200',
    lecturer: 'border-primary-200',
    admin: 'border-red-200'
  };

  const initials = alt
    ? alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const baseClasses = `relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 border-2 ${roleColors[role] || roleColors.student} ${sizeClasses[size] || sizeClasses.md} ${className}`;

  if (src) {
    return (
      <div className={baseClasses}>
        <img 
          src={src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${src}`} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <span className="hidden w-full h-full items-center justify-center font-bold text-gray-500 bg-gray-100">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <span className="font-bold text-gray-500 bg-gray-100 uppercase">
        {initials}
      </span>
    </div>
  );
};

export default Avatar;
