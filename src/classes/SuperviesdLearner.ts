import Controller from './Controller.js';
import Vehicle from './Vehicle.js';

export default class SupervisedLearner {
  static setReadyBtn = document.querySelector('#gen-training') as HTMLButtonElement;
  static submitData = document.querySelector('#submit-training') as HTMLButtonElement;
  static setSupervisedDriver = document.querySelector('#supervised-model') as HTMLButtonElement;

  static readyToRecord = false;
  static recording = false;
  static trainingData: number[][] = [];
  static trainingIntervalHandle: number;
  static car: Vehicle;

  static async submitTrainingData(this: void): Promise<void> {
    const res = await fetch('/train_model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(SupervisedLearner.trainingData),
    });

    if (res.ok) {
      console.log('training data submitted successfully');
      SupervisedLearner.setSupervisedDriver.disabled = false;
    } else {
      console.error(`failed to submit training data: ${res.status}`);
    }
  }

  static init(): void {
    this.submitData.addEventListener('click', this.submitTrainingData);
    this.submitData.disabled = true;
    this.setSupervisedDriver.disabled = true;

    this.setSupervisedDriver.addEventListener('click', () => {
      Controller.mode = 'supervised';
    });

    this.setReadyBtn.addEventListener('click', () => {
      SupervisedLearner.readyToRecord = true;
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
        SupervisedLearner.submitData.disabled = false;
        console.log(SupervisedLearner.trainingData);
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
