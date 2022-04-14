import { controlstate } from '../../interfaces.js';
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

  static async getApiInput(carState: car): Promise<controlstate | void> {
    const res = await fetch(
      '/gamestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carState),
      });

    if (res.ok) {
      return await res.json() as controlstate;
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
