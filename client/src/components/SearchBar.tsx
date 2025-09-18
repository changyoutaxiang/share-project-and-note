import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "搜索项目和任务...", 
  onSearch,
  onClear,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch?.(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Force immediate search on Enter
      onSearch?.(query);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 pr-9"
          data-testid="input-search"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {query && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-popover border rounded-md shadow-lg z-50">
          <p className="text-sm text-muted-foreground" data-testid="text-search-results">
            搜索: "{query}"
          </p>
        </div>
      )}
    </div>
  );
}