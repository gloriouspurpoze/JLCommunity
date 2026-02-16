export default function VideoModal({ embedUrl, onClose, title }) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black"
          >
            ✕
          </button>
  
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>
    )
  }
  