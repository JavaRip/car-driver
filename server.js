import express from 'express';
import fs from 'fs';
const app = express();

const listeningServer = app.listen(8080);

function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

export async function sendGSToServer(GS) {
    const data = GS.values()
    await fs.appendFile(`data.csv`, data, 'utf8')
}

app.use(express.static('client'));
app.post('/gs', express.json(), asyncWrap(writeGSToCSV()))

