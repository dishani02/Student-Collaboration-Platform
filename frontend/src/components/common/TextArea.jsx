
import React from 'react';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  helperText,
  className = '',
  required = false,
  disabled = false,
}) => {
  const baseClasses = "w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none shadow-sm";
  const stateClasses = error 
    ? "border-red-500 bg-red-50" 
    : "border-gray-200 hover:border-gray-300";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : "";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-bold text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
      />

      {error ? (
        <p className="text-xs font-semibold text-red-500 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export default TextArea;
