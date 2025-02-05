const express = require('express');
const app = express();
const port = process.env.APP_PORT;

app.get('/', (req, res) => {
  console.log('API request received from', req.ip);
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
