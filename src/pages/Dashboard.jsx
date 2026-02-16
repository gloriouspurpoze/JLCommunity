import FeaturedProjects from '../components/FeaturedProjects'
import ProjectCard from '../components/ProjectCard'
import ReactionBadge from '../components/ReactionBadge'

const communityProjects = [
  { id: 'fleating-matchroot', title: 'Fleating Matchroot', author: 'Design World' },
  { id: 'ploding-flo-hody', title: 'Ploding Flo Hody', author: 'Animation Hub' },
  { id: 'ranite-bhp', title: 'Ranite Bhp Pulsy Friend', author: 'Creative Lab' },
  { id: 'tentanya-slorosel', title: "Tentanya's Slorosel", author: 'Story Makers' },
]

const bottomProjects = [
  { id: 'pixel-adventure', title: 'Pixel Adventure', author: 'Game Studio' },
  { id: 'color-splash', title: 'Color Splash', author: 'Art Club' },
  { id: 'music-maker', title: 'Music Maker', author: 'Sound Lab' },
  { id: 'robo-builder', title: 'Robo Builder', author: 'Tech Team' },
]

const communityReactions = [
  { emoji: '🤩', label: 'So sweet', count: 3 },
  { emoji: '🔥', label: 'So great', count: 5 },
  { emoji: '💚', label: 'So cool', count: 7 },
]

function Dashboard() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* Featured projects section */}
      <FeaturedProjects />

      {/* Safe Commenting section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Safe Commenting</h2>
          <button className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-brand-purple bg-brand-purple/10 rounded-full hover:bg-brand-purple/20 transition-colors">
            Reactions
          </button>
        </div>

        {/* Community project cards — row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {communityProjects.map((item) => (
            <ProjectCard
              key={item.id}
              id={item.id}
              title={item.title}
              author={item.author}
            />
          ))}
        </div>

        {/* Reactions for this section */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
          {communityReactions.map((r) => (
            <ReactionBadge
              key={r.label}
              emoji={r.emoji}
              label={r.label}
              count={r.count}
            />
          ))}
        </div>

        {/* Community project cards — row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {bottomProjects.map((item) => (
            <ProjectCard
              key={item.id}
              id={item.id}
              title={item.title}
              author={item.author}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
