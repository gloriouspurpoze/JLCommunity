import { useState, useEffect, useRef, useCallback } from 'react'
import FeaturedProjects from '../components/FeaturedProjects'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../services'

const PAGE_SIZE = 20 // Load 20 projects per page

function Home() {
  // State for projects data
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [communityProjects, setCommunityProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef(null)

  // Load more projects function (defined early for useEffect dependency)
  const loadMoreProjects = useCallback(async () => {
    if (loadingMore || !hasMore) {
      console.log('⛔ Skipping load - loadingMore:', loadingMore, '| hasMore:', hasMore)
      return
    }

    console.log('🚀 Starting to load more projects...')
    setLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      console.log(`📡 Fetching page ${nextPage}...`)
      const data = await projects.listProjects({
        page: nextPage,
        page_size: PAGE_SIZE,
        ordering: '-created_at',
      })

      const newProjects = data.results || []
      console.log(`✅ Received ${newProjects.length} projects from page ${nextPage}`)
      console.log('🔗 Has next page:', !!data.next)

      // Append new projects to existing list
      setCommunityProjects(prev => {
        console.log(`📦 Total projects: ${prev.length} + ${newProjects.length} = ${prev.length + newProjects.length}`)
        return [...prev, ...newProjects]
      })
      setCurrentPage(nextPage)
      setHasMore(!!data.next)
    } catch (err) {
      console.error('❌ Failed to load more projects:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, hasMore, loadingMore])

  // Fetch initial projects on component mount with cache
  useEffect(() => {
    // Check cache first
    const cachedFeatured = localStorage.getItem('featured_projects')
    const cachedCommunity = localStorage.getItem('community_projects_p1')

    if (cachedFeatured && cachedCommunity) {
      setFeaturedProjects(JSON.parse(cachedFeatured))
      setCommunityProjects(JSON.parse(cachedCommunity))
      setLoading(false) // kill spinner early 💀
    }

    // Fetch fresh data in background
    fetchInitialProjects()
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const currentTarget = observerTarget.current
    
    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more data
        const isVisible = entries[0].isIntersecting
        console.log('📍 Scroll sentinel visible:', isVisible, '| hasMore:', hasMore, '| loading:', loadingMore)
        
        if (isVisible && hasMore && !loadingMore) {
          console.log('🔄 Loading more projects...')
          loadMoreProjects()
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    )

    if (currentTarget) {
      observer.observe(currentTarget)
      console.log('👀 Observer attached to sentinel')
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loadMoreProjects])

  async function fetchInitialProjects() {
    try {
      // Fetch featured projects (sorted by most reactions, top 3)
      const featuredData = await projects.listProjects({
        page: 1,
        page_size: 3,
        ordering: '-total_reactions',
      })

      // Fetch first page of community projects
      const communityData = await projects.listProjects({
        page: 1,
        page_size: PAGE_SIZE,
        ordering: '-created_at',
      })

      const featured = featuredData.results || []
      const community = communityData.results || []

      setFeaturedProjects(featured)
      setCommunityProjects(community)
      setHasMore(!!communityData.next)

      console.log('📊 Initial load complete:')
      console.log('  - Featured projects:', featured.length)
      console.log('  - Community projects:', community.length)
      console.log('  - Has more pages:', !!communityData.next)
      console.log('  - Total count:', communityData.count)

      // Update cache
      localStorage.setItem('featured_projects', JSON.stringify(featured))
      localStorage.setItem('community_projects_p1', JSON.stringify(community))
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err.getUserMessage ? err.getUserMessage() : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

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

      {/* Community Projects - Infinite Scroll Grid */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Community Projects
        </h2>

        {/* YouTube-like responsive video grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {communityProjects.length > 0 ? (
            communityProjects.map((item) => (
              <ProjectCard
                key={item.id}
                id={item.id}
                title={item.project_title || item.title}
                author={item.student_name || item.creator_name || 'Anonymous'}
                videoUrl={item.project_video_recording}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8">No projects available</p>
          )}
        </div>

        {/* Loading more spinner */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Loading more projects...</span>
          </div>
        )}

        {/* Intersection observer sentinel element + Manual Load Button */}
        {hasMore && !loadingMore && (
          <div ref={observerTarget} className="py-8 flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-gray-400">Scroll for more or click to load...</p>
            <button
              onClick={loadMoreProjects}
              className="px-6 py-2.5 bg-brand-purple text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Load More Projects
            </button>
          </div>
        )}

        {/* End of list message */}
        {!hasMore && communityProjects.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">You've reached the end! 🎉</p>
            <p className="text-xs text-gray-400 mt-2">Showing {communityProjects.length} projects</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
