import express from 'express';
import fs from 'fs';
const app = express();

// eslint-disable-next-line no-unused-vars
const listeningserver = app.listen(8080);

function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

export function writeGStoCSV(req, res) {
  const data = `${req.body.posX},${req.body.posY},${req.body.movVec},${req.body.speed},${req.body.turnLeft},${req.body.turnRight},${req.body.accel}\n`;
  fs.appendFile('data.csv', data, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.json();
}

app.use(express.static('client'));
app.post('/gs', express.json(), asyncWrap(writeGStoCSV));
