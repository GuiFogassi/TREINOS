import { useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

export const ModalConfirmacao = ({ modal, onClose }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  if (!modal) return null

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [modal])

  return (
    <div
      className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
    >
      <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
        <p id="modal-confirmacao-titulo" className={`${classes.textPrimary} mb-6 text-center`}>{modal.mensagem}</p>
        <div className="flex gap-3">
          <button
            onClick={modal.onCancel}
            className={`flex-1 ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
            aria-label="Cancelar ação"
          >
            Cancelar
          </button>
          <button
            onClick={modal.onConfirm}
            className={`flex-1 ${classes.redBg} ${classes.redHover} ${classes.redText} py-3 rounded-xl font-medium transition-all active:scale-95`}
            aria-label="Confirmar ação"
            autoFocus
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

