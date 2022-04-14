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

const car = new Car({ x: 250, y: 150 }, 0);
const controller = new Controller();

document.addEventListener('keydown', (event) => {
  Controller.parseUserInput(event, controller);
});

document.addEventListener('keyup', (event) => {
  Controller.parseUserInput(event, controller);
});

async function main(): Promise<void> {
  for (let i = 0; i < Infinity; i += 1) {
    Visualizer.drawVectorArray(canvas, map, 3, 'white');
    Visualizer.drawVectorArray(canvas, car.body.sides, 3, 'lime');
    await delay(50);
    Visualizer.clearViewports(canvas);
  }
}

await main();
