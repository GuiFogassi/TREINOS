# TREINOS - Gerenciador de Treinos

Aplicativo PWA (Progressive Web App) para gerenciar seus treinos de academia com controle de tempo de descanso, planejamento semanal e estatísticas.

## 🚀 Funcionalidades

- **Treinos Personalizados**: Crie e gerencie seus próprios treinos
- **Cardio**: Treino de cardio com controle de tempo (horas + minutos)
- **Controle de Séries**: Sistema de bloqueio progressivo - série seguinte só libera após completar a anterior e o descanso
- **Timer de Descanso Personalizado**: Configure tempo de descanso por exercício
- **Planejamento Semanal**: Organize seus treinos para a semana inteira (múltiplos treinos por dia)
- **Estatísticas**: Acompanhe seu progresso com estatísticas detalhadas (semana, quinzena, mês)
- **Métodos de Treino**: Suporte a diversos métodos pré-definidos (DropSet, Rest Pause, Progressão, etc.)
- **Repetições Flexíveis**: Suporte a formatos como `5x15/12/10/8/6`, `8 a 10`, `falha`, `max`
- **Links de Vídeo**: Adicione links de vídeo para exercícios
- **Exportar/Importar Dados**: Backup completo dos seus treinos, planejamento e histórico
- **Persistência Automática**: Progresso salvo automaticamente no localStorage
- **PWA**: Instale como app nativo no celular
- **Acessibilidade**: Suporte completo a leitores de tela e navegação por teclado
- **Feedback Visual Completo**: 
  - Séries bloqueadas (cinza)
  - Séries disponíveis (azul)
  - Séries completas (verde com check)
  - Exercício completo (fundo verde)


## 🎯 Como Usar

1. **Criar Treino**: Clique no botão "+" na tela de treinos para criar um novo treino ou Cardio
2. **Editar Treino**: Clique no ícone de edição em qualquer treino para modificar exercícios
3. **Selecionar Treino**: Escolha um treino na tela inicial para executar
4. **Executar Séries**: Toque nos botões redondos para marcar as séries conforme for completando
5. **Descanso**: Após marcar uma série, o timer de descanso aparece no rodapé. Você pode rolar a tela e ver outros exercícios enquanto descansa
6. **Pular Descanso**: Use o botão "Pular" para liberar a próxima série imediatamente
7. **Planejamento**: Na aba "Planejamento", organize seus treinos para cada dia da semana
8. **Estatísticas**: Na aba "Estatísticas", acompanhe seu progresso e visualize exercícios mais/menos realizados
9. **Finalizar**: Quando todos os exercícios estiverem completos, aparecerá o botão "Finalizar Treino"

## 📱 PWA

O app pode ser instalado como PWA:
- **Android**: Chrome → Menu → "Adicionar à tela inicial"
- **iOS**: Safari → Compartilhar → "Adicionar à Tela de Início"
- **Desktop**: Chrome/Edge → Menu → "Instalar app"

O app funcionará offline após o primeiro carregamento.


## 🛠️ Tecnologias

- React 18
- Vite
- TailwindCSS
- Lucide React (ícones)
- PWA (Service Worker)

## 📝 Notas

- O progresso é salvo automaticamente no localStorage
- Use "Exportar Dados" para fazer backup completo
- Use "Importar Dados" para restaurar seus treinos de um arquivo JSON
- Use "Resetar Histórico" para limpar todos os dados salvos
- O timer de descanso padrão é de 2 minutos (120 segundos), mas pode ser personalizado por exercício
- O app funciona offline após a primeira instalação
- Cardio pode ser agendado para todos os dias da semana sem bloqueio

## 👨‍💻 Desenvolvedor

Desenvolvido por **Guilherme Fogassi**

- 📧 Email: guilemos72@gmail.com
- 💬 WhatsApp: (51) 98268-3895
- 🔗 GitHub: [GuiFogassi](https://github.com/GuiFogassi)
- 💼 LinkedIn: [Guilherme Fogassi](https://www.linkedin.com/in/guilherme-fogassi/)
