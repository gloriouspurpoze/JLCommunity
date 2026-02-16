import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import TopCreators from '../components/TopCreators'
// import { parents } from '../services'

// Dummy data until backend provides top creators endpoint
const dummyCreators = [
  { name: 'Alice', score: 56 },
  { name: 'Bob', score: 54 },
  { name: 'Claire', score: 35 },
  { name: 'David', score: 31 },
]

function MainLayout() {
  const [creators, setCreators] = useState([])

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem('top_creators')

    if (cached) {
      setCreators(JSON.parse(cached))
    }

    // Fetch fresh data in background
    fetchCreators()
  }, [])

  async function fetchCreators() {
    try {
      // TODO: Use backend API when endpoint is available
      // const data = await parents.listTopCreators({ limit: 10 })
      // setCreators(data)
      // localStorage.setItem('top_creators', JSON.stringify(data))

      // For now, use dummy data
      await new Promise(resolve => setTimeout(resolve, 300))
      setCreators(dummyCreators)
      localStorage.setItem('top_creators', JSON.stringify(dummyCreators))
    } catch (err) {
      console.error('Failed to load creators:', err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Fixed right sidebar — desktop only, never scrolls */}
        <div className="hidden lg:flex">
          <TopCreators creators={creators} />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
