import FeaturedCard from './FeaturedCard'

function FeaturedProjects({ projects = [] }) {
  // Show message if no projects
  if (projects.length === 0) {
    return (
      <section>
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-violet to-brand-purple p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">No featured projects available</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Featured cards with thick purple/violet border */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-pink-200 to-brand-purple-200 p-3 sm:p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Most loved Creations</h1>        
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => (
            <FeaturedCard
              key={project.id}
              id={project.id}
              title={project.project_title}
              category={project.course_name || 'Project'}
              emoji={getReactionEmoji(project)}
              likes={project.total_reactions || 0}
              comments={project.total_comments || 0}
              videoUrl={project.project_video_recording}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper function to get dominant reaction emoji from project data
function getReactionEmoji(project) {
  const reactions = {
    love: '❤️',
    wow: '😮',
    funny: '😂',
    inspiring: '🤩',
    cool: '🔥',
  }

  // Use reactions_breakdown from API
  const breakdown = project.reactions_breakdown || {}

  // Find reaction type with highest count
  let maxReaction = 'love'
  let maxCount = breakdown.love || 0

  if ((breakdown.wow || 0) > maxCount) {
    maxReaction = 'wow'
    maxCount = breakdown.wow
  }
  if ((breakdown.funny || 0) > maxCount) {
    maxReaction = 'funny'
    maxCount = breakdown.funny
  }
  if ((breakdown.inspiring || 0) > maxCount) {
    maxReaction = 'inspiring'
    maxCount = breakdown.inspiring
  }
  if ((breakdown.cool || 0) > maxCount) {
    maxReaction = 'cool'
  }

  return reactions[maxReaction]
}

export default FeaturedProjects
