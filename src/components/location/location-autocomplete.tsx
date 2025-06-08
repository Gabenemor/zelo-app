"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  onLocationSelect: (location: { address: string; lat?: number; lng?: number }) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

// Mock Nigerian locations for autocomplete
const mockNigerianLocations = [
  "Lagos, Ikeja", "Lagos, Victoria Island", "Lagos, Surulere", "Lagos, Lekki",
  "Abuja, Garki", "Abuja, Wuse", "Abuja, Maitama", "Abuja, Asokoro",
  "Port Harcourt, GRA", "Port Harcourt, Rumuokoro",
  "Ibadan, Bodija", "Ibadan, Challenge",
  "Kano, Fagge", "Kano, Nassarawa",
  "Enugu, Independence Layout",
  "Kaduna, Tudun Wada",
  // Add more common Nigerian towns/areas
];

export function LocationAutocomplete({ 
  onLocationSelect, 
  initialValue = "",
  placeholder = "Enter a Nigerian location (e.g., Ikeja, Lagos)",
  className 
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filteredSuggestions = mockNigerianLocations.filter(
        location => location.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (location: string) => {
    setQuery(location);
    setShowSuggestions(false);
    // In a real implementation with Google Maps API, you'd get lat/lng here
    onLocationSelect({ address: location }); 
  };

  return (
    <div className={cn("relative w-full", className)} ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10"
          autoComplete="off"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="cursor-pointer select-none px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
