
require("./bots/SKN/index1.js")
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join(__dirname, 'responses.json');

let responses = {};
if (fs.existsSync(filePath)) {
  responses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

app.get('/api/responses', (req, res) => res.json(responses));

app.post('/api/responses', (req, res) => {
  const { said, reply } = req.body;
  responses[said] = reply;
  fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));
  res.sendStatus(200);
});

app.put('/api/responses/:said', (req, res) => {
  const said = decodeURIComponent(req.params.said);
  responses[said] = req.body.reply;
  fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));
  res.sendStatus(200);
});

app.delete('/api/responses/:said', (req, res) => {
  const said = decodeURIComponent(req.params.said);
  delete responses[said];
  fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => console.log('ok'));
