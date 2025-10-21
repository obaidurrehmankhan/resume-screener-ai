import pino from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';

export const appLogger = pino({
  level,
  base: undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  messageKey: 'message',
});

export type AppLogger = typeof appLogger;
