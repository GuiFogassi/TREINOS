import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Clock, SkipForward, CheckCircle, Pause, Play, X } from 'lucide-react'
import { formatarTempo, formatarTempoDescanso } from '../../utils/time'
import { useTreinoTimer } from '../../hooks/useTreinoTimer'
import { useTreinoProgress } from '../../hooks/useTreinoProgress'
import { salvarNoLocalStorage, carregarDoLocalStorage } from '../../utils/storage'
import { TEMPO_DESCANSO } from '../../constants/treinos'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeClasses } from '../../utils/theme'

const IconeVideo = ({ url, theme }) => {
  const classes = getThemeClasses(theme)
  
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center w-8 h-8 rounded-full ${classes.buttonSecondary} transition-colors group`}
      onClick={(e) => e.stopPropagation()}
      title="Abrir vídeo"
    >
      <svg
        className={`w-5 h-5 ${classes.textSecondary} ${theme === 'light' ? 'group-hover:text-[#2d2d2d]' : 'group-hover:text-white/70'} transition-colors`}
        fill="currentColor"
        viewBox="0 0 96.875 96.875"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M95.201,25.538c-1.186-5.152-5.4-8.953-10.473-9.52c-12.013-1.341-24.172-1.348-36.275-1.341
          c-12.105-0.007-24.266,0-36.279,1.341c-5.07,0.567-9.281,4.368-10.467,9.52C0.019,32.875,0,40.884,0,48.438
          C0,55.992,0,64,1.688,71.336c1.184,5.151,5.396,8.952,10.469,9.52c12.012,1.342,24.172,1.349,36.277,1.342
          c12.107,0.007,24.264,0,36.275-1.342c5.07-0.567,9.285-4.368,10.471-9.52c1.689-7.337,1.695-15.345,1.695-22.898
          C96.875,40.884,96.889,32.875,95.201,25.538z M35.936,63.474c0-10.716,0-21.32,0-32.037c10.267,5.357,20.466,10.678,30.798,16.068
          C56.434,52.847,46.23,58.136,35.936,63.474z"/>
      </svg>
    </a>
  )
}

export const TreinoExecution = ({
  treino,
  treinoId,
  onVoltar,
  onFinalizar,
  mostrarConclusao,
  onFecharConclusao,
  onMostrarInfo
}) => {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)
  
  const [tempoDescanso, setTempoDescanso] = useState(0)
  const [serieEmDescanso, setSerieEmDescanso] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const intervaloDescansoRef = useRef(null)

  const { tempoTotal, limparTimer } = useTreinoTimer(treinoId, isPaused)
  const {
    progresso,
    exerciciosPulados,
    marcarSerie,
    pularExercicio,
    desfazerPularExercicio,
    limparProgresso
  } = useTreinoProgress(treinoId)

  useEffect(() => {
    if (!treinoId) return

    const chavePausado = `treino_${treinoId}_pausado`
    const pausado = carregarDoLocalStorage(chavePausado, false)
    setIsPaused(pausado)
  }, [treinoId])

  useEffect(() => {
    if (tempoDescanso > 0) {
      intervaloDescansoRef.current = setInterval(() => {
        setTempoDescanso((prev) => {
          if (prev <= 1) {
            setSerieEmDescanso(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (intervaloDescansoRef.current) {
          clearInterval(intervaloDescansoRef.current)
        }
      }
    }
  }, [tempoDescanso])

  const pausarTreino = () => {
    setIsPaused(true)
    const chavePausado = `treino_${treinoId}_pausado`
    salvarNoLocalStorage(chavePausado, true)
    onMostrarInfo('Treino pausado. Você pode voltar mais tarde e continuar de onde parou.')
  }

  const continuarTreino = () => {
    setIsPaused(false)
    const chavePausado = `treino_${treinoId}_pausado`
    salvarNoLocalStorage(chavePausado, false)
  }

  const exercicioCompleto = (exercicioIndex) => {
    if (exerciciosPulados.includes(exercicioIndex)) {
      return true
    }
    const exercicio = treino.exercicios[exercicioIndex]
    for (let i = 1; i <= exercicio.series; i++) {
      if (!progresso[`${exercicioIndex}_${i}`]) {
        return false
      }
    }
    return true
  }

  const exercicioFoiIniciado = (exercicioIndex) => {
    if (exerciciosPulados.includes(exercicioIndex)) {
      return false
    }
    const exercicio = treino.exercicios[exercicioIndex]
    return progresso[`${exercicioIndex}_1`] === true
  }

  const obterExercicioAtual = () => {
    for (let i = 0; i < treino.exercicios.length; i++) {
      if (!exerciciosPulados.includes(i) && exercicioFoiIniciado(i) && !exercicioCompleto(i)) {
        return i
      }
    }
    return null
  }

  const podeMarcarSerie = (exercicioIndex, serieIndex) => {
    if (exerciciosPulados.includes(exercicioIndex)) {
      return false
    }

    const exercicioAtual = obterExercicioAtual()

    if (serieIndex === 1) {
      if (exercicioAtual === null) {
        return true
      }
      if (exercicioAtual === exercicioIndex) {
        return true
      }
      return false
    }

    if (exercicioAtual === null) {
      return false
    }

    if (exercicioIndex !== exercicioAtual) {
      return false
    }

    const serieAnterior = `${exercicioIndex}_${serieIndex - 1}`
    if (!progresso[serieAnterior]) {
      return false
    }

    if (serieEmDescanso) {
      if (serieEmDescanso.exercicioIndex === exercicioIndex &&
        serieEmDescanso.serieIndex === serieIndex &&
        tempoDescanso > 0) {
        return false
      }
    }

    return true
  }

  const handleMarcarSerie = (exercicioIndex, serieIndex) => {
    marcarSerie(exercicioIndex, serieIndex)

    const totalExercicios = treino.exercicios.length
    const exercicio = treino.exercicios[exercicioIndex]
    const ultimaSerie = serieIndex === exercicio.series

    let proximoExercicioIndex = exercicioIndex
    let proximaSerieIndex = serieIndex + 1

    if (ultimaSerie) {
      proximaSerieIndex = 1
      proximoExercicioIndex = exercicioIndex + 1

      while (proximoExercicioIndex < totalExercicios && exerciciosPulados.includes(proximoExercicioIndex)) {
        proximoExercicioIndex++
      }
    }

    const ultimoExercicioNaoPulado = proximoExercicioIndex >= totalExercicios

    if (!ultimoExercicioNaoPulado) {
      const tempoDescansoExercicio = exercicio.descanso || TEMPO_DESCANSO
      setTempoDescanso(tempoDescansoExercicio)
      setSerieEmDescanso({
        exercicioIndex: proximoExercicioIndex,
        serieIndex: proximaSerieIndex
      })
    }
  }

  const pularDescanso = () => {
    setTempoDescanso(0)
    setSerieEmDescanso(null)
    if (intervaloDescansoRef.current) {
      clearInterval(intervaloDescansoRef.current)
    }
  }

  const treinoCompleto = () => {
    if (treinoId === 'CARDIO') {
      return true
    }
    return treino.exercicios.every((_, index) => {
      if (exerciciosPulados.includes(index)) {
        return true
      }
      return exercicioCompleto(index)
    })
  }

  const handleFinalizar = () => {
    const exerciciosComStatus = treino.exercicios.map((ex, index) => ({
      ...ex,
      pulado: exerciciosPulados.includes(index)
    }))
    onFinalizar(tempoTotal, exerciciosPulados, exerciciosComStatus)
  }

  const [mostrarModalVoltar, setMostrarModalVoltar] = useState(false)

  const handleVoltar = () => {
    // Se o treino está pausado, volta direto sem perguntar
    if (isPaused) {
      onVoltar()
      return
    }
    // Se o treino está rodando, pergunta o que fazer
    setMostrarModalVoltar(true)
  }

  const handleEncerrarTreino = () => {
    limparTimer()
    limparProgresso()
    setMostrarModalVoltar(false)
    onVoltar()
  }

  if (!treino) return null

  const completo = treinoCompleto()

  return (
    <div className={`min-h-screen ${classes.bgMain} pb-32`}>
      {mostrarModalVoltar && (
        <div className={`fixed inset-0 z-50 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}>
          <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
            <h2 className={`text-xl font-semibold ${classes.textPrimary} mb-4 text-center`}>
              O que deseja fazer?
            </h2>
            <p className={`${classes.textSecondary} text-sm mb-4 text-center`}>
              O treino está em andamento. Use o botão "Pausar" ao lado do relógio se quiser continuar depois.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleEncerrarTreino}
                className={`w-full ${classes.redBg} ${classes.redHover} ${classes.redText} py-3 rounded-xl font-medium transition-all active:scale-95`}
              >
                Encerrar Treino
              </button>
              <button
                onClick={() => setMostrarModalVoltar(false)}
                className={`w-full ${classes.buttonPrimary} py-3 rounded-xl font-medium transition-all active:scale-95`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConclusao && (
        <div className={`fixed inset-0 z-30 ${classes.bgOverlay} backdrop-blur-sm flex items-center justify-center p-4`}>
          <div className={`${classes.bgCard} border ${classes.borderSecondary} rounded-2xl p-6 max-w-sm w-full`}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className={`text-2xl font-semibold ${classes.textPrimary} mb-2`}>
                Parabéns!
              </h2>
              <p className={`${classes.textSecondary} text-sm mb-1`}>
                Treino finalizado com sucesso
              </p>
              <p className={`${classes.textTertiary} text-xs`}>
                Tempo total: {formatarTempo(tempoTotal)}
              </p>
            </div>
            <button
              onClick={() => {
                limparTimer()
                limparProgresso()
                onFecharConclusao()
              }}
              className={`w-full ${classes.buttonPrimary} font-medium py-3 rounded-xl transition-all active:scale-95`}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className={`sticky top-0 z-10 ${classes.bgMain}/95 backdrop-blur-sm border-b ${classes.borderPrimary} px-4 py-4`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={handleVoltar}
            className={`${classes.textSecondary} ${theme === 'light' ? 'hover:text-[#2d2d2d]' : 'hover:text-white'} font-medium flex items-center gap-2 text-sm transition-colors`}
            aria-label="Voltar para lista de treinos"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            {isPaused ? (
              <button
                onClick={continuarTreino}
                className={`${classes.greenBg} ${classes.greenHover} ${classes.greenText} px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all active:scale-95`}
                aria-label="Continuar treino"
              >
                <Play className="w-4 h-4" />
                Continuar
              </button>
            ) : (
              <button
                onClick={pausarTreino}
                className={`${theme === 'light' ? 'bg-[#ffe0b3]/30 hover:bg-[#ffe0b3]/40 text-[#b8864a]' : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'} px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all active:scale-95`}
                aria-label="Pausar treino"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
            )}
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${classes.textTertiary}`} />
              <span className={`font-semibold text-base ${classes.textPrimary}`}>
                {formatarTempo(tempoTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {treino.exercicios.map((exercicio, exercicioIndex) => {

          const completoExercicio = exercicioCompleto(exercicioIndex)
          const pulado = exerciciosPulados.includes(exercicioIndex)

          return (
            <div
              key={exercicioIndex}
              className={`${classes.bgCard} border rounded-2xl p-5 transition-all ${pulado
                ? `${classes.orangeBorder} ${classes.orangeBg}`
                : completoExercicio
                  ? `${classes.greenBorder} ${classes.greenBg}`
                  : `${classes.borderPrimary} ${theme === 'light' ? 'hover:border-[#d0d0d0]' : 'hover:border-white/10'}`
                }`}
            >
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1">
                    <h2 className={`text-lg font-semibold ${classes.textPrimary} flex items-center gap-2`}>
                      {exercicio.nome}
                      {pulado && (
                        <span className={`text-xs ${classes.orangeBg} ${classes.orangeText} px-2 py-0.5 rounded`}>
                          Pulado
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {exercicio.link && (
                      <div className="flex-shrink-0">
                        <IconeVideo url={exercicio.link} theme={theme} />
                      </div>
                    )}
                    {!pulado && (
                      <button
                        onClick={() => pularExercicio(exercicioIndex)}
                        className={`${classes.orangeText} ${theme === 'light' ? 'opacity-70 hover:opacity-100' : 'opacity-60 hover:opacity-100'} p-1.5 rounded transition-opacity`}
                        aria-label={`Pular exercício ${exercicio.nome}`}
                        title="Pular exercício"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {pulado && (
                      <button
                        onClick={() => desfazerPularExercicio(exercicioIndex)}
                        className={`${classes.greenText} ${theme === 'light' ? 'opacity-70 hover:opacity-100' : 'opacity-60 hover:opacity-100'} p-1.5 rounded transition-opacity`}
                        aria-label={`Desfazer pular exercício ${exercicio.nome}`}
                        title="Desfazer pular"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {exercicio.metodo && (
                  <p className={`text-xs ${classes.textSecondary} mb-1`}>
                    Método: {exercicio.metodo}
                  </p>
                )}
                <p className={`text-xs ${classes.textTertiary}`}>
                  {exercicio.series} séries × {exercicio.repeticoes} reps
                </p>
                {exercicio.descanso && (
                  <p className={`text-xs ${classes.textTertiary} mt-1`}>
                    Descanso: {formatarTempoDescanso(exercicio.descanso)}
                  </p>
                )}
              </div>

              {!pulado && (
                <div className="flex flex-wrap gap-2.5">
                  {Array.from({ length: exercicio.series }, (_, i) => {
                    const serieIndex = i + 1
                    const chave = `${exercicioIndex}_${serieIndex}`
                    const feita = progresso[chave] || false
                    const disponivel = podeMarcarSerie(exercicioIndex, serieIndex)

                    return (
                      <button
                        key={serieIndex}
                        onClick={() => {
                          if (disponivel && !feita) {
                            handleMarcarSerie(exercicioIndex, serieIndex)
                          }
                        }}
                        disabled={!disponivel || feita}
                        aria-label={feita
                          ? `Série ${serieIndex} do exercício ${exercicio.nome} completa`
                          : disponivel
                            ? `Marcar série ${serieIndex} do exercício ${exercicio.nome} como completa`
                            : `Série ${serieIndex} do exercício ${exercicio.nome} bloqueada`
                        }
                        aria-pressed={feita}
                        className={`w-12 h-12 rounded-full font-semibold text-sm transition-all ${feita
                          ? `${theme === 'light' ? 'bg-[#5a9a5a]' : 'bg-green-500'} ${classes.textPrimary}`
                          : disponivel
                            ? `${classes.buttonPrimary} active:scale-95 border ${classes.borderSecondary}`
                            : `${theme === 'light' ? 'bg-[#f5f5f0]' : 'bg-white/5'} ${classes.textTertiary} border ${classes.borderPrimary} cursor-not-allowed`
                          }`}
                      >
                        {feita ? <CheckCircle className="w-5 h-5 mx-auto" aria-hidden="true" /> : serieIndex}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {tempoDescanso > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 ${classes.bgCard} border-t ${classes.borderSecondary} backdrop-blur-sm z-20`}>
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${classes.buttonSecondary} rounded-full p-2`}>
                  <Clock className={`w-5 h-5 ${theme === 'light' ? 'text-[#2d2d2d]' : 'text-white/80'}`} />
                </div>
                <div>
                  <p className={`text-xs ${classes.textSecondary}`}>Descanso</p>
                  <p className={`text-xl font-semibold ${classes.textPrimary}`}>{formatarTempo(tempoDescanso)}</p>
                </div>
              </div>
              <button
                onClick={pularDescanso}
                className={`${classes.buttonPrimary} px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 active:scale-95 transition-all text-sm border ${classes.borderSecondary}`}
                aria-label="Pular tempo de descanso"
              >
                <SkipForward className="w-4 h-4" aria-hidden="true" />
                Pular
              </button>
            </div>
          </div>
        </div>
      )}

      {completo && !mostrarConclusao && (
        <div className={`fixed bottom-0 left-0 right-0 ${classes.bgCard} border-t ${classes.greenBorder} backdrop-blur-sm z-20`}>
          <div className="max-w-md mx-auto px-4 py-4">
            <button
              onClick={handleFinalizar}
              className={`w-full ${classes.greenBg} ${classes.greenHover} ${classes.greenText} font-semibold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border ${classes.greenBorder}`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Finalizar Treino</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

