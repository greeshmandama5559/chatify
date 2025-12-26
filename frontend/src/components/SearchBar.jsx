import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, onClear, placeholder = "Search users..." }) => {
  return (
    <div className="relative w-full max-w-md">
      {/* Icon */}
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl
                   bg-white/80 dark:bg-zinc-900
                   border border-gray-300 dark:border-zinc-700
                   text-sm text-gray-800 dark:text-gray-100
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-all"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
