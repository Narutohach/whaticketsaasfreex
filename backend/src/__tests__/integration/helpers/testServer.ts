// @whiskeysockets/baileys é distribuído como ESM puro, e o Jest não consegue
// parsear como CommonJS. app.ts carrega todas as rotas (routes/index.ts), e
// várias controllers (ex.: WhatsAppController) importam libs/wbot.ts direto,
// além de app.ts importar queues.ts (que arrasta wbotMessageListener.ts, com
// o mesmo problema). Nenhum teste de integração aqui exercita fila ou envio
// de WhatsApp, então os dois módulos são substituídos antes de app.ts
// carregar. O mock do próprio pacote (jest.config.js -> moduleNameMapper)
// cobre os outros consumidores transitivos (ex.: UpdateTicketService).
jest.mock("../../../libs/wbot", () => ({
  getWbot: jest.fn(() => {
    throw new Error("ERR_WAPP_NOT_INITIALIZED");
  }),
  removeWbot: jest.fn(),
  restartWbot: jest.fn(),
  initWASocket: jest.fn()
}));

jest.mock("../../../queues", () => ({
  messageQueue: { add: jest.fn(), process: jest.fn() },
  sendScheduledMessages: { add: jest.fn(), process: jest.fn() }
}));

// providers.ts (integração com provedores externos de boleto/IXC) usa
// puppeteer, que neste ambiente não tem o Chromium baixado — mockado pelo
// mesmo motivo dos dois acima: nenhum teste aqui exercita esse fluxo.
jest.mock("puppeteer", () => ({}));

// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import http from "http";
// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import app from "../../../app";
// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import { initIO, getIO } from "../../../libs/socket";
// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import sequelize from "../../../database";

/**
 * SessionController.store (login) chama getIO().to(...).emit(...)
 * incondicionalmente após autenticar — sem inicializar o Socket.IO num
 * `http.Server` de verdade, todo login em teste de integração quebraria com
 * "io not initialized", mesmo com credenciais corretas.
 *
 * O server é colocado para escutar aqui mesmo (porta aleatória) em vez de
 * deixar o supertest gerenciar o ciclo de vida sozinho: passado um server já
 * — mas não — escutando, versões do supertest tratam isso como efêmero e o
 * fecham sozinhas após a primeira chamada, e um `server.close()` posterior
 * nosso falha com "Server is not running" (e o erro dessa falha carrega uma
 * referência circular do pool do Sequelize, o que derruba o worker do Jest
 * ao tentar serializar a falha para o processo principal).
 */
export const createTestServer = async (): Promise<http.Server> => {
  const server = http.createServer(app);
  initIO(server);

  await new Promise<void>(resolve => {
    server.listen(0, resolve);
  });

  return server;
};

export const closeTestServer = async (): Promise<void> => {
  // io.close() fecha o http.Server por baixo também; chamar os dois
  // separadamente deixa handles do Socket.IO abertos (o Jest acusa "worker
  // failed to exit gracefully").
  await new Promise<void>(resolve => {
    getIO().close(() => resolve());
  });

  await sequelize.close();
};
