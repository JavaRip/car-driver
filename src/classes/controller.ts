import { controlstate, intersect } from '../interfaces.js';
import car from './vehicle.js';

export default class Controller {
  turnLeft: boolean;
  turnRight: boolean;
  accel: boolean;

  constructor() {
    this.turnLeft = false;
    this.turnRight = false;
    this.accel = false;
  }

  static getInput(controller: Controller): controlstate {
    return {
      turnLeft: controller.turnLeft,
      turnRight: controller.turnRight,
      accel: controller.accel,
    };
  }

  static async getApiInput(carState: intersect[]): Promise<controlstate> {
    const res = await fetch(
      '/getMove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carState),
      });

    const controlArr: number[] = await res.json() as number[];
    console.log(controlArr)

    const inputs: controlstate = {
      turnLeft: Boolean(Number(controlArr[0])),
      turnRight: Boolean(Number(controlArr[1])),
      accel: Boolean(Number(controlArr[2])),
    };

    if (res.ok) {
      return inputs;
    } else {
      throw new Error();
    }
  }

  static parseUserInput(event: KeyboardEvent, controller: Controller): void {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        event.type === 'keydown' ? controller.turnLeft = true : controller.turnLeft = false;
        break;
      case 'd':
      case 'ArrowRight':
        event.type === 'keydown' ? controller.turnRight = true : controller.turnRight = false;
        break;
      case 'w':
      case 'ArrowUp':
        event.type === 'keydown' ? controller.accel = true : controller.accel = false;
        break;
    }
  }
}
