import { MenuButton } from './Layout/Sidebar'

export const Header = ({ onToggleMenu, abaAtiva }) => {
  const getPageTitle = () => {
    switch (abaAtiva) {
      case 'treinos':
        return 'Treinos'
      case 'planejamento':
        return 'Planejamento'
      case 'estatisticas':
        return 'Estatísticas'
      default:
        return 'TREINOS'
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5" role="banner">
      <div className="px-4 py-3 flex items-center gap-4">
        <MenuButton onClick={onToggleMenu} />
        <h1 className="text-lg font-semibold text-white lg:ml-0">
          {getPageTitle()}
        </h1>
      </div>
    </header>
  )
}

