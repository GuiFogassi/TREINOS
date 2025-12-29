import { Play, Calendar, BarChart3, X, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

const abas = [
  { id: 'treinos', label: 'Treinos', icon: Play },
  { id: 'planejamento', label: 'Planejamento', icon: Calendar },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 }
]

export const Sidebar = ({ abaAtiva, onAbaChange, isOpen, onToggle, onCreateTreino }) => {
  const { theme, toggleTheme } = useTheme()
  const classes = getThemeClasses(theme)
  
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className={`fixed inset-0 ${classes.bgOverlay} backdrop-blur-sm z-40 lg:hidden`}
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full ${classes.bgMain} border-r ${classes.borderPrimary} z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col`}
        role="navigation"
        aria-label="Menu de navegação principal"
      >
        {/* Header do Sidebar */}
        <div className={`p-4 border-b ${classes.borderPrimary} flex items-center justify-between`}>
          <button
            onClick={() => {
              onAbaChange('treinos')
              if (window.innerWidth < 1024) {
                onToggle()
              }
            }}
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="Ir para página inicial TREINOS"
          >
            <img
              src="/logo.png"
              alt="TREINOS"
              className="h-8 w-auto"
            />
          </button>
          <button
            onClick={onToggle}
            className={`lg:hidden ${classes.textSecondary} hover:${classes.textPrimary} p-2 rounded-lg transition-colors`}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 py-4 px-2" role="navigation">
          <div className="space-y-1">
            {abas.map((aba) => {
              const Icon = aba.icon
              const isActive = abaAtiva === aba.id
              return (
                <button
                  key={aba.id}
                  onClick={() => {
                    onAbaChange(aba.id)
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? `${classes.bgCard} ${classes.textPrimary} border ${classes.borderSecondary}`
                      : `${classes.textSecondary} ${classes.bgHover}`
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{aba.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Botão criar treino (apenas na aba treinos) */}
        {abaAtiva === 'treinos' && (
          <div className={`p-4 border-t ${classes.borderPrimary}`}>
            <button
              onClick={() => {
                onCreateTreino()
                if (window.innerWidth < 1024) {
                  onToggle()
                }
              }}
              className={`w-full ${classes.buttonPrimary} py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-95`}
              aria-label="Criar novo treino"
            >
              <Play className="w-4 h-4" />
              <span>Criar Treino</span>
            </button>
          </div>
        )}

        {/* Toggle de tema */}
        <div className={`p-4 border-t ${classes.borderPrimary}`}>
          <button
            onClick={toggleTheme}
            className={`w-full ${classes.buttonSecondary} py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-95`}
            aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

// Botão hambúrguer para mobile
export const MenuButton = ({ onClick, isOpen }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  return (
    <button
      onClick={onClick}
      className={`lg:hidden ${classes.textPrimary} p-2 rounded-lg ${classes.bgHover} transition-colors`}
      aria-label="Abrir menu"
      aria-expanded={isOpen}
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

