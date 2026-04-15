/**
 * lib/observability/logger.ts
 * Structured logger using pino.
 * Server-only. Do not import in client components.
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
    },
  }),
  base: {
    env: process.env.NODE_ENV ?? 'unknown',
    service: 'cabane-apuseni',
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger with additional bound context fields.
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
