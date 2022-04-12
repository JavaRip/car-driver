import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
const app = express();

app.listen(8080);

function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

async function getNextMove(req, res) {
  const nextMoveRes = await fetch(
    'http://localhost:5000/gamestate', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
  const nextMove = (await nextMoveRes.text()).slice(2, -2).split(' ');
  res.json(nextMove);
}

export function writeGStoCSV(req, res) {
  const data = `
  ${req.body.posX},
    ${req.body.posY},
    ${req.body.movVec},
    ${req.body.speed},
    ${req.body.turnLeft},
    ${req.body.turnRight},
    ${req.body.accel}\n`;
  fs.appendFile('data.csv', data, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.json();
}

app.use(express.static('client'));
app.post('/gamestate', express.json(), asyncWrap(getNextMove));
// app.post('/gs', express.json(), asyncWrap(writeGStoCSV));
