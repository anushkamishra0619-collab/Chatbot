function RecentQuestions({ questions, onSelect }) {
  return (
    <aside className="col-span-1 overflow-y-auto bg-zinc-800 p-4 text-left text-white">
      <h2 className="mb-3 font-semibold">Recent questions</h2>
      <ul className="space-y-2">
        {questions.map((item, index) => (
          <li key={`${item}-${index}`}>
            <button
              className="w-full truncate text-left hover:text-zinc-300"
              onClick={() => onSelect(item)}
              title={item}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default RecentQuestions
