/**
 * Logging utility for Cool Shot AI WhatsApp Bot
 */

const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs-extra');
fs.ensureDirSync('./logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'coolshot-whatsapp-bot' },
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: './logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: './logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
  ],
});

// Add console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        
        return log;
      })
    )
  }));
}

// Add specific methods for different log types
logger.system = (message, meta = {}) => {
  logger.info(message, { type: 'system', ...meta });
};

logger.auth = (message, meta = {}) => {
  logger.info(message, { type: 'auth', ...meta });
};

logger.command = (message, meta = {}) => {
  logger.info(message, { type: 'command', ...meta });
};

logger.ai = (message, meta = {}) => {
  logger.info(message, { type: 'ai', ...meta });
};

logger.admin = (message, meta = {}) => {
  logger.info(message, { type: 'admin', ...meta });
};

logger.user = (message, meta = {}) => {
  logger.info(message, { type: 'user', ...meta });
};

module.exports = logger;