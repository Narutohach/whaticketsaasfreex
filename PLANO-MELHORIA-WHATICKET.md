# Plano de Evolução — Whaticket SaaS

## Objetivo

Transformar a aplicação em uma plataforma omnichannel profissional, mantendo tickets, contatos, filas, usuários, Kanban, campanhas e relatórios.

Adicionar:

- WhatsApp via Baileys;
- WhatsApp Cloud API oficial da Meta;
- OpenAI e Gemini como provedores selecionáveis;
- automações com respostas estruturadas;
- segurança, observabilidade, onboarding e cobrança comercial.

## Contexto atual

Stack: React 17, Express/TypeScript, MySQL/Sequelize, Redis/Bull, Socket.IO, Baileys e OpenAI.

Arquivos principais:

- `backend/src/services/WbotServices/wbotMessageListener.ts`
- `backend/src/services/WbotServices/SendWhatsAppMessage.ts`
- `backend/src/services/WbotServices/SendWhatsAppMedia.ts`
- `backend/src/models/Whatsapp.ts`
- `backend/src/models/Prompt.ts`
- `backend/src/controllers/PromptController.ts`
- `frontend/src/components/PromptModal/index.js`
- `frontend/src/pages/Prompts/index.js`
- `backend/src/routes/dashboardRoutes.ts`
- `backend/src/config/auth.ts`

## Fase 0 — Documentação e desenho técnico

Validar os contratos oficiais antes de implementar:

- Meta: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
- Meta Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- Meta Postman: https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- Gemini API: https://ai.google.dev/api
- Gemini conteúdo: https://ai.google.dev/gemini-api/docs/generate-content/get-started
- Gemini structured output: https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- Gemini function calling: https://ai.google.dev/gemini-api/docs/generate-content/function-calling
- OpenAI Responses: https://platform.openai.com/docs/api-reference/responses

Entregáveis: mapa dos fluxos, contratos internos de canais e IA, versões suportadas, matriz de capacidades e decisão entre token manual e Embedded Signup da Meta.

Não assumir nomes de modelos, limites ou versões de API sem validação vigente.

## Fase 1 — Segurança e isolamento multiempresa

Prioridade máxima.

- Proteger `/dashboard/ticketsUsers` e `/dashboard/ticketsDay`;
- remover `companyId = 1` de configurações;
- garantir filtro por `companyId` em todos os serviços;
- proteger ou limitar `/companies/cadastro`;
- revisar endpoints públicos de planos, invoices e configurações;
- remover fallbacks inseguros de JWT;
- remover `.env` versionado e rotacionar credenciais;
- criptografar tokens Meta, OpenAI e Gemini;
- nunca enviar API keys ao frontend;
- adicionar rate limit para login, cadastro, webhooks e envio;
- validar MIME, tamanho e extensão dos uploads;
- remover dados sensíveis dos logs;
- criar auditoria administrativa.

Verificação: testes de acesso entre empresas, testes de permissão, scanner de secrets e falha controlada quando JWT não estiver configurado.

## Fase 2 — Build, qualidade e testes

- Corrigir scripts Linux-only do frontend;
- criar lockfile do backend;
- remover `messageRoutes` duplicado;
- corrigir interceptors Axios;
- corrigir ciclo de vida do Socket.IO;
- remover arquivos `OLD`, `Custom` e abandonados;
- substituir `console.log` por logger estruturado;
- corrigir codificação UTF-8;
- alinhar versões do README, Compose e packages.

Criar testes para login, refresh, permissões, isolamento, tickets, mensagens, reconexão, webhooks, campanhas e cobrança.

Critério de aceite:

```text
npm run lint
npm test
npm run build
```

funcionando em ambiente limpo e no Docker.

## Fase 3 — Camada unificada de canais

Criar:

```text
backend/src/services/Channels/
backend/src/services/Channels/ChannelProvider.ts
backend/src/services/Channels/BaileysChannelProvider.ts
backend/src/services/Channels/MetaCloudApiChannelProvider.ts
```

Contrato:

```ts
interface ChannelProvider {
  sendText(input: SendTextInput): Promise<SentMessage>;
  sendMedia(input: SendMediaInput): Promise<SentMessage>;
  sendTemplate?(input: SendTemplateInput): Promise<SentMessage>;
  markAsRead?(messageId: string): Promise<void>;
  getStatus(): Promise<ChannelStatus>;
}
```

Adicionar à conexão: `provider`, `phoneNumber`, `phoneNumberId`, `wabaId`, `accessTokenEncrypted`, `webhookVerifyTokenEncrypted`, `apiVersion` e `status`.

Tickets, contatos e mensagens devem chamar `ChannelProvider`, nunca Baileys diretamente.

## Fase 4 — WhatsApp Cloud API oficial

Criar `MetaCloudApiService`, `MetaWabaService`, `MetaWebhookService`, `MetaMediaService` e `MetaTemplateService`.

Operações principais:

```http
GET  /{WABA_ID}/phone_numbers
POST /{WABA_ID}/subscribed_apps
POST /{PHONE_NUMBER_ID}/register
POST /{PHONE_NUMBER_ID}/messages
```

Endpoints internos:

```http
POST /whatsapp/meta/connect
GET  /whatsapp/meta/phone-numbers
POST /whatsapp/meta/register
POST /whatsapp/meta/subscribe
GET  /webhooks/meta/whatsapp
POST /webhooks/meta/whatsapp
```

O webhook deverá validar `hub.challenge`, `hub.verify_token` e `X-Hub-Signature-256`, identificar a empresa por `phone_number_id`, ignorar duplicidades, registrar mensagens/status e processar o restante em Bull/Redis.

