export interface controlState {
  turnLeft: boolean,
  turnRight: boolean,
  accel: boolean,
}

export default class Controller {
  static turnLeft = false;
  static turnRight = false;
  static accel = false;
  static mode = 'manual';

  static init(): void {
    document.addEventListener('keydown', (event) => {
      Controller.parseUserInput(event);
    });

    document.addEventListener('keyup', (event) => {
      Controller.parseUserInput(event);
    });
  }

  static getInput(): controlState {
    return {
      turnLeft: Controller.turnLeft,
      turnRight: Controller.turnRight,
      accel: Controller.accel,
    };
  }

  static parseUserInput(event: KeyboardEvent): void {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        event.type === 'keydown' ? Controller.turnLeft = true : Controller.turnLeft = false;
        break;
      case 'd':
      case 'ArrowRight':
        event.type === 'keydown' ? Controller.turnRight = true : Controller.turnRight = false;
        break;
      case 'w':
      case 'ArrowUp':
        event.type === 'keydown' ? Controller.accel = true : Controller.accel = false;
        break;
    }
  }
}

Controller.init();
