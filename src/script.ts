import Controller from './classes/Controller.js';
import Car from './classes/Vehicle.js';
import Visualizer from './classes/Visualizer.js';
import Point from './classes/Point.js';
import VectorLib from './classes/VectorLib.js';
import maps from './map.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    if (!timeoutId) reject(new Error('failed to delay'));
  });
}

// TODO add resetCar method to Car class
// function resetCarState() {
//   return new Car({ x: 250, y: 150 }, 0, 0);
// }

// // TODO create supervisedAi class
// async function submitGameState(sensorWallIntersects: intersect[], inputs: controlstate) {
//   const data: trainingrow = {
//     sensors: sensorWallIntersects.map(x => x.length),
//     inputs: inputs,
//   };

//   const res = await fetch(
//     '/submitTrainingData', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     },
//   );

//   if (!res.ok) {
//     throw new Error(`Failed to submit training data: ${res.status}`);
//   }
// }


async function main(): Promise<void> {
  const map = maps.straightMap;
  const targetFrameDuration = 32;
  let frameStartTime;

  const car = new Car(new Point(250, 150), 0, 0);

  for (let i = 0; i < Infinity; i += 1) {
    frameStartTime = Date.now();
    const sensorWallIntersects = VectorLib.findRealIntersect(car.sensors, map);
    const carWallIntersects = VectorLib.findRealIntersect(car.body.sides, map);

    // TODO reset car position if carWallIntersects.length > 0
    Visualizer.drawPointArray(carWallIntersects.map(x => x.point), 3, 'crimson');
    Visualizer.drawPointArray(sensorWallIntersects.map(x => x.point), 3, 'gold');
    Visualizer.drawVectorArray(car.body.sides, 3, 'skyblue', 'solid');
    Visualizer.drawVectorArray(car.sensors, 3, 'hotpink', 'dashed');
    Visualizer.drawVectorArray(map, 3, 'white', 'solid');

    // const inputs = await Controller.getApiInput(sensorWallIntersects);
    const inputs = Controller.getInput();
    car.move(inputs);
    const frameDuration = Date.now() - frameStartTime;

    let frameBuffer;
    if (targetFrameDuration - frameDuration > 0) {
      frameBuffer = targetFrameDuration - frameDuration;
    } else {
      frameBuffer = 0;
    }
    await delay(frameBuffer);

    Visualizer.clearViewports();
  }
}

await main();
