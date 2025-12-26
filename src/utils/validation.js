export const validarTreino = (treino) => {
  if (!treino || typeof treino !== 'object') return false
  if (!treino.nome || typeof treino.nome !== 'string') return false
  if (!Array.isArray(treino.exercicios)) return false
  return true
}

