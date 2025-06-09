
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceSelectionChipsProps {
  availableServices: readonly string[];
  selectedServices: string[];
  onSelectedServicesChange: (services: string[]) => void;
  selectionType?: 'single' | 'multiple';
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
}

export function ServiceSelectionChips({
  availableServices,
  selectedServices,
  onSelectedServicesChange,
  selectionType = 'multiple',
  maxSelections,
  className,
  disabled = false,
}: ServiceSelectionChipsProps) {
  const handleSelect = (service: string) => {
    if (disabled) return;

    if (selectionType === 'single') {
      onSelectedServicesChange([service]);
    } else {
      const isCurrentlySelected = selectedServices.includes(service);
      let newSelectedServices;

      if (isCurrentlySelected) {
        newSelectedServices = selectedServices.filter((s) => s !== service);
      } else {
        // Check if adding a new service would exceed maxSelections
        if (maxSelections !== undefined && selectedServices.length >= maxSelections) {
          // Optionally, provide feedback (e.g., toast) that max selections reached.
          // For now, we just prevent adding more.
          return;
        }
        newSelectedServices = [...selectedServices, service];
      }
      onSelectedServicesChange(newSelectedServices);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {availableServices.map((service) => {
        const isSelected = selectedServices.includes(service);
        // Determine if the button should be disabled due to maxSelections limit
        // (only if trying to select a new item, not when unselecting)
        const isDisabledByMax =
          !isSelected &&
          selectionType === 'multiple' &&
          maxSelections !== undefined &&
          selectedServices.length >= maxSelections;

        return (
          <Button
            key={service}
            type="button"
            variant={isSelected ? "default" : "outline"}
            onClick={() => handleSelect(service)}
            disabled={disabled || isDisabledByMax}
            className={cn("h-auto py-2 px-4 text-sm", {
              "opacity-60 cursor-not-allowed": isDisabledByMax && !disabled,
            })}
            aria-pressed={isSelected}
          >
            {service}
          </Button>
        );
      })}
    </div>
  );
}
