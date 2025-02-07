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

app.listen(port, () => {
  logger.info(`Server started`, { port });
});
