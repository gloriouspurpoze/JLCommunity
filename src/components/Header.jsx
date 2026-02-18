import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Header() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Sync with URL search param on mount and when URL changes
  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    
    // Navigate to home page with search query
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      // If empty, clear search param
      navigate('/')
    }
  }

  return (
    <header className="bg-gradient-to-r from-brand-pink to-brand-purple px-10 sm:px-6 md:px-15 py-2 flex items-center justify-between shrink-0 h-16 sm:h-20 md:h-20">
      {/* Logo + tagline */}
      <Link to="/" className="flex items-center gap-4">
        <img
          src="/assets/Jetlearn Logo.png"
          alt="JET Learn"
          className="w-10 h-10 sm:w-13 sm:h-13 rounded-full shrink-0 object-cover"
        />
        <div className="hidden sm:block leading-tight">
          <p className="text-[16px] font-medium text-white">World's Top Rated</p>
          <p className="text-[16px] font-medium text-white">AI Academy for Kids</p>
        </div>
      </Link>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Top Creators — mobile/tablet only */}
        {/* <Link
          to="/top-creators"
          className="md:hidden px-3 py-1 bg-brand-yellow text-gray-900 text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Top Creators
        </Link> */}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 md:py-2 w-44 sm:w-60 md:w-80 shadow-md shadow-gray-500">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs sm:text-lg text-gray-700 outline-none bg-transparent placeholder-gray-400"
          />
          <button type="submit" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800 shrink-0 ml-1 cursor-pointer hover:text-brand-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  )
}

export default Header
