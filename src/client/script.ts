import GameEngine from './classes/gameEngine.js';
import Controller from './classes/controller.js';
import Visualizer from './classes/visualizer.js';
import MapEditor from './classes/mapEditor.js';

import map from './map.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    if (!timeoutId) reject(new Error('failed to delay'));
  });
}

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const pauseMenu = document.querySelector('#pause-menu') as HTMLDivElement;
const manualModeBtn = pauseMenu.querySelector('#manual-mode-btn') as HTMLButtonElement;
const trainingDataModeBtn = pauseMenu.querySelector('#training-data-mode-btn') as HTMLButtonElement;
const autopilotModeBtn = pauseMenu.querySelector('#autopilot-mode') as HTMLButtonElement;
const mapEditorModeBtn = pauseMenu.querySelector('#map-editor') as HTMLButtonElement;

if (!canvas) throw new Error();

const controller = new Controller();
const mapEditor = new MapEditor(map);

let mode = 'map-editor';
let carState = GameEngine.resetCarState();

document.addEventListener('keydown', (event) => {
  Controller.parseUserInput(event, controller);
});

document.addEventListener('keyup', (event) => {
  Controller.parseUserInput(event, controller);
});

document.addEventListener('pause', () => {
  Visualizer.togglePauseMenu(pauseMenu);
});

document.addEventListener('lock-x', () => { mapEditor.lockX = true; });
document.addEventListener('unlock-x', () => { mapEditor.lockX = false; });
document.addEventListener('lock-y', () => { mapEditor.lockY = true; });
document.addEventListener('unlock-y', () => { mapEditor.lockY = false; });
document.addEventListener('delete-wall', () => {
  MapEditor.deleteWall(mapEditor);
  console.log('deleting wall (hopefully)');
});

canvas.addEventListener('mousedown', (event) => {
  mapEditor.wallStart = MapEditor.getMousePosition(canvas, event);
});

canvas.addEventListener('mouseup', (event) => {
  if (mode !== 'map-editor') return;
  if (mapEditor.wallStart === null) return;
  if (mapEditor.wallEnd === null) return;

  mapEditor.wallEnd = MapEditor.getMousePosition(canvas, event);
  mapEditor.createWall({
    start: mapEditor.wallStart, end: mapEditor.wallEnd,
  });

  mapEditor.wallStart = null;
  mapEditor.wallEnd = null;
});

canvas.addEventListener('mouseup', (event) => {
  if (mode !== 'map-editor') return;
  MapEditor.getMousePosition(canvas, event);
});

canvas.addEventListener('mousemove', (event) => {
  if (mode !== 'map-editor') return;
  if (mapEditor.wallStart === null) return;

  const hoverPos = MapEditor.getMousePosition(canvas, event);
  mapEditor.wallEnd = hoverPos;
});

manualModeBtn.addEventListener('mousedown', () => {
  Visualizer.togglePauseMenu(pauseMenu);
  GameEngine.resetCarState();
  mode = 'manual';
});

trainingDataModeBtn.addEventListener('mousedown', () => {
  Visualizer.togglePauseMenu(pauseMenu);
  GameEngine.resetCarState();
  mode = 'training';
});

autopilotModeBtn.addEventListener('mousedown', () => {
  Visualizer.togglePauseMenu(pauseMenu);
  GameEngine.resetCarState();
  mode = 'autopilot';
});

mapEditorModeBtn.addEventListener('mousedown', () => {
  Visualizer.togglePauseMenu(pauseMenu);
  GameEngine.resetCarState();
  mode = 'map-editor';
});

const targetFrameDuration = 64;

async function main(): Promise<void> {
  let frameStartTime;

  while (true) {
    frameStartTime = Date.now();
    if (mode === 'autopilot') {
      const carBody = GameEngine.getCarBody(carState);
      const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
      const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
      const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
      const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
      const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);

      if (bodyWallIntersects.length !== 0) carState = GameEngine.resetCarState();

      Visualizer.drawPointArray(canvas, sensorWallIntersectPoints, 3, 'gold');
      Visualizer.drawPointArray(canvas, bodyWallIntersectPoints, 3, 'crimson');
      Visualizer.drawVectorArray(canvas, carBody.sides, 3, 'skyblue', 'solid');
      Visualizer.drawVectorArray(canvas, sensors, 3, 'hotpink', 'dashed');
      Visualizer.drawVectorArray(canvas, map, 3, 'white', 'solid');

      const inputs = await Controller.getApiInput(sensorWallIntersects);
      carState = GameEngine.moveVehicle(carState, inputs);
    } else if (mode === 'map-editor') {
      Visualizer.drawVectorArray(canvas, map, 3, 'white', 'solid');

      if (mapEditor.wallEnd && mapEditor.wallStart) {
        const wallPrevVec = {
          start: mapEditor.wallStart, end: mapEditor.wallEnd,
        };
        Visualizer.drawVectorArray(canvas, [wallPrevVec], 2, 'gray', 'solid');
      }
    } else if (mode === 'manual') {
      const carBody = GameEngine.getCarBody(carState);
      const sensors = GameEngine.getCarSensors(carBody.vertices, carState.direction);
      const sensorWallIntersects = GameEngine.findRealIntersect(sensors, map);
      const sensorWallIntersectPoints = sensorWallIntersects.map(x => x.point);
      const bodyWallIntersects = GameEngine.findRealIntersect(carBody.sides, map);
      const bodyWallIntersectPoints = bodyWallIntersects.map(x => x.point);

      if (bodyWallIntersects.length !== 0) carState = GameEngine.resetCarState();

      Visualizer.drawPointArray(canvas, sensorWallIntersectPoints, 3, 'gold');
      Visualizer.drawPointArray(canvas, bodyWallIntersectPoints, 3, 'crimson');
      Visualizer.drawVectorArray(canvas, carBody.sides, 3, 'skyblue', 'solid');
      Visualizer.drawVectorArray(canvas, sensors, 3, 'hotpink', 'dashed');
      Visualizer.drawVectorArray(canvas, map, 3, 'white', 'solid');

      const inputs = Controller.getInput(controller);
      carState = GameEngine.moveVehicle(carState, inputs);
    } else if (mode === 'record-training-data') {
      console.log('recording training data');
    }

    const frameDuration = Date.now() - frameStartTime;
    let frameBuffer;

    if (targetFrameDuration - frameDuration > 0) {
      frameBuffer = targetFrameDuration - frameDuration;
    } else {
      frameBuffer = 0;
    }

    // console.debug(frameBuffer);

    await delay(frameBuffer);
    Visualizer.clearViewports(canvas);
  }
}

await main();
