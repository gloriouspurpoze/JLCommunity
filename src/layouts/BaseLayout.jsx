import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

function BaseLayout() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default BaseLayout
