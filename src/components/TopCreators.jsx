import { Link } from 'react-router-dom'

const REACTION_BADGES = {
  love: { label: 'Love', emoji: '❤️', color: 'bg-pink-100 text-pink-700' },
  cool: { label: 'Cool', emoji: '🔥', color: 'bg-orange-100 text-orange-700' },
  inspiring: { label: 'Inspiring', emoji: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  wow: { label: 'Wow', emoji: '🤩', color: 'bg-amber-100 text-amber-700' },
  funny: { label: 'Funny', emoji: '😂', color: 'bg-green-100 text-green-700' },
}

function getTopBadge(creator) {
  // Try reactions_breakdown first (API data)
  if (creator.reactions_breakdown) {
    const breakdown = creator.reactions_breakdown
    let topType = 'love'
    let topCount = 0
    for (const [type, count] of Object.entries(breakdown)) {
      if (count > topCount) {
        topType = type
        topCount = count
      }
    }
    return REACTION_BADGES[topType] || REACTION_BADGES.love
  }
  // Fallback for dummy data with badge index
  if (creator.badge !== undefined) {
    const keys = Object.keys(REACTION_BADGES)
    return REACTION_BADGES[keys[creator.badge % keys.length]] || REACTION_BADGES.love
  }
  return REACTION_BADGES.love
}

function AvatarCircle({ name, size = 'w-10 h-10', ring = '' }) {
  const initials = (name || '?').charAt(0).toUpperCase()
  const colors = [
    'bg-pink-300', 'bg-purple-300', 'bg-blue-300', 'bg-green-300',
    'bg-yellow-300', 'bg-orange-300', 'bg-cyan-300', 'bg-rose-300',
  ]
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0

  return (
    <div className={`${size} rounded-full ${colors[colorIdx]} flex items-center justify-center font-bold text-white shrink-0 ${ring}`}>
      {initials}
    </div>
  )
}

function Badge({ creator }) {
  const b = getTopBadge(creator)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${b.color}`}>
      {b.emoji} {b.label}
    </span>
  )
}

function TopCreators({ creators = [], tab = 'week', onTabChange }) {
  const sorted = [...creators]
    .sort((a, b) => (b.total_reactions ?? b.score ?? 0) - (a.total_reactions ?? a.score ?? 0))
    .slice(0, 10)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)
  const maxScore = (sorted[0]?.total_reactions ?? sorted[0]?.score) || 1

  const getScore = (c) => c.total_reactions ?? c.score ?? 0
  const getName = (c) => c.learner_name ?? c.name ?? 'Unknown'
  const getSubtitle = (c) => c.course_name ?? c.subtitle ?? 'Creator'

  // Podium order: #2 left, #1 center, #3 right
  const podium = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <aside className="custom-scrollbar w-72 shrink-0 m-4 bg-gradient-to-b from-yellow-200 via-white to-yellow-200 rounded-tl-3xl rounded-tr-3xl p-4 pt-5 flex flex-col gap-4 overflow-y-auto border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
          🏆 Top Creators
        </h2>
        {onTabChange && (
          ""
          // <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-semibold">
          //   <button
          //     onClick={() => onTabChange('week')}
          //     className={`px-3 py-1 rounded-full transition-colors ${tab === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          //   >
          //     This Week
          //   </button>
          //   <button
          //     onClick={() => onTabChange('all')}
          //     className={`px-3 py-1 rounded-full transition-colors ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          //   >
          //     All Time
          //   </button>
          // </div>
        )}
      </div>

      {creators.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No creators data available</p>
      )}

      {/* Podium - Top 3 */}
      {podium.length >= 3 && (
        <div className="flex items-end justify-center gap-2 pt-2 pb-3">
          {/* #2 */}
          <div className="flex flex-col items-center w-20">
            <span className="text-xs font-bold text-gray-500 mb-1">#2</span>
            <AvatarCircle name={getName(podium[0])} size="w-12 h-12" ring="ring-2 ring-gray-300" />
            <p className="text-xs font-bold text-gray-900 mt-1 truncate w-full text-center">{getName(podium[0])}</p>
            <Badge creator={podium[0]} />
            <p className="text-sm font-bold text-gray-700 mt-0.5">❤️ {getScore(podium[0])}</p>
          </div>

          {/* #1 */}
          <div className="flex flex-col items-center w-24 -mt-4">
            <span className="text-sm">👑</span>
            <AvatarCircle name={getName(podium[1])} size="w-16 h-16" ring="ring-3 ring-brand-yellow" />
            <p className="text-sm font-bold text-gray-900 mt-1 truncate w-full text-center">{getName(podium[1])}</p>
            <Badge creator={podium[1]} />
            <p className="text-base font-bold text-gray-900 mt-0.5">🔥 {getScore(podium[1])}</p>
          </div>

          {/* #3 */}
          <div className="flex flex-col items-center w-20">
            <span className="text-xs font-bold text-gray-500 mb-1">#3</span>
            <AvatarCircle name={getName(podium[2])} size="w-12 h-12" ring="ring-2 ring-orange-300" />
            <p className="text-xs font-bold text-gray-900 mt-1 truncate w-full text-center">{getName(podium[2])}</p>
            <Badge creator={podium[2]} />
            <p className="text-sm font-bold text-gray-700 mt-0.5">⭐ {getScore(podium[2])}</p>
          </div>
        </div>
      )}

      {/* Divider + Column labels */}
      {rest.length > 0 && (
        <div className="border-t border-gray-200 pt-2">
          <div className="grid grid-cols-[32px_1fr_auto] gap-2 px-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            <span>Rank</span>
            <span>Creator</span>
            <span className="text-right">Reactions</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2">
            {rest.map((creator, i) => {
              const rank = i + 4
              const score = getScore(creator)
              const barWidth = Math.max(10, Math.round((score / maxScore) * 100))
              const barColors = ['bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400']
              const barColor = barColors[i % barColors.length]

              return (
                <div
                  key={creator.learner_uid || rank}
                  className="grid grid-cols-[32px_1fr_auto] gap-2 items-center bg-white rounded-xl px-2 py-2 border border-gray-100 shadow-sm"
                >
                  <span className="text-sm font-bold text-gray-500 text-center">#{rank}</span>

                  <div className="flex items-center gap-2 min-w-0">
                    {/* <AvatarCircle name={getName(creator)} size="w-8 h-8" /> */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{getName(creator)}</p>
                      <p className="text-[10px] text-gray-500 truncate">{getSubtitle(creator)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 w-16 mr-2">
                    {/* <Badge creator={creator} /> */}
                    {/* <div className="flex items-center gap-1 w-full">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div> */}
                      <span className="text-[15px] font-bold text-gray-600">{score}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* View All Projects */}
        {/* <Link
          to="/"
          className="mt-auto bg-brand-yellow text-gray-900 font-bold text-sm px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity flex items-center justify-between"
        >
          <span>View All Projects</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link> */}
    </aside>
  )
}

export default TopCreators
