import { useState, useEffect } from 'react'
import FeaturedProjects from '../components/FeaturedProjects'
import ProjectCard from '../components/ProjectCard'
import ReactionBadge from '../components/ReactionBadge'
import { projects } from '../services'

// Static reactions data (not from API)
const communityReactions = [
  { emoji: '🤩', label: 'So sweet', count: 3 },
  { emoji: '🔥', label: 'So great', count: 5 },
  { emoji: '💚', label: 'So cool', count: 7 },
]

function Home() {
  // State for projects data
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [communityProjects, setCommunityProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch projects on component mount with cache
  useEffect(() => {
    // Check cache first
    const cachedFeatured = localStorage.getItem('featured_projects')
    const cachedCommunity = localStorage.getItem('community_projects')

    if (cachedFeatured && cachedCommunity) {
      setFeaturedProjects(JSON.parse(cachedFeatured))
      setCommunityProjects(JSON.parse(cachedCommunity))
      setLoading(false) // kill spinner early 💀
    }

    // Fetch fresh data in background
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      // Fetch featured projects (sorted by most reactions, top 3)
      const featuredData = await projects.listProjects({
        page: 1,
        page_size: 3,
        ordering: '-total_reactions',
      })

      // Fetch community projects (next 8 for the two grids)
      const communityData = await projects.listProjects({
        page: 1,
        page_size: 12,
        ordering: '-created_at',
      })

      const featured = featuredData.results || []
      const community = communityData.results || []

      setFeaturedProjects(featured)
      setCommunityProjects(community)

      // Update cache
      localStorage.setItem('featured_projects', JSON.stringify(featured))
      localStorage.setItem('community_projects', JSON.stringify(community))
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err.getUserMessage ? err.getUserMessage() : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Split community projects into two rows
  const firstRowProjects = communityProjects.slice(0, 4)
  const secondRowProjects = communityProjects.slice(4, 8)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-purple text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
 
      {/* Featured projects section */}
      <FeaturedProjects projects={featuredProjects} />

      {/* Safe Commenting section */}
      <section>
        

        {/* Community project cards — row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {firstRowProjects.length > 0 ? (
            firstRowProjects.map((item) => (
              <ProjectCard
                key={item.id}
                id={item.id}
                title={item.project_title || item.title}
                author={item.student_name || item.creator_name || 'Anonymous'}
                videoUrl={item.project_video_recording}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No projects available</p>
          )}
        </div>

        

        {/* Community project cards — row 2 */}
        {secondRowProjects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {secondRowProjects.map((item) => (
              <ProjectCard
                key={item.id}
                id={item.id}
                title={item.project_title || item.title}
                author={item.student_name || item.creator_name || 'Anonymous'}
                videoUrl={item.project_video_recording}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
