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

    // Se está pausado, usa o tempo pausado ou o tempo acumulado (o que estiver disponível)
    if (pausado) {
      const tempoParaExibir = tempoPausado !== null ? tempoPausado : tempoAcumulado
      // Garante que o tempo está salvo corretamente em todos os lugares
      if (tempoParaExibir > 0) {
        salvarNoLocalStorage(chaveTempoPausado, tempoParaExibir)
        salvarNoLocalStorage(chaveTempoAcumulado, tempoParaExibir)
        salvarNoLocalStorage(`treino_${treinoId}_tempo`, tempoParaExibir)
      }
      setTempoTotal(tempoParaExibir)
      setTempoInicio(null)
    } else if (tempoAcumulado > 0) {
      // Treino em andamento - verifica se há um tempo de início salvo
      const inicioSalvo = carregarDoLocalStorage(chaveInicio, null)
      if (inicioSalvo) {
        const agora = Math.floor(Date.now() / 1000)
        const tempoDesdeRetomada = agora - inicioSalvo
        const tempoTotalCalculado = tempoAcumulado + tempoDesdeRetomada
        setTempoTotal(tempoTotalCalculado)
        setTempoInicio(inicioSalvo)
      } else {
        // Não há início salvo, então inicia um novo período de contagem
        const agora = Math.floor(Date.now() / 1000)
        setTempoInicio(agora)
        salvarNoLocalStorage(chaveInicio, agora)
        setTempoTotal(tempoAcumulado)
      }
    } else {
      // Novo treino - inicia do zero
      const agora = Math.floor(Date.now() / 1000)
      setTempoInicio(agora)
      salvarNoLocalStorage(chaveInicio, agora)
      salvarNoLocalStorage(chaveTempoAcumulado, 0)
      setTempoTotal(0)
    }

    // Cleanup: salva o tempo quando o componente é desmontado
    return () => {
      if (treinoId) {
        const pausadoAtual = carregarDoLocalStorage(chavePausado, false)
        if (pausadoAtual) {
          // Se está pausado, garante que o tempo está salvo
          const tempoPausadoAtual = carregarDoLocalStorage(chaveTempoPausado, null)
          const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)
          const tempoParaSalvar = tempoPausadoAtual !== null ? tempoPausadoAtual : tempoAcumuladoAtual

          if (tempoParaSalvar > 0) {
            salvarNoLocalStorage(chaveTempoPausado, tempoParaSalvar)
            salvarNoLocalStorage(chaveTempoAcumulado, tempoParaSalvar)
            salvarNoLocalStorage(`treino_${treinoId}_tempo`, tempoParaSalvar)
          }
        }
      }
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

      const chaveTempo = `treino_${treinoId}_tempo`
      const chavePausado = `treino_${treinoId}_pausado`
      const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
      const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`

      if (tempoInicio !== null) {
        // Treino estava rodando e foi pausado agora - calcula e salva o tempo
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
      } else {
        // Treino já estava pausado - garante que o tempo está salvo corretamente
        const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, null)
        const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)

        // Usa o tempo pausado se disponível, senão usa o tempo acumulado
        const tempoParaSalvar = tempoPausado !== null ? tempoPausado : tempoAcumuladoAtual

        // Garante que o tempo está salvo em todos os lugares necessários
        if (tempoParaSalvar > 0) {
          salvarNoLocalStorage(chaveTempo, tempoParaSalvar)
          salvarNoLocalStorage(chavePausado, true)
          salvarNoLocalStorage(chaveTempoPausado, tempoParaSalvar)
          salvarNoLocalStorage(chaveTempoAcumulado, tempoParaSalvar)
          setTempoTotal(tempoParaSalvar)
        }
      }
      return
    }

    if (tempoInicio === null) {
      const chavePausado = `treino_${treinoId}_pausado`
      const chaveTempoPausado = `treino_${treinoId}_tempoPausado`
      const chaveTempoAcumulado = `treino_${treinoId}_tempoAcumulado`
      const chaveInicio = `treino_${treinoId}_inicio`

      // Verifica se estava pausado e precisa retomar
      const pausado = carregarDoLocalStorage(chavePausado, false)
      if (pausado) {
        // Usa tempoPausado se disponível, senão usa tempoAcumulado
        const tempoPausado = carregarDoLocalStorage(chaveTempoPausado, null)
        const tempoAcumuladoAtual = carregarDoLocalStorage(chaveTempoAcumulado, 0)
        const tempoParaContinuar = tempoPausado !== null ? tempoPausado : tempoAcumuladoAtual
        const agora = Math.floor(Date.now() / 1000)

        // Salva o tempo acumulado antes de retomar
        salvarNoLocalStorage(chaveTempoAcumulado, tempoParaContinuar)
        salvarNoLocalStorage(chaveInicio, agora)
        salvarNoLocalStorage(chavePausado, false)
        removerDoLocalStorage(chaveTempoPausado)

        setTempoInicio(agora)
        setTempoTotal(tempoParaContinuar)
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

