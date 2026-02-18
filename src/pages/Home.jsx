import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import FeaturedProjects from '../components/FeaturedProjects'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../services'

const PAGE_SIZE = 20 // Load 20 projects per page

function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

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
      const apiParams = {
        page: nextPage,
        page_size: PAGE_SIZE,
        ordering: '-created_at',
      }
      
      // Add search query if present
      if (searchQuery) {
        apiParams.search = searchQuery
      }

      const data = await projects.listProjects(apiParams)

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
  }, [currentPage, hasMore, loadingMore, searchQuery])

  // Fetch initial projects on component mount with cache
  useEffect(() => {
    // Reset pagination when search query changes
    setCurrentPage(1)
    setHasMore(true)
    setLoading(true)
    setError(null)

    // Skip cache for search results
    if (!searchQuery) {
      // Check cache first (only for non-search)
      const cachedFeatured = localStorage.getItem('featured_projects')
      const cachedCommunity = localStorage.getItem('community_projects_p1')

      if (cachedFeatured && cachedCommunity) {
        setFeaturedProjects(JSON.parse(cachedFeatured))
        setCommunityProjects(JSON.parse(cachedCommunity))
        setLoading(false) // kill spinner early 💀
      }
    }

    // Fetch fresh data in background
    fetchInitialProjects()
  }, [searchQuery])

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
      // When searching, skip featured and just show search results
      if (searchQuery) {
        console.log('🔍 Searching for:', searchQuery)
        
        const searchData = await projects.listProjects({
          page: 1,
          page_size: PAGE_SIZE,
          search: searchQuery,
          ordering: '-created_at',
        })

        const results = searchData.results || []
        
        setFeaturedProjects([]) // Hide featured when searching
        setCommunityProjects(results)
        setHasMore(!!searchData.next)

        console.log('📊 Search results:', results.length)
        console.log('  - Total count:', searchData.count)
      } else {
        // Normal flow: fetch featured + community
        const featuredData = await projects.listProjects({
          page: 1,
          page_size: 3,
          ordering: '-total_reactions',
        })

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

        // Update cache (only for non-search)
        localStorage.setItem('featured_projects', JSON.stringify(featured))
        localStorage.setItem('community_projects_p1', JSON.stringify(community))
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err.getUserMessage ? err.getUserMessage() : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Check if we have any content to show
  const hasContent = featuredProjects.length > 0 || communityProjects.length > 0

  // Loading state - only show full page loader if no content exists
  if (loading && !hasContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">
            {searchQuery ? `Searching for "${searchQuery}"...` : 'Loading projects...'}
          </p>
        </div>
      </div>
    )
  }

  // Error state - only show full page error if no content exists
  if (error && !hasContent) {
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
      {/* Error banner - show when error occurs but content exists */}
      {error && hasContent && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Failed to refresh content</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
 
 
      {/* Featured projects section - hide when searching */}
      {!searchQuery && <FeaturedProjects projects={featuredProjects} />}

      {/* Community Projects - Infinite Scroll Grid */}
      <section>
        {searchQuery ? (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {communityProjects.length} project{communityProjects.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Clear Search
            </a>
          </div>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Community Projects
          </h2>
        )}

        {/* YouTube-like responsive video grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {communityProjects.length > 0 ? (
            communityProjects.map((item) => (
              <ProjectCard
                key={item.id}
                id={item.id}
                title={item.project_title || item.title}
                author={item.learner_name || item.creator_name || 'Anonymous'}
                videoUrl={item.project_video_recording}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              {searchQuery ? (
                <>
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-600 text-lg mb-2">No projects found for "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm">Try different keywords or browse all projects</p>
                </>
              ) : (
                <p className="text-gray-500">No projects available</p>
              )}
            </div>
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
