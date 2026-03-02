// Spec: context.md §5 — Ponto de entrada do servidor Express
// Responsável por iniciar o servidor na porta definida em PORT

import 'dotenv/config'
import app from './api/app'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

app.listen(PORT, () => {
  console.log(`✅ Servidor iniciado na porta ${PORT}`)
  console.log(`📡 API disponível em: http://localhost:${PORT}/api/v1`)
})
