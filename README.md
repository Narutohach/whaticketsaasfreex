# Hacto Desk

Plataforma de atendimento omnichannel via WhatsApp, com Kanban, campanhas, agendamentos, chat interno e integração com agentes de IA (OpenAI e Google Gemini).

![Tela de login](docs/screenshots/01-login.png)

## Principais recursos

- WhatsApp Web (Baileys / QR Code) e WhatsApp Cloud API (Meta Oficial)
- Kanban de atendimentos
- Campanhas de disparo em massa
- Respostas rápidas e chatbot por filas
- Integração com prompts de IA (OpenAI e Gemini)
- Agendamento de mensagens
- Multiempresa com planos configuráveis
- Dashboard e relatórios

## Requisitos

- Node.js 20+
- PostgreSQL
- Redis
- Docker (opcional, recomendado para deploy)

## Rodando com Docker

```bash
docker compose -f docker-compose.yaml -f docker-compose.local.yaml up -d
```

## Estrutura do projeto

- `backend/` — API Node.js/TypeScript (Express, Sequelize, Baileys)
- `frontend/` — Aplicação React (Material-UI)

## Capturas de tela

### Dashboard

Visão geral de conexões ativas, tickets, contatos e tempo médio de atendimento.

![Dashboard](docs/screenshots/02-dashboard.png)

### Atendimentos

Inbox omnichannel com filas, transferência e finalização de tickets.

![Atendimentos](docs/screenshots/03-atendimentos.png)

### Conexões

Gerenciamento de números conectados via WhatsApp Web ou Cloud API.

![Conexões](docs/screenshots/04-conexoes.png)

### Kanban

Organização visual dos atendimentos por etapa.

![Kanban](docs/screenshots/05-kanban.png)

### Contatos

Base de contatos com histórico de interação e status.

![Contatos](docs/screenshots/06-contatos.png)

### Filas & Chatbot

Configuração de filas de atendimento e fluxo automático do chatbot.

![Filas](docs/screenshots/07-filas.png)

### IA (OpenAI/Gemini)

Cadastro de prompts de IA, com escolha de provedor (OpenAI ou Google Gemini) e modelo.

![IA](docs/screenshots/08-ia-prompts.png)

### Respostas Rápidas

Atalhos de texto para agilizar o atendimento.

![Respostas Rápidas](docs/screenshots/09-respostas-rapidas.png)

### Agendamentos

Calendário de mensagens agendadas.

![Agendamentos](docs/screenshots/10-agendamentos.png)
