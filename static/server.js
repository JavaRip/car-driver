import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
const app = express();
function asyncWrap(f) {
    return (req, res, next) => {
        Promise.resolve(f(req, res, next))
            .catch((e) => next(e || new Error()));
    };
}
async function getNextMove(req, res) {
    const sensors = req.body;
    const nextMoveRes = await fetch('http://127.0.0.1:5000/gamestate', {
        method: 'POST',
        body: JSON.stringify(sensors.map(x => x.length)),
    });
    const nextMove = (await nextMoveRes.text()).slice(2, -2).split(' ');
    res.json(nextMove);
}
export function saveTrainingData(req, res) {
    const data = trainingDataToArr(req.body);
    fs.appendFile('data.csv', data, function (err) {
        if (err) {
            console.log(err);
        }
    });
    res.json();
}
function trainingDataToArr(data) {
    const dataArr = data.sensors;
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
//# sourceMappingURL=server.js.map