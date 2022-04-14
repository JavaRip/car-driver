import { point } from '../../interfaces.js';

export default class vehicle {
  position: point;
  speed: number;
  direction: number;

  constructor(pos: point, movVec: number, speed: number) {
    this.position = pos;
    this.speed = speed;
    this.direction = movVec;
  }
}
