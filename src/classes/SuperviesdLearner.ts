import Controller from './Controller.js';
import Vehicle from './Vehicle.js';

export default class SupervisedLearner {
  static setReadyBtn = document.querySelector('#supervised') as HTMLButtonElement;
  static readyToRecord = false;
  static recording = false;
  static trainingData: number[][] = [];
  static trainingIntervalHandle: number;
  static car: Vehicle;

  static init(): void {
    this.setReadyBtn.addEventListener('click', () => {
      SupervisedLearner.readyToRecord = true;
      console.log('ready to record');
    });

    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'w' &&
        SupervisedLearner.readyToRecord &&
        !SupervisedLearner.recording
      ) {
        SupervisedLearner.recording = true;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key === 'w' && SupervisedLearner.recording) {
        SupervisedLearner.recording = false;
        SupervisedLearner.readyToRecord = false;
        // submit training data to server
      }
    });
  }

  static recordData(sensorLengths: number[]): void {
    this.trainingData.push([
      Number(Controller.turnLeft),
      Number(Controller.accel),
      Number(Controller.turnRight),
      ...sensorLengths,
    ]);

    console.log(SupervisedLearner.trainingData.length);
  }
}

SupervisedLearner.init();
