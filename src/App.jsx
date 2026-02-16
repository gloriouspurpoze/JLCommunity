import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import BaseLayout from './layouts/BaseLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import TopCreatorsPage from './pages/TopCreatorsPage'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  return (
    <Routes>
      {/* Pages with Top Creators sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/top-creators" element={<TopCreatorsPage />} />
      </Route>

      {/* Pages without Top Creators sidebar */}
      <Route element={<BaseLayout />}>
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Route>
    </Routes>
  )
}

export default App
