const winston = require('winston');

const logLevel = process.env.APP_LOG_LEVEL || 'info';

// Create a logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

module.exports = logger;
