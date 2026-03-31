"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AMENITIES_OPTIONS } from "@/lib/types/property";

interface AmenitiesFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function AmenitiesField({ value, onChange }: AmenitiesFieldProps) {
  function handleToggle(amenity: string, checked: boolean) {
    if (checked) {
      onChange([...value, amenity]);
    } else {
      onChange(value.filter((v) => v !== amenity));
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {AMENITIES_OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <Checkbox
            id={`amenity-${option.value}`}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) =>
              handleToggle(option.value, checked === true)
            }
          />
          <Label
            htmlFor={`amenity-${option.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
