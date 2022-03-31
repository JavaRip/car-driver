'use strict';

const delay = ms => new Promise(res => setTimeout(res, ms));

var directionPressed = 0;

document.addEventListener('keydown', function(event) {
  if (event.keyCode == 37) {
    directionPressed = -1;

  }
  if (event.keyCode == 39) {
    directionPressed = 1;
  }
}, true);

document.addEventListener('keyup', function(event) {
  if (event.keyCode == 37) {
    directionPressed = 0;

  }
  if (event.keyCode == 39) {
    directionPressed = 0;
  }
}, true);

class GameState {
  constructor(posX, posY, map, movVec, speed) {
    this.posX = posX;
    this.posY = posY;
    this.movVec = movVec;
    this.movRay = null;
    this.speed = speed;
    this.map = map;
  }
}

class Visualizer {
  drawMap(level) {
    this._drawVectorArray(level, 5, 'white');
  }

  drawCar(posX, posY, movVec, movRay) {
    this._drawCarBody(posX, posY, movVec, 'red');
    this._drawVectorArray([movRay], 5, 'lime');
  }

  clearViewports() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.height, canvas.width);
  }

  _drawCarBody(posX, posY, movVec, strokeColor) {
    const offset = 0.4;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(posX, posY, 10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'gold';

    ctx.beginPath();
    const FRCX = posX + (Math.cos(movVec + offset) * 50);
    const FRCY = posY + (Math.sin(movVec + offset) * 50);
    ctx.arc(FRCX, FRCY, 3, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'aqua';

    ctx.beginPath();
    const FLCX = posX + (Math.cos(movVec + -offset) * 50);
    const FLCY = posY + (Math.sin(movVec + -offset) * 50);
    ctx.arc(FLCX, FLCY, 3, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'crimson';

    ctx.beginPath();
    const RLCX = posX - (Math.cos(movVec + offset) * 50);
    const RLCY = posY - (Math.sin(movVec + offset) * 50);
    ctx.arc(RLCX, RLCY, 3, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'indigo';

    ctx.beginPath();
    const RRCX = posX - (Math.cos(movVec + -offset) * 50);
    const RRCY = posY - (Math.sin(movVec + -offset) * 50);
    ctx.arc(RRCX, RRCY, 3, 0, 2 * Math.PI);
    ctx.stroke();
  }

  _drawVectorArray(vectors, lineWidth, strokeColor) {
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

class GameEngine {
  moveCar(posX, posY, movVec, speed, turn, accel) {
    const tau = Math.PI * 2;
    const rotationSpeed = 5;

    // if car is accelerating increase speed
    speed += accel;

    // move in direction of travel
    posX += speed * Math.cos(movVec);
    posY += speed * Math.sin(movVec);

    // rotate moveVec
    movVec = (movVec + rotationSpeed) % tau;

    return { posX, posY, movVec, speed };
  }

  getRayRelativeToPosition(posX, posY, movVec, angleOffset) {
    // without offset, cast the ray directly down the direction the player is facing
    // use offset to cast ray relative to this position. Offset is in radians
    const rayLength = 75;
    const rayOffsetX = Math.cos(movVec + angleOffset);
    const rayOffsetY = Math.sin(movVec + angleOffset);
    const rayExtendedX = rayOffsetX * rayLength;
    const rayExtendedY = rayOffsetY * rayLength;
    const rayEndpointX = posX + rayExtendedX;
    const rayEndpointY = posY + rayExtendedY;
    return { x1: posX, y1: posY, x2: rayEndpointX, y2: rayEndpointY };
  }
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const map = [{ x1: 60, y1: 50, x2: 60, y2: 90 }];
const GS = new GameState(canvas.height / 2, canvas.width / 2, map, 1, 10);
const View = new Visualizer();
const Engine = new GameEngine();

async function main() {
  for (let i = 0; i < 1000; i += directionPressed) {
    await delay(100);
    GS.movVec = ((i * 2 % 360) * Math.PI) / (45);
    View.clearViewports();
    View.drawMap(GS.map, GS.posX, GS.posY, [], GS.movVec);
    GS.movRay = Engine.getRayRelativeToPosition(GS.posX, GS.posY, GS.movVec, 0);
    View.drawCar(GS.posX, GS.posY, GS.movVec, GS.movRay);
  }
}

main();
