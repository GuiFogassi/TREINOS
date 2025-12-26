import { Play, Calendar, BarChart3, Plus } from 'lucide-react'

const abas = [
  { id: 'treinos', label: 'Treinos', icon: Play },
  { id: 'planejamento', label: 'Planejamento', icon: Calendar },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 }
]

export const Header = ({ abaAtiva, onAbaChange, onVoltarInicio, onCreateTreino }) => {
  return (
    <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5" role="banner">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between py-3 mb-1">
          <button
            onClick={onVoltarInicio}
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="Ir para página inicial TREINOS"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onVoltarInicio()
              }
            }}
          >
            <img
              src="/logo.png"
              alt="TREINOS"
              className="h-8 w-auto"
            />
          </button>
          {abaAtiva === 'treinos' && (
            <button
              onClick={onCreateTreino}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all active:scale-95"
              aria-label="Criar novo treino"
              title="Criar novo treino"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <nav className="flex gap-1" role="tablist" aria-label="Navegação principal">
          {abas.map((aba) => {
            const Icon = aba.icon
            const isActive = abaAtiva === aba.id
            return (
              <button
                key={aba.id}
                onClick={() => onAbaChange(aba.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${aba.id}`}
                className={`flex-1 py-2.5 rounded-t-xl font-medium text-sm transition-all ${isActive
                  ? 'bg-[#1a1a1a] text-white border-t border-x border-white/10'
                  : 'text-white/50 hover:text-white/70'
                  }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{aba.label}</span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

