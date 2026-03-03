// Spec: PRD §3 — Formulário de Entrada: CNPJ + seleção de UF + botão Consultar
// Componente responsável por capturar e validar visualmente os dados antes de enviar à API

import { useState, FormEvent } from 'react'

interface CompanyFormProps {
  onSubmit: (cnpj: string, uf: string) => void
  loading: boolean
}

/** Aplica máscara visual no CNPJ: xx.xxx.xxx/xxxx-xx */
function maskCnpj(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function CompanyForm({ onSubmit, loading }: CompanyFormProps) {
  const [cnpj, setCnpj] = useState('')
  const [uf, setUf] = useState('MG')
  const [error, setError] = useState('')

  function handleChangeCnpj(value: string) {
    setCnpj(maskCnpj(value))
    setError('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const raw = cnpj.replace(/\D/g, '')
    if (raw.length !== 14) {
      setError('O CNPJ deve ter 14 dígitos.')
      return
    }
    onSubmit(raw, uf)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="cnpj" className="block text-sm font-semibold text-gray-700 mb-1">
          CNPJ
        </label>
        <input
          id="cnpj"
          type="text"
          value={cnpj}
          onChange={(e) => handleChangeCnpj(e.target.value)}
          placeholder="00.000.000/0000-00"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          required
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="uf" className="block text-sm font-semibold text-gray-700 mb-1">
          UF
        </label>
        <select
          id="uf"
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="MG">MG - Minas Gerais</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
      >
        {loading ? 'Consultando...' : 'Consultar'}
      </button>
    </form>
  )
}
