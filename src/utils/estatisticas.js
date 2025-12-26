import { carregarDoLocalStorage } from './storage'
import { obterSemanaAtual } from './time'

export const calcularEstatisticas = (periodo = 'semana') => {
  const historico = carregarDoLocalStorage('historico_treinos', [])
  if (!Array.isArray(historico)) {
    return {
      totalTreinos: 0,
      tempoTotal: 0,
      exerciciosMaisFeitos: [],
      exerciciosMenosFeitos: [],
      treinosPorDia: 0,
      exerciciosPulados: 0
    }
  }

  const agora = new Date()
  let dataInicio

  switch (periodo) {
    case 'semana':
      const { inicio } = obterSemanaAtual()
      dataInicio = inicio
      break
    case 'quinzena':
      dataInicio = new Date(agora)
      dataInicio.setDate(agora.getDate() - 15)
      break
    case 'mes':
      dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
      break
    default:
      dataInicio = new Date(0)
  }

  const treinosPeriodo = historico.filter(reg => {
    if (!reg || !reg.data) return false
    try {
      const dataRegistro = new Date(reg.data)
      return dataRegistro >= dataInicio
    } catch {
      return false
    }
  })

  const exerciciosCount = {}
  let totalExerciciosPulados = 0

  treinosPeriodo.forEach(reg => {
    if (reg.exerciciosPulados && Array.isArray(reg.exerciciosPulados)) {
      totalExerciciosPulados += reg.exerciciosPulados.length
    }
    
    if (reg.exercicios && Array.isArray(reg.exercicios)) {
      reg.exercicios.forEach(ex => {
        if (ex && ex.nome && !ex.pulado) {
          exerciciosCount[ex.nome] = (exerciciosCount[ex.nome] || 0) + 1
        }
      })
    }
  })

  const exerciciosOrdenados = Object.entries(exerciciosCount)
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalTreinos: treinosPeriodo.length,
    tempoTotal: treinosPeriodo.reduce((sum, reg) => sum + (reg.tempoTotal || 0), 0),
    exerciciosMaisFeitos: exerciciosOrdenados.slice(0, 5),
    exerciciosMenosFeitos: exerciciosOrdenados.slice(-5).reverse(),
    treinosPorDia: treinosPeriodo.length > 0 ? (treinosPeriodo.length / (periodo === 'semana' ? 7 : periodo === 'quinzena' ? 15 : 30)).toFixed(1) : 0,
    exerciciosPulados: totalExerciciosPulados
  }
}

