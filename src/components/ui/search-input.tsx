import { Search } from "lucide-react";

export function SearchInput({
  ariaLabel,
  icon,
  placeholder,
}: {
  ariaLabel: string;
  icon?: React.ReactNode;
  placeholder: string;
}) {
  return (
    <label className="flex h-11 w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 text-muted shadow-sm">
      {icon ?? <Search size={16} />}
      <input
        type="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-soft"
      />
    </label>
  );
}
