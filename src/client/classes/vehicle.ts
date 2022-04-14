import { vector, point, vehiclebody } from '../../interfaces.js';

export default class vehicle {
  position: point;
  body: vehiclebody;
  speed: number;
  direction: number;

  constructor(pos: point, movVec: number) {
    this.position = pos;
    this.body = this._getCarBody(pos, movVec);
    this.speed = 0;
    this.direction = movVec;
  }

  static updateCarBody(car: vehicle): void {
    car.body = car._getCarBody(car.position, car.direction);
  }

  _getCarBody(pos: point, movVec: number): vehiclebody {
    const tau = Math.PI * 2;

    const carWidth = 30;
    const carLength = 100;
    const carHypot: number = Math.hypot(carWidth, carLength);
    const angle: number = Math.acos(carLength / carHypot);

    const RRC: vector = this._getRelativeRay(pos, carWidth, movVec, tau * 0.25);
    const RLC: vector = this._getRelativeRay(pos, carWidth, movVec, tau * 1.75);
    const FRC: vector = this._getRelativeRay(pos, carHypot, movVec, angle);
    const FLC: vector = this._getRelativeRay(pos, carHypot, movVec, tau - angle);

    const carVertices: point[] = [
      { x: FLC.end.x, y: FLC.end.y },
      { x: FRC.end.x, y: FRC.end.y },
      { x: RLC.end.x, y: RLC.end.y },
      { x: RRC.end.x, y: RRC.end.y },
    ];

    const carSides: vector[] = [
      { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: FRC.end.x, y: FRC.end.y } },
      { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: RLC.end.x, y: RLC.end.y } },
      { start: { x: FRC.end.x, y: FRC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } },
      { start: { x: RLC.end.x, y: RLC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } },
    ];

    return { vertices: carVertices, sides: carSides };
  }

  _getRelativeRay(
    pos: point,
    rayLength: number,
    movVec: number,
    angleOffset: number,
  ): vector {
    // without offset, cast the ray directly down the direction the car is facing
    // use offset to cast ray relative to this position. Offset is in radians

    const rayOffsetX = Math.cos(movVec + angleOffset);
    const rayOffsetY = Math.sin(movVec + angleOffset);
    const rayExtendedX = rayOffsetX * rayLength;
    const rayExtendedY = rayOffsetY * rayLength;
    const rayEndpoint: point = { x: pos.x + rayExtendedX, y: pos.y + rayExtendedY };

    return { start: pos, end: rayEndpoint };
  }
}
