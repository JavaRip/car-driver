import express from 'express';
const app = express();

app.use(express.static('client'));
const listeningServer = app.listen(8080);

