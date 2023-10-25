import { controlState } from './Controller.js';
import Point from './Point.js';
import Vector from './Vector.js';
import VectorLib from './VectorLib.js';

export interface vehicleBody {
  vertices: Point[],
  sides: Vector[],
}

export default class vehicle {
  position: Point;
  speed: number;
  direction: number;
  rotationSpeed: number;
  accelRate: number;
  deccelRate: number;
  maxSpeed: number;
  width: number;
  length: number;
  body: vehicleBody;
  sensors: Vector[];

  constructor(pos: Point, movVec: number, speed: number) {
    this.position = pos;
    this.speed = speed;
    this.direction = movVec;
    this.rotationSpeed = 0.1;
    this.accelRate = 0.3;
    this.deccelRate = 1;
    this.maxSpeed = 15;
    this.width = 30;
    this.length = 100;
    this.body = this.getCarBody();
    this.sensors = this.getSensors();
  }

  move(inputs: controlState): void {
    const tau = Math.PI * 2;
    let updatedDir: number;
    let updatedSpeed: number;

    if (inputs.turnLeft === true) {
      updatedDir = (this.direction - this.rotationSpeed) % tau;
    } else if (inputs.turnRight === true) {
      updatedDir = (this.direction + this.rotationSpeed) % tau;
    } else {
      updatedDir = this.direction;
    }

    if (inputs.accel === true) {
      if (this.speed + this.accelRate <= this.maxSpeed) {
        updatedSpeed = this.speed + this.accelRate;
      } else {
        updatedSpeed = this.maxSpeed;
      }
    } else {
      if (this.speed - this.deccelRate > 0) {
        updatedSpeed = this.speed - this.accelRate;
      } else {
        updatedSpeed = 0;
      }
    }

    this.position.x = Math.round(this.position.x + Math.cos(this.direction) * this.speed);
    this.position.y = Math.round(this.position.y + Math.sin(this.direction) * this.speed);
    this.speed = updatedSpeed;
    this.direction = updatedDir;

    this.body = this.getCarBody();
    this.sensors = this.getSensors();
  }

  getSensors(): Vector[] {
    return [
      VectorLib._getRelativeRay(this.body.vertices[0], 1000, this.direction, Math.PI * 1.75),
      VectorLib._getRelativeRay(this.body.vertices[1], 1000, this.direction, Math.PI * 0.25),
      VectorLib._getRelativeRay(this.body.vertices[0], 1000, this.direction, Math.PI * 2),
      VectorLib._getRelativeRay(this.body.vertices[1], 1000, this.direction, Math.PI * 2),
      VectorLib._getRelativeRay(this.body.vertices[0], 1000, this.direction, Math.PI * 1.5),
      VectorLib._getRelativeRay(this.body.vertices[1], 1000, this.direction, Math.PI * 0.5),
      VectorLib._getRelativeRay(this.body.vertices[2], 1000, this.direction, Math.PI * 0.5),
      VectorLib._getRelativeRay(this.body.vertices[3], 1000, this.direction, Math.PI * 1.5),
    ];
  }

  getCarBody(): vehicleBody {
    const tau = Math.PI * 2;

    const carHypot: number = Math.hypot(this.width, this.length);
    const angle: number = Math.acos(this.length / carHypot);

    // Rear Right Corner
    const RRC: Vector = VectorLib._getRelativeRay(
      this.position,
      this.width,
      this.direction,
      tau * 0.25,
    );

    // Rear Left Corner
    const RLC: Vector = VectorLib._getRelativeRay(
      this.position,
      this.width,
      this.direction,
      tau * 1.75,
    );

    // Front Right Corner
    const FRC: Vector = VectorLib._getRelativeRay(
      this.position,
      carHypot,
      this.direction,
      angle,
    );

    // Front Left Corner
    const FLC: Vector = VectorLib._getRelativeRay(
      this.position,
      carHypot,
      this.direction,
      tau - angle,
    );

    const carVertices: Point[] = [
      new Point(Math.round(FLC.end.x), Math.round(FLC.end.y)), // front left
      new Point(Math.round(FRC.end.x), Math.round(FRC.end.y)), // front right
      new Point(Math.round(RRC.end.x), Math.round(RRC.end.y)), // back right
      new Point(Math.round(RLC.end.x), Math.round(RLC.end.y)), // back left
    ];

    const carSides: Vector[] = [
      new Vector(new Point(RRC.end.x, RRC.end.y), new Point(FRC.end.x, FRC.end.y)), // right side
      new Vector(new Point(RRC.end.x, RRC.end.y), new Point(RLC.end.x, RLC.end.y)), // rear
      new Vector(new Point(FRC.end.x, FRC.end.y), new Point(FLC.end.x, FLC.end.y)), // front
      new Vector(new Point(RLC.end.x, RLC.end.y), new Point(FLC.end.x, FLC.end.y)), // left side
    ];

    return { vertices: carVertices, sides: carSides };
  }
}
