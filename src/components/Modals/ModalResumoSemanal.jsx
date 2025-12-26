import { formatarTempo } from '../../utils/time'

export const ModalResumoSemanal = ({ modal, onClose }) => {
  if (!modal) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Resumo da {modal.periodo}
          </h2>
          <p className="text-white/60 text-sm mb-1">
            Tempo total de treino:
          </p>
          <p className="text-2xl font-bold text-white">
            {formatarTempo(modal.tempoTotal)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

