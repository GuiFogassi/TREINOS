export const salvarNoLocalStorage = (chave, dados) => {
  try {
    localStorage.setItem(chave, JSON.stringify(dados))
    return true
  } catch (error) {
    console.error(`Erro ao salvar ${chave}:`, error)
    return false
  }
}

export const carregarDoLocalStorage = (chave, valorPadrao = null) => {
  try {
    const dados = localStorage.getItem(chave)
    if (!dados) return valorPadrao
    return JSON.parse(dados)
  } catch (error) {
    console.error(`Erro ao carregar ${chave}:`, error)
    return valorPadrao
  }
}

export const removerDoLocalStorage = (chave) => {
  try {
    localStorage.removeItem(chave)
    return true
  } catch (error) {
    console.error(`Erro ao remover ${chave}:`, error)
    return false
  }
}

