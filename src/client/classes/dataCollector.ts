import { intersect, controlstate, trainingrow } from '../../interfaces.js';

export default class dataCollector {
  static async submitGameState(sensorWallIntersects: intersect[], inputs: controlstate): Promise<boolean> {
    const data: trainingrow = {
      sensors: sensorWallIntersects.map(x => x.length),
      inputs: inputs,
    };

    const res = await fetch(
      '/submitTrainingData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      console.error('failed to submite training data');
      return false;
    }

    return true;
  }
}
