import { point, vector } from '../../interfaces.js';
import map from '../map.js';

export default class mapEditor {
  static wallStart: point | null;
  static wallEnd: point | null;
  static lockX: boolean;
  static lockY: boolean;
  static map: vector[];
  static canvas: null | HTMLCanvasElement;

  static init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    document.addEventListener('create-wall-point', (event) => {
      if (this.canvas === null) throw new Error();
      const mouseEvent = (event as CustomEvent).detail;

      if (this.wallStart === null) {
        this.wallStart = this.getMousePosition(this.canvas, mouseEvent);
      } else if (this.wallStart !== null && this.wallEnd !== null) {
        this.createWall({
          start: this.wallStart, end: this.wallEnd,
        });

        this.wallStart = null;
        this.wallEnd = null;
      }
    });

    document.addEventListener('preview-wall-point', (event) => {
      if (this.canvas === null) throw new Error();
      if (this.wallStart === null) return;

      const mouseEvent = (event as CustomEvent).detail;
      const hoverPos = this.getMousePosition(canvas, mouseEvent);
      this.wallEnd = hoverPos;
    });
  }

  static {
    this.map = map;
    this.wallStart = null;
    this.wallEnd = null;
    this.lockX = false;
    this.lockY = false;

    document.addEventListener('lock-x', () => { this.lockX = true; });
    document.addEventListener('unlock-x', () => { this.lockX = false; });
    document.addEventListener('lock-y', () => { this.lockY = true; });
    document.addEventListener('unlock-y', () => { this.lockY = false; });
    document.addEventListener('delete-wall', () => this.deleteWall());
  }

  static getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent): point {
    const canvasViewWidth = canvas.getBoundingClientRect().width;
    const canvasViewHeight = canvas.getBoundingClientRect().height;
    const canvasModelWidth = Number(canvas.getAttribute('width'));
    const canvasModelHeight = Number(canvas.getAttribute('height'));

    const rect = canvas.getBoundingClientRect();
    const viewX = event.clientX - rect.left;
    const viewY = event.clientY - rect.top;

    const modelX = (canvasModelWidth / canvasViewWidth) * viewX;
    const modelY = (canvasModelHeight / canvasViewHeight) * viewY;

    return { x: modelX, y: modelY };
  }

  static createWall(wall: vector): void {
    this.map.push(wall);
  }

  static deleteWall(): void {
    if (this.map.length > 0) this.map.pop();
    else console.error('no walls to delete');
  }
}
