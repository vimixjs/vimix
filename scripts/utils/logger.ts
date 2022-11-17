import consola from 'consola';
import colors from 'picocolors';

export const prefixes = {
  start: colors.blue('start') + ' -',
  wait: colors.cyan('wait') + ' -',
  error: colors.red('error') + ' -',
  fatal: colors.red('fatal') + ' -',
  warn: colors.yellow('warn') + '  -',
  ready: colors.green('ready') + ' -',
  info: colors.cyan('info') + ' -',
  event: colors.magenta('event') + ' -',
  debug: colors.gray('debug') + ' -',
};

const createConsola = () => {
  const logger = consola.create({});
  return logger;
};

const consolaLogger = createConsola();

export function wait(...message: any[]) {
  consolaLogger.log(prefixes.wait, ...message);
}

export function error(...message: any[]) {
  consolaLogger.error(prefixes.error, ...message);
}

export function warn(...message: any[]) {
  consolaLogger.warn(prefixes.warn, ...message);
}

export function ready(...message: any[]) {
  consolaLogger.log(prefixes.ready, ...message);
}

export function info(...message: any[]) {
  consolaLogger.log(prefixes.info, ...message);
}

export function event(...message: any[]) {
  consolaLogger.log(prefixes.event, ...message);
}

export function fatal(...message: any[]) {
  consolaLogger.error(prefixes.fatal, ...message);
}

export function start(...message: any[]) {
  consolaLogger.log(prefixes.start, ...message);
}

interface VimixLogger {
  wait: typeof wait;
  error: typeof error;
  warn: typeof warn;
  ready: typeof ready;
  info: typeof info;
  event: typeof event;
  fatal: typeof fatal;
  start: typeof start;
}

const logger: VimixLogger = {
  wait,
  error,
  warn,
  ready,
  info,
  event,
  fatal,
  start,
};

export { logger, logger as default };
