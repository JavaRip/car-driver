import express from 'express';
import fs from 'fs';
const app = express();

const listeningserver = app.listen(8080);
listeningserver.on('connection', () => {
  console.log('new connection');
});

function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

export function writeGStoCSV(req, res) {
  const data = `${req.body.posX},${req.body.posY},${req.body.movVec},${req.body.speed},${req.body.rotSpeed},${req.body.turnLeft},${req.body.turnRight},${req.body.accel}\n`;
  fs.appendFile('data.csv', data, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.json();
}

app.use(express.static('client'));
app.post('/gs', express.json(), asyncWrap(writeGStoCSV));
