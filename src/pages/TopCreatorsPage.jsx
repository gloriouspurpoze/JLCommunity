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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading creators...</p>
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
      <TopCreators creators={creators} />
    </div>
  )
}

export default TopCreatorsPage
