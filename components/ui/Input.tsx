import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-navy font-heading"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          "w-full rounded border bg-white px-3 py-2.5 text-sm text-slate",
          "placeholder:text-slate/50 outline-none transition",
          "focus:border-navy focus:ring-2 focus:ring-navy/20",
          error ? "border-red-400" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
