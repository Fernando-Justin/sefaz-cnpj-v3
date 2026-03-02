// Spec: PRD §3 — Tratamento de Erros: mensagens amigáveis mapeadas por código HTTP
// Exibe ao usuário uma mensagem clara sem expor detalhes técnicos internos

interface ErrorMessageProps {
  statusCode?: number
  message?: string
}

/** Traduz o código HTTP para uma mensagem amigável em PT-BR */
function getFriendlyMessage(statusCode?: number, rawMessage?: string): string {
  switch (statusCode) {
    case 400:
      return 'Os dados informados são inválidos. Verifique o CNPJ e tente novamente.'
    case 404:
      return 'CNPJ não encontrado na base de dados da SEFAZ.'
    case 429:
      return 'Você atingiu o limite de consultas. Aguarde 1 minuto e tente novamente.'
    case 502:
      return 'O serviço da SEFAZ retornou um erro. Tente novamente em alguns instantes.'
    case 504:
      return 'A SEFAZ demorou para responder. Tente novamente.'
    case 500:
      return 'Erro interno do servidor. Contate o administrador do sistema.'
    default:
      return rawMessage ?? 'Ocorreu um erro inesperado. Tente novamente.'
  }
}

export function ErrorMessage({ statusCode, message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mt-4 text-sm">
      <p className="font-semibold">Não foi possível realizar a consulta</p>
      <p className="mt-1">{getFriendlyMessage(statusCode, message)}</p>
    </div>
  )
}
