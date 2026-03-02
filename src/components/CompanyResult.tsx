// Spec: PRD §3 — Apresentação de Resultados: exibir os campos de CompanyData retornados pela API
// Cada campo mapeado deve corresponder ao payload do SRD §3 (200 OK)

interface CompanyResultProps {
  data: {
    cnpj: string
    razaoSocial: string
    nomeFantasia: string
    situacaoCadastral: string
    dataAbertura: string
    cnaePrincipal: string
    endereco: string
  }
}

/** Cor de destaque da situação cadastral */
function getSituacaoColor(situacao: string): string {
  const s = situacao.toLowerCase()
  if (s.includes('habilitado') && !s.includes('restrição')) return 'text-green-600'
  if (s.includes('restrição') || s.includes('parcialmente')) return 'text-yellow-600'
  return 'text-red-600'
}

export function CompanyResult({ data }: CompanyResultProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4 space-y-4">
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">Razão Social</p>
        <p className="text-lg font-bold text-gray-800">{data.razaoSocial}</p>
        {data.nomeFantasia && (
          <p className="text-sm text-gray-500">({data.nomeFantasia})</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">CNPJ</p>
          <p className="text-sm font-mono">{data.cnpj}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Situação Cadastral</p>
          <p className={`text-sm font-semibold ${getSituacaoColor(data.situacaoCadastral)}`}>
            {data.situacaoCadastral}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Data de Abertura</p>
          <p className="text-sm">{data.dataAbertura}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">CNAE Principal</p>
          <p className="text-sm">{data.cnaePrincipal}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">Endereço</p>
        <p className="text-sm">{data.endereco}</p>
      </div>
    </div>
  )
}
