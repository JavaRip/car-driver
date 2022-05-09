import { point, vector } from '../../interfaces.js';

export default class Visualizer {
  static pauseMenu: null | HTMLDivElement;
  static canvas: null | HTMLCanvasElement;

  static init(pauseMenu: HTMLDivElement, canvas: HTMLCanvasElement): void {
    this.pauseMenu = pauseMenu;
    this.canvas = canvas;

    document.addEventListener('pause', () => {
      Visualizer.togglePauseMenu();
    });
  }

  static clearViewports(): void {
    if (this.canvas === null) throw new Error();

    const ctx = this.canvas.getContext('2d');

    if (!ctx) return;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.height, this.canvas.width);
  }

  static drawPointArray(points: point[], width: number, color: string): void {
    if (this.canvas === null) throw new Error();

    const ctx = this.canvas.getContext('2d');

    if (!ctx) return;

    ctx.lineWidth = width;
    ctx.strokeStyle = color;

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  static drawVectorArray(vectors: vector[], width: number, color: string, texture: string): void {
    if (this.canvas === null) throw new Error();

    const ctx = this.canvas.getContext('2d');

    if (!ctx) return;

    if (texture === 'dashed') {
      ctx.setLineDash([5, 15]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    for (const v of vectors) {
      ctx.beginPath();
      ctx.moveTo(v.start.x, v.start.y);
      ctx.lineTo(v.end.x, v.end.y);
      ctx.stroke();
    }
  }

  static togglePauseMenu(): void {
    if (this.pauseMenu === null) throw new Error();

    if (this.pauseMenu.style.display === 'none') {
      this.pauseMenu.style.display = '';
    } else {
      this.pauseMenu.style.display = 'none';
    }
  }
}
