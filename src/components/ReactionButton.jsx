import { useState, useEffect } from 'react'
import { reactions as reactionsService } from '../services'

/**
 * Interactive reaction button with optimistic updates
 * Handles clicking, API submission, and rollback on failure
 */
function ReactionButton({ 
  projectId, 
  reactionType, 
  emoji, 
  count = 0, 
  isActive = false,
  onReactionUpdate 
}) {
  const [localCount, setLocalCount] = useState(count)
  const [isProcessing, setIsProcessing] = useState(false)
  const [localActive, setLocalActive] = useState(isActive)

  // Sync local state with props when they change (e.g., when navigating to a new project)
  useEffect(() => {
    setLocalCount(count)
    setLocalActive(isActive)
  }, [count, isActive, projectId])

  async function handleClick(e) {
    e.preventDefault() // Prevent navigation if inside a link
    e.stopPropagation()

    if (isProcessing) return

    // Store previous state for rollback
    const previousCount = localCount
    const previousActive = localActive

    // Optimistic update
    if (localActive) {
      // Already active - this would be a toggle off, but the API doesn't support that
      // For now, do nothing
      return
    }

    setLocalCount(prev => prev + 1)
    setLocalActive(true)
    setIsProcessing(true)

    try {
      await reactionsService.createOrUpdateReaction({
        project_id: projectId,
        reaction_type: reactionType,
      })

      // Success - notify parent if callback provided
      if (onReactionUpdate) {
        onReactionUpdate(reactionType)
      }
    } catch (error) {
      // Rollback optimistic update
      setLocalCount(previousCount)
      setLocalActive(previousActive)

      // Show error (use a toast library in production)
      console.error('Reaction failed:', error.getUserMessage?.() || error.message)
      
      // Optional: show inline error
      // setError(error.getUserMessage())
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing || localActive}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        transition-all shadow-sm
        ${localActive 
          ? 'bg-brand-yellow border-2 border-brand-orange scale-105 cursor-not-allowed' 
          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
        }
        ${isProcessing ? 'opacity-60 cursor-wait' : ''}
        ${localActive && !isProcessing ? 'opacity-100' : ''}
      `}
      title={localActive ? `You reacted with ${reactionType}` : `React with ${reactionType}`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="font-bold text-gray-900">{localCount}</span>
    </button>
  )
}

export default ReactionButton
