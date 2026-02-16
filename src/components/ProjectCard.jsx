import { Link } from 'react-router-dom'
import VideoPlayer from './VideoPlayer'

/**
 * Extract Google Drive file ID from various URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null
 */
function extractDriveFileId(url) {
  if (!url) return null

  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]

  return null
}

/**
 * Get Google Drive thumbnail URL from video link
 * @param {string} driveUrl - Full Google Drive URL
 * @returns {string} - Thumbnail URL
 */
function getDriveThumbnail(driveUrl) {
  const fileId = extractDriveFileId(driveUrl)
  if (!fileId) return null

  // Use Google's thumbnail service for high quality
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
}

function ProjectCard({ id, title, author, videoUrl }) {
  const thumbnailUrl = getDriveThumbnail(videoUrl)

  return (
    <Link
      to={`/project/${id || 'demo'}`}
      className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-shadow"
    >
      {/* Video thumbnail with play button overlay */}
      <div className="relative bg-gray-200 w-full h-24 sm:h-28 overflow-hidden">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title || 'Project preview'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* <VideoPlayer project={project} /> */}

      {/* Card body */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold text-gray-900 truncate">
          {title || 'Project Title'}
        </h3>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-300 shrink-0" />
          <span className="text-[10px] sm:text-xs text-gray-500 truncate">
            {author || 'Creator Name'}
          </span>
        </div>

        <span className="mt-1 self-start px-2.5 sm:px-3 py-1 text-[10px] font-semibold text-white bg-brand-orange rounded-full">
          See Inside
        </span>
      </div>
    </Link>
  )
}

export default ProjectCard
