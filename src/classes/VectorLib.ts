import Point from './Point.js';
import Vector from './Vector.js';

export interface intersect {
  length: number,
  point: Point,
}

export default class VectorLib {
  static findRealIntersect(rays1: Vector[], rays2: Vector[]): intersect[] {
    const intersects = [];
    for (const ray1 of rays1) {
      // isect short for intersect
      let isect: intersect = { length: Infinity, point: { x: NaN, y: NaN } };
      for (const ray2 of rays2) {
        const newIsectPoint: Point = this._findTheoreticalIntersectionPoint(ray1, ray2);
        const newIsect = {
          length: Math.hypot(ray1.start.x - newIsectPoint.x, ray1.start.y - newIsectPoint.y),
          point: { x: newIsectPoint.x, y: newIsectPoint.y },
        };

        if (newIsect.length < isect.length) isect = newIsect;
      }

      if (
        isect.point.x >= ray1.start.x &&
        isect.point.x <= ray1.end.x &&
        isect.point.y >= ray1.start.y &&
        isect.point.y <= ray1.end.y
      ) {
        intersects.push(isect);
      } else if (
        isect.point.x <= ray1.start.x &&
        isect.point.x >= ray1.end.x &&
        isect.point.y <= ray1.start.y &&
        isect.point.y >= ray1.end.y
      ) {
        intersects.push(isect);
      } else if (
        isect.point.x <= ray1.start.x &&
        isect.point.x >= ray1.end.x &&
        isect.point.y >= ray1.start.y &&
        isect.point.y <= ray1.end.y
      ) {
        intersects.push(isect);
      } else if (
        isect.point.x >= ray1.start.x &&
        isect.point.x <= ray1.end.x &&
        isect.point.y <= ray1.start.y &&
        isect.point.y >= ray1.end.y
      ) {
        intersects.push(isect);
      }
    }

    return intersects;
  }

  static _findTheoreticalIntersectionPoint(ray1: Vector, ray2: Vector): Point {
    const denominator =
      (
        (ray2.start.x - ray2.end.x) * (ray1.start.y - ray1.end.y) -
        (ray2.start.y - ray2.end.y) * (ray1.start.x - ray1.end.x)
      );

    const t =
      (
        (ray1.end.x - ray1.start.x) * (ray2.start.y - ray1.start.y) -
        (ray1.end.y - ray1.start.y) * (ray2.start.x - ray1.start.x)
      ) /
      denominator;

    const u =
      (
        (ray2.end.x - ray2.start.x) * (ray2.start.y - ray1.start.y) -
        (ray2.end.y - ray2.start.y) * (ray2.start.x - ray1.start.x)
      ) / denominator;

    // if points do intersect calculate where
    if (t > 0 && t < 1 && u > 0) {
      const intersectX = Math.round(ray2.start.x + t * (ray2.end.x - ray2.start.x));
      const intersectY = Math.round(ray2.start.y + t * (ray2.end.y - ray2.start.y));
      return { x: intersectX, y: intersectY };
    } else {
      return { x: Infinity, y: Infinity };
    }
  }

  static _getRelativeRay(
    pos: Point,
    rayLength: number,
    movVec: number,
    angleOffset: number,
  ): Vector {
    // without offset, cast the ray directly down the direction the car is facing
    // use offset to cast ray relative to this position. Offset is in radians

    const rayOffsetX = Math.cos(movVec + angleOffset);
    const rayOffsetY = Math.sin(movVec + angleOffset);
    const rayExtendedX = rayOffsetX * rayLength;
    const rayExtendedY = rayOffsetY * rayLength;
    const rayEndpoint: Point = { x: pos.x + rayExtendedX, y: pos.y + rayExtendedY };

    return { start: pos, end: rayEndpoint };
  }
}
