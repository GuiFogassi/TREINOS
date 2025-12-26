import { Mail, MessageCircle, Github, Linkedin } from 'lucide-react'

export const Footer = () => {
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

