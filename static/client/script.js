import GameEngine from './classes/gameEngine.js';
import Controller from './classes/controller.js';
import Car from './classes/vehicle.js';
import Visualizer from './classes/visualizer.js';
import map from './map.js';
function delay(ms) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, ms);
        if (!timeoutId)
            reject(new Error('failed to delay'));
    });
}
const canvas = document.querySelector('canvas');
if (!canvas)
    throw new Error();
const controller = new Controller();
function resetCarState() {
    return new Car({ x: 250, y: 150 }, 0, 0);
}
async function submitGameState(sensorWallIntersects, inputs) {
    const data = {
        sensors: sensorWallIntersects.map(x => x.length),
        inputs: inputs,
    };
    const res = await fetch('/submitTrainingData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
document.addEventListener('keydown', (event) => {
    Controller.parseUserInput(event, controller);
});
document.addEventListener('keyup', (event) => {
    Controller.parseUserInput(event, controller);
});
const targetFrameDuration = 32;
async function main() {
    let carState = resetCarState();
    let frameStartTime;
    for (let i = 0; i < Infinity; i += 1) {
        frameStartTime = Date.now();
        const carBody = GameEngine.getCarBody(carState);
        const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
        const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
        const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
        const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
        const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);
        if (bodyWallIntersects.length !== 0)
            carState = resetCarState();
        Visualizer.drawPointArray(canvas, sensorWallIntersectPoints, 3, 'gold');
        Visualizer.drawPointArray(canvas, bodyWallIntersectPoints, 3, 'crimson');
        Visualizer.drawVectorArray(canvas, carBody.sides, 3, 'skyblue', 'solid');
        Visualizer.drawVectorArray(canvas, sensors, 3, 'hotpink', 'dashed');
        Visualizer.drawVectorArray(canvas, map, 3, 'white', 'solid');
        const inputs = await Controller.getApiInput(sensorWallIntersects);
        const frameDuration = Date.now() - frameStartTime;
        let frameBuffer;
        if (targetFrameDuration - frameDuration > 0) {
            frameBuffer = targetFrameDuration - frameDuration;
        }
        else {
            frameBuffer = 0;
        }
        console.log(frameStartTime);
        console.log(frameDuration);
        console.log(frameBuffer);
        console.log('==========');
        await delay(frameBuffer);
        Visualizer.clearViewports(canvas);
        carState = GameEngine.moveVehicle(carState, inputs);
    }
}
await main();
//# sourceMappingURL=script.js.map