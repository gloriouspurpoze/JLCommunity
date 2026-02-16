function ReactionBadge({ emoji, label, count }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
      <span>{emoji}</span>
      <span>{label}</span>
      <span className="font-bold text-gray-800">{count}</span>
    </span>
  )
}

export default ReactionBadge
