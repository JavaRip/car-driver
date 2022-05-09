import { controlstate, intersect } from '../../interfaces.js';

export default class Controller {
  static turnLeft: boolean;
  static turnRight: boolean;
  static accel: boolean;
  static mode: string;
  static targetFrameDuration: number; // milliseconds

  static {
    this.turnLeft = false;
    this.turnRight = false;
    this.accel = false;
    this.mode = 'map-editor';
    this.targetFrameDuration = 32;

    document.addEventListener('keydown', (event) => {
      this.parseKeyboardInput(event);
    });

    document.addEventListener('keyup', (event) => {
      this.parseKeyboardInput(event);
    });

    document.addEventListener('mousedown', (event) => {
      this.parseMouseInput(event);
    });

    document.addEventListener('mouseup', (event) => {
      this.parseMouseInput(event);
    });

    document.addEventListener('mousemove', (event) => {
      this.parseMouseInput(event);
    });

    document.addEventListener('change-mode', (event) => {
      this.mode = (event as CustomEvent).detail;
    });
  }

  static getInput(): controlstate {
    return {
      turnLeft: this.turnLeft,
      turnRight: this.turnRight,
      accel: this.accel,
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

  static parseKeyboardInput(event: KeyboardEvent): void {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        event.type === 'keydown' ? this.turnLeft = true : this.turnLeft = false;
        break;
      case 'd':
      case 'ArrowRight':
        event.type === 'keydown' ? this.turnRight = true : this.turnRight = false;
        break;
      case 'w':
      case 'ArrowUp':
        event.type === 'keydown' ? this.accel = true : this.accel = false;
        break;
      case 'p':
      case 'Escape':
        if (event.type === 'keydown') document.dispatchEvent(new Event('pause'));
        break;
      case 'Shift':
        if (event.type === 'keydown') document.dispatchEvent(new Event('lock-x'));
        if (event.type === 'keyup') document.dispatchEvent(new Event('unlock-x'));
        break;
      case 'Control':
        if (event.type === 'keydown') document.dispatchEvent(new Event('lock-y'));
        if (event.type === 'keyup') document.dispatchEvent(new Event('unlock-y'));
        break;
      case 'u':
        if (event.type === 'keydown') document.dispatchEvent(new Event('delete-wall'));
        break;
    }
  }

  static parseMouseInput(event: MouseEvent): void {
    const target = event.target as Element;
    if (target.id == null) return;
    switch (target.id) {
      case 'game-view':
        if (event.type === 'mousedown' && this.mode === 'map-editor') {
          const createWallEvent = new CustomEvent(
            'create-wall-point',
            { detail: event },
          );

          document.dispatchEvent(createWallEvent);
        }

        if (event.type === 'mousemove' && this.mode === 'map-editor') {
          const previewWallEvent = new CustomEvent(
            'preview-wall-point',
            { detail: event },
          );

          document.dispatchEvent(previewWallEvent);
        }
        break;
      case 'manual-mode-btn':
        if (event.type === 'mousedown') {
          const changeModeEvent = new CustomEvent(
            'change-mode',
            { detail: 'manual' },
          );

          document.dispatchEvent(changeModeEvent);
        }
        break;
      case 'training-data-mode-btn':
        if (event.type === 'mousedown') {
          const changeModeEvent = new CustomEvent(
            'change-mode',
            { detail: 'training' },
          );

          document.dispatchEvent(changeModeEvent);
        }
        break;
      case 'autopilot-mode-btn':
        if (event.type === 'mousedown') {
          const changeModeEvent = new CustomEvent(
            'change-mode',
            { detail: 'autopilot' },
          );

          document.dispatchEvent(changeModeEvent);
        }
        break;
      case 'map-editor-btn':
        if (event.type === 'mousedown') {
          const changeModeEvent = new CustomEvent(
            'change-mode',
            { detail: 'map-editor' },
          );

          document.dispatchEvent(changeModeEvent);
        }
        break;
    }
  }
}
