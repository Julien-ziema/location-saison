"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PhotosFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function PhotosField({ value, onChange }: PhotosFieldProps) {
  const [inputValue, setInputValue] = useState("");

  function handleAdd() {
    const url = inputValue.trim();
    if (url && !value.includes(url)) {
      onChange([...value, url]);
      setInputValue("");
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://exemple.com/photo.jpg"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((url, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
            >
              <span className="flex-1 truncate text-slate-600">{url}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="shrink-0 text-slate-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
