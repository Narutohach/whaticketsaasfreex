/**
 * @whiskeysockets/baileys é distribuído como ESM puro, e o Jest (via ts-jest,
 * sem transform de Babel para JS) não consegue parsear o `import` no arquivo
 * compilado da lib. O pacote é importado direta ou transitivamente por boa
 * parte dos controllers/services (WhatsAppController, UpdateTicketService,
 * wbotMessageListener, providers.ts...), então mapear o próprio especificador
 * do pacote (ver jest.config.js -> moduleNameMapper) resolve de uma vez só,
 * em vez de mockar cada arquivo consumidor.
 *
 * Nenhum teste de integração hoje exercita envio/recebimento real de
 * WhatsApp, então este mock só precisa não quebrar no import — qualquer
 * propriedade acessada (função, enum, namespace como `proto`) devolve outro
 * proxy chamável, nunca undefined.no-lugar-errado.
 */
const callableNoop: any = new Proxy(() => undefined, {
  get: (_target, prop) => {
    if (prop === "__esModule") return true;
    return callableNoop;
  }
});

module.exports = callableNoop;
