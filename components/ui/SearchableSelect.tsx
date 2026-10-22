"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  keywords?: string;
};

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
}

function optionMatches(option: SearchableSelectOption, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    option.label.toLowerCase().includes(needle) ||
    (option.keywords ?? "").toLowerCase().includes(needle)
  );
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  emptyMessage = "No matches",
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(
    null
  );

  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? "";
  const displayValue = open ? query : selectedLabel;

  const filtered = useMemo(() => {
    if (!open) return options;
    const trimmed = query.trim();
    if (!trimmed || trimmed.toLowerCase() === selectedLabel.toLowerCase()) {
      return options;
    }
    return options.filter((option) => optionMatches(option, query));
  }, [open, options, query, selectedLabel]);

  const updateMenuPosition = () => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const maxHeight = Math.min(240, Math.max(spaceBelow, spaceAbove, 120));
    const openAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
    setMenuRect({
      top: openAbove ? rect.top - maxHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const handle = () => updateMenuPosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open, filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(listId);
      if (menu?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, listId]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    const item = document.getElementById(`${listId}-option-${highlightIndex}`);
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open, listId]);

  const openMenu = () => {
    if (disabled) return;
    setQuery(selectedLabel);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const selectOption = (option: SearchableSelectOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[highlightIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={openMenu}
        onClick={openMenu}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cn(className, "pr-9")}
      />
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        size={14}
      />
      {open &&
        menuRect &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            className="fixed z-[200] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
            style={{
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              maxHeight: menuRect.maxHeight,
            }}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-xs font-medium text-slate-400">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightIndex;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-xs font-bold",
                      isHighlighted ? "bg-primary text-white" : isSelected ? "bg-slate-100 text-primary" : "text-primary"
                    )}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}
