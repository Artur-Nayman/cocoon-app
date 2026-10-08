const isDev = import.meta.env ? import.meta.env.DEV : true;

export const logger = {
  debug: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args) => {
    console.info(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
  }
};
