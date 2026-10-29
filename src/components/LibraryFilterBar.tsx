type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: "all" | "quiz" | "challenge" | "memory";
  setSelectedType: (value: "all" | "quiz" | "challenge" | "memory") => void;
};

export default function LibraryFilterBar({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
}: Props) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <input
        className="text-input"
        placeholder="Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ maxWidth: 260 }}
      />

      <select
        className="text-input"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as "all" | "quiz" | "challenge" | "memory")}
        style={{ maxWidth: 180 }}
      >
        <option value="all">All types</option>
        <option value="quiz">Quiz</option>
        <option value="challenge">Challenge</option>
        <option value="memory">Memory</option>
      </select>
    </div>
  );
}
