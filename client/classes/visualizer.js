export default class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
  }

  nextFrame(GS) {
    const intersects = GS.colRays.map(ray => ray.intersect);

    this._clearViewports();
    this._drawVectorArray(GS.map, 5, 'white');
    this._drawPointArray([{ posX: GS.posX, posY: GS.posY }], 5, 'red');
    this._drawPointArray(GS.bodyIntersects, 5, 'crimson');
    this._drawPointArray(intersects, 5, 'hotpink');
    this._drawVectorArray(GS.bodyRays, 5, 'aqua');
    this._drawVectorArray(GS.colRays, 5, 'lime');
  }

  _clearViewports() {
    const ctx = this.canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.height, this.canvas.width);
  }

  _drawCarBody(body, strokeWidth, strokeStyle) {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();

    for (const point of body) {
      ctx.lineTo(point.x2, point.y2);
    }

    ctx.closePath();
    ctx.stroke();
  }

  _drawPointArray(points, strokeWidth, strokeColor) {
    const ctx = this.canvas.getContext('2d');

    ctx.strokeWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.posX, point.posY, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  _drawVectorArray(vectors, lineWidth, strokeColor) {
    const ctx = this.canvas.getContext('2d');

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    for (const vector of vectors) {
      ctx.beginPath();
      ctx.moveTo(vector.x1, vector.y1);
      ctx.lineTo(vector.x2, vector.y2);
      ctx.stroke();
    }
  }
}
