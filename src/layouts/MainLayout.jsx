import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import TopCreators from '../components/TopCreators'
import { leaderboard } from '../services'

function MainLayout() {
  const [creators, setCreators] = useState([])
  const [tab, setTab] = useState('week')

  useEffect(() => {
    const cacheKey = tab === 'week' ? 'leaderboard_weekly' : 'leaderboard_all'
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      setCreators(JSON.parse(cached))
    }

    fetchCreators(tab)
  }, [tab])

  async function fetchCreators(currentTab) {
    try {
      let data
      if (currentTab === 'week') {
        const res = await leaderboard.getWeeklyLeaderboard()
        data = res.results || res || []
      } else {
        data = await leaderboard.getLeaderboard({ limit: 20 })
        if (data.results) data = data.results
      }

      if (Array.isArray(data)) {
        setCreators(data)
        const cacheKey = currentTab === 'week' ? 'leaderboard_weekly' : 'leaderboard_all'
        localStorage.setItem(cacheKey, JSON.stringify(data))
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Scrollable main content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Fixed right sidebar — desktop only, never scrolls */}
        <div className="hidden lg:flex">
          <TopCreators creators={creators} tab={tab} onTabChange={setTab} />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
