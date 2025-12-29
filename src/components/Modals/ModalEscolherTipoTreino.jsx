import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

export const ModalEscolherTipoTreino = ({ mostrar, onCreateTreinoNormal, onCreateCardio, onCancel }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  if (!mostrar) return null

  return (
    <div className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}>
      <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
        <h2 className={`text-xl font-semibold ${classes.textPrimary} mb-4 text-center`}>
          Criar Novo Treino
        </h2>
        <div className="space-y-3">
          <button
            onClick={onCreateTreinoNormal}
            className={`w-full ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
          >
            Treino de Força
          </button>
          <button
            onClick={onCreateCardio}
            className={`w-full ${classes.blueBg} ${classes.blueHover} ${classes.blueText} py-3 rounded-xl font-medium transition-all active:scale-95`}
          >
            🏃 Cardio
          </button>
          <button
            onClick={onCancel}
            className={`w-full ${theme === 'light' ? 'bg-[#f5f5f0] hover:bg-[#e5e5e5]' : 'bg-white/5 hover:bg-white/10'} ${classes.textSecondary} py-2 rounded-xl font-medium transition-all active:scale-95 text-sm`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

