import 'vite';
import { createRequire } from 'module';
import { join, dirname } from 'path';
import _debug from 'debug';
import readline from 'readline';
import colors from 'picocolors';
import 'minimatch';
import os from 'os';
import 'mustache';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var getRoot = /* @__PURE__ */ __name(() => {
  if (typeof __require !== "undefined" && typeof __require.resolve !== "undefined") {
    return dirname(__require.resolve("vimix/package.json"));
  }
  return dirname(createRequire(import.meta.url).resolve("vimix/package.json"));
}, "getRoot");
var pkgRoot = getRoot();
console.log(pkgRoot);
join(pkgRoot, "templates");

// src/node/core/config.ts
function defineConfig(config) {
  return config;
}
__name(defineConfig, "defineConfig");
var LogLevels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};
var lastType;
var lastMsg;
var sameCount = 0;
function clearScreen() {
  const repeatCount = process.stdout.rows - 2;
  const blank = repeatCount > 0 ? "\n".repeat(repeatCount) : "";
  console.log(blank);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}
__name(clearScreen, "clearScreen");
function createLogger(level = "info", options = {}) {
  if (options.customLogger) {
    return options.customLogger;
  }
  const loggedErrors = /* @__PURE__ */ new WeakSet();
  const { prefix = "[vite]", allowClearScreen = true } = options;
  const thresh = LogLevels[level];
  const canClearScreen = allowClearScreen && process.stdout.isTTY && !process.env.CI;
  const clear = canClearScreen ? clearScreen : () => {
  };
  function output(type, msg, options2 = {}) {
    if (thresh >= LogLevels[type]) {
      const method = type === "info" ? "log" : type;
      const format = /* @__PURE__ */ __name(() => {
        if (options2.timestamp) {
          const tag = type === "info" ? colors.cyan(colors.bold(prefix)) : type === "warn" ? colors.yellow(colors.bold(prefix)) : colors.red(colors.bold(prefix));
          return `${colors.dim(new Date().toLocaleTimeString())} ${tag} ${msg}`;
        } else {
          return msg;
        }
      }, "format");
      if (options2.error) {
        loggedErrors.add(options2.error);
      }
      if (canClearScreen) {
        if (type === lastType && msg === lastMsg) {
          sameCount++;
          clear();
          console[method](format(), colors.yellow(`(x${sameCount + 1})`));
        } else {
          sameCount = 0;
          lastMsg = msg;
          lastType = type;
          if (options2.clear) {
            clear();
          }
          console[method](format());
        }
      } else {
        console[method](format());
      }
    }
  }
  __name(output, "output");
  const warnedMessages = /* @__PURE__ */ new Set();
  process.env.DEBUG ? _debug(prefix) : () => {
  };
  const logger2 = {
    hasWarned: false,
    debug(msg, opts) {
      output("debug", msg, opts);
    },
    info(msg, opts) {
      output("info", msg, opts);
    },
    warn(msg, opts) {
      logger2.hasWarned = true;
      output("warn", msg, opts);
    },
    warnOnce(msg, opts) {
      if (warnedMessages.has(msg))
        return;
      logger2.hasWarned = true;
      output("warn", msg, opts);
      warnedMessages.add(msg);
    },
    error(msg, opts) {
      logger2.hasWarned = true;
      output("error", msg, opts);
    },
    clearScreen(type) {
      if (thresh >= LogLevels[type]) {
        clear();
      }
    },
    hasErrorLogged(error) {
      return loggedErrors.has(error);
    }
  };
  return logger2;
}
__name(createLogger, "createLogger");
createLogger();
os.platform() === "win32";

export { defineConfig };
