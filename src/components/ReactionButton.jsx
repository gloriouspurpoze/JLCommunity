import { useState, useEffect, useRef } from 'react'
import { reactions as reactionsService } from '../services'

function spawnParticles(container, emoji) {
  const count = 8
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span')
    span.textContent = emoji
    span.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: ${14 + Math.random() * 10}px;
      pointer-events: none;
      z-index: 50;
      opacity: 1;
    `

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6
    const dist = 30 + Math.random() * 40
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 20 // bias upward
    const dur = 500 + Math.random() * 300

    span.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy * 1.3 + 15}px)) scale(0.6)`, opacity: 0 },
      ],
      { duration: dur, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' }
    )

    container.appendChild(span)
    setTimeout(() => span.remove(), dur + 50)
  }
}

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
  const btnRef = useRef(null)

  useEffect(() => {
    setLocalCount(count)
    setLocalActive(isActive)
  }, [count, isActive, projectId])

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (isProcessing || localActive) return

    // Fire particles
    if (btnRef.current) {
      spawnParticles(btnRef.current, emoji)
    }

    const previousCount = localCount
    const previousActive = localActive

    setLocalCount(prev => prev + 1)
    setLocalActive(true)
    setIsProcessing(true)

    try {
      await reactionsService.createOrUpdateReaction({
        project_id: projectId,
        reaction_type: reactionType,
      })

      if (onReactionUpdate) {
        onReactionUpdate(reactionType)
      }
    } catch (error) {
      setLocalCount(previousCount)
      setLocalActive(previousActive)
      console.error('Reaction failed:', error.getUserMessage?.() || error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isProcessing || localActive}
      className={`
        relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        transition-all shadow-sm overflow-visible
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
