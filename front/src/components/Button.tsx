import type { ButtonHTMLAttributes } from "react";

interface TButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

export default function Button({
  loading,
  disabled,
  children,
  className,
  ...props
}: TButton) {
  return (
    <button
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 px-5 py-2 rounded transition-colors disabled:opacity-50 ${className ?? ""}`}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
