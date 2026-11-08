import * as React from "react";
import { cn } from "../cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labelled input; label is required for WCAG 2.1 AA. */
export function Input({ id, label, hint, error, className, ...props }: InputProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  const errorId = inputId + "-error";
  const hintId = inputId + "-hint";
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-md border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-ring",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
