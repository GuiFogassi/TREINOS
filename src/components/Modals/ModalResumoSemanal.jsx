import { formatarTempo } from '../../utils/time'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

export const ModalResumoSemanal = ({ modal, onClose }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  if (!modal) return null

  return (
    <div className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}>
      <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📊</div>
          <h2 className={`text-xl font-semibold ${classes.textPrimary} mb-2`}>
            Resumo da {modal.periodo}
          </h2>
          <p className={`${classes.textSecondary} text-sm mb-1`}>
            Tempo total de treino:
          </p>
          <p className={`text-2xl font-bold ${classes.textPrimary}`}>
            {formatarTempo(modal.tempoTotal)}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`w-full ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

