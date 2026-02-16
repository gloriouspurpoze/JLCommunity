import { useState, useEffect } from 'react'
import { getDriveEmbedUrl } from '../services/utils'

export default function VideoPlayer({ project }) {
  const [open, setOpen] = useState(false)
  const embedUrl = getDriveEmbedUrl(project?.project_video_recording)

  useEffect(() => {
    const esc = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => embedUrl && setOpen(true)}
        className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 relative cursor-pointer group shadow-lg"
      >
        <img
          src={project.thumbnail_url || '/video-placeholder.jpg'}
          alt={project.project_title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
          </svg>
        </div>

        {!embedUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100">
            No video available
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 bg-black/70 text-white rounded-full w-10 h-10"
            >
              ✕
            </button>

            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
              title={project.project_title}
            />
          </div>
        </div>
      )}
    </>
  )
}
