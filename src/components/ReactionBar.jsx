import ReactionButton from './ReactionButton'

const REACTION_CONFIG = [
  { type: 'love', emoji: '💗', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'funny', emoji: '😂', label: 'Funny' },
  { type: 'inspiring', emoji: '⭐', label: 'Inspiring' },
  { type: 'cool', emoji: '🔥', label: 'Cool' },
]

/**
 * Reaction bar component - displays all available reactions
 * @param {number} projectId - Project ID for submitting reactions
 * @param {Object} counts - Reaction counts from API (reactions_breakdown: {love, wow, funny, inspiring, cool})
 * @param {Function} onReactionUpdate - Optional callback after successful reaction
 */
function ReactionBar({ projectId, counts = {}, onReactionUpdate }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {REACTION_CONFIG.map((reaction) => {
        const countKey = `${reaction.type}`
        const count = counts[countKey] || 0

        return (
          <ReactionButton
            key={reaction.type}
            projectId={projectId}
            reactionType={reaction.type}
            emoji={reaction.emoji}
            count={count}
            onReactionUpdate={onReactionUpdate}
          />
        )
      })}
    </div>
  )
}

export default ReactionBar
