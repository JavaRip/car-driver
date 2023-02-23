import GameEngine from './classes/gameEngine.js';
import Controller from './classes/controller.js';
import Visualizer from './classes/visualizer.js';
import MapEditor from './classes/mapEditor.js';
import { elements } from '../interfaces.js';

import map from './map.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    if (!timeoutId) reject(new Error('failed to delay'));
  });
}

function getElements(): elements {
  return {
    canvas: document.querySelector('#game-view') as HTMLCanvasElement,
    pauseMenu: document.querySelector('#pause-menu') as HTMLDivElement,
    manualModeBtn: document.querySelector('#manual-mode-btn') as HTMLButtonElement,
    trainingDataModeBtn: document.querySelector('#training-data-mode-btn') as HTMLButtonElement,
    autopilotModeBtn: document.querySelector('#autopilot-mode-btn') as HTMLButtonElement,
    mapEditorModeBtn: document.querySelector('#map-editor-btn') as HTMLButtonElement,
  };
}

function initClasses(el: elements): void {
  MapEditor.init(el.canvas);
  Visualizer.init(el.pauseMenu, el.canvas);
}

async function init(): Promise<void> {
  const el = getElements();
  initClasses(el);

  await main();
}

async function main(): Promise<void> {
  let carState = GameEngine.resetCarState();
  let frameStartTime;

  while (true) {
    frameStartTime = Date.now();
    if (Controller.mode === 'autopilot') {
      const carBody = GameEngine.getCarBody(carState);
      const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
      const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
      const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
      const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
      const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);

      if (bodyWallIntersects.length !== 0) carState = GameEngine.resetCarState();

      Visualizer.drawPointArray(sensorWallIntersectPoints, 3, 'gold');
      Visualizer.drawPointArray(bodyWallIntersectPoints, 3, 'crimson');
      Visualizer.drawVectorArray(carBody.sides, 3, 'skyblue', 'solid');
      Visualizer.drawVectorArray(sensors, 3, 'hotpink', 'dashed');
      Visualizer.drawVectorArray(map, 3, 'white', 'solid');

      const inputs = await Controller.getApiInput(sensorWallIntersects);
      carState = GameEngine.moveVehicle(carState, inputs);
    } else if (Controller.mode === 'map-editor') {
      Visualizer.drawVectorArray(map, 3, 'white', 'solid');

      if (MapEditor.wallEnd && MapEditor.wallStart) {
        const wallPrevVec = {
          start: MapEditor.wallStart, end: MapEditor.wallEnd,
        };
        Visualizer.drawVectorArray([wallPrevVec], 2, 'gray', 'solid');
      }
    } else if (Controller.mode === 'manual') {
      const carBody = GameEngine.getCarBody(carState);
      const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
      const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
      const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
      const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
      const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);

      if (bodyWallIntersects.length !== 0) carState = GameEngine.resetCarState();

      Visualizer.drawPointArray(sensorWallIntersectPoints, 3, 'gold');
      Visualizer.drawPointArray(bodyWallIntersectPoints, 3, 'crimson');
      Visualizer.drawVectorArray(carBody.sides, 3, 'skyblue', 'solid');
      Visualizer.drawVectorArray(sensors, 3, 'hotpink', 'dashed');
      Visualizer.drawVectorArray(map, 3, 'white', 'solid');

      const inputs = Controller.getInput();
      carState = GameEngine.moveVehicle(carState, inputs);
    } else if (Controller.mode === 'record-training-data') {
      console.log('recording training data');
    }

    const frameDuration = Date.now() - frameStartTime;
    let frameBuffer;

    if (Controller.targetFrameDuration - frameDuration > 0) {
      frameBuffer = Controller.targetFrameDuration - frameDuration;
    } else {
      frameBuffer = 0;
    }

    await delay(frameBuffer);
    Visualizer.clearViewports();
  }
}

window.addEventListener('load', init);
