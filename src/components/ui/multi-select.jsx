"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "./button";

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newValue = value.some(item => item.value === option.value)
      ? value.filter(item => item.value !== option.value)
      : [...value, option];
    onChange(newValue);
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter(item => item.value !== optionValue));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`min-h-10 border rounded-md bg-white p-2 flex flex-wrap gap-1 cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Selected items */}
        {value.length > 0 ? (
          <>
            {value.map((item) => (
              <div
                key={item.value}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeOption(item.value, e)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={disabled}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-xs text-gray-500 hover:text-gray-700 flex items-center"
              disabled={disabled}
            >
              Clear all
            </button>
          </>
        ) : (
          <span className={`text-gray-400 ${disabled ? 'opacity-50' : ''}`}>
            {placeholder}
          </span>
        )}
        
        {!disabled && (
          <ChevronDown 
            size={16} 
            className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
          {/* Search input */}
          {options.length > 5 && (
            <div className="p-2 border-b sticky top-0 bg-white">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border rounded text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div className="divide-y">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${value.some(item => item.value === option.value) ? "bg-blue-50" : ""}`}
                  onClick={() => toggleOption(option)}
                >
                  <span>{option.label}</span>
                  {value.some(item => item.value === option.value) && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-sm">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}