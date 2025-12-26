import { useEffect } from "react";
import SearchBar from "./SearchBar";
import { useProfileStore } from "../store/useProfileStore";

const SearchUsers = () => {

  const { getUserByName, setSearchUsersNone, query, setQuery } = useProfileStore();

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        getUserByName(query);
      }else{
        setSearchUsersNone();
      }
    }, 100);

    return () => clearTimeout(delay);
  }, [getUserByName, query, setSearchUsersNone]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        onClear={() => setQuery("")}
        placeholder="Search by username"
      />

      {query ? (
        <p className="text-sm text-gray-500">
          Searching for <span className="font-semibold">{query}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400">Start typing to search</p>
      )}
    </div>
  );
};

export default SearchUsers;
