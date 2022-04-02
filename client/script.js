
const delay = ms => new Promise(res => setTimeout(res, ms));

class Controller {
  constructor() {
    this.turnLeft = false;
    this.turnRight = false;
    this.accel = false;
    this.parseInputBound = this._parseInput.bind(this);
    document.addEventListener('keydown', this.parseInputBound);
    document.addEventListener('keyup', this.parseInputBound);
  }

  getInput() {
    const turnLeft = this.turnLeft;
    const turnRight = this.turnRight;
    const accel = this.accel;
    return { turnLeft, turnRight, accel };
  }

  _parseInput(event) {
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
    }
  }
}

class GameState {
  constructor(posX, posY, map, movVec, speed) {
    this.posX = posX;
    this.posY = posY;
    this.body = [];
    this.movVec = movVec;
    this.movRay = null;
    this.speed = speed;
    this.map = map;
  }
}

class Visualizer {
  nextFrame(GS) {
    this._clearViewports();
    this._drawVectorArray(GS.map, 5, 'white');
    this._drawCarCenter(GS.posX, GS.posY, 5, 'red');
    this._drawCarBody(GS.carBody, 8, 'aqua');
    this._drawVectorArray([GS.movRay], 5, 'lime');
  }

  _clearViewports() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.height, canvas.width);
  }

  _drawCarCenter(posX, posY, strokeWidth, strokeColor) {
    ctx.strokeWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(posX, posY, 12, 0, 2 * Math.PI);
    ctx.stroke();
  }

  _drawCarBody(body, strokeWidth, strokeStyle) {
    ctx.strokeWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    console.log(body)

    // draw a box by connecting all vector endpoints
    for (let i=0; i<4; i++) {
      ctx.beginPath();
      ctx.moveTo(body[i].x2, body[i].y2);
      if (i===3) {ctx.lineTo(body[0].x2, body[0].y2);}
      else {ctx.lineTo(body[i+1].x2, body[i+1].y2);}
      ctx.stroke();
    }

    this._drawCarWheels(body, ctx.strokeWidth)
  }

  _drawCarWheels(wheels, strokeWidth) {
    // skittles wheels
    const colours = ['yellow', 'red', 'green', 'blue']
    ctx.strokeWidth = strokeWidth;
    for (let i=0; i<4; i++) {
      ctx.strokeStyle = colours[i];
      ctx.beginPath();
      ctx.arc(wheels[i].x2, wheels[i].y2, 6, 0, 2 * Math.PI);
      ctx.stroke();
    }
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
  moveCar(posX, posY, movVec, speed, inputs) {
    const tau = Math.PI * 2;
    const rotationSpeed = 0.1;
    const accelRate = 0.3;
    const deccelRate = 1;
    const maxSpeed = 10;

    if (inputs.turnLeft === true) {
      movVec = (movVec - rotationSpeed) % tau;
    }

    if (inputs.turnRight === true) {
      movVec = (movVec + rotationSpeed) % tau;
    }

    if (inputs.accel === true) {
      if (speed + accelRate <= maxSpeed) speed += accelRate;
      else speed = maxSpeed;

      posX += Math.cos(movVec) * speed;
      posY += Math.sin(movVec) * speed;
    } else {
      if (speed - deccelRate > 0) speed -= accelRate;
      else speed = 0;

      posX += Math.cos(movVec) * speed;
      posY += Math.sin(movVec) * speed;
    }

    const carBody = [];
    const carWidth = 25;
    const carLengthHyp = Math.sqrt((carWidth*carWidth)+(75*75)); // car length hypotenuse

    const RRRC = this.getRayRelativeToPosition(posX, posY, carWidth, movVec, Math.PI * 0.5);
    const RRLC = this.getRayRelativeToPosition(posX, posY, carWidth, movVec, Math.PI * 1.5);
    const FRRC = this.getRayRelativeToPosition(posX, posY, carLengthHyp, movVec, Math.PI * 0.1);
    const FRLC = this.getRayRelativeToPosition(posX, posY, carLengthHyp, movVec, Math.PI * 1.9);

    carBody.push(FRRC);
    carBody.push(FRLC);
    carBody.push(RRLC);
    carBody.push(RRRC);

    return { posX, posY, carBody, movVec, speed };
  }

  getRayRelativeToPosition(posX, posY, rayLength, movVec, angleOffset) {
    // without offset, cast the ray directly down the direction the player is facing
    // use offset to cast ray relative to this position. Offset is in radians
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
const map = [
  // outer ring
  { x1: 50, y1: 750, x2: 50, y2: 250 },
  { x1: 50, y1: 250, x2: 75, y2: 175 },
  { x1: 75, y1: 175, x2: 175, y2: 75 },
  { x1: 250, y1: 50, x2: 175, y2: 75 },

  { x1: 250, y1: 50, x2: 750, y2: 50 },
  { x1: 750, y1: 50, x2: 825, y2: 75 },
  { x1: 825, y1: 75, x2: 925, y2: 175 },
  { x1: 925, y1: 175, x2: 950, y2: 250 },

  { x1: 950, y1: 250, x2: 950, y2: 750 },
  { x1: 950, y1: 750, x2: 925, y2: 825 },
  { x1: 925, y1: 825, x2: 825, y2: 925 },
  { x1: 825, y1: 925, x2: 750, y2: 950 },

  { x1: 750, y1: 950, x2: 250, y2: 950 },
  { x1: 250, y1: 950, x2: 175, y2: 925 },
  { x1: 175, y1: 925, x2: 75, y2: 825 },
  { x1: 75, y1: 825, x2: 50, y2: 750 },

  // inner ring
  { x1: 250, y1: 350, x2: 250, y2: 650 },
  { x1: 250, y1: 650, x2: 350, y2: 750 },
  { x1: 350, y1: 750, x2: 650, y2: 750 },
  { x1: 650, y1: 750, x2: 750, y2: 650 },
  { x1: 750, y1: 650, x2: 750, y2: 350 },
  { x1: 750, y1: 350, x2: 650, y2: 250 },
  { x1: 650, y1: 250, x2: 350, y2: 250 },
  { x1: 350, y1: 250, x2: 250, y2: 350 },
];

const GS = new GameState(canvas.height / 2, canvas.width / 2, map, (Math.PI * 0), 10);
const View = new Visualizer();
const Engine = new GameEngine();
const BrowserController = new Controller();

async function main() {
  for (let i = 0; i < Infinity; i += 1) {
    await delay(16);
    const inputs = BrowserController.getInput();

    const newGs = Engine.moveCar(GS.posX, GS.posY, GS.movVec, GS.speed, inputs);
    GS.posX = newGs.posX;
    GS.posY = newGs.posY;
    GS.carBody = newGs.carBody;
    GS.movVec = newGs.movVec;
    GS.speed = newGs.speed;
    GS.movRay = Engine.getRayRelativeToPosition(GS.posX, GS.posY, 95, GS.movVec, 0);

    View.nextFrame(GS);
  }
}

main();
