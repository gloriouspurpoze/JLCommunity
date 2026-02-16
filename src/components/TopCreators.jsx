// Default dummy data (fallback when no props provided)
const defaultCreators = [
  { name: 'Alice', score: 56 },
  { name: 'Bob', score: 54 },
  { name: 'Claire', score: 35 },
  { name: 'David', score: 31 },
]

function TopCreators({ creators = defaultCreators }) {
  return (
    <aside className="w-64 shrink-0 bg-brand-yellow rounded-t-2xl p-5 m-5 mb-0 flex flex-col gap-5 overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900">Top Creators</h2>

      <div className="flex flex-col gap-4">
        {creators.length > 0 ? (
          creators.map((creator, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0" />

              <span className="flex-1 text-base font-semibold text-gray-900 truncate">
                {creator.name}
              </span>

              <span className="text-xl font-bold text-gray-900">{creator.score}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No creators available</p>
        )}
      </div>
    </aside>
  )
}

export default TopCreators
