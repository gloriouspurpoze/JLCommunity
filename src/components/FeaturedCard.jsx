import { Link } from 'react-router-dom'
import { getDriveThumbnail } from '../utils/thumbnails'

function FeaturedCard({ id, title, category, emoji, likes, comments, videoUrl }) {
  const thumbnailUrl = getDriveThumbnail(videoUrl, 400)
  
  // Debug log
  if (videoUrl) {
    console.log('🌟 Featured project:', title, '| Thumbnail:', thumbnailUrl)
  }

  return (
    <Link
      to={`/project/${id || 'demo'}`}
      className="bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Video thumbnail or placeholder */}
      <div className="relative bg-gray-200 w-full h-32 sm:h-36 lg:h-40 rounded-t-2xl overflow-hidden">
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={title || 'Project preview'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.log('❌ Featured image failed:', thumbnailUrl)
                e.target.style.display = 'none'
                const parent = e.target.parentElement
                const placeholder = parent?.querySelector('.fallback-placeholder')
                if (placeholder) placeholder.style.display = 'flex'
              }}
            />
            <div className="fallback-placeholder w-full h-full flex items-center justify-center text-gray-400" style={{ display: 'none' }}>
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 sm:pb-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
          {title || 'Project Title'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {category || 'Category'}
        </p>

        {/* Reaction + comment badges */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 mt-auto pt-2">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 bg-gray-100 rounded-md px-1.5 sm:px-2 py-0.5">
            {emoji || '❤️'}<span className="font-semibold">{likes ?? 0}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 bg-gray-100 rounded-md px-1.5 sm:px-2 py-0.5">
            💬<span className="font-semibold">{comments ?? 0}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default FeaturedCard
