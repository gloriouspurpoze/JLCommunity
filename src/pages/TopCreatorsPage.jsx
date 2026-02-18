import { useState, useEffect } from 'react'
import TopCreators from '../components/TopCreators'
// import { parents } from '../services'

// Dummy data until backend provides top creators endpoint
const dummyCreators = [
  { name: 'Alice', score: 56 },
  { name: 'Bob', score: 54 },
  { name: 'Claire', score: 35 },
  { name: 'David', score: 31 },
  { name: 'Emma', score: 28 },
  { name: 'Frank', score: 25 },
  { name: 'Grace', score: 22 },
]

function TopCreatorsPage() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem('top_creators')

    if (cached) {
      setCreators(JSON.parse(cached))
      setLoading(false) // kill spinner early 💀
    }

    // Fetch fresh data
    fetchCreators()
  }, [])

  async function fetchCreators() {
    try {
      // TODO: Use backend API when endpoint is available
      // const data = await parents.listTopCreators({ limit: 10 })
      // setCreators(data)
      // localStorage.setItem('top_creators', JSON.stringify(data))

      // For now, use dummy data
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      setCreators(dummyCreators)
      localStorage.setItem('top_creators', JSON.stringify(dummyCreators))
    } catch (err) {
      console.error('Failed to load creators:', err)
      setError(err.getUserMessage ? err.getUserMessage() : 'Failed to load creators')
    } finally {
      setLoading(false)
    }
  }

  // Check if we have any content to show
  const hasContent = creators.length > 0

  // Loading state - only show full page loader if no content exists
  if (loading && !hasContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading creators...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
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
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Error banner - show when error occurs but content exists */}
      {error && hasContent && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm mb-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Failed to refresh creators</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchCreators()}
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
      
      <TopCreators creators={creators} />
    </div>
  )
}

export default TopCreatorsPage
