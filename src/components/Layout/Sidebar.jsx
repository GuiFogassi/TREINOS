import { Play, Calendar, BarChart3, X, Menu } from 'lucide-react'

const abas = [
  { id: 'treinos', label: 'Treinos', icon: Play },
  { id: 'planejamento', label: 'Planejamento', icon: Calendar },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 }
]

export const Sidebar = ({ abaAtiva, onAbaChange, isOpen, onToggle, onCreateTreino }) => {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0a0a0a] border-r border-white/5 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col`}
        role="navigation"
        aria-label="Menu de navegação principal"
      >
        {/* Header do Sidebar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
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
            className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg transition-colors"
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
                      ? 'bg-[#1a1a1a] text-white border border-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
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
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => {
                onCreateTreino()
                if (window.innerWidth < 1024) {
                  onToggle()
                }
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              aria-label="Criar novo treino"
            >
              <Play className="w-4 h-4" />
              <span>Criar Treino</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

// Botão hambúrguer para mobile
export const MenuButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Abrir menu"
      aria-expanded={isOpen}
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

