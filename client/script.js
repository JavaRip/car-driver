class Controller {
  constructor() {
    this.turnLeft = false;
    this.turnRight = false;
    this.accel = false;
    this.colRays = []; // rays cast to detect collision
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

  getMrRoboto(colRays) {
    let turnLeft = false;
    let turnRight = false;
    const accel = true;

    if (colRays === undefined) {
      return { turnLeft, turnRight, accel };
    }

    // Left > Right
    if (colRays[0].intersect.distance > colRays[1].intersect.distance) {
      turnLeft = true;
    }

    // Left < Right
    if (colRays[0].intersect.distance < colRays[1].intersect.distance) {
      turnRight = true;
    }

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
  constructor(posX, posY, map, movVec, speed, rotSpeed) {
    this.posX = posX;
    this.posY = posY;
    this.body = [];
    this.bodyRays = [];
    this.bodyIntersects = [];
    this.movVec = movVec;
    this.movRay = null;
    this.speed = speed;
    this.rotSpeed = rotSpeed;
    this.map = map;
  }
}

class Visualizer {
  nextFrame(GS) {
    this._clearViewports();
    this._drawVectorArray(GS.map, 5, 'white');
    this._drawPointArray([{ posX: GS.posX, posY: GS.posY }], 5, 'red');
    const intersects = GS.colRays.map(ray => ray.intersect);

    this._drawPointArray(GS.bodyIntersects, 5, 'crimson');
    this._drawPointArray(intersects, 5, 'hotpink');
    this._drawVectorArray(GS.bodyRays, 5, 'aqua');
    this._drawVectorArray(GS.colRays, 5, 'lime');
  }

  _clearViewports() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.height, canvas.width);
  }

  _drawCarBody(body, strokeWidth, strokeStyle) {
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
    ctx.strokeWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.posX, point.posY, 12, 0, 2 * Math.PI);
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
  moveCar(posX, posY, movVec, speed, inputs, map) {
    const tau = Math.PI * 2;
    const rotationSpeed = 0.1;
    const accelRate = 0.3;
    const deccelRate = 1;
    const maxSpeed = 15;

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
    const carWidth = 30;
    const carLength = 100;
    const carHypot = Math.hypot(carWidth, carLength);
    const angle = Math.acos(carLength / carHypot);

    const RRRC = this.getRelativeRay(posX, posY, carWidth, movVec, tau * 0.25);
    const RRLC = this.getRelativeRay(posX, posY, carWidth, movVec, tau * 1.75);
    const FRRC = this.getRelativeRay(posX, posY, carHypot, movVec, angle);
    const FRLC = this.getRelativeRay(posX, posY, carHypot, movVec, tau - angle);

    carBody.push(RRRC);
    carBody.push(RRLC);
    carBody.push(FRLC);
    carBody.push(FRRC);

    const bodyRays = [];
    bodyRays.push({ x1: RRRC.x2, y1: RRRC.y2, x2: FRRC.x2, y2: FRRC.y2 });
    bodyRays.push({ x1: RRRC.x2, y1: RRRC.y2, x2: RRLC.x2, y2: RRLC.y2 });
    bodyRays.push({ x1: FRRC.x2, y1: FRRC.y2, x2: FRLC.x2, y2: FRLC.y2 });
    bodyRays.push({ x1: RRLC.x2, y1: RRLC.y2, x2: FRLC.x2, y2: FRLC.y2 });

    const bodyIntersects = this._getBodyCollisions(map, bodyRays);

    const colRays = [];

    // winner winner
    colRays.push(this.getRelativeRay(FRLC.x2, FRLC.y2, 200, movVec, tau * 0.850));
    colRays.push(this.getRelativeRay(FRRC.x2, FRRC.y2, 200, movVec, tau * 0.150));

    // loser loser
    // colRays.push(this.getRelativeRay(FRLC.x2, FRLC.y2, 200, movVec, tau * 0.875));
    // colRays.push(this.getRelativeRay(FRRC.x2, FRRC.y2, 200, movVec, tau * 0.125));

    this._detectIntersects(posX, posY, colRays, map);

    return { posX, posY, carBody, colRays, movVec, speed, bodyRays, bodyIntersects };
  }

  _getBodyCollisions(map, rays) {
    const intersects = [];
    for (const ray of rays) {
      let intersect = { distance: Infinity, posX: null, posY: null };
      for (const wall of map) {
        const newIntersect = this._findIntersect(ray, wall);
        newIntersect.distance =
          Math.hypot(ray.x1 - newIntersect.posX, ray.y1 - newIntersect.posY);

        if (newIntersect.distance < intersect.distance) {
          intersect = newIntersect;
        }
      }

      if (intersect.posX >= ray.x1 && intersect.posX <= ray.x2 && intersect.posY >= ray.y1 && intersect.posY <= ray.y2) {
        intersects.push(intersect);
      }
      if (intersect.posX <= ray.x1 && intersect.posX >= ray.x2 && intersect.posY <= ray.y1 && intersect.posY >= ray.y2) {
        intersects.push(intersect);
      }
      if (intersect.posX <= ray.x1 && intersect.posX >= ray.x2 && intersect.posY >= ray.y1 && intersect.posY <= ray.y2) {
        intersects.push(intersect);
      }
      if (intersect.posX >= ray.x1 && intersect.posX <= ray.x2 && intersect.posY <= ray.y1 && intersect.posY >= ray.y2) {
        intersects.push(intersect);
      }
    }
    return intersects;
  }

  _detectIntersects(posX, posY, castRays, map) {
    for (const ray of castRays) {
      // placeholder intersect distance is infinite, any intersect is shorter than none
      ray.intersect = { distance: Infinity, posX: null, posY: null };
      for (const wall of map) {
        const newIntersect = this._findIntersect(ray, wall);
        newIntersect.distance =
          Math.hypot(posX - newIntersect.posX, posY - newIntersect.posY);
        if (newIntersect.distance < ray.intersect.distance) {
          ray.intersect = newIntersect;
        }
      }
    }
  }

  _findIntersect(ray, wall) {
    const denominator =
      ((wall.x1 - wall.x2) * (ray.y1 - ray.y2) - (wall.y1 - wall.y2) * (ray.x1 - ray.x2));
    const t =
      ((ray.x2 - ray.x1) * (wall.y1 - ray.y1) - (ray.y2 - ray.y1) * (wall.x1 - ray.x1)) /
      denominator;
    const u =
      ((wall.x2 - wall.x1) * (wall.y1 - ray.y1) - (wall.y2 - wall.y1) * (wall.x1 - ray.x1)) /
      denominator;

    // if points do intersect calculate where
    if (t > 0 && t < 1 && u > 0) {
      const intersectOnWallX = wall.x1 + t * (wall.x2 - wall.x1);
      const intersectOnWallY = wall.y1 + t * (wall.y2 - wall.y1);
      return { posX: intersectOnWallX, posY: intersectOnWallY };
    } else {
      return { posX: Infinity, posY: Infinity };
    }
  }

  getRelativeRay(posX, posY, rayLength, movVec, angleOffset) {
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
const ctx = canvas.getContext('2d'); const map = [
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

let GS = new GameState(250, 150, map, 0, 0);

const View = new Visualizer();
const Engine = new GameEngine();
const BrowserController = new Controller();

// eslint-disable-next-line promise/param-names
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  for (let i = 0; i < Infinity; i += 1) {
    if (GS.bodyIntersects.length > 0) GS = new GameState(250, 150, map, 0, 0);
    await delay(32);

    // const inputs = BrowserController.getInput();
    const inputs = BrowserController.getMrRoboto(GS.colRays);


    const data = {
      posX: GS.posX,
      posY: GS.posY,
      map: GS.map,
      movVec: GS.movVec,
      speed: GS.speed,
      rotSpeed: GS.rotSpeed,
      turnLeft: inputs.turnLeft,
      turnRight: inputs.turnRight,
      accel: inputs.accel,
    };

    try {
      fetch('gs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.log(e);
    }

    const newGs = Engine.moveCar(GS.posX, GS.posY, GS.movVec, GS.speed, inputs, GS.map);
    GS.posX = newGs.posX;
    GS.posY = newGs.posY;
    GS.carBody = newGs.carBody;
    GS.movVec = newGs.movVec;
    GS.speed = newGs.speed;
    GS.bodyRays = newGs.bodyRays;
    GS.movRay = Engine.getRelativeRay(GS.posX, GS.posY, 75, GS.movVec, 0);
    GS.colRays = newGs.colRays;
    GS.bodyIntersects = newGs.bodyIntersects;

    View.nextFrame(GS);
  }
}

main();
