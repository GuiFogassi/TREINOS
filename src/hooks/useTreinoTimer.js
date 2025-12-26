import { useState, useEffect, useRef } from 'react'
import { salvarNoLocalStorage, carregarDoLocalStorage, removerDoLocalStorage } from '../utils/storage'

export const useTreinoTimer = (treinoId, isPaused = false) => {
  const [tempoTotal, setTempoTotal] = useState(0)
  const [tempoInicio, setTempoInicio] = useState(null)
  const intervaloRef = useRef(null)
  const ultimaAtualizacaoRef = useRef(null)

  useEffect(() => {
    if (!treinoId) {
      setTempoTotal(0)
      setTempoInicio(null)
      return
    }

    const chaveInicio = `treino_${treinoId}_inicio`
    const chaveTempo = `treino_${treinoId}_tempo`
    const chavePausado = `treino_${treinoId}_pausado`
    const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
    const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`

    const inicioSalvo = carregarDoLocalStorage(chaveInicio, null)
    const tempoSalvo = carregarDoLocalStorage(chaveTempo, 0)
    const pausado = carregarDoLocalStorage(chavePausado, false)
    const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, null)
    const tempoAcumulado = carregarDoLocalStorage(chaveTempoAcumulado, 0)

    if (inicioSalvo) {
      const agora = Math.floor(Date.now() / 1000)
      if (pausado && tempoPausado !== null) {
        setTempoTotal(tempoPausado)
        setTempoInicio(null)
      } else if (!pausado) {
        const tempoDecorridoAntesPausa = tempoAcumulado || 0
        const tempoDesdeRetomada = agora - inicioSalvo
        const tempoTotalCalculado = tempoDecorridoAntesPausa + tempoDesdeRetomada
        setTempoTotal(tempoTotalCalculado)
        setTempoInicio(inicioSalvo)
      } else {
        setTempoTotal(tempoAcumulado || 0)
        setTempoInicio(null)
      }
    } else {
      const agora = Math.floor(Date.now() / 1000)
      setTempoInicio(agora)
      salvarNoLocalStorage(chaveInicio, agora)
      salvarNoLocalStorage(chaveTempoAcumulado, 0)
      setTempoTotal(0)
    }
  }, [treinoId])

  useEffect(() => {
    if (!treinoId || isPaused) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
      if (isPaused && treinoId && tempoInicio !== null) {
        const chaveTempo = `treino_${treinoId}_tempo`
        const chavePausado = `treino_${treinoId}_pausado`
        const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
        const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
        const chaveInicio = `treino_${treinoId}_inicio`
        
        const agora = Math.floor(Date.now() / 1000)
        const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)
        const tempoDesdeRetomada = agora - tempoInicio
        const tempoTotalPausado = tempoAcumuladoAtual + tempoDesdeRetomada
        
        salvarNoLocalStorage(chaveTempo, tempoTotalPausado)
        salvarNoLocalStorage(chavePausado, true)
        salvarNoLocalStorage(chaveTempoPausado, tempoTotalPausado)
        salvarNoLocalStorage(chaveTempoAcumulado, tempoTotalPausado)
        setTempoInicio(null)
      }
      return
    }

    if (tempoInicio === null) return

    intervaloRef.current = setInterval(() => {
      const agora = Math.floor(Date.now() / 1000)
      const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
      const tempoAcumulado = carregarDoLocalStorage(chaveTempoAcumulado, 0)
      const tempoDesdeRetomada = agora - tempoInicio
      const decorrido = tempoAcumulado + tempoDesdeRetomada
      
      setTempoTotal(decorrido)

      const chaveTempo = `treino_${treinoId}_tempo`
      salvarNoLocalStorage(chaveTempo, decorrido)

      ultimaAtualizacaoRef.current = agora
    }, 1000)

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
    }
  }, [treinoId, tempoInicio, isPaused])

  const retomarTreino = () => {
    if (!treinoId) return

    const chavePausado = `treino_${treinoId}_pausado`
    const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
    const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
    const chaveInicio = `treino_${treinoId}_inicio`

    const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, 0)
    const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)
    const agora = Math.floor(Date.now() / 1000)

    salvarNoLocalStorage(chaveTempoAcumulado, tempoPausado)
    setTempoInicio(agora)
    setTempoTotal(tempoPausado)
    salvarNoLocalStorage(chaveInicio, agora)
    salvarNoLocalStorage(chavePausado, false)
    removerDoLocalStorage(chaveTempoPausado)
  }

  const limparTimer = () => {
    if (!treinoId) return

    const chaveInicio = `treino_${treinoId}_inicio`
    const chaveTempo = `treino_${treinoId}_tempo`
    const chavePausado = `treino_${treinoId}_pausado`
    const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
    const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`

    removerDoLocalStorage(chaveInicio)
    removerDoLocalStorage(chaveTempo)
    removerDoLocalStorage(chavePausado)
    removerDoLocalStorage(chaveTempoPausado)
    removerDoLocalStorage(chaveTempoAcumulado)

    setTempoTotal(0)
    setTempoInicio(null)
  }

  return { tempoTotal, retomarTreino, limparTimer }
}

