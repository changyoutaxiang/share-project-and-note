import SearchBar from "../SearchBar";

export default function SearchBarExample() {
  return (
    <div className="max-w-md p-4">
      <SearchBar
        placeholder="搜索项目和任务..."
        onSearch={(query) => console.log("Search query:", query)}
        onClear={() => console.log("Search cleared")}
      />
    </div>
  );
}