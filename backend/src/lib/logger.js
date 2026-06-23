// Simple JSON logger util
const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ level: 'info', msg, ...meta, ts: new Date() })),
  warn: (msg, meta = {}) => console.log(JSON.stringify({ level: 'warn', msg, ...meta, ts: new Date() })),
  error: (msg, meta = {}) => console.log(JSON.stringify({ level: 'error', msg, ...meta, ts: new Date() })),
};

module.exports = logger;
