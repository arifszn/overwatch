const express = require('express');
const logger = require('./logger');
const app = express();
const port = process.env.APP_PORT;

app.get('/', (req, res) => {
  logger.info('API request received.', { ip: req.ip });
  res.send('Hello World!');
});

app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});
