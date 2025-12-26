import { useEffect } from 'react'

export const ModalConfirmacao = ({ modal, onClose }) => {
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <p id="modal-confirmacao-titulo" className="text-white mb-6 text-center">{modal.mensagem}</p>
        <div className="flex gap-3">
          <button
            onClick={modal.onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
            aria-label="Cancelar ação"
          >
            Cancelar
          </button>
          <button
            onClick={modal.onConfirm}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-all active:scale-95"
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

