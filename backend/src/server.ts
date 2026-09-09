import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";
import { TransferTicketQueue } from "./wbotTransferTicketQueue";
import { recoverStalledInboundMessages } from "./services/WbotServices/RecoverStalledInboundMessages";
import cron from "node-cron";

const server = app.listen(process.env.PORT, async () => {
  try {
    const companies = await Company.findAll();
    const sessionPromises = [];

    for (const c of companies) {
      sessionPromises.push(StartAllWhatsAppsSessions(c.id));
    }

    await Promise.all(sessionPromises);
    startQueueProcess();
    logger.info(`Server started on port: ${process.env.PORT}`);
  } catch (error) {
    logger.error({ err: error }, "Error starting server");
    console.error(error);
    process.exit(1);
  }
});

process.on("uncaughtException", err => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Registra e segue, em vez de derrubar o processo.
 *
 * Este é um servidor multiempresa: matar o processo por uma promise rejeitada
 * em UM fluxo tira do ar TODAS as empresas e descarta a fila de mensagens
 * recebidas, que hoje vive em memória (wbotMessageListener). Vários caminhos
 * chegam aqui sem tratamento — inclusive o webhook público de pagamento —, o
 * que tornava a queda provocável de fora.
 *
 * `uncaughtException` continua encerrando: ali o estado do processo é
 * realmente desconhecido e seguir é pior.
 */
process.on("unhandledRejection", (reason, p) => {
  logger.error(
    `unhandledRejection (processo mantido no ar): ${
      (reason as Error)?.message || reason
    }`
  );
  logger.debug(`unhandledRejection promise: ${p}`);
});


cron.schedule("* * * * *", async () => {
  try {
    logger.info(`Serviço de transferência de tickets iniciado`);
    await TransferTicketQueue();
  } catch (error) {
    logger.error("Error in cron job:", error);
  }
});

// Recupera mensagens de texto que ficaram presas por uma queda do processo
// no meio do processamento (ver InboundMessageDurability.ts).
cron.schedule("*/2 * * * *", async () => {
  try {
    await recoverStalledInboundMessages();
  } catch (error) {
    logger.error(`Error recovering stalled inbound messages: ${error}`);
  }
});

initIO(server);

// Configure graceful shutdown to handle all outstanding promises
gracefulShutdown(server, {
  signals: "SIGINT SIGTERM",
  timeout: 30000, // 30 seconds
  onShutdown: async () => {
    logger.info("Gracefully shutting down...");
    // Add any other cleanup code here, if necessary
  },
  finally: () => {
    logger.info("Server shutdown complete.");
  }
});
