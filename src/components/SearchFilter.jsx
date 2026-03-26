import { useState, useEffect } from "react";

function SearchFilter({ books, onFilter, initialQuery = "" }) {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");

  const categories = [...new Set(books.map((b) => b.category))].sort();
  const authors = [...new Set(books.map((b) => b.author))].sort();

  useEffect(() => {
    const next = initialQuery || "";
    const t = setTimeout(() => setSearch(next), 0);
    return () => clearTimeout(t);
  }, [initialQuery]);

  useEffect(() => {
    let filtered = books;

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(lowerSearch) ||
        b.author.toLowerCase().includes(lowerSearch)
      );
    }

    if (category) {
      filtered = filtered.filter((b) => b.category === category);
    }

    if (author) {
      filtered = filtered.filter((b) => b.author === author);
    }

    onFilter(filtered);
  }, [search, category, author, books, onFilter]);

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setAuthor("");
  };

  return (
    <div className="search-filter">
      <h3>🔍 Search & Filter Books</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: 0, padding: "12px 14px" }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ margin: 0, padding: "12px 14px" }}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={author} onChange={(e) => setAuthor(e.target.value)} style={{ margin: 0, padding: "12px 14px" }}>
          <option value="">All Authors</option>
          {authors.map((aut) => (
            <option key={aut} value={aut}>{aut}</option>
          ))}
        </select>
        <button className="btn primary" onClick={handleReset} style={{ margin: 0 }}>Reset</button>
      </div>
    </div>
  );
}

export default SearchFilter;
