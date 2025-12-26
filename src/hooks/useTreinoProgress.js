import { useState, useEffect } from 'react'
import { salvarNoLocalStorage, carregarDoLocalStorage, removerDoLocalStorage } from '../utils/storage'

export const useTreinoProgress = (treinoId) => {
  const [progresso, setProgresso] = useState({})
  const [exerciciosPulados, setExerciciosPulados] = useState([])
  const [exercicioInicial, setExercicioInicial] = useState(null)

  useEffect(() => {
    if (!treinoId) {
      setProgresso({})
      setExerciciosPulados([])
      setExercicioInicial(null)
      return
    }

    const chaveProgresso = `treino_${treinoId}_progresso`
    const chavePulados = `treino_${treinoId}_pulados`
    const chaveInicial = `treino_${treinoId}_inicial`

    const progressoSalvo = carregarDoLocalStorage(chaveProgresso, {})
    const puladosSalvos = carregarDoLocalStorage(chavePulados, [])
    const inicialSalvo = carregarDoLocalStorage(chaveInicial, null)

    setProgresso(progressoSalvo)
    setExerciciosPulados(puladosSalvos)
    setExercicioInicial(inicialSalvo)
  }, [treinoId])

  const atualizarProgresso = (novoProgresso) => {
    setProgresso(novoProgresso)
    if (treinoId) {
      const chaveProgresso = `treino_${treinoId}_progresso`
      salvarNoLocalStorage(chaveProgresso, novoProgresso)
    }
  }

  const marcarSerie = (exercicioIndex, serieIndex) => {
    const chave = `${exercicioIndex}_${serieIndex}`
    const novoProgresso = { ...progresso, [chave]: true }
    atualizarProgresso(novoProgresso)
  }

  const pularExercicio = (exercicioIndex) => {
    if (!exerciciosPulados.includes(exercicioIndex)) {
      const novosPulados = [...exerciciosPulados, exercicioIndex]
      setExerciciosPulados(novosPulados)
      if (treinoId) {
        const chavePulados = `treino_${treinoId}_pulados`
        salvarNoLocalStorage(chavePulados, novosPulados)
      }
    }
  }

  const desfazerPularExercicio = (exercicioIndex) => {
    const novosPulados = exerciciosPulados.filter(idx => idx !== exercicioIndex)
    setExerciciosPulados(novosPulados)
    if (treinoId) {
      const chavePulados = `treino_${treinoId}_pulados`
      salvarNoLocalStorage(chavePulados, novosPulados)
    }
  }

  const definirExercicioInicial = (exercicioIndex) => {
    setExercicioInicial(exercicioIndex)
    if (treinoId) {
      const chaveInicial = `treino_${treinoId}_inicial`
      salvarNoLocalStorage(chaveInicial, exercicioIndex)
    }
  }

  const limparProgresso = () => {
    if (!treinoId) return

    const chaveProgresso = `treino_${treinoId}_progresso`
    const chavePulados = `treino_${treinoId}_pulados`
    const chaveInicial = `treino_${treinoId}_inicial`

    removerDoLocalStorage(chaveProgresso)
    removerDoLocalStorage(chavePulados)
    removerDoLocalStorage(chaveInicial)

    setProgresso({})
    setExerciciosPulados([])
    setExercicioInicial(null)
  }

  return {
    progresso,
    exerciciosPulados,
    exercicioInicial,
    marcarSerie,
    pularExercicio,
    desfazerPularExercicio,
    definirExercicioInicial,
    limparProgresso,
    atualizarProgresso
  }
}

