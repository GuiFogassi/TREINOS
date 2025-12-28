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
    const chavePausado = `treino_${treinoId}_pausado`
    const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
    const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`

    const pausado = carregarDoLocalStorage(chavePausado, false)
    const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, null)
    const tempoAcumulado = carregarDoLocalStorage(chaveTempoAcumulado, 0)

    if (pausado && tempoPausado !== null) {
      setTempoTotal(tempoPausado)
      setTempoInicio(null)
    } else if (tempoAcumulado > 0) {
      const inicioSalvo = carregarDoLocalStorage(chaveInicio, null)
      if (inicioSalvo) {
        const agora = Math.floor(Date.now() / 1000)
        const tempoDesdeRetomada = agora - inicioSalvo
        const tempoTotalCalculado = tempoAcumulado + tempoDesdeRetomada
        setTempoTotal(tempoTotalCalculado)
        setTempoInicio(inicioSalvo)
      } else {
        const agora = Math.floor(Date.now() / 1000)
        setTempoInicio(agora)
        salvarNoLocalStorage(chaveInicio, agora)
        setTempoTotal(tempoAcumulado)
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
    if (!treinoId) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
      return
    }

    if (isPaused) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
      if (tempoInicio !== null) {
        const chaveTempo = `treino_${treinoId}_tempo`
        const chavePausado = `treino_${treinoId}_pausado`
        const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
        const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
        
        const agora = Math.floor(Date.now() / 1000)
        const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)
        const tempoDesdeRetomada = agora - tempoInicio
        const tempoTotalPausado = tempoAcumuladoAtual + tempoDesdeRetomada
        
        salvarNoLocalStorage(chaveTempo, tempoTotalPausado)
        salvarNoLocalStorage(chavePausado, true)
        salvarNoLocalStorage(chaveTempoPausado, tempoTotalPausado)
        salvarNoLocalStorage(chaveTempoAcumulado, tempoTotalPausado)
        setTempoInicio(null)
        setTempoTotal(tempoTotalPausado)
      }
      return
    }

    if (tempoInicio === null) {
      const chavePausado = `treino_${treinoId}_pausado`
      const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
      const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
      const chaveInicio = `treino_${treinoId}_inicio`
      
      const pausado = carregarDoLocalStorage(chavePausado, false)
      if (pausado) {
        const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, 0)
        const agora = Math.floor(Date.now() / 1000)
        
        salvarNoLocalStorage(chaveTempoAcumulado, tempoPausado)
        salvarNoLocalStorage(chaveInicio, agora)
        salvarNoLocalStorage(chavePausado, false)
        removerDoLocalStorage(chaveTempoPausado)
        
        setTempoInicio(agora)
        setTempoTotal(tempoPausado)
        return
      }
      return
    }

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
    const agora = Math.floor(Date.now() / 1000)

    salvarNoLocalStorage(chaveTempoAcumulado, tempoPausado)
    salvarNoLocalStorage(chaveInicio, agora)
    salvarNoLocalStorage(chavePausado, false)
    removerDoLocalStorage(chaveTempoPausado)
    
    setTempoInicio(agora)
    setTempoTotal(tempoPausado)
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

