import GameEngine from './classes/gameEngine.js';
import Controller from './classes/controller.js';
import GameState from './classes/gamestate.js';
import Visualizer from './classes/visualizer.js';
import map from './map.js';

let GS = new GameState(250, 150, map, 0, 0);
const View = new Visualizer(document.querySelector('canvas'));
const Engine = new GameEngine();
const Ctrl = new Controller();

function delay(ms) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    if (!timeoutId) reject(new Error('failed to delay'));
  });
}

async function main() {
  for (let i = 0; i < Infinity; i += 1) {
    // reset on crash
    if (GS.bodyIntersects.length > 0) GS = new GameState(250, 150, map, 0, 0);

    const inputs = await Ctrl.getInput(GS);
    await delay(50);

    const newGs = Engine.moveCar(GS.posX, GS.posY, GS.movVec, GS.speed, GS.map, inputs);
    GS.posX = newGs.posX;
    GS.posY = newGs.posY;
    GS.carBody = newGs.carBody;
    GS.movVec = newGs.movVec;
    GS.speed = newGs.speed;
    GS.bodyRays = newGs.bodyRays;
    GS.movRay = Engine.getRelativeRay(GS.posX, GS.posY, 75, GS.movVec, 0);
    GS.colRays = newGs.colRays;
    GS.bodyIntersects = newGs.bodyIntersects;

    View.nextFrame(GS);
  }
}

main();
