const express = require('express');
const logger = require('./logger');
const app = express();
const port = process.env.APP_PORT || 3000;

// Middleware to extract trace context
app.use((req, res, next) => {
  const traceId = req.headers['traceparent'] || req.headers['x-trace-id'];
  logger.info('Incoming request', { trace_id: traceId, route: req.path, method: req.method, ip: req.ip });
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Route to generate random logs
app.get('/generate-logs', (req, res) => {
  const logCount = 100;
  const logTypes = ['info', 'warn', 'error', 'debug'];

  for (let i = 0; i < logCount; i++) {
    const randomLogType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const randomMessage = `Random ${randomLogType.toUpperCase()} log #${i + 1}`;
    const randomMeta = {
      userId: Math.floor(Math.random() * 1000),
      action: ['login', 'logout', 'update', 'delete'][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.5 ? 'success' : 'failure',
    };

    // Log the random message with metadata
    logger[randomLogType](randomMessage, randomMeta);
  }

  res.send(`Generated ${logCount} random logs.`);
});

app.listen(port, () => {
  logger.info(`Server started`, { port });
});
