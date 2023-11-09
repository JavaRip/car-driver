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

  static async getInput(sensorLengths: number[]): Promise<controlState> {
    if (Controller.mode === 'manual') {
      return await new Promise((resolve) => {
        resolve({
          turnLeft: Controller.turnLeft,
          turnRight: Controller.turnRight,
          accel: Controller.accel,
        });
      });
    } else if (Controller.mode === 'supervised') {
      const res = await fetch('get_move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          [...sensorLengths],
        ]),
      });

      if (!res.ok) {
        console.error(`failed to get move: ${res.status}`);
      }

      const controlArr: number[] = await res.json() as number[];
      console.log(controlArr);

      return await new Promise((resolve) => {
        resolve({
          turnLeft: Boolean(controlArr[0]),
          accel: Boolean(controlArr[1]),
          turnRight: Boolean(controlArr[2]),
        });
      });
    } else {
      throw new Error(`invalid mode: ${Controller.mode}`);
    }
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
