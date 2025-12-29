/**
 * Logger utility that only logs in development mode
 * Prevents console logs from appearing in production builds
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production, but only in dev mode for detailed info
    if (isDev) {
      console.error(...args);
    } else {
      // In production, only log critical errors without sensitive details
      console.error('[Error]', args[0]);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

