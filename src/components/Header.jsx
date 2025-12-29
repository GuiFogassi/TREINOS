import { MenuButton } from './Layout/Sidebar'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/theme'

export const Header = ({ onToggleMenu, abaAtiva }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
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
    <header className={`sticky top-0 z-30 ${classes.bgMain}/95 backdrop-blur-sm border-b ${classes.borderPrimary}`} role="banner">
      <div className="px-4 py-3 flex items-center gap-4">
        <MenuButton onClick={onToggleMenu} />
        <h1 className={`text-lg font-semibold ${classes.textPrimary} lg:ml-0`}>
          {getPageTitle()}
        </h1>
      </div>
    </header>
  )
}

