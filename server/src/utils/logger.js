// Minimal structured logger. Swap for pino/winston later without changing call
// sites. Silent during tests to keep output clean.
const isTest = process.env.NODE_ENV === 'test';

function log(level, args) {
  if (isTest) return;
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](`[${ts}] ${level.toUpperCase()}`, ...args);
}

export const logger = {
  info: (...args) => log('info', args),
  warn: (...args) => log('warn', args),
  error: (...args) => log('error', args),
  debug: (...args) => process.env.DEBUG && log('debug', args),
};
