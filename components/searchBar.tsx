import React, { useState } from 'react';


interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Buscar...', onSearch }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex border-1 border-gray-200 rounded-lg mb-5 shadow-sm">
      <input type="text" value={query} onChange={handleInputChange} placeholder={placeholder} className="w-full px-4 py-2 text-sm outline-none duration-150"/>
      <button type="submit" className="px-3 bg-gray-100 text-sm border-l-1 border-gray-200"><i className="bi bi-search"></i></button>
    </form>
  );
};

export default SearchBar;