## Fase 5 — Templates, mídia e campanhas

- Sincronizar templates da WABA;
- suportar idiomas, variáveis e botões;
- controlar aprovação;
- fazer upload de mídia e armazenar `MEDIA_ID`;
- associar `wamid` à mensagem local;
- criar fila por conexão e destinatário;
- usar retry idempotente;
- controlar janela de atendimento, opt-in e opt-out;
- limitar campanhas por plano.

As campanhas devem escolher automaticamente Baileys ou Meta Cloud conforme o provider da conexão.

## Fase 6 — Abstração de IA

O OpenAI atual está acoplado ao `wbotMessageListener.ts` e usa SDK antigo.

Criar:

```text
backend/src/services/AI/AIProvider.ts
backend/src/services/AI/AIProviderFactory.ts
backend/src/services/AI/AIError.ts
backend/src/services/AI/providers/OpenAIProvider.ts
backend/src/services/AI/providers/GeminiProvider.ts
```

Contrato:

```ts
type AIProviderName = "openai" | "gemini";

interface AIProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateTextStream?(input: GenerateTextInput): AsyncIterable<string>;
  transcribeAudio?(filePath: string, model?: string): Promise<string>;
}
```

Migrar OpenAI de `createChatCompletion` para Responses API. Adicionar Gemini com:

```bash
npm install @google/genai
```

```ts
import { GoogleGenAI } from "@google/genai";
const client = new GoogleGenAI({ apiKey });
const response = await client.models.generateContent({ model, contents });
```

Streaming Gemini: `client.models.generateContentStream({ model, contents })`.

## Fase 7 — Configuração e escolha da IA

Adicionar ao modelo `Prompt`:

```text
provider
model
apiKeyEncrypted
temperature
maxTokens
maxMessages
systemPrompt
enableTools
enableStreaming
```

Prioridade de configuração:

```text
ticket > fila > conexão > empresa > configuração global
```

Na interface: provedor, modelo, chave protegida, “Testar conexão”, capacidades, custo, consumo, status e limites.

Substituir `useOpenAi` por `allowedAIProviders`, `monthlyAITokens`, `monthlyAICalls` e `allowedAIModels`.

## Fase 8 — Respostas estruturadas e ferramentas

Evitar controle por texto livre. Usar JSON validado:

```json
{
  "reply": "Mensagem para o cliente",
  "action": "transfer_queue",
  "queueId": 5
}
```

Ferramentas futuras: `transfer_to_queue`, `close_ticket`, `add_ticket_tag`, `get_customer_data`, `check_order_status` e `create_order`.

Cada ferramenta precisa de JSON Schema, autorização, auditoria, limite de execução e confirmação para ações destrutivas.

## Fase 9 — Pipeline unificado de mensagens

```text
InboundMessage
  -> NormalizeMessage
  -> ResolveCompany
  -> UpsertContact
  -> FindOrCreateTicket
  -> PersistMessage
  -> ApplyRouting
  -> ExecuteAutomation
  -> ExecuteAI
  -> EmitRealtimeEvent
```

O pipeline deve funcionar para Baileys, Meta Cloud API e futuros canais, com idempotência, retry seguro, anexos, áudio, status de entrega e fallback para operador.

## Fase 10 — Observabilidade e custos

Registrar por empresa: provider, model, ticketId, duração, tokens, status e erro.

Erros normalizados:

```text
INVALID_API_KEY
RATE_LIMITED
MODEL_NOT_FOUND
CONTEXT_TOO_LARGE
SAFETY_BLOCKED
TIMEOUT
PROVIDER_UNAVAILABLE
```

Retry somente em timeout, 429 e 5xx temporário. Nunca repetir ação de negócio sem idempotência. Criar painel de consumo e alertas de falha.

## Fase 11 — Redesign visual

Executar após estabilidade:

- escolher uma única biblioteca visual;
- remover mistura Material UI v4, MUI v5, Bootstrap e famílias diversas de ícones;
- criar design system;
- padronizar cores, tipografia, espaçamento e estados;
- redesenhar a inbox;
- melhorar busca, filtros e atalhos;
- criar estados loading, vazio, erro e sucesso;
- criar central de saúde das conexões;
- criar onboarding;
- criar configuração visual da IA;
- transformar dashboard em painel de métricas de negócio.

## Fase 12 — Produto comercial

- Trial automático;
- planos com limites reais;
- cobrança recorrente;
- suspensão por inadimplência;
- limites de usuários, conexões, mensagens e IA;
- métricas de uso;
- backup e exportação;
- auditoria;
- documentação;
- LGPD;
- central de ajuda;
- monitoramento e página de status;
- onboarding sem intervenção técnica.

## Ordem de execução

1. Segurança e isolamento multiempresa.
2. Build, testes e correções críticas.
3. Camada unificada de canais.
4. WhatsApp Cloud API.
5. Templates, mídia e campanhas.
6. Abstração de IA.
7. Migração do OpenAI.
8. Adição do Gemini.
9. Function calling e ações internas.
10. Pipeline unificado.
11. Observabilidade e custos.
12. Redesign visual.
13. Planos, onboarding e comercialização.

## Primeira entrega recomendada

Entregar primeiro:

1. sistema seguro e isolado por empresa;
2. OpenAI funcionando através da nova abstração;
3. Meta Cloud API recebendo e enviando texto;
4. testes automatizados do fluxo principal.

Depois adicionar Gemini, mídia, templates, function calling e automações avançadas.
