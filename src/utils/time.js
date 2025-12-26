export const formatarTempo = (segundos) => {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segs = segundos % 60

  if (horas > 0) {
    return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }
  return `${minutos}:${segs.toString().padStart(2, '0')}`
}

export const formatarTempoDescanso = (segundos) => {
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

export const obterSemanaAtual = () => {
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

