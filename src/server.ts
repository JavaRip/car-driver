import express, { Request, Response, Application, RequestHandler, NextFunction } from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import { trainingrow, intersect } from './interfaces.js';

const app: Application = express();

function asyncWrap(f: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

async function getNextMove(req: Request, res: Response): Promise<void> {
  const sensors: intersect[] = req.body;
  const nextMoveRes = await fetch(
    'http://localhost:5000/gamestate', {
      method: 'POST',
      body: JSON.stringify(sensors.map(x => x.length)),
    });
  const nextMove = (await nextMoveRes.text()).slice(2, -2).split(' ');
  res.json(nextMove);
}

export function saveTrainingData(req: Request, res: Response): void {
  const data: string = trainingDataToArr(req.body);

  fs.appendFile('data.csv', data, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.json();
}

function trainingDataToArr(data: trainingrow): string {
  const dataArr: (boolean|number)[] = data.sensors;

  dataArr.push(data.inputs.turnLeft);
  dataArr.push(data.inputs.turnRight);
  dataArr.push(data.inputs.accel);

  const outData = String(dataArr) + '\n';
  return outData;
}

app.use(express.static('dist/client/'));
app.post('/getMove', express.json(), asyncWrap(getNextMove));
app.post('/submitTrainingData', express.json(), asyncWrap(saveTrainingData));

const port = 8080;
console.log(`server running on ${port}`);
app.listen(port);
