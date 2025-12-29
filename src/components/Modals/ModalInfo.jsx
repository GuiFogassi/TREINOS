import { useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

export const ModalInfo = ({ modal, onClose }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  if (!modal) return null

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [modal, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-info-titulo"
    >
      <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
        <p id="modal-info-titulo" className={`${classes.textPrimary} mb-6 text-center`}>{modal.mensagem}</p>
        <button
          onClick={onClose}
          className={`w-full ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
          aria-label="Fechar mensagem"
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  )
}

