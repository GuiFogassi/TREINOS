export const ModalEscolherTipoTreino = ({ mostrar, onCreateTreinoNormal, onCreateCardio, onCancel }) => {
  if (!mostrar) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Criar Novo Treino
        </h2>
        <div className="space-y-3">
          <button
            onClick={onCreateTreinoNormal}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
          >
            Treino de Força
          </button>
          <button
            onClick={onCreateCardio}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 rounded-xl font-medium transition-all active:scale-95"
          >
            🏃 Cardio
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-2 rounded-xl font-medium transition-all active:scale-95 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

