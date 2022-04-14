import express, { Request, Response, Application, RequestHandler, NextFunction } from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
const app: Application = express();

function asyncWrap(f: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

async function getNextMove(req: Request, res: Response): Promise<void> {
  const nextMoveRes = await fetch(
    'http://localhost:5000/gamestate', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
  const nextMove = (await nextMoveRes.text()).slice(2, -2).split(' ');
  res.json(nextMove);
}

// export function writeGStoCSV(req: Request, res: Response): Promise<Reponse> {
//   const data = `
//   ${req.body.posX},
//     ${req.body.posY},
//     ${req.body.movVec},
//     ${req.body.speed},
//     ${req.body.turnLeft},
//     ${req.body.turnRight},
//     ${req.body.accel}\n`;
//   fs.appendFile('data.csv', data, function (err) {
//     if (err) {
//       console.log(err);
//     }
//   });
//   res.json();
// }

app.use(express.static('dist/client/'));
// app.post('/gamestate', express.json(), asyncWrap(getNextMove));
// app.post('/gs', express.json(), asyncWrap(writeGStoCSV));

const port = 8080;
console.log(`server running on ${port}`);
app.listen(port);
