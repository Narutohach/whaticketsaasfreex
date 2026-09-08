import pino from 'pino';
import moment from 'moment-timezone';

// Função para obter o timestamp com fuso horário
const timezoned = () => {
  return moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm:ss');
};

// Caminhos censurados nos logs. O pino/fast-redact nao aceita "**" no inicio,
// entao usamos "campo" para a raiz, "*.campo" para um nivel de aninhamento e
// caminhos explicitos para os casos profundos que realmente acontecem aqui
// (erros do axios carregam config/request/response com o header Authorization).
const redactPaths = [
  // Headers de autenticacao (axios, express, socket)
  "headers.Authorization",
  "headers.authorization",
  "config.headers.Authorization",
  "config.headers.authorization",
  "err.config.headers.Authorization",
  "err.config.headers.authorization",
  "error.config.headers.Authorization",
  "error.config.headers.authorization",
  "request.headers.Authorization",
  "request.headers.authorization",
  "response.config.headers.Authorization",
  "response.config.headers.authorization",
  "req.headers.authorization",
  "req.headers.Authorization",
  "*.headers.Authorization",
  "*.headers.authorization",
  // Campos sensiveis na raiz do objeto logado
  "apiKey",
  "voiceKey",
  "token",
  "accessToken",
  "password",
  "session",
  "creds",
  "keys",
  "clientSecret",
  "client_secret",
  // Os mesmos campos um nivel abaixo
  "*.apiKey",
  "*.voiceKey",
  "*.token",
  "*.accessToken",
  "*.password",
  "*.session",
  "*.creds",
  "*.keys",
  "*.clientSecret",
  "*.client_secret"
];

const logger = pino({
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]"
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', // Use this para tradução de tempo
      ignore: "pid,hostname"
    },
  },
  timestamp: () => `,"time":"${timezoned()}"`, // Adiciona o timestamp formatado
});

export  { logger };
