import Controller from './Controller.js';
import Vehicle from './Vehicle.js';

export default class SupervisedLearner {
  static setReadyBtn = document.querySelector('#supervised') as HTMLButtonElement;
  static submitData = document.querySelector('#submit-training') as HTMLButtonElement;
  static readyToRecord = false;
  static recording = false;
  static trainingData: number[][] = [];
  static trainingIntervalHandle: number;
  static car: Vehicle;

  static async submitTrainingData(this: void): Promise<void> {
    console.log('submitting training data');
    const res = await fetch('/train_model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(SupervisedLearner.trainingData),
    });

    if (res.ok) {
      console.log('training data submitted successfully');
    } else {
      console.error(`failed to submit training data: ${res.status}`);
    }
  }

  static init(): void {
    this.submitData.addEventListener('click', this.submitTrainingData);

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
