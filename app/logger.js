const winston = require('winston');
const { trace, context } = require('@opentelemetry/api');

const logLevel = process.env.APP_LOG_LEVEL || 'info';

// OpenTelemetry Log Level Mapping
const severityMap = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

// Create a logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(
      ({ timestamp, level, message, service, resource, ...meta }) => {
        // Extract trace information if available
        const span = trace.getSpan(context.active());
        const traceId = span ? span.spanContext().traceId : null;
        const spanId = span ? span.spanContext().spanId : null;

        return JSON.stringify({
          Timestamp: timestamp,
          SeverityText: level.toUpperCase(),
          SeverityNumber: severityMap[level] || 3,
          Body: message,
          ServiceName: process.env.SERVICE_NAME || 'app',
          TraceId: traceId || '',
          SpanId: spanId || '',
          ResourceAttributes: JSON.stringify(resource || {}), // Resource metadata
          LogAttributes: JSON.stringify(meta || {}), // Structured log attributes
        });
      }
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

module.exports = logger;
