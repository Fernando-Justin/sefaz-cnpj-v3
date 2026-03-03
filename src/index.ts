// Spec: context.md §5 — Ponto de entrada do servidor Express
// Responsável por iniciar o servidor na porta definida em PORT

import 'dotenv/config'

// O strong-soap não repassa o httpsAgent customizado para o download do WSDL,
// usando o cliente HTTP interno do Node. A SEFAZ utiliza cadeia de certificados
// emitida por AC-Raiz ICP-Brasil, que não está no bundle do Node.js.
// Por isso desabilitamos a verificação TLS do lado do cliente neste processo,
// que é dedicado exclusivamente à integração com webservices governamentais.
if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

import app from './api/app'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

app.listen(PORT, () => {
  console.log(`✅ Servidor iniciado na porta ${PORT}`)
  console.log(`📡 API disponível em: http://localhost:${PORT}/api/v1`)
})
