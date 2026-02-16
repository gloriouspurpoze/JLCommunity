import { useState } from 'react'

export default function VideoCard({ project }) {
  const [open, setOpen] = useState(false)

  const driveEmbedUrl = getDriveEmbedUrl(project.project_video_recording)

  return (
    <>
      {/* Thumbnail Card */}
      <div
        onClick={() => driveEmbedUrl && setOpen(true)}
        className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 relative cursor-pointer group shadow-lg"
      >
        {/* Thumbnail */}
        <img
          src={project.thumbnail_url || '/video-placeholder.jpg'}
          alt={project.project_title}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <svg
            className="w-16 h-16 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
          </svg>
        </div>

        {/* Fallback */}
        {!driveEmbedUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100">
            No video available
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <VideoModal
          embedUrl={driveEmbedUrl}
          onClose={() => setOpen(false)}
          title={project.project_title}
        />
      )}
    </>
  )
}
