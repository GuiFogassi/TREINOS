import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Play, RotateCcw, CheckCircle, Clock, SkipForward, ArrowLeft, Plus, Trash2, X, Edit2, Calendar, ExternalLink, BarChart3, TrendingUp, Download, Upload, Mail, MessageCircle, Github, Linkedin } from 'lucide-react'

const TREINOS_PADRAO = {
  A: {
    nome: 'Treino A',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: 12 },
      { nome: 'Agachamento', series: 4, repeticoes: 10 },
      { nome: 'Remada Curvada', series: 3, repeticoes: 12 },
      { nome: 'Desenvolvimento', series: 3, repeticoes: 10 },
      { nome: 'Tríceps Pulley', series: 3, repeticoes: 15 }
    ]
  },
  B: {
    nome: 'Treino B',
    exercicios: [
      { nome: 'Levantamento Terra', series: 4, repeticoes: 8 },
      { nome: 'Barra Fixa', series: 3, repeticoes: 10 },
      { nome: 'Leg Press', series: 4, repeticoes: 15 },
      { nome: 'Rosca Direta', series: 3, repeticoes: 12 },
      { nome: 'Panturrilha', series: 4, repeticoes: 20 }
    ]
  },
  C: {
    nome: 'Treino C',
    exercicios: [
      { nome: 'Supino Inclinado', series: 4, repeticoes: 10 },
      { nome: 'Stiff', series: 3, repeticoes: 12 },
      { nome: 'Crucifixo', series: 3, repeticoes: 12 },
      { nome: 'Cadeira Extensora', series: 3, repeticoes: 15 },
      { nome: 'Bíceps Alternado', series: 3, repeticoes: 12 }
    ]
  },
  D: {
    nome: 'Treino D',
    exercicios: [
      { nome: 'Supino Declinado', series: 4, repeticoes: 10 },
      { nome: 'Afundo', series: 3, repeticoes: 12 },
      { nome: 'Puxada Frontal', series: 3, repeticoes: 12 },
      { nome: 'Elevação Lateral', series: 3, repeticoes: 15 },
      { nome: 'Tríceps Testa', series: 3, repeticoes: 12 }
    ]
  },
  E: {
    nome: 'Treino E',
    exercicios: [
      { nome: 'Supino com Halteres', series: 4, repeticoes: 10 },
      { nome: 'Agachamento Sumô', series: 4, repeticoes: 12 },
      { nome: 'Remada Unilateral', series: 3, repeticoes: 12 },
      { nome: 'Encolhimento', series: 3, repeticoes: 15 },
      { nome: 'Rosca Martelo', series: 3, repeticoes: 12 }
    ]
  }
}

const TEMPO_DESCANSO = 120

const METODOS_TREINO = [
  'Cluster set',
  'Ponto Zero',
  'Rest Pause',
  'DropSet',
  'Strip Set',
  'Progressão',
  'SST Variação de tempo',
  'SST Variação de carga',
  'Bi-set',
  'Tri-set',
  'Pico de contração',
  'Progressão+drop na ultima'
]

