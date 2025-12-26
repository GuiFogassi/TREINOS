import { useEffect } from 'react'

export const ModalInfo = ({ modal, onClose }) => {
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-info-titulo"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <p id="modal-info-titulo" className="text-white mb-6 text-center">{modal.mensagem}</p>
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
          aria-label="Fechar mensagem"
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  )
}

