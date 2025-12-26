import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, RotateCcw, CheckCircle, Clock, SkipForward, ArrowLeft, Plus, Trash2, X, Edit2, Calendar, ExternalLink, BarChart3, TrendingUp, Download, Upload, Mail, MessageCircle, Github, Linkedin } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ModalConfirmacao } from './components/Modals/ModalConfirmacao'
import { ModalInfo } from './components/Modals/ModalInfo'
import { ModalResumoSemanal } from './components/Modals/ModalResumoSemanal'
import { ModalEscolherTipoTreino } from './components/Modals/ModalEscolherTipoTreino'
import { ModalCardio } from './components/Modals/ModalCardio'
import { TreinoExecution } from './components/Treinos/TreinoExecution'
import { TREINOS_PADRAO, TEMPO_DESCANSO } from './constants/treinos'
import { METODOS_TREINO } from './constants/metodos'
import { salvarNoLocalStorage, carregarDoLocalStorage } from './utils/storage'
import { formatarTempo, formatarTempoDescanso, obterSemanaAtual } from './utils/time'
import { validarTreino } from './utils/validation'
import { processarTreinosImportados, converterDescansoParaSegundos, parsearSeriesReps } from './utils/importExport'
import { calcularEstatisticas } from './utils/estatisticas'


function App() {
  const [treinos, setTreinos] = useState({})
  const [treinoSelecionado, setTreinoSelecionado] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [treinoEditando, setTreinoEditando] = useState(null)
  const [treinoFinalizado, setTreinoFinalizado] = useState(false)
  const [mostrarConclusao, setMostrarConclusao] = useState(false)
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

  const salvarHistoricoTreino = (treinoId, tempoTotal, exerciciosPulados = [], exerciciosComStatus = []) => {
    const historico = carregarDoLocalStorage('historico_treinos', [])
    if (!Array.isArray(historico)) return

    const novoRegistro = {
      treinoId,
      nomeTreino: treinos[treinoId]?.nome || 'Treino',
      data: new Date().toISOString(),
      tempoTotal,
      exercicios: exerciciosComStatus.length > 0 ? exerciciosComStatus : (treinos[treinoId]?.exercicios || []),
      exerciciosPulados: exerciciosPulados
    }
    historico.push(novoRegistro)
    salvarNoLocalStorage('historico_treinos', historico)
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

  const treinosOrdenados = () => {
    return Object.keys(treinos)
      .filter(id => id !== 'CARDIO')
      .sort((a, b) => {
        const nomeA = treinos[a].nome.toLowerCase()
        const nomeB = treinos[b].nome.toLowerCase()
        return nomeA.localeCompare(nomeB)
      })
  }


  const iniciarTreino = (treinoId) => {
    const hoje = new Date()
    if (hoje.getDay() === 1) {
      verificarResumoSemanal()
    }

    setTreinoSelecionado(treinoId)
    setTreinoFinalizado(false)
    setMostrarConclusao(false)
  }

  const finalizarTreino = (tempoTotalFinal, exerciciosPulados = [], exerciciosComStatus = []) => {
    setTreinoFinalizado(true)
    setMostrarConclusao(true)

    salvarHistoricoTreino(treinoSelecionado, tempoTotalFinal, exerciciosPulados, exerciciosComStatus)
  }

  const fecharConclusao = () => {
    setTreinoSelecionado(null)
    setTreinoFinalizado(false)
    setMostrarConclusao(false)

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
              localStorage.removeItem(`treino_${treino}_pausado`)
              localStorage.removeItem(`treino_${treino}_tempoPausado`)
              localStorage.removeItem(`treino_${treino}_tempoAcumulado`)
              localStorage.removeItem(`treino_${treino}_pulados`)
              localStorage.removeItem(`treino_${treino}_inicial`)
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
        localStorage.removeItem(`treino_${treinoId}_pausado`)
        localStorage.removeItem(`treino_${treinoId}_tempoPausado`)
        localStorage.removeItem(`treino_${treinoId}_tempoAcumulado`)
        localStorage.removeItem(`treino_${treinoId}_pulados`)
        localStorage.removeItem(`treino_${treinoId}_inicial`)

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



  const voltarAoInicio = useCallback(() => {
    setAbaAtiva('treinos')
    setTreinoSelecionado(null)
    setModoEdicao(false)
    setTreinoEditando(null)
  }, [])


  useEffect(() => {
    if (modoEdicao && treinoEditando === 'CARDIO' && !cardioEditando && treinos['CARDIO']) {
      setCardioEditando('CARDIO')
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
          {cardioEditando && (
            <ModalCardio
              treinoCardio={treinos['CARDIO']}
              mostrar={!!cardioEditando}
              onSalvar={(dados) => {
                const novosTreinos = {
                  ...treinos,
                  CARDIO: {
                    ...treinos['CARDIO'],
                    ...dados
                  }
                }
                salvarTreinos(novosTreinos)
                setCardioEditando(null)
                setModoEdicao(false)
                setTreinoEditando(null)
                mostrarInfo('Cardio salvo com sucesso!')
              }}
              onCancel={() => {
                setCardioEditando(null)
                setCardioForm({ tipo: '', tempo: 0 })
                setModoEdicao(false)
                setTreinoEditando(null)
              }}
              modoEdicao={true}
              onMostrarInfo={mostrarInfo}
            />
          )}
          <ModalEscolherTipoTreino
            mostrar={mostrarModalCardio}
            onCreateTreinoNormal={criarTreinoNormal}
            onCreateCardio={criarCardio}
            onCancel={() => setMostrarModalCardio(false)}
          />
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
        <Header
          abaAtiva={abaAtiva}
          onAbaChange={setAbaAtiva}
          onVoltarInicio={voltarAoInicio}
          onCreateTreino={criarNovoTreino}
        />
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
        <ModalConfirmacao modal={modalConfirmacao} onClose={() => setModalConfirmacao(null)} />
        <ModalInfo modal={modalInfo} onClose={() => setModalInfo(null)} />
        <ModalResumoSemanal modal={modalResumoSemanal} onClose={() => setModalResumoSemanal(null)} />
        <ModalEscolherTipoTreino
          mostrar={mostrarModalCardio}
          onCreateTreinoNormal={criarTreinoNormal}
          onCreateCardio={criarCardio}
          onCancel={() => setMostrarModalCardio(false)}
        />
        {cardioEditando && (
          <ModalCardio
            treinoCardio={treinos['CARDIO']}
            mostrar={!!cardioEditando}
            onSalvar={(dados) => {
              const novosTreinos = {
                ...treinos,
                CARDIO: {
                  ...treinos['CARDIO'],
                  ...dados
                }
              }
              salvarTreinos(novosTreinos)
              setCardioEditando(null)
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
              mostrarInfo('Cardio salvo com sucesso!')
            }}
            onCancel={() => {
              setCardioEditando(null)
              setCardioForm({ tipo: '', tempo: 0 })
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
            }}
            modoEdicao={modoEdicao && treinoEditando === 'CARDIO'}
            onMostrarInfo={mostrarInfo}
          />
        )}
      </>
    )
  }

  // Tela de estatísticas
  if (abaAtiva === 'estatisticas' && !treinoSelecionado) {
    const stats = calcularEstatisticas(periodoStats)

    return (
      <>
        <Header
          abaAtiva={abaAtiva}
          onAbaChange={setAbaAtiva}
          onVoltarInicio={voltarAoInicio}
          onCreateTreino={criarNovoTreino}
        />
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
        <ModalConfirmacao modal={modalConfirmacao} onClose={() => setModalConfirmacao(null)} />
        <ModalInfo modal={modalInfo} onClose={() => setModalInfo(null)} />
        <ModalResumoSemanal modal={modalResumoSemanal} onClose={() => setModalResumoSemanal(null)} />
        <ModalEscolherTipoTreino
          mostrar={mostrarModalCardio}
          onCreateTreinoNormal={criarTreinoNormal}
          onCreateCardio={criarCardio}
          onCancel={() => setMostrarModalCardio(false)}
        />
        {cardioEditando && (
          <ModalCardio
            treinoCardio={treinos['CARDIO']}
            mostrar={!!cardioEditando}
            onSalvar={(dados) => {
              const novosTreinos = {
                ...treinos,
                CARDIO: {
                  ...treinos['CARDIO'],
                  ...dados
                }
              }
              salvarTreinos(novosTreinos)
              setCardioEditando(null)
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
              mostrarInfo('Cardio salvo com sucesso!')
            }}
            onCancel={() => {
              setCardioEditando(null)
              setCardioForm({ tipo: '', tempo: 0 })
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
            }}
            modoEdicao={modoEdicao && treinoEditando === 'CARDIO'}
            onMostrarInfo={mostrarInfo}
          />
        )}
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
        <Header
          abaAtiva={abaAtiva}
          onAbaChange={setAbaAtiva}
          onVoltarInicio={voltarAoInicio}
          onCreateTreino={criarNovoTreino}
        />
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
        <ModalConfirmacao modal={modalConfirmacao} onClose={() => setModalConfirmacao(null)} />
        <ModalInfo modal={modalInfo} onClose={() => setModalInfo(null)} />
        <ModalResumoSemanal modal={modalResumoSemanal} onClose={() => setModalResumoSemanal(null)} />
        <ModalEscolherTipoTreino
          mostrar={mostrarModalCardio}
          onCreateTreinoNormal={criarTreinoNormal}
          onCreateCardio={criarCardio}
          onCancel={() => setMostrarModalCardio(false)}
        />
        {cardioEditando && (
          <ModalCardio
            treinoCardio={treinos['CARDIO']}
            mostrar={!!cardioEditando}
            onSalvar={(dados) => {
              const novosTreinos = {
                ...treinos,
                CARDIO: {
                  ...treinos['CARDIO'],
                  ...dados
                }
              }
              salvarTreinos(novosTreinos)
              setCardioEditando(null)
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
              mostrarInfo('Cardio salvo com sucesso!')
            }}
            onCancel={() => {
              setCardioEditando(null)
              setCardioForm({ tipo: '', tempo: 0 })
              if (modoEdicao && treinoEditando === 'CARDIO') {
                setModoEdicao(false)
                setTreinoEditando(null)
              }
            }}
            modoEdicao={modoEdicao && treinoEditando === 'CARDIO'}
            onMostrarInfo={mostrarInfo}
          />
        )}
      </>
    )
  }

  // Tela de execução do treino
  if (treinoSelecionado) {
    const treino = treinos[treinoSelecionado]
    if (!treino) return null

    return (
      <TreinoExecution
        treino={treino}
        treinoId={treinoSelecionado}
        onVoltar={voltarInicio}
        onFinalizar={finalizarTreino}
        mostrarConclusao={mostrarConclusao}
        onFecharConclusao={fecharConclusao}
        onMostrarInfo={mostrarInfo}
      />
    )
  }

  // Fallback - não deveria chegar aqui
  return (
    <>
      <ModalConfirmacao modal={modalConfirmacao} onClose={() => setModalConfirmacao(null)} />
      <ModalInfo modal={modalInfo} onClose={() => setModalInfo(null)} />
      <ModalResumoSemanal modal={modalResumoSemanal} onClose={() => setModalResumoSemanal(null)} />
      <ModalEscolherTipoTreino
        mostrar={mostrarModalCardio}
        onCreateTreinoNormal={criarTreinoNormal}
        onCreateCardio={criarCardio}
        onCancel={() => setMostrarModalCardio(false)}
      />
      {cardioEditando && (
        <ModalCardio
          treinoCardio={treinos['CARDIO']}
          mostrar={!!cardioEditando}
          onSalvar={(dados) => {
            const novosTreinos = {
              ...treinos,
              CARDIO: {
                ...treinos['CARDIO'],
                ...dados
              }
            }
            salvarTreinos(novosTreinos)
            setCardioEditando(null)
            if (modoEdicao && treinoEditando === 'CARDIO') {
              setModoEdicao(false)
              setTreinoEditando(null)
            }
            mostrarInfo('Cardio salvo com sucesso!')
          }}
          onCancel={() => {
            setCardioEditando(null)
            setCardioForm({ tipo: '', tempo: 0 })
            if (modoEdicao && treinoEditando === 'CARDIO') {
              setModoEdicao(false)
              setTreinoEditando(null)
            }
          }}
          modoEdicao={modoEdicao && treinoEditando === 'CARDIO'}
          onMostrarInfo={mostrarInfo}
        />
      )}
    </>
  )
}

export default App