function App() {
  const [treinos, setTreinos] = useState({})
  const [treinoSelecionado, setTreinoSelecionado] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [treinoEditando, setTreinoEditando] = useState(null)
  const [tempoTotal, setTempoTotal] = useState(0)
  const [tempoDescanso, setTempoDescanso] = useState(0)
  const [serieEmDescanso, setSerieEmDescanso] = useState(null)
  const [progresso, setProgresso] = useState({})
  const [treinoFinalizado, setTreinoFinalizado] = useState(false)
  const [mostrarConclusao, setMostrarConclusao] = useState(false)
  const [tempoInicio, setTempoInicio] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState('treinos')
  const [planejamentoSemanal, setPlanejamentoSemanal] = useState({
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
    sabado: [],
    domingo: []
  })

  const [mostrarModalCardio, setMostrarModalCardio] = useState(false)
  const [cardioEditando, setCardioEditando] = useState(null)
  const [cardioForm, setCardioForm] = useState({ tipo: '', tempo: 0 })

  const [modalConfirmacao, setModalConfirmacao] = useState(null)
  const [modalInfo, setModalInfo] = useState(null)
  const [modalResumoSemanal, setModalResumoSemanal] = useState(null)

  const [exercicioEditando, setExercicioEditando] = useState(null)
  const [exercicioEditado, setExercicioEditado] = useState({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })
  const [periodoStats, setPeriodoStats] = useState('semana')

  const [novoExercicio, setNovoExercicio] = useState({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })

  const intervaloTotalRef = useRef(null)
  const intervaloDescansoRef = useRef(null)

  const salvarNoLocalStorage = (chave, dados) => {
    try {
      localStorage.setItem(chave, JSON.stringify(dados))
      return true
    } catch (error) {
      console.error(`Erro ao salvar ${chave}:`, error)
      mostrarInfo('Erro ao salvar dados. Verifique se há espaço suficiente no dispositivo.')
      return false
    }
  }

  const carregarDoLocalStorage = (chave, valorPadrao = null) => {
    try {
      const dados = localStorage.getItem(chave)
      if (!dados) return valorPadrao
      return JSON.parse(dados)
    } catch (error) {
      console.error(`Erro ao carregar ${chave}:`, error)
      mostrarInfo('Erro ao carregar dados. Usando dados padrão.')
      return valorPadrao
    }
  }

  const validarTreino = (treino) => {
    if (!treino || typeof treino !== 'object') return false
    if (!treino.nome || typeof treino.nome !== 'string') return false
    if (!Array.isArray(treino.exercicios)) return false
    return true
  }

  useEffect(() => {
    const treinosSalvos = carregarDoLocalStorage('treinos_personalizados')
    if (treinosSalvos && typeof treinosSalvos === 'object') {
      const treinosMigrados = {}
      Object.keys(treinosSalvos).forEach(treinoId => {
        const treino = treinosSalvos[treinoId]
        if (validarTreino(treino)) {
          if (treino.exercicios) {
            treino.exercicios = treino.exercicios.map(ex => ({
              ...ex,
              descanso: ex.descanso || 120,
              series: ex.series || 4,
              repeticoes: ex.repeticoes || '12',
              nome: ex.nome || 'Exercício sem nome'
            }))
          }
          treinosMigrados[treinoId] = treino
        }
      })
      if (Object.keys(treinosMigrados).length > 0) {
        setTreinos(treinosMigrados)
        salvarNoLocalStorage('treinos_personalizados', treinosMigrados)
      } else {
        setTreinos(TREINOS_PADRAO)
      }
    } else {
      setTreinos(TREINOS_PADRAO)
    }
  }, [])

  useEffect(() => {
    const planejamentoSalvo = carregarDoLocalStorage('planejamento_semanal', {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
      domingo: []
    })
    if (planejamentoSalvo && typeof planejamentoSalvo === 'object') {
      const planejamentoMigrado = {}
      const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      diasSemana.forEach(dia => {
        if (Array.isArray(planejamentoSalvo[dia])) {
          planejamentoMigrado[dia] = planejamentoSalvo[dia]
        } else {
          planejamentoMigrado[dia] = planejamentoSalvo[dia] ? [planejamentoSalvo[dia]] : []
        }
      })
      setPlanejamentoSemanal(planejamentoMigrado)
    }
  }, [])

  useEffect(() => {
    if (Object.keys(treinos).length > 0 && !treinos['CARDIO']) {
      const novosTreinos = {
        ...treinos,
        CARDIO: {
          nome: 'Cardio',
          tipo: 'cardio',
          exercicios: []
        }
      }
      salvarTreinos(novosTreinos)
    }
  }, [treinos])

  useEffect(() => {
    if (Object.keys(treinos).length > 0) {
      salvarNoLocalStorage('treinos_personalizados', treinos)
    }
  }, [treinos])

  const planejamentoCarregadoRef = useRef(false)

  useEffect(() => {
    const planejamentoSalvo = carregarDoLocalStorage('planejamento_semanal', {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
      domingo: []
    })
    if (planejamentoSalvo && typeof planejamentoSalvo === 'object') {
      const planejamentoMigrado = {}
      const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      diasSemana.forEach(dia => {
        if (Array.isArray(planejamentoSalvo[dia])) {
          planejamentoMigrado[dia] = planejamentoSalvo[dia]
        } else {
          planejamentoMigrado[dia] = planejamentoSalvo[dia] ? [planejamentoSalvo[dia]] : []
        }
      })
      setPlanejamentoSemanal(planejamentoMigrado)
    }
    setTimeout(() => {
      planejamentoCarregadoRef.current = true
    }, 300)
  }, [])

  useEffect(() => {
    if (planejamentoCarregadoRef.current && planejamentoSemanal && Object.keys(planejamentoSemanal).length === 7) {
      salvarNoLocalStorage('planejamento_semanal', planejamentoSemanal)
    }
  }, [planejamentoSemanal])

  const salvarTreinos = (novosTreinos) => {
    setTreinos(novosTreinos)
    salvarNoLocalStorage('treinos_personalizados', novosTreinos)
  }

  const mostrarConfirmacao = (mensagem, onConfirm, onCancel) => {
    setModalConfirmacao({
      mensagem,
      onConfirm: () => {
        onConfirm()
        setModalConfirmacao(null)
      },
      onCancel: () => {
        if (onCancel) onCancel()
        setModalConfirmacao(null)
      }
    })
  }

  const mostrarInfo = (mensagem) => {
    setModalInfo({ mensagem })
  }

  const salvarHistoricoTreino = (treinoId, tempoTotal) => {
    const historico = carregarDoLocalStorage('historico_treinos', [])
    if (!Array.isArray(historico)) return

    const novoRegistro = {
      treinoId,
      nomeTreino: treinos[treinoId]?.nome || 'Treino',
      data: new Date().toISOString(),
      tempoTotal,
      exercicios: treinos[treinoId]?.exercicios || []
    }
    historico.push(novoRegistro)
    salvarNoLocalStorage('historico_treinos', historico)
  }

  const obterSemanaAtual = () => {
    const hoje = new Date()
    const dia = hoje.getDay()
    const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1)
    const segunda = new Date(hoje.setDate(diff))
    segunda.setHours(0, 0, 0, 0)
    const domingo = new Date(segunda)
    domingo.setDate(segunda.getDate() + 6)
    domingo.setHours(23, 59, 59, 999)
    return { inicio: segunda, fim: domingo }
  }

  const calcularTempoSemanal = () => {
    const { inicio, fim } = obterSemanaAtual()
    const historico = carregarDoLocalStorage('historico_treinos', [])
    if (!Array.isArray(historico)) return 0

    const treinosSemana = historico.filter(reg => {
      if (!reg || !reg.data) return false
      const dataRegistro = new Date(reg.data)
      return dataRegistro >= inicio && dataRegistro <= fim
    })

    return treinosSemana.reduce((total, reg) => total + (reg.tempoTotal || 0), 0)
  }

  const verificarResumoSemanal = () => {
    const hoje = new Date()
    const diaSemana = hoje.getDay()

    if (diaSemana === 0 || diaSemana === 1) {
      const tempoSemanal = calcularTempoSemanal()
      if (tempoSemanal > 0) {
        setModalResumoSemanal({
          tempoTotal: tempoSemanal,
          periodo: diaSemana === 0 ? 'esta semana' : 'semana anterior'
        })
      }
    }
  }

  const IconeVideo = ({ url }) => {
    if (!url) return null

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
        onClick={(e) => e.stopPropagation()}
        title="Abrir vídeo"
      >
        <svg
          className="w-5 h-5 text-white/50 group-hover:text-white/70"
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

  const treinosOrdenados = () => {
    return Object.keys(treinos)
      .filter(id => id !== 'CARDIO')
      .sort((a, b) => {
        const nomeA = treinos[a].nome.toLowerCase()
        const nomeB = treinos[b].nome.toLowerCase()
        return nomeA.localeCompare(nomeB)
      })
  }

  useEffect(() => {
    if (treinoSelecionado) {
      const chave = `treino_${treinoSelecionado}_progresso`
      const salvo = carregarDoLocalStorage(chave, {})
      if (salvo && typeof salvo === 'object') {
        setProgresso(salvo)
      }

      try {
        const tempoSalvo = localStorage.getItem(`treino_${treinoSelecionado}_tempo`)
        if (tempoSalvo) {
          const tempo = parseInt(tempoSalvo)
          if (!isNaN(tempo)) setTempoTotal(tempo)
        }

        const inicioSalvo = localStorage.getItem(`treino_${treinoSelecionado}_inicio`)
        if (inicioSalvo) {
          const inicio = parseInt(inicioSalvo)
          if (!isNaN(inicio)) {
            setTempoInicio(inicio)
            const agora = Math.floor(Date.now() / 1000)
            setTempoTotal(agora - inicio)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tempo do treino:', error)
      }
    }
  }, [treinoSelecionado])

  useEffect(() => {
    if (treinoSelecionado && !treinoFinalizado && !mostrarConclusao) {
      if (tempoInicio === null) {
        const agora = Math.floor(Date.now() / 1000)
        setTempoInicio(agora)
        try {
          localStorage.setItem(`treino_${treinoSelecionado}_inicio`, agora.toString())
        } catch (error) {
          console.error('Erro ao salvar início do treino:', error)
        }
      }

      intervaloTotalRef.current = setInterval(() => {
        if (tempoInicio !== null) {
          const agora = Math.floor(Date.now() / 1000)
          const decorrido = agora - tempoInicio
          setTempoTotal(decorrido)
          try {
            localStorage.setItem(`treino_${treinoSelecionado}_tempo`, decorrido.toString())
          } catch (error) {
            console.error('Erro ao salvar tempo do treino:', error)
          }
        }
      }, 1000)

      return () => {
        if (intervaloTotalRef.current) {
          clearInterval(intervaloTotalRef.current)
        }
      }
    }
  }, [treinoSelecionado, treinoFinalizado, mostrarConclusao, tempoInicio])

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

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`
  }

  const formatarTempoDescanso = (segundos) => {
    if (segundos < 60) {
      return `${segundos}seg`
    }
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    if (segs === 0) {
      return `${minutos}min`
    }
    return `${minutos}min${segs}seg`
  }

  const iniciarTreino = (treinoId) => {
    const hoje = new Date()
    if (hoje.getDay() === 1) {
      verificarResumoSemanal()
    }

    setTreinoSelecionado(treinoId)
    setTreinoFinalizado(false)
    setMostrarConclusao(false)
    setTempoDescanso(0)
    setSerieEmDescanso(null)
  }

  const marcarSerie = (exercicioIndex, serieIndex) => {
    const chave = `${exercicioIndex}_${serieIndex}`
    const novoProgresso = { ...progresso, [chave]: true }
    setProgresso(novoProgresso)

    const chaveStorage = `treino_${treinoSelecionado}_progresso`
    salvarNoLocalStorage(chaveStorage, novoProgresso)

    const exercicio = treinos[treinoSelecionado].exercicios[exercicioIndex]

    const totalExercicios = treinos[treinoSelecionado].exercicios.length
    const ultimoExercicio = exercicioIndex === totalExercicios - 1
    const ultimaSerie = serieIndex === exercicio.series

    if (!(ultimoExercicio && ultimaSerie)) {
      let proximaSerieIndex, proximoExercicioIndex

      if (serieIndex < exercicio.series) {
        proximaSerieIndex = serieIndex + 1
        proximoExercicioIndex = exercicioIndex
      } else {
        proximaSerieIndex = 1
        proximoExercicioIndex = exercicioIndex + 1
      }
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

  const podeMarcarSerie = (exercicioIndex, serieIndex) => {
    if (exercicioIndex === 0 && serieIndex === 1) {
      return true
    }

    if (serieIndex === 1 && exercicioIndex > 0) {
      const exercicioAnterior = treinos[treinoSelecionado].exercicios[exercicioIndex - 1]
      for (let i = 1; i <= exercicioAnterior.series; i++) {
        if (!progresso[`${exercicioIndex - 1}_${i}`]) {
          return false
        }
      }
    } else {
      const serieAnterior = `${exercicioIndex}_${serieIndex - 1}`
      if (!progresso[serieAnterior]) {
        return false
      }
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

  const exercicioCompleto = (exercicioIndex) => {
    const exercicio = treinos[treinoSelecionado].exercicios[exercicioIndex]
    for (let i = 1; i <= exercicio.series; i++) {
      if (!progresso[`${exercicioIndex}_${i}`]) {
        return false
      }
    }
    return true
  }

  const treinoCompleto = () => {
    if (treinoSelecionado === 'CARDIO') {
      return true
    }
    const exercicios = treinos[treinoSelecionado].exercicios
    return exercicios.every((_, index) => exercicioCompleto(index))
  }

  const finalizarTreino = () => {
    setTreinoFinalizado(true)
    setMostrarConclusao(true)

    salvarHistoricoTreino(treinoSelecionado, tempoTotal)

    if (intervaloTotalRef.current) {
      clearInterval(intervaloTotalRef.current)
    }
    if (intervaloDescansoRef.current) {
      clearInterval(intervaloDescansoRef.current)
    }
  }

  const fecharConclusao = () => {
    localStorage.removeItem(`treino_${treinoSelecionado}_progresso`)
    localStorage.removeItem(`treino_${treinoSelecionado}_tempo`)
    localStorage.removeItem(`treino_${treinoSelecionado}_inicio`)

    setTreinoSelecionado(null)
    setProgresso({})
    setTempoTotal(0)
    setTempoDescanso(0)
    setSerieEmDescanso(null)
    setTreinoFinalizado(false)
    setMostrarConclusao(false)
    setTempoInicio(null)

    verificarResumoSemanal()
  }

  const resetarHistorico = () => {
    mostrarConfirmacao(
      'Tem certeza que deseja resetar todo o histórico? Todos os progressos serão perdidos.',
      () => {
        try {
          Object.keys(treinos).forEach(treino => {
            try {
              localStorage.removeItem(`treino_${treino}_progresso`)
              localStorage.removeItem(`treino_${treino}_tempo`)
              localStorage.removeItem(`treino_${treino}_inicio`)
            } catch (error) {
              console.error(`Erro ao remover dados do treino ${treino}:`, error)
            }
          })
          localStorage.removeItem('historico_treinos')
          mostrarInfo('Histórico resetado com sucesso!')
        } catch (error) {
          console.error('Erro ao resetar histórico:', error)
          mostrarInfo('Erro ao resetar histórico.')
        }
      }
    )
  }

  const exportarDados = () => {
    try {
      const dados = {
        treinos: carregarDoLocalStorage('treinos_personalizados', {}),
        planejamento: carregarDoLocalStorage('planejamento_semanal', {
          segunda: [], terca: [], quarta: [], quinta: [], sexta: [], sabado: [], domingo: []
        }),
        historico: carregarDoLocalStorage('historico_treinos', []),
        versao: '1.0',
        dataExportacao: new Date().toISOString()
      }

      const dadosJSON = JSON.stringify(dados, null, 2)
      const blob = new Blob([dadosJSON], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `treinos-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      mostrarInfo('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      mostrarInfo('Erro ao exportar dados.')
    }
  }

  const converterDescansoParaSegundos = (descansoStr) => {
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

    return segundos > 0 ? segundos : 120
  }
  const parsearSeriesReps = (seriesRepsStr) => {
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

  const processarTreinosImportados = (dados) => {
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
    // Caso 2: Formato completo do app (com treinos como objeto)
    else if (dados.treinos && typeof dados.treinos === 'object' && !Array.isArray(dados.treinos)) {
      treinosProcessados = dados.treinos
    }
    // Caso 3: Array de treinos direto
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
    // Caso 4: Objeto com treinos como propriedades
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

    // Normalizar todos os treinos processados
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

  // Importar dados (restore) - melhorado para aceitar diferentes formatos
  const importarDados = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const dados = JSON.parse(event.target.result)

          if (!dados || (typeof dados !== 'object' && !Array.isArray(dados))) {
            mostrarInfo('Arquivo inválido. O arquivo deve conter um objeto ou array JSON válido.')
            return
          }

          const treinosProcessados = processarTreinosImportados(dados)

          if (Object.keys(treinosProcessados).length === 0) {
            mostrarInfo('Nenhum treino válido encontrado no arquivo. Verifique o formato do JSON.')
            return
          }

          const mensagem = Object.keys(treinosProcessados).length === 1
            ? `Importar 1 treino? Isso irá substituir os treinos atuais.`
            : `Importar ${Object.keys(treinosProcessados).length} treinos? Isso irá substituir os treinos atuais.`

          mostrarConfirmacao(
            mensagem,
            () => {
              try {
                salvarNoLocalStorage('treinos_personalizados', treinosProcessados)
                setTreinos(treinosProcessados)

                if (dados.planejamento && typeof dados.planejamento === 'object') {
                  setPlanejamentoSemanal(dados.planejamento)
                  planejamentoCarregadoRef.current = true
                  salvarNoLocalStorage('planejamento_semanal', dados.planejamento)
                }

                if (dados.historico && Array.isArray(dados.historico)) {
                  salvarNoLocalStorage('historico_treinos', dados.historico)
                }

                mostrarInfo(`${Object.keys(treinosProcessados).length} treino(s) importado(s) com sucesso!`)
              } catch (error) {
                console.error('Erro ao importar dados:', error)
                mostrarInfo('Erro ao importar dados. Verifique se o arquivo está correto.')
              }
            }
          )
        } catch (error) {
          console.error('Erro ao ler arquivo:', error)
          mostrarInfo('Erro ao ler arquivo. Verifique se é um arquivo JSON válido.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const voltarInicio = () => {
    mostrarConfirmacao(
      'Deseja voltar ao início? O progresso será mantido.',
      () => {
        setTreinoSelecionado(null)
        setModoEdicao(false)
        setTreinoEditando(null)
        setTempoDescanso(0)
        setSerieEmDescanso(null)
        if (intervaloDescansoRef.current) {
          clearInterval(intervaloDescansoRef.current)
        }
      }
    )
  }

  const criarNovoTreino = () => {
    setMostrarModalCardio(true)
  }

  const criarTreinoNormal = () => {
    const novoId = `treino_${Date.now()}`
    const novoTreino = {
      nome: 'Novo Treino',
      exercicios: []
    }
    const novosTreinos = { ...treinos, [novoId]: novoTreino }
    salvarTreinos(novosTreinos)
    setTreinoEditando(novoId)
    setModoEdicao(true)
    setMostrarModalCardio(false)
  }

  const criarCardio = () => {
    setCardioEditando('CARDIO')
    setCardioForm({ tipo: '', tempo: 0 })
    setMostrarModalCardio(false)
  }

  const editarTreino = (treinoId) => {
    setTreinoEditando(treinoId)
    setModoEdicao(true)
  }

  const salvarEdicaoTreino = () => {
    setModoEdicao(false)
    setTreinoEditando(null)
    setNovoExercicio({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })
  }

  const adicionarExercicio = () => {
    if (!novoExercicio.nome.trim()) return

    const treino = treinos[treinoEditando]
    const exercicioParaAdicionar = {
      nome: novoExercicio.nome,
      series: novoExercicio.series,
      repeticoes: novoExercicio.repeticoes,
      link: novoExercicio.link.trim() || '',
      metodo: novoExercicio.metodo.trim() || '',
      descanso: novoExercicio.descanso || 120
    }
    const exerciciosAtualizados = [...treino.exercicios, exercicioParaAdicionar]
    const novosTreinos = {
      ...treinos,
      [treinoEditando]: {
        ...treino,
        exercicios: exerciciosAtualizados
      }
    }
    salvarTreinos(novosTreinos)
    setNovoExercicio({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })
  }

  const removerExercicio = (index) => {
    const treino = treinos[treinoEditando]
    const exercicioNome = treino.exercicios[index]?.nome || 'este exercício'

    mostrarConfirmacao(
      `Tem certeza que deseja remover "${exercicioNome}"?`,
      () => {
        const exerciciosAtualizados = treino.exercicios.filter((_, i) => i !== index)
        const novosTreinos = {
          ...treinos,
          [treinoEditando]: {
            ...treino,
            exercicios: exerciciosAtualizados
          }
        }
        salvarTreinos(novosTreinos)
        mostrarInfo('Exercício removido com sucesso!')
      }
    )
  }

  const atualizarNomeTreino = (novoNome) => {
    const treino = treinos[treinoEditando]
    const novosTreinos = {
      ...treinos,
      [treinoEditando]: {
        ...treino,
        nome: novoNome
      }
    }
    salvarTreinos(novosTreinos)
  }

  const deletarTreino = (treinoId) => {
    if (treinoId === 'CARDIO') {
      mostrarInfo('Cardio não pode ser deletado')
      return
    }

    mostrarConfirmacao(
      'Tem certeza que deseja deletar este treino?',
      () => {
        const novosTreinos = { ...treinos }
        delete novosTreinos[treinoId]
        salvarTreinos(novosTreinos)

        localStorage.removeItem(`treino_${treinoId}_progresso`)
        localStorage.removeItem(`treino_${treinoId}_tempo`)
        localStorage.removeItem(`treino_${treinoId}_inicio`)

        const novoPlanejamento = { ...planejamentoSemanal }
        Object.keys(novoPlanejamento).forEach(dia => {
          const treinosDia = novoPlanejamento[dia] || []
          const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])
          novoPlanejamento[dia] = treinosArray.filter(id => id !== treinoId)
        })
        setPlanejamentoSemanal(novoPlanejamento)
        planejamentoCarregadoRef.current = true
        salvarNoLocalStorage('planejamento_semanal', novoPlanejamento)

        setModoEdicao(false)
        setTreinoEditando(null)
      }
    )
  }

  const iniciarEdicaoExercicio = (index) => {
    const exercicio = treinos[treinoEditando].exercicios[index]
    setExercicioEditando(index)
    setExercicioEditado({ ...exercicio })
  }

  const salvarEdicaoExercicio = () => {
    if (!exercicioEditado.nome.trim()) return

    const treino = treinos[treinoEditando]
    const exerciciosAtualizados = [...treino.exercicios]
    exerciciosAtualizados[exercicioEditando] = {
      nome: exercicioEditado.nome,
      series: exercicioEditado.series,
      repeticoes: exercicioEditado.repeticoes,
      link: exercicioEditado.link.trim() || '',
      metodo: exercicioEditado.metodo.trim() || '',
      descanso: exercicioEditado.descanso || 120
    }

    const novosTreinos = {
      ...treinos,
      [treinoEditando]: {
        ...treino,
        exercicios: exerciciosAtualizados
      }
    }
    salvarTreinos(novosTreinos)
    setExercicioEditando(null)
    setExercicioEditado({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })
  }

  const cancelarEdicaoExercicio = () => {
    setExercicioEditando(null)
    setExercicioEditado({ nome: '', series: 4, repeticoes: '12', link: '', metodo: '', descanso: 120 })
  }

  // Salvar planejamento semanal
  const salvarPlanejamento = () => {
    if (salvarNoLocalStorage('planejamento_semanal', planejamentoSemanal)) {
      mostrarInfo('Planejamento salvo com sucesso!')
    }
  }

  const treinoBloqueado = (dia, treinoId) => {
    if (!treinoId) return false
    if (treinoId === 'CARDIO') return false

    const ordemDias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
    const indiceDiaAtual = ordemDias.indexOf(dia)

    if (indiceDiaAtual === -1) return false

    const diasAnteriores = []
    for (let i = 1; i <= 3 && (indiceDiaAtual - i) >= 0; i++) {
      diasAnteriores.push(ordemDias[indiceDiaAtual - i])
    }
    return diasAnteriores.some(diaAnterior => {
      const treinosDia = planejamentoSemanal[diaAnterior] || []
      return Array.isArray(treinosDia) ? treinosDia.includes(treinoId) : treinosDia === treinoId
    })
  }

  const atualizarTreinoDia = (dia, treinoId) => {
    if (treinoId && treinoBloqueado(dia, treinoId)) {
      return
    }

    const treinosDia = planejamentoSemanal[dia] || []
    const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])

    const novoArray = treinosArray.includes(treinoId)
      ? treinosArray.filter(id => id !== treinoId)
      : [...treinosArray, treinoId]

    const novoPlanejamento = {
      ...planejamentoSemanal,
      [dia]: novoArray
    }

    setPlanejamentoSemanal(novoPlanejamento)
    planejamentoCarregadoRef.current = true
    salvarNoLocalStorage('planejamento_semanal', novoPlanejamento)
  }
  const treinoSelecionadoNoDia = (dia, treinoId) => {
    const treinosDia = planejamentoSemanal[dia] || []
    const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])
    return treinosArray.includes(treinoId)
  }

  const calcularEstatisticas = useCallback((periodo = 'semana') => {
    const historico = carregarDoLocalStorage('historico_treinos', [])
    if (!Array.isArray(historico)) {
      return {
        totalTreinos: 0,
        tempoTotal: 0,
        exerciciosMaisFeitos: [],
        exerciciosMenosFeitos: [],
        treinosPorDia: 0
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
    treinosPeriodo.forEach(reg => {
      if (reg.exercicios && Array.isArray(reg.exercicios)) {
        reg.exercicios.forEach(ex => {
          if (ex && ex.nome) {
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
      treinosPorDia: treinosPeriodo.length > 0 ? (treinosPeriodo.length / (periodo === 'semana' ? 7 : periodo === 'quinzena' ? 15 : 30)).toFixed(1) : 0
    }
  }, [])

  const abas = useMemo(() => [
    { id: 'treinos', label: 'Treinos', icon: Play },
    { id: 'planejamento', label: 'Planejamento', icon: Calendar },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 }
  ], [])

  const voltarAoInicio = useCallback(() => {
    setAbaAtiva('treinos')
    setTreinoSelecionado(null)
    setModoEdicao(false)
    setTreinoEditando(null)
  }, [])

  const Header = () => {
    return (
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5" role="banner">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between py-3 mb-1">
            <button
              onClick={voltarAoInicio}
              className="flex items-center hover:opacity-80 transition-opacity"
              aria-label="Ir para página inicial TREINOS"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  voltarAoInicio()
                }
              }}
            >
              <img
                src="/logo.png"
                alt="TREINOS"
                className="h-8 w-auto"
              />
            </button>
            {abaAtiva === 'treinos' && (
              <button
                onClick={criarNovoTreino}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all active:scale-95"
                aria-label="Criar novo treino"
                title="Criar novo treino"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <nav className="flex gap-1" role="tablist" aria-label="Navegação principal">
            {abas.map((aba) => {
              const Icon = aba.icon
              const isActive = abaAtiva === aba.id
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${aba.id}`}
                  className={`flex-1 py-2.5 rounded-t-xl font-medium text-sm transition-all ${isActive
                    ? 'bg-[#1a1a1a] text-white border-t border-x border-white/10'
                    : 'text-white/50 hover:text-white/70'
                    }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{aba.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </header>
    )
  }

  const Footer = () => {
    const anoAtual = new Date().getFullYear()

    return (
      <footer className="bg-[#0a0a0a] border-t border-white/5 mt-auto" role="contentinfo">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <a
                href="mailto:guilemos72@gmail.com"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                aria-label="Enviar email para guilemos72@gmail.com"
                title="Email: guilemos72@gmail.com"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-xs hidden sm:inline">Email</span>
              </a>

              <a
                href="https://wa.me/5551982683895"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-green-400 transition-colors group"
                aria-label="Enviar mensagem no WhatsApp"
                title="WhatsApp: (51) 98268-3895"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-xs hidden sm:inline">WhatsApp</span>
              </a>

              <a
                href="https://github.com/GuiFogassi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                aria-label="Ver perfil no GitHub"
                title="GitHub: GuiFogassi"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-xs hidden sm:inline">GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/guilherme-fogassi/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors group"
                aria-label="Ver perfil no LinkedIn"
                title="LinkedIn: Guilherme Fogassi"
              >
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-xs hidden sm:inline">LinkedIn</span>
              </a>
            </div>

            <div className="text-center">
              <p className="text-xs text-white/40">
                © {anoAtual} TREINOS. Todos os direitos reservados.
              </p>
              <p className="text-xs text-white/40 mt-1">
                Desenvolvido por <span className="text-white/60 font-medium">Guilherme Fogassi</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  const ModalConfirmacao = () => {
    if (!modalConfirmacao) return null

    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          modalConfirmacao.onCancel()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [modalConfirmacao])

    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
      >
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
          <p id="modal-confirmacao-titulo" className="text-white mb-6 text-center">{modalConfirmacao.mensagem}</p>
          <div className="flex gap-3">
            <button
              onClick={modalConfirmacao.onCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
              aria-label="Cancelar ação"
            >
              Cancelar
            </button>
            <button
              onClick={modalConfirmacao.onConfirm}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-all active:scale-95"
              aria-label="Confirmar ação"
              autoFocus
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ModalInfo = () => {
    if (!modalInfo) return null

    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setModalInfo(null)
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [modalInfo])

    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-info-titulo"
      >
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
          <p id="modal-info-titulo" className="text-white mb-6 text-center">{modalInfo.mensagem}</p>
          <button
            onClick={() => setModalInfo(null)}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
            aria-label="Fechar mensagem"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    )
  }

  const ModalResumoSemanal = () => {
    if (!modalResumoSemanal) return null
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Resumo da {modalResumoSemanal.periodo}
            </h2>
            <p className="text-white/60 text-sm mb-1">
              Tempo total de treino:
            </p>
            <p className="text-2xl font-bold text-white">
              {formatarTempo(modalResumoSemanal.tempoTotal)}
            </p>
          </div>
          <button
            onClick={() => setModalResumoSemanal(null)}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const ModalEscolherTipoTreino = () => {
    if (!mostrarModalCardio) return null
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Criar Novo Treino
          </h2>
          <div className="space-y-3">
            <button
              onClick={criarTreinoNormal}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
            >
              Treino de Força
            </button>
            <button
              onClick={criarCardio}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 rounded-xl font-medium transition-all active:scale-95"
            >
              🏃 Cardio
            </button>
            <button
              onClick={() => setMostrarModalCardio(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-2 rounded-xl font-medium transition-all active:scale-95 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ModalCardio = () => {
    if (!cardioEditando) return null

    const cardio = treinos['CARDIO'] || {}
    const [localTipo, setLocalTipo] = useState('')
    const [localTempo, setLocalTempo] = useState(0)

    useEffect(() => {
      if (cardioEditando) {
        const cardioData = treinos['CARDIO']
        setLocalTipo(cardioData?.tipoCardio || '')
        setLocalTempo(cardioData?.tempoCardio || 0)
      }
    }, [cardioEditando, treinos])

    const handleSalvar = () => {
      if (!localTipo.trim()) {
        mostrarInfo('Por favor, informe o tipo de cardio')
        return
      }
      if (localTempo <= 0) {
        mostrarInfo('Por favor, informe o tempo do cardio')
        return
      }

      const novosTreinos = {
        ...treinos,
        CARDIO: {
          ...cardio,
          tipoCardio: localTipo.trim(),
          tempoCardio: localTempo
        }
      }
      salvarTreinos(novosTreinos)
      setCardioEditando(null)
      setCardioForm({ tipo: '', tempo: 0 })
      if (modoEdicao && treinoEditando === 'CARDIO') {
        setModoEdicao(false)
        setTreinoEditando(null)
      }
      mostrarInfo('Cardio salvo com sucesso!')
    }

    const handleCancelar = () => {
      setCardioEditando(null)
      setCardioForm({ tipo: '', tempo: 0 })
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
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            {cardio?.tipoCardio ? 'Editar Cardio' : 'Criar Cardio'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Tipo de Cardio</label>
              <input
                type="text"
                value={localTipo}
                onChange={(e) => setLocalTipo(e.target.value)}
                placeholder="Ex: Corrida, Caminhada, Esteira, Bike..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Tempo</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={horas}
                  onChange={handleHorasChange}
                  min="0"
                  placeholder="0"
                  className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
                <span className="text-white/60 text-sm">h</span>
                <input
                  type="number"
                  value={minutos}
                  onChange={handleMinutosChange}
                  min="0"
                  max="59"
                  placeholder="0"
                  className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
                <span className="text-white/60 text-sm">min</span>
              </div>
              <p className="text-xs text-white/30 mt-1">
                Tempo total: {formatarTempo(localTempo)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSalvar}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 rounded-xl font-medium transition-all active:scale-95"
              >
                Salvar
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (modoEdicao && treinoEditando === 'CARDIO' && !cardioEditando) {
      const cardio = treinos['CARDIO']
      setCardioEditando('CARDIO')
      setCardioForm({
        tipo: cardio?.tipoCardio || '',
        tempo: cardio?.tempoCardio || 0
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoEdicao, treinoEditando])

  if (modoEdicao && treinoEditando) {
    const treino = treinos[treinoEditando]

    if (treinoEditando === 'CARDIO') {
      if (!cardioEditando) {
        return null
      }

      return (
        <>
          <ModalCardio />
          <ModalEscolherTipoTreino />
        </>
      )
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6 mt-4">
            <button
              onClick={salvarEdicaoTreino}
              className="text-white/60 hover:text-white font-medium flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              onClick={() => deletarTreino(treinoEditando)}
              className="text-red-400/60 hover:text-red-400 text-sm"
            >
              Deletar
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={treino.nome}
              onChange={(e) => atualizarNomeTreino(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-white/20"
              placeholder="Nome do treino"
            />
          </div>

          <div className="space-y-3 mb-6">
            {treino.exercicios.map((exercicio, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4"
              >
                {exercicioEditando === index ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={exercicioEditado.nome}
                      onChange={(e) => setExercicioEditado({ ...exercicioEditado, nome: e.target.value })}
                      placeholder="Nome do exercício"
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                    />
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Método (opcional)</label>
                      <select
                        value={exercicioEditado.metodo}
                        onChange={(e) => setExercicioEditado({ ...exercicioEditado, metodo: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 mb-2"
                      >
                        <option value="">Selecione ou digite abaixo</option>
                        {METODOS_TREINO.map(metodo => (
                          <option key={metodo} value={metodo}>{metodo}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={exercicioEditado.metodo}
                        onChange={(e) => setExercicioEditado({ ...exercicioEditado, metodo: e.target.value })}
                        placeholder="Ou digite um método personalizado..."
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">Séries</label>
                        <input
                          type="number"
                          value={exercicioEditado.series}
                          onChange={(e) => setExercicioEditado({ ...exercicioEditado, series: parseInt(e.target.value) || 0 })}
                          min="1"
                          className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">Repetições</label>
                        <input
                          type="text"
                          value={exercicioEditado.repeticoes}
                          onChange={(e) => setExercicioEditado({ ...exercicioEditado, repeticoes: e.target.value })}
                          placeholder="Ex: 12, 8 a 10, 5x15/12/10..."
                          className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Descanso (segundos)</label>
                      <input
                        type="number"
                        value={exercicioEditado.descanso || 120}
                        onChange={(e) => setExercicioEditado({ ...exercicioEditado, descanso: parseInt(e.target.value) || 120 })}
                        min="0"
                        placeholder="120"
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                      />
                      <p className="text-xs text-white/30 mt-1">
                        Ex: 20seg = 20, 1min = 60, 1min30seg = 90, 2min = 120
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Link do vídeo (opcional)</label>
                      <input
                        type="url"
                        value={exercicioEditado.link}
                        onChange={(e) => setExercicioEditado({ ...exercicioEditado, link: e.target.value })}
                        placeholder="YouTube, Instagram, TikTok..."
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={salvarEdicaoExercicio}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicaoExercicio}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{exercicio.nome}</h3>
                        {exercicio.metodo && (
                          <p className="text-xs text-white/50 mb-1">
                            Método: {exercicio.metodo}
                          </p>
                        )}
                        <p className="text-xs text-white/40">
                          {exercicio.series} séries × {exercicio.repeticoes} reps
                        </p>
                        {exercicio.descanso && (
                          <p className="text-xs text-white/30 mt-1">
                            Descanso: {formatarTempoDescanso(exercicio.descanso)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => iniciarEdicaoExercicio(index)}
                          className="text-blue-400/60 hover:text-blue-400 p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removerExercicio(index)}
                          className="text-red-400/60 hover:text-red-400 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {exercicio.link && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <p className="text-xs text-white/40 mb-1">Link do vídeo:</p>
                        <a
                          href={exercicio.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 break-all"
                        >
                          {exercicio.link}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 mb-4">
            <h3 className="text-white font-medium mb-4 text-sm">Adicionar Exercício</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={novoExercicio.nome}
                onChange={(e) => setNovoExercicio({ ...novoExercicio, nome: e.target.value })}
                placeholder="Nome do exercício"
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
              />
              <div>
                <label className="text-xs text-white/40 mb-1 block">Método (opcional)</label>
                <select
                  value={novoExercicio.metodo}
                  onChange={(e) => setNovoExercicio({ ...novoExercicio, metodo: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 mb-2"
                >
                  <option value="">Selecione ou digite abaixo</option>
                  {METODOS_TREINO.map(metodo => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={novoExercicio.metodo}
                  onChange={(e) => setNovoExercicio({ ...novoExercicio, metodo: e.target.value })}
                  placeholder="Ou digite um método personalizado..."
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Séries</label>
                  <input
                    type="number"
                    value={novoExercicio.series}
                    onChange={(e) => setNovoExercicio({ ...novoExercicio, series: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Repetições</label>
                  <input
                    type="text"
                    value={novoExercicio.repeticoes}
                    onChange={(e) => setNovoExercicio({ ...novoExercicio, repeticoes: e.target.value })}
                    placeholder="Ex: 12, 8 a 10, 5x15/12/10..."
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Descanso (segundos)</label>
                <input
                  type="number"
                  value={novoExercicio.descanso || 120}
                  onChange={(e) => setNovoExercicio({ ...novoExercicio, descanso: parseInt(e.target.value) || 120 })}
                  min="0"
                  placeholder="120"
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
                <p className="text-xs text-white/30 mt-1">
                  Ex: 20seg = 20, 1min = 60, 1min30seg = 90, 2min = 120
                </p>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Link do vídeo (opcional)</label>
                <input
                  type="url"
                  value={novoExercicio.link}
                  onChange={(e) => setNovoExercicio({ ...novoExercicio, link: e.target.value })}
                  placeholder="YouTube, Instagram, TikTok..."
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
                <p className="text-xs text-white/30 mt-1">
                  Cole o link do vídeo do exercício
                </p>
              </div>
              <button
                onClick={adicionarExercicio}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <ModalConfirmacao />
        <ModalInfo />
        <ModalResumoSemanal />
      </div>
    )
  }

  // Tela de planejamento semanal
  if (abaAtiva === 'planejamento' && !treinoSelecionado) {
    const diasSemana = [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ]

    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0a0a0a] p-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6 mt-4">
              <h2 className="text-xl font-semibold text-white">
                Planejamento Semanal
              </h2>
              <button
                onClick={salvarPlanejamento}
                className="text-white font-medium text-sm"
              >
                Salvar
              </button>
            </div>

            <p className="text-sm text-white/40 mb-6">
              Defina qual treino será executado em cada dia
            </p>

            <div className="space-y-3">
              {diasSemana.map((dia) => (
                <div
                  key={dia.key}
                  className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4"
                >
                  <h3 className="text-white font-medium mb-3 text-sm">
                    {dia.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Cardio sempre aparece primeiro */}
                    {treinos['CARDIO'] && (
                      <button
                        onClick={() => atualizarTreinoDia(dia.key, 'CARDIO')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${treinoSelecionadoNoDia(dia.key, 'CARDIO')
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-500/10 text-blue-400/60 hover:bg-blue-500/20 border border-blue-500/20'
                          }`}
                      >
                        🏃 Cardio
                      </button>
                    )}
                    {treinosOrdenados().filter(id => id !== 'CARDIO').map((treinoId) => {
                      const treino = treinos[treinoId]
                      const selecionado = treinoSelecionadoNoDia(dia.key, treinoId)
                      const bloqueado = treinoBloqueado(dia.key, treinoId)

                      return (
                        <button
                          key={treinoId}
                          onClick={() => atualizarTreinoDia(dia.key, treinoId)}
                          disabled={bloqueado && !selecionado}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selecionado
                            ? 'bg-white/20 text-white border border-white/30'
                            : bloqueado
                              ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed opacity-40'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                            }`}
                          title={bloqueado && !selecionado ? 'Treino bloqueado (foi usado nos últimos 3 dias)' : ''}
                        >
                          {treino.nome}
                          {bloqueado && !selecionado && (
                            <span className="ml-1 text-xs">🔒</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {(() => {
                    const treinosDia = planejamentoSemanal[dia.key] || []
                    const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])
                    if (treinosArray.length > 0) {
                      return (
                        <div className="mt-3 space-y-1">
                          {treinosArray.map((treinoId, idx) => {
                            const treino = treinos[treinoId]
                            if (!treino) return null
                            const isCardio = treinoId === 'CARDIO'
                            return (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-white/60">
                                  {isCardio ? `🏃 Cardio${treino.tipoCardio ? ` - ${treino.tipoCardio}` : ''}${treino.tempoCardio ? ` (${formatarTempo(treino.tempoCardio)})` : ''}` : treino.nome}
                                </span>
                                <button
                                  onClick={() => atualizarTreinoDia(dia.key, treinoId)}
                                  className="text-red-400/60 hover:text-red-400 text-xs"
                                >
                                  Remover
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <ModalConfirmacao />
        <ModalInfo />
        <ModalResumoSemanal />
        <ModalEscolherTipoTreino />
        <ModalCardio />
      </>
    )
  }

  // Tela de estatísticas
  if (abaAtiva === 'estatisticas' && !treinoSelecionado) {
    const stats = calcularEstatisticas(periodoStats)

    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0a0a0a] p-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="flex gap-2 mb-6 mt-4">
              {['semana', 'quinzena', 'mes'].map(periodo => (
                <button
                  key={periodo}
                  onClick={() => setPeriodoStats(periodo)}
                  className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${periodoStats === periodo
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                >
                  {periodo === 'semana' ? 'Semana' : periodo === 'quinzena' ? 'Quinzena' : 'Mês'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Total de treinos</span>
                    <span className="text-white font-semibold">{stats.totalTreinos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Tempo total</span>
                    <span className="text-white font-semibold">{formatarTempo(stats.tempoTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Média por dia</span>
                    <span className="text-white font-semibold">{stats.treinosPorDia} treinos</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4">Exercícios mais realizados</h3>
                <div className="space-y-2">
                  {stats.exerciciosMaisFeitos.length > 0 ? (
                    stats.exerciciosMaisFeitos.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">{ex.nome}</span>
                        <span className="text-white/60 text-sm">{ex.count}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm">Nenhum dado disponível</p>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4">Exercícios menos realizados</h3>
                <div className="space-y-2">
                  {stats.exerciciosMenosFeitos.length > 0 ? (
                    stats.exerciciosMenosFeitos.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">{ex.nome}</span>
                        <span className="text-white/60 text-sm">{ex.count}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm">Nenhum dado disponível</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <ModalConfirmacao />
        <ModalInfo />
        <ModalResumoSemanal />
        <ModalEscolherTipoTreino />
        <ModalCardio />
      </>
    )
  }

  // Tela de treinos (grid)
  if (abaAtiva === 'treinos' && !treinoSelecionado) {
    const diasSemana = [
      { key: 'segunda', label: 'Seg' },
      { key: 'terca', label: 'Ter' },
      { key: 'quarta', label: 'Qua' },
      { key: 'quinta', label: 'Qui' },
      { key: 'sexta', label: 'Sex' },
      { key: 'sabado', label: 'Sáb' },
      { key: 'domingo', label: 'Dom' }
    ]

    const temPlanejamento = Object.values(planejamentoSemanal).some(treinosDia => {
      const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])
      return treinosArray.length > 0
    })

    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0a0a0a] p-4 pb-8">
          <div className="max-w-md mx-auto">
            {/* Planejamento Semanal Preview */}
            {temPlanejamento && (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm">Semana</h3>
                  <button
                    onClick={() => setAbaAtiva('planejamento')}
                    className="text-white/40 hover:text-white/60 text-xs"
                  >
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {diasSemana.map((dia) => {
                    const treinosDia = planejamentoSemanal[dia.key] || []
                    const treinosArray = Array.isArray(treinosDia) ? treinosDia : (treinosDia ? [treinosDia] : [])

                    return (
                      <div
                        key={dia.key}
                        className="text-center"
                      >
                        <p className="text-xs text-white/40 mb-1">{dia.label}</p>
                        {treinosArray.length > 0 ? (
                          <div className="space-y-0.5">
                            {treinosArray.map((treinoId, idx) => {
                              const treino = treinos[treinoId]
                              if (!treino) return null
                              const isCardio = treinoId === 'CARDIO'
                              return (
                                <div
                                  key={idx}
                                  className={`rounded-lg p-1 ${isCardio ? 'bg-blue-500/20' : 'bg-white/10'}`}
                                >
                                  <p className={`text-[9px] font-medium truncate ${isCardio ? 'text-blue-400' : 'text-white'}`}>
                                    {isCardio ? '🏃' : (treino.nome.split(' ')[1] || treino.nome.substring(0, 3))}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="bg-white/5 rounded-lg p-1.5">
                            <p className="text-[10px] text-white/20">-</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Grid de Treinos */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Cardio sempre aparece primeiro */}
              {treinos['CARDIO'] && (
                <div
                  className="bg-[#1a1a1a] border border-blue-500/20 hover:border-blue-500/30 rounded-2xl p-4 transition-all group cursor-pointer"
                  onClick={() => {
                    if (treinos['CARDIO']?.tipoCardio && treinos['CARDIO']?.tempoCardio) {
                      iniciarTreino('CARDIO')
                    } else {
                      setCardioEditando('CARDIO')
                      setCardioForm({
                        tipo: treinos['CARDIO']?.tipoCardio || '',
                        tempo: treinos['CARDIO']?.tempoCardio || 0
                      })
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-blue-400 mb-1 truncate">
                        🏃 Cardio
                      </h2>
                      {treinos['CARDIO']?.tipoCardio && treinos['CARDIO']?.tempoCardio ? (
                        <p className="text-xs text-white/40">
                          {treinos['CARDIO'].tipoCardio} • {formatarTempo(treinos['CARDIO'].tempoCardio)}
                        </p>
                      ) : (
                        <p className="text-xs text-white/40">
                          Clique para configurar
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCardioEditando('CARDIO')
                        setCardioForm({
                          tipo: treinos['CARDIO']?.tipoCardio || '',
                          tempo: treinos['CARDIO']?.tempoCardio || 0
                        })
                      }}
                      className="bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors flex-shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
              {treinosOrdenados().map((treinoId) => {
                const treino = treinos[treinoId]
                const totalExercicios = treino.exercicios.length
                const totalSeries = treino.exercicios.reduce((acc, ex) => acc + ex.series, 0)

                return (
                  <div
                    key={treinoId}
                    className="bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all group cursor-pointer"
                    onClick={() => iniciarTreino(treinoId)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-white mb-1 truncate">
                          {treino.nome}
                        </h2>
                        <p className="text-xs text-white/40">
                          {totalExercicios} ex • {totalSeries} séries
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          editarTreino(treinoId)
                        }}
                        className="bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors flex-shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white/60" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {treino.exercicios.slice(0, 2).map((exercicio, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-white/50">
                          <div className="w-0.5 h-0.5 rounded-full bg-white/20 flex-shrink-0"></div>
                          <span className="truncate text-[10px]">{exercicio.nome}</span>
                        </div>
                      ))}
                      {treino.exercicios.length > 2 && (
                        <div className="text-[10px] text-white/30 pt-0.5">
                          +{treino.exercicios.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2">
              <button
                onClick={exportarDados}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dados</span>
              </button>
              <button
                onClick={importarDados}
                className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Dados</span>
              </button>
              <button
                onClick={resetarHistorico}
                className="w-full bg-[#1a1a1a] border border-white/5 hover:border-white/10 text-white/60 hover:text-white/80 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetar Histórico</span>
              </button>
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <ModalConfirmacao />
        <ModalInfo />
        <ModalResumoSemanal />
        <ModalEscolherTipoTreino />
        <ModalCardio />
      </>
    )
  }

  // Tela de execução do treino
  if (treinoSelecionado) {
    const treino = treinos[treinoSelecionado]
    const completo = treinoCompleto()

    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-32">
        {/* Card de Conclusão */}
        {mostrarConclusao && (
          <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Parabéns!
                </h2>
                <p className="text-white/60 text-sm mb-1">
                  Treino finalizado com sucesso
                </p>
                <p className="text-white/40 text-xs">
                  Tempo total: {formatarTempo(tempoTotal)}
                </p>
              </div>
              <button
                onClick={fecharConclusao}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Header Fixo */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              onClick={voltarInicio}
              className="text-white/60 hover:text-white font-medium flex items-center gap-2 text-sm"
              aria-label="Voltar para lista de treinos"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="font-semibold text-base text-white">
                {formatarTempo(tempoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="max-w-md mx-auto px-4 py-6 space-y-3">
          {treino.exercicios.map((exercicio, exercicioIndex) => {
            const completoExercicio = exercicioCompleto(exercicioIndex)

            return (
              <div
                key={exercicioIndex}
                className={`bg-[#1a1a1a] border rounded-2xl p-5 transition-all ${completoExercicio
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-white flex-1">
                      {exercicio.nome}
                    </h2>
                    {exercicio.link && (
                      <div className="flex-shrink-0">
                        <IconeVideo url={exercicio.link} />
                      </div>
                    )}
                  </div>
                  {exercicio.metodo && (
                    <p className="text-xs text-white/50 mb-1">
                      Método: {exercicio.metodo}
                    </p>
                  )}
                  <p className="text-xs text-white/40">
                    {exercicio.series} séries × {exercicio.repeticoes} reps
                  </p>
                  {exercicio.descanso && (
                    <p className="text-xs text-white/30 mt-1">
                      Descanso: {formatarTempoDescanso(exercicio.descanso)}
                    </p>
                  )}
                </div>

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
                            marcarSerie(exercicioIndex, serieIndex)
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
                          ? 'bg-green-500 text-white'
                          : disponivel
                            ? 'bg-white/10 text-white hover:bg-white/20 active:scale-95 border border-white/10'
                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                          }`}
                      >
                        {feita ? <CheckCircle className="w-5 h-5 mx-auto" aria-hidden="true" /> : serieIndex}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Timer de Descanso (Footer Fixo) */}
        {tempoDescanso > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 backdrop-blur-sm z-20">
            <div className="max-w-md mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-full p-2">
                    <Clock className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Descanso</p>
                    <p className="text-xl font-semibold text-white">{formatarTempo(tempoDescanso)}</p>
                  </div>
                </div>
                <button
                  onClick={pularDescanso}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 active:scale-95 transition-all text-sm border border-white/10"
                  aria-label="Pular tempo de descanso"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  Pular
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão Finalizar Treino */}
        {completo && !mostrarConclusao && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-green-500/30 backdrop-blur-sm z-20">
            <div className="max-w-md mx-auto px-4 py-4">
              <button
                onClick={finalizarTreino}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border border-green-500/30"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Finalizar Treino</span>
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ModalConfirmacao />
        <ModalInfo />
        <ModalResumoSemanal />
        <ModalEscolherTipoTreino />
        <ModalCardio />
      </div>
    )
  }

  // Fallback - não deveria chegar aqui
  return (
    <>
      <ModalConfirmacao />
      <ModalInfo />
      <ModalResumoSemanal />
      <ModalEscolherTipoTreino />
      <ModalCardio />
    </>
  )
}

export default App
