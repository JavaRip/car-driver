import GameEngine from './classes/gameEngine.js';
import Controller from './classes/controller.js';
import Car from './classes/vehicle.js';
import Visualizer from './classes/visualizer.js';
import map from './map.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    if (!timeoutId) reject(new Error('failed to delay'));
  });
}

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

if (!canvas) throw new Error();

const controller = new Controller();

let carState = new Car({ x: 250, y: 150 }, 0, 0);

document.addEventListener('keydown', (event) => {
  Controller.parseUserInput(event, controller);
});

document.addEventListener('keyup', (event) => {
  Controller.parseUserInput(event, controller);
});

async function main(): Promise<void> {
  for (let i = 0; i < Infinity; i += 1) {
    const carBody = GameEngine.getCarBody(carState);
    const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
    const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
    const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
    const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
    const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);

    Visualizer.drawPointArray(canvas, sensorWallIntersectPoints, 3, 'gold');
    Visualizer.drawPointArray(canvas, bodyWallIntersectPoints, 3, 'crimson');
    Visualizer.drawVectorArray(canvas, carBody.sides, 3, 'skyblue');
    Visualizer.drawVectorArray(canvas, sensors, 3, 'hotpink');
    Visualizer.drawVectorArray(canvas, map, 3, 'white');
    await delay(50);
    Visualizer.clearViewports(canvas);
    carState = GameEngine.moveVehicle(carState, Controller.getInput(controller));
  }
}

await main();
