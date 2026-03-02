# Relatório de Revisão Cruzada: PRD vs SRD

## Resumo Geral

**Saúde dos Documentos:** 85%
**Veredicto:** ⚠️ Aprovar com ajustes

Os documentos estão consistentes entre si no modelo mental macro e as premissas essenciais batem perfeitamente. Contudo, há algumas definições e gaps no tratamento de exceções, formato da carga e dependências de infraestrutura que exigem esclarecimento no SRD e adendos no PRD antes de seguirmos para o desenvolvimento.

---

## 1. Tabela de Inconsistências Encontradas

| Tópico                   | No PRD                                                              | No SRD                                                                                                                                                      | Impacto                                                                                                                     |
| :----------------------- | :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Escopo do App**        | Fala de "App Web" e "Formulário de Entrada"                         | Apresenta a arquitetura **exclusiva para Backend** (API REST), delegando o Frontend.                                                                        | O PRD propõe que o projeto é _Fullstack_, mas o SRD desenhou o projeto apenas como _Backend_. (Inconsistência Arquitetural) |
| **Dados do Certificado** | O "Certificado Digital ficará armazenado apenas no servidor (API)". | Instanciar "agente HTTPS M2M que passe a chave privada (...) (mTLS)". Falta definir onde/como o arquivo do certificado será armazenado (env/arquivo fixo?). | Risco de falha de segurança ou problemas de deploy.                                                                         |
| **Resposta de Sucesso**  | Exibir "(ex: Razão Social, Endereço, Situação Cadastral)".          | Retorna `CompanyData`. O SRD não descreveu o payload do JSON 200 OK.                                                                                        | Retrabalho no momento do frontend integrar.                                                                                 |

---

## 2. Tabela de Gaps por Documento

### Gaps no PRD (`.context/prd.md`)

- **Limitação de Acesso (Rate Limit/Segurança):** O PRD prevê um WebService consultando base governamental, mas não impõe limite de requisições. Sem Rate Limit, bots podem derrubar a API ou bloquear o Certificado da empresa (Sefaz bloqueadora).
- **Dados Sensíveis do Retorno:** A consulta Pública de CNPJ costuma retornar Quadro de Sócios (QSA) e Capital Social. Não está claro no PRD se devemos ocultar ou expor essas informações específicas.

### Gaps no SRD (`.context/srd.md`)

- **Assinatura do Payload do Frontend:** Não está definido qual estrutura de dados de JSON a rota `/api/v1/companies/:cnpj/:uf` retorna em caso de Sucesso (200). Apenas referencia `CompanyData`.
- **Certificado Digital - Tratamento de Erro:** O SRD cita `502 Bad Gateway` para falhas no Certificado (mTLS), mas falhas de certificado revogado/vencido deveriam gerar um aviso claro antes de delegar culpa apenas como "Bad Gateway" externo.
- **Configuração do Ambiente:** Não tem menção ao `.env` ou infraestrutura base (caminhos dos Certificados e url's do WSDL).

---

## 3. Sugestões Priorizadas

### CRÍTICAS (Resolver antes de codar)

1. **[Arquitetura]** Alinhar o escopo entre PRD e SRD. O projeto terá as pastas de React na mesma base de código do Express (Monorepo/Pasta `src/components`) ou o SRD está descrevendo apenas o repósitório do Backend? (_Nota: A estrutura de arquivos criada inicialmente apontava para um App React com chamadas SOAP pelo backend no mesmo repo._)
2. **[SRD]** Definir a estrutura exata (Payload JSON) do `CompanyData` (campos retornado).

### IMPORTANTES (Resolver durante o Design)

3. **[PRD/SRD]** Adicionar um requisito de Rate Limit simples para proteger o IP do Servidor/Certificado contra bloqueio pela SEFAZ por excesso de requisições.
4. **[SRD]** Adicionar na seção 4 o formato físico de leitura do certificado (ex: PFX ou PEM) e declarar a necessidade de variáveis de ambiente (`.env`) para SENHA e CAMINHO do certificado.

### OPCIONAIS

5. **[PRD]** Especificar as mensagens textuais exatas que o UI/UX exibirá no frontend ao usuário para os códigos de erro.
