import { useState, useEffect } from 'react'
import { formatarTempo } from '../../utils/time'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

export const ModalCardio = ({ treinoCardio, onSalvar, onCancel, modoEdicao, onMostrarInfo, mostrar }) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  const [localTipo, setLocalTipo] = useState('')
  const [localTempo, setLocalTempo] = useState(0)

  useEffect(() => {
    if (treinoCardio) {
      setLocalTipo(treinoCardio.tipoCardio || '')
      setLocalTempo(treinoCardio.tempoCardio || 0)
    } else if (modoEdicao) {
      setLocalTipo('')
      setLocalTempo(0)
    }
  }, [treinoCardio, modoEdicao])

  if (!mostrar && !modoEdicao) return null
  if (!mostrar && modoEdicao && !treinoCardio) return null

  const handleSalvar = () => {
    if (!localTipo.trim()) {
      if (onMostrarInfo) {
        onMostrarInfo('Por favor, informe o tipo de cardio')
      }
      return
    }
    if (localTempo <= 0) {
      if (onMostrarInfo) {
        onMostrarInfo('Por favor, informe o tempo do cardio')
      }
      return
    }

    if (onSalvar) {
      onSalvar({
        tipoCardio: localTipo.trim(),
        tempoCardio: localTempo
      })
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const horas = Math.floor(localTempo / 3600)
  const minutos = Math.floor((localTempo % 3600) / 60)

  const handleHorasChange = (e) => {
    const novasHoras = parseInt(e.target.value) || 0
    setLocalTempo(novasHoras * 3600 + minutos * 60)
  }

  const handleMinutosChange = (e) => {
    const novosMinutos = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
    setLocalTempo(horas * 3600 + novosMinutos * 60)
  }

  return (
    <div className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}>
      <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
        <h2 className={`text-xl font-semibold ${classes.textPrimary} mb-4 text-center`}>
          {treinoCardio?.tipoCardio ? 'Editar Cardio' : 'Criar Cardio'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className={`text-xs ${classes.textTertiary} mb-1 block`}>Tipo de Cardio</label>
            <input
              type="text"
              value={localTipo}
              onChange={(e) => setLocalTipo(e.target.value)}
              placeholder="Ex: Corrida, Caminhada, Esteira, Bike..."
              className={`w-full ${classes.bgMain} border ${classes.borderPrimary} rounded-lg px-3 py-2 ${classes.textPrimary} text-sm focus:outline-none ${theme === 'light' ? 'focus:border-[#d0d0d0]' : 'focus:border-white/20'}`}
              autoComplete="off"
            />
          </div>
          <div>
            <label className={`text-xs ${classes.textTertiary} mb-1 block`}>Tempo</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={horas}
                onChange={handleHorasChange}
                min="0"
                placeholder="0"
                className={`flex-1 ${classes.bgMain} border ${classes.borderPrimary} rounded-lg px-3 py-2 ${classes.textPrimary} text-sm focus:outline-none ${theme === 'light' ? 'focus:border-[#d0d0d0]' : 'focus:border-white/20'}`}
              />
              <span className={`${classes.textSecondary} text-sm`}>h</span>
              <input
                type="number"
                value={minutos}
                onChange={handleMinutosChange}
                min="0"
                max="59"
                placeholder="0"
                className={`flex-1 ${classes.bgMain} border ${classes.borderPrimary} rounded-lg px-3 py-2 ${classes.textPrimary} text-sm focus:outline-none ${theme === 'light' ? 'focus:border-[#d0d0d0]' : 'focus:border-white/20'}`}
              />
              <span className={`${classes.textSecondary} text-sm`}>min</span>
            </div>
            <p className={`text-xs ${classes.textTertiary} mt-1`}>
              Tempo total: {formatarTempo(localTempo)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSalvar}
              className={`flex-1 ${classes.blueBg} ${classes.blueHover} ${classes.blueText} py-3 rounded-xl font-medium transition-all active:scale-95`}
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className={`flex-1 ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

