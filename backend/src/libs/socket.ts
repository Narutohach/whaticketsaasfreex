import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import User from "../models/User";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import { REDIS_URI_CONNECTION } from "../config/redis";
import { CounterManager } from "./counter";

let io: SocketIO;

/**
 * Sem isso, `io.to(sala).emit(...)` só alcança os sockets conectados NESTA
 * instância do processo. Com 2+ réplicas atrás de um load balancer, um
 * atendente preso na réplica B nunca recebe eventos emitidos por um
 * webhook/mensagem processado na réplica A — hoje isso torna impossível rodar
 * mais de uma réplica. O adapter usa pub/sub do Redis (que a aplicação já usa
 * para Bull) para propagar os emits entre todas as instâncias.
 */
export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  // Clientes dedicados: uma conexão em modo subscribe não pode rodar outros
  // comandos, por isso pub e sub precisam ser instâncias separadas.
  const pubClient = new Redis(REDIS_URI_CONNECTION);
  const subClient = pubClient.duplicate();

  pubClient.on("error", err =>
    logger.error(`Socket.IO Redis adapter (pub): ${err.message}`)
  );
  subClient.on("error", err =>
    logger.error(`Socket.IO Redis adapter (sub): ${err.message}`)
  );

  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", async socket => {
    logger.info("Client Connected");
    const { token } = socket.handshake.query;
    let tokenData = null;
    try {
      tokenData = verify(token as string, authConfig.secret);
      // Nao logar o payload do JWT inteiro; apenas os identificadores nao sensiveis
      logger.debug(
        `io-onConnection: userId=${tokenData?.id} companyId=${tokenData?.companyId}`
      );
    } catch (error) {
      logger.warn(`[libs/socket.ts] Error decoding token: ${error?.message}`);
      socket.disconnect();
      return io;
    }
    const counters = new CounterManager();

    let user: User = null;
    let userId = tokenData.id;

    if (userId && userId !== "undefined" && userId !== "null") {
      user = await User.findByPk(userId, { include: [ Queue ] });
      if (user) {
        user.online = true;
        await user.save();
      } else {
        logger.info(`onConnect: User ${userId} not found`);
        socket.disconnect();
        return io;
      }
    } else {
      logger.info("onConnect: Missing userId");
      socket.disconnect();
      return io;
    }

    socket.join(`company-${user.companyId}-mainchannel`);
    socket.join(`user-${user.id}`);

    socket.on("joinChatBox", async (ticketId: string) => {
      if (!ticketId || ticketId === "undefined") {
        return;
      }
      Ticket.findByPk(ticketId).then(
        (ticket) => {
          if (ticket && ticket.companyId === user.companyId
            && (ticket.userId === user.id || user.profile === "admin")) {
            let c: number;
            if ((c = counters.incrementCounter(`ticket-${ticketId}`)) === 1) {
              socket.join(ticketId);
            }
            logger.debug(`joinChatbox[${c}]: Channel: ${ticketId} by user ${user.id}`)
          } else {
            logger.info(`Invalid attempt to join channel of ticket ${ticketId} by user ${user.id}`)
          }
        },
        (error) => {
          logger.error(error, `Error fetching ticket ${ticketId}`);
        }
      );
    });
    
    socket.on("leaveChatBox", async (ticketId: string) => {
      if (!ticketId || ticketId === "undefined") {
        return;
      }

      let c: number;
      // o último que sair apaga a luz

      if ((c = counters.decrementCounter(`ticket-${ticketId}`)) === 0) {
        socket.leave(ticketId);
      }
      logger.debug(`leaveChatbox[${c}]: Channel: ${ticketId} by user ${user.id}`)
    });

    socket.on("joinNotification", async () => {
      let c: number;
      if ((c = counters.incrementCounter("notification")) === 1) {
        if (user.profile === "admin") {
          socket.join(`company-${user.companyId}-notification`);
        } else {
          user.queues.forEach((queue) => {
            logger.debug(`User ${user.id} of company ${user.companyId} joined queue ${queue.id} channel.`);
            socket.join(`queue-${queue.id}-notification`);
          });
          if (user.allTicket === "enabled") {
            socket.join("queue-null-notification");
          }

        }
      }
      logger.debug(`joinNotification[${c}]: User: ${user.id}`);
    });
    
    socket.on("leaveNotification", async () => {
      let c: number;
      if ((c = counters.decrementCounter("notification")) === 0) {
        if (user.profile === "admin") {
          socket.leave(`company-${user.companyId}-notification`);
        } else {
          user.queues.forEach((queue) => {
            logger.debug(`User ${user.id} of company ${user.companyId} leaved queue ${queue.id} channel.`);
            socket.leave(`queue-${queue.id}-notification`);
          });
          if (user.allTicket === "enabled") {
            socket.leave("queue-null-notification");
          }
        }
      }
      logger.debug(`leaveNotification[${c}]: User: ${user.id}`);
    });
 
    socket.on("joinTickets", (status: string) => {
      if (counters.incrementCounter(`status-${status}`) === 1) {
        if (user.profile === "admin") {
          logger.debug(`Admin ${user.id} of company ${user.companyId} joined ${status} tickets channel.`);
          socket.join(`company-${user.companyId}-${status}`);
        } else if (status === "pending") {
          user.queues.forEach((queue) => {
            logger.debug(`User ${user.id} of company ${user.companyId} joined queue ${queue.id} pending tickets channel.`);
            socket.join(`queue-${queue.id}-pending`);
          });
          if (user.allTicket === "enabled") {
            socket.join("queue-null-pending");
          }
        } else {
          logger.debug(`User ${user.id} cannot subscribe to ${status}`);
        }
      }
    });
    
    socket.on("leaveTickets", (status: string) => {
      if (counters.decrementCounter(`status-${status}`) === 0) {
        if (user.profile === "admin") {
          logger.debug(`Admin ${user.id} of company ${user.companyId} leaved ${status} tickets channel.`);
          socket.leave(`company-${user.companyId}-${status}`);
        } else if (status === "pending") {
          user.queues.forEach((queue) => {
            logger.debug(`User ${user.id} of company ${user.companyId} leaved queue ${queue.id} pending tickets channel.`);
            socket.leave(`queue-${queue.id}-pending`);
          });
          if (user.allTicket === "enabled") {
            socket.leave("queue-null-pending");
          }
        }
      }
    });
    
    socket.emit("ready");
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
