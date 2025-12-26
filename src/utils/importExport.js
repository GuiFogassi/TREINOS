import { validarTreino } from './validation'
import { TEMPO_DESCANSO } from '../constants/treinos'

export const converterDescansoParaSegundos = (descansoStr) => {
  if (typeof descansoStr === 'number') return descansoStr
  if (!descansoStr || typeof descansoStr !== 'string') return 120

  const str = descansoStr.toLowerCase().trim()
  let segundos = 0

  const matchMin = str.match(/(\d+)\s*min/)
  if (matchMin) {
    segundos += parseInt(matchMin[1]) * 60
  }

  const matchSeg = str.match(/(\d+)\s*seg/)
  if (matchSeg) {
    segundos += parseInt(matchSeg[1])
  }

  if (segundos === 0) {
    const num = parseInt(str)
    if (!isNaN(num)) {
      segundos = num < 10 ? num * 60 : num
    }
  }

  return segundos > 0 ? segundos : TEMPO_DESCANSO
}

export const parsearSeriesReps = (seriesRepsStr) => {
  if (!seriesRepsStr || typeof seriesRepsStr !== 'string') {
    return { series: 4, repeticoes: '12' }
  }

  const str = seriesRepsStr.trim()
  const matchSeries = str.match(/^(\d+)x/)
  const series = matchSeries ? parseInt(matchSeries[1]) : 4

  const matchReps = str.match(/^\d+x(.+)$/)
  if (matchReps) {
    let repeticoes = matchReps[1].trim()
    repeticoes = repeticoes.replace(/seg$/i, '')
    return { series, repeticoes }
  }

  return { series, repeticoes: '12' }
}

export const processarTreinosImportados = (dados) => {
  let treinosProcessados = {}

  if (dados.treinos && Array.isArray(dados.treinos)) {
    dados.treinos.forEach((treino, index) => {
      if (treino && treino.exercicios && Array.isArray(treino.exercicios)) {
        const treinoId = treino.identificador
          ? treino.identificador.replace(/\s+/g, '_').toLowerCase()
          : `treino_${Date.now()}_${index}`

        const nomeTreino = treino.identificador || treino.nome || `Treino ${index + 1}`

        treinosProcessados[treinoId] = {
          nome: nomeTreino,
          exercicios: treino.exercicios.map(ex => {
            const { series, repeticoes } = parsearSeriesReps(ex.series_reps || ex.series_reps)

            return {
              nome: ex.nome || 'Exercício sem nome',
              series: series,
              repeticoes: repeticoes,
              link: ex.link_apoio || ex.link || '',
              metodo: ex.metodo || '',
              descanso: converterDescansoParaSegundos(ex.descanso)
            }
          })
        }
      }
    })
  }
  else if (dados.treinos && typeof dados.treinos === 'object' && !Array.isArray(dados.treinos)) {
    treinosProcessados = dados.treinos
  }
  else if (Array.isArray(dados)) {
    dados.forEach((treino, index) => {
      if (validarTreino(treino)) {
        const treinoId = treino.id || treino.identificador?.replace(/\s+/g, '_').toLowerCase() || `treino_${Date.now()}_${index}`
        treinosProcessados[treinoId] = {
          nome: treino.identificador || treino.nome,
          exercicios: treino.exercicios || []
        }
      }
    })
  }
  else if (typeof dados === 'object') {
    Object.keys(dados).forEach(key => {
      const item = dados[key]
      if (validarTreino(item)) {
        treinosProcessados[key] = {
          nome: item.identificador || item.nome,
          exercicios: (item.exercicios || []).map(ex => ({
            nome: ex.nome || '',
            series: ex.series || 4,
            repeticoes: ex.repeticoes || '12',
            link: ex.link_apoio || ex.link || '',
            metodo: ex.metodo || '',
            descanso: typeof ex.descanso === 'string' ? converterDescansoParaSegundos(ex.descanso) : (ex.descanso || 120)
          }))
        }
      }
    })
  }

  const treinosNormalizados = {}
  Object.keys(treinosProcessados).forEach(treinoId => {
    const treino = treinosProcessados[treinoId]
    if (treino && treino.exercicios && Array.isArray(treino.exercicios)) {
      treinosNormalizados[treinoId] = {
        nome: treino.nome || 'Treino sem nome',
        exercicios: treino.exercicios.map(ex => ({
          nome: ex.nome || 'Exercício sem nome',
          series: ex.series || 4,
          repeticoes: ex.repeticoes || '12',
          link: ex.link || '',
          metodo: ex.metodo || '',
          descanso: typeof ex.descanso === 'string' ? converterDescansoParaSegundos(ex.descanso) : (ex.descanso || 120)
        }))
      }
    }
  })

  return treinosNormalizados
}

