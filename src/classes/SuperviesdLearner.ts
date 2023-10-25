export default class SupervisedLearner {
  static recording = false;
  static trainingData = [];

  static init(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'w') {
        console.log('recording');
        SupervisedLearner.recording = true;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key === 'w') {
        SupervisedLearner.recording = false;
        console.log('saving recording');
      }
    });
  }
}

SupervisedLearner.init();
