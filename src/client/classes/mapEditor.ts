import { point, vector } from '../../interfaces.js';

export default class mapEditor {
  wallStart: point | null;
  wallEnd: point | null;
  lockX: boolean;
  lockY: boolean;
  map: vector[];

  constructor(map: vector[]) {
    this.map = map;
    this.wallStart = null;
    this.wallEnd = null;
    this.lockX = false;
    this.lockY = false;
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

  createWall(wall: vector): void {
    this.map.push(wall);
  }

  static deleteWall(me: mapEditor): void {
    if (me.map.length > 0) me.map.pop();
    else console.error('no walls to delete');
  }
}
