# Implementation Plan (plan.md)

> Origem: [context.md](./context.md) | [SRD.md](./srd.md) | [PRD.md](../PRD.md)

## Visão Geral

Plano de implementação seguindo o fluxo SDD: **Spec → Interface → Test → Implement → Validate**.
Cada fase é rastreável a um requisito do PRD/SRD e implementada na sequência de dependências.

---

## Fase 1 — Scaffolding e Configuração do Monorepo

> Objetivo: Ter o ambiente 100% funcional antes de qualquer código de negócio.

- [ ] Inicializar `package.json` com `npm workspaces` (raiz do Monorepo).
- [ ] Configurar `tsconfig.json` com strict mode para backend e frontend.
- [ ] Instalar todas as dependências listadas no `context.md`.
- [ ] Configurar Vite para bundling do React + Tailwind (Frontend).
- [ ] Criar `.env.example` com todas as variáveis (`PORT`, `CERT_PATH`, `CERT_PASS`, `SEFAZ_ENDPOINT_MG`, `SOAP_TIMEOUT_MS`).
- [ ] Criar `.gitignore` — incluir `certs/`, `.env` e `node_modules/`.
- [ ] Criar pasta `certs/` com `.gitkeep` para recepcionar o arquivo `.pfx`.

**Entregável:** Projeto inicia com `npm run dev` sem erros.

---

## Fase 2 — Interfaces e Contratos (Spec → Interface)

> Objetivo: Fixar os contratos de dados antes de qualquer implementação.
> Rastreabilidade: SRD §3 (Payload 200 OK) e §2 (Estrutura MVC).

- [ ] `src/interfaces/CompanyData.ts` — Definir interface TypeScript exata conforme payload do SRD §3.
- [ ] `src/interfaces/SefazConfig.ts` — Definir interface da configuração SOAP (wsdlUrl, certPath, certPass, timeoutMs).
- [ ] `src/interfaces/ISefazService.ts` — Definir contrato do Service: `query(cnpj: string, uf: string): Promise<CompanyData>`.

**Entregável:** Compilação TypeScript limpa (zero erros de tipos).

---

## Fase 3 — Backend: Utilitários e Validações

> Objetivo: Garantir segurança nas entradas antes de tocar a SEFAZ.
> Rastreabilidade: SRD §5 (Validações Core).

- [ ] `src/api/utils/cnpjValidator.ts` — Implementar validador com regex 14-dígitos + cálculo modular RFB dos dois dígitos verificadores.
- [ ] `src/api/utils/ufValidator.ts` — Implementar validador de UF (Enum com "SP" como valor válido inicial).
- [ ] `src/api/utils/xmlParser.ts` — Implementar parser que extrai os campos do nó SOAP retornado e retorna objeto `CompanyData`.

**Entregável:** Utilitários retornam corretamente para entradas válidas e inválidas (validação manual).

---

## Fase 4 — Backend: Service (SOAP + Certificado)

> Objetivo: Concentrar a integração com a SEFAZ em uma única camada isolada.
> Rastreabilidade: SRD §4 (Integração SOAP e Certificado Digital).

- [ ] `src/api/services/sefazService.ts` — Implementar:
  - Leitura do `.pfx` via `fs.readFileSync(CERT_PATH)` + `CERT_PASS` do `.env`.
  - Criação do `https.Agent` com `pfx` e `passphrase` para o mTLS.
  - Criação do client SOAP via `strong-soap` injetando o `wsdl_options` com o Agent HTTPS.
  - Invocação do método `ConsultaCadastro` com os parâmetros `cnpj` e `uf`.
  - Tratamento de timeout: rejeitar Promise após `SOAP_TIMEOUT_MS` ms.
  - Encaminhar a resposta XML para o `xmlParser.ts`.

**Entregável:** Service resolve `CompanyData` para um CNPJ de homologação (ou mock) configurado no `.env`.

---

## Fase 5 — Backend: Controller, Rotas e Rate Limit

> Objetivo: Expor o endpoint da API de forma segura e padronizada.
> Rastreabilidade: SRD §3 (Contrato GET /api/v1/companies) e §5 (Rate Limit).

- [ ] `src/api/app.ts` — Configurar:
  - Middleware `cors` e `express.json`.
  - Middleware de `express-rate-limit` (10 req / 1 min por IP).
  - Registrar rota `/api/v1` apontando para o router.
  - Handler global de erros (formato `{ error, message }`).
- [ ] `src/api/controllers/cnpjController.ts` — Implementar:
  - Extrair `cnpj` e `uf` dos `req.params`.
  - Acionar `cnpjValidator` e `ufValidator`.
  - Chamar `sefazService.query()`.
  - Mapear exceções para os status HTTP corretos: 400, 404, 429, 500, 502, 504.
- [ ] `src/index.ts` — Iniciar o servidor Express na `PORT` do `.env`.

**Entregável:** `GET /api/v1/companies/00000000000191/SP` retorna JSON 200 ou 400 conforme esperado no SRD.

---

## Fase 6 — Frontend: Componentes e Página

> Objetivo: Interface simples para o humano consultar o CNPJ.
> Rastreabilidade: PRD §3 (Formulário de Entrada e Apresentação de Resultados).

- [ ] `src/components/CompanyForm.tsx` — Formulário com campo de CNPJ (com máscara) + select de UF + botão Consultar. Validação visual do formato do CNPJ antes de submeter.
- [ ] `src/components/CompanyResult.tsx` — Exibir os campos do `CompanyData` de forma organizada: situação em destaque (Ativa/Irregular/etc), nome, endereço, CNAE.
- [ ] `src/components/ErrorMessage.tsx` — Exibir erro amigável em PT-BR conforme código HTTP retornado.
- [ ] `src/pages/ConsultaCnpj.tsx` — Orquestrar o fetch para `/api/v1/companies/:cnpj/:uf`, gerenciar loading state, sucesso e erro.
- [ ] `src/App.tsx` — Ponto de entrada React renderizando `ConsultaCnpj`.

**Entregável:** Tela funcional: digitar CNPJ → clicar Consultar → ver dados ou erro.

---

## Fase 7 — Validação Final (Validate)

> Objetivo: Verificar o fluxo completo de ponta a ponta.
> Rastreabilidade: PRD §6 (Critérios de Aceite).

- [ ] Testar fluxo completo: Formulário → API → SEFAZ → Resultado em tela.
- [ ] Testar CNPJ inválido → receber 400 e mensagem de erro na tela.
- [ ] Testar CNPJ válido porém inexistente → receber 404 na tela.
- [ ] Simular Rate Limit: exceder 10 req/min → receber 429 na tela.
- [ ] Verificar que `CERT_PATH` ausente/incorreto → exibe erro 500 sem stack trace exposto.
- [ ] Verificar que o arquivo `.pfx` nunca aparece em nenhuma response HTTP.

**Entregável:** Todos os critérios de aceite do PRD §6 marcados como concluídos.

---

## Dependência de Execução (Ordem)

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7
Scaffolding → Contratos → Utils → Service → Controller → UI → Validação
```
