import { useState, useEffect } from 'react'
import { salvarNoLocalStorage, carregarDoLocalStorage } from '../utils/storage'

export const useLocalStorage = (chave, valorInicial) => {
  const [valor, setValor] = useState(() => {
    const itemSalvo = carregarDoLocalStorage(chave, valorInicial)
    return itemSalvo !== null ? itemSalvo : valorInicial
  })

  useEffect(() => {
    salvarNoLocalStorage(chave, valor)
  }, [chave, valor])

  return [valor, setValor]
}

