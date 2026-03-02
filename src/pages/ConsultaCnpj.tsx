// Spec: PRD §3 — Página central que orquestra o fluxo completo de consulta
// Gerencia os estados de loading, sucesso e erro, delegando a UI para os componentes filhos

import { useState } from 'react'
import { CompanyForm } from '../components/CompanyForm'
import { CompanyResult } from '../components/CompanyResult'
import { ErrorMessage } from '../components/ErrorMessage'
import { CompanyData } from '../interfaces/CompanyData'

interface ApiError {
  statusCode?: number
  message?: string
}

export function ConsultaCnpj() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompanyData | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  async function handleQuery(cnpj: string, uf: string) {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/v1/companies/${cnpj}/${uf}`)
      const data = await response.json()

      if (!response.ok) {
        setError({ statusCode: response.status, message: data.message })
        return
      }

      setResult(data as CompanyData)
    } catch {
      setError({ message: 'Não foi possível conectar ao servidor. Verifique sua conexão.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Consulta Cadastral SEFAZ</h1>
        <p className="text-sm text-gray-500 mb-6">Informe o CNPJ e a UF para consultar a situação cadastral.</p>

        <CompanyForm onSubmit={handleQuery} loading={loading} />

        {error && <ErrorMessage statusCode={error.statusCode} message={error.message} />}
        {result && <CompanyResult data={result} />}
      </div>
    </div>
  )
}
