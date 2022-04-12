export default class GameEngine {
  moveCar(posX, posY, movVec, speed, map, inputs) {
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

    colRays.push(this.getRelativeRay(FRLC.x2, FRLC.y2, 200, movVec, tau * 0.875));
    colRays.push(this.getRelativeRay(FRRC.x2, FRRC.y2, 200, movVec, tau * 0.125));

    for (const ray of colRays) {
      ray.intersect = this._detectIntersect(ray, map);
    }

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

  _detectIntersect(ray, map) {
    // placeholder intersect distance is infinite, any intersect is shorter than none
    let intersect = { distance: Infinity, posX: null, posY: null };
    for (const wall of map) {
      const newIntersect = this._findIntersect(ray, wall);
      newIntersect.distance =
        Math.hypot(ray.x1 - newIntersect.posX, ray.y1 - newIntersect.posY);
      if (newIntersect.distance < intersect.distance) intersect = newIntersect;
    }
    return intersect;
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
