import "./SearchBox.css";
export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search-box">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
      />
    </div>
  );
}
