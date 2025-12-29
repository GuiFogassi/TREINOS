// Helper para obter classes de tema
export const getThemeClasses = (theme) => {
  const isLight = theme === 'light'
  
  return {
    // Backgrounds
    bgMain: isLight ? 'bg-[#faf9f6]' : 'bg-[#0a0a0a]',
    bgCard: isLight ? 'bg-white' : 'bg-[#1a1a1a]',
    bgOverlay: isLight ? 'bg-black/40' : 'bg-black/60',
    bgHover: isLight ? 'hover:bg-[#f5f5f0]' : 'hover:bg-white/5',
    
    // Textos
    textPrimary: isLight ? 'text-[#2d2d2d]' : 'text-white',
    textSecondary: isLight ? 'text-[#6b6b6b]' : 'text-white/60',
    textTertiary: isLight ? 'text-[#9a9a9a]' : 'text-white/40',
    
    // Bordas
    borderPrimary: isLight ? 'border-[#e5e5e5]' : 'border-white/5',
    borderSecondary: isLight ? 'border-[#d0d0d0]' : 'border-white/10',
    
    // Cores de ação - Azul
    blueBg: isLight ? 'bg-[#b8d4e3]/30' : 'bg-blue-500/20',
    blueText: isLight ? 'text-[#5a8fa8]' : 'text-blue-400',
    blueBorder: isLight ? 'border-[#b8d4e3]/50' : 'border-blue-500/30',
    blueHover: isLight ? 'hover:bg-[#b8d4e3]/40' : 'hover:bg-blue-500/30',
    
    // Verde
    greenBg: isLight ? 'bg-[#c4e4c4]/30' : 'bg-green-500/20',
    greenText: isLight ? 'text-[#5a9a5a]' : 'text-green-400',
    greenBorder: isLight ? 'border-[#c4e4c4]/50' : 'border-green-500/30',
    greenHover: isLight ? 'hover:bg-[#c4e4c4]/40' : 'hover:bg-green-500/30',
    
    // Laranja
    orangeBg: isLight ? 'bg-[#ffe0b3]/30' : 'bg-orange-500/20',
    orangeText: isLight ? 'text-[#b8864a]' : 'text-orange-400',
    orangeBorder: isLight ? 'border-[#ffe0b3]/50' : 'border-orange-500/30',
    orangeHover: isLight ? 'hover:bg-[#ffe0b3]/40' : 'hover:bg-orange-500/30',
    
    // Vermelho
    redBg: isLight ? 'bg-[#ffcccc]/30' : 'bg-red-500/20',
    redText: isLight ? 'text-[#cc6666]' : 'text-red-400',
    redBorder: isLight ? 'border-[#ffcccc]/50' : 'border-red-500/30',
    redHover: isLight ? 'hover:bg-[#ffcccc]/40' : 'hover:bg-red-500/30',
    
    // Botões
    buttonPrimary: isLight 
      ? 'bg-[#e5e5e5] hover:bg-[#d0d0d0] text-[#2d2d2d]' 
      : 'bg-white/10 hover:bg-white/20 text-white',
    buttonSecondary: isLight
      ? 'bg-white/50 hover:bg-white/70 text-[#2d2d2d]'
      : 'bg-white/5 hover:bg-white/10 text-white/60',
  }
}

