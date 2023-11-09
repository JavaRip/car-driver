import Point from './Point.js';
import Vector from './Vector.js';
import VectorLib from './VectorLib.js';
export default class Vehicle {
    position;
    speed;
    direction;
    rotationSpeed;
    accelRate;
    deccelRate;
    maxSpeed;
    width;
    length;
    body;
    sensors;
    constructor(pos, movVec, speed) {
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
    move(inputs) {
        const tau = Math.PI * 2;
        let updatedDir;
        let updatedSpeed;
        if (inputs.turnLeft === true) {
            updatedDir = (this.direction - this.rotationSpeed) % tau;
        }
        else if (inputs.turnRight === true) {
            updatedDir = (this.direction + this.rotationSpeed) % tau;
        }
        else {
            updatedDir = this.direction;
        }
        if (inputs.accel === true) {
            if (this.speed + this.accelRate <= this.maxSpeed) {
                updatedSpeed = this.speed + this.accelRate;
            }
            else {
                updatedSpeed = this.maxSpeed;
            }
        }
        else {
            if (this.speed - this.deccelRate > 0) {
                updatedSpeed = this.speed - this.accelRate;
            }
            else {
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
    getSensors() {
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
    getCarBody() {
        const tau = Math.PI * 2;
        const carHypot = Math.hypot(this.width, this.length);
        const angle = Math.acos(this.length / carHypot);
        // Rear Right Corner
        const RRC = VectorLib._getRelativeRay(this.position, this.width, this.direction, tau * 0.25);
        // Rear Left Corner
        const RLC = VectorLib._getRelativeRay(this.position, this.width, this.direction, tau * 1.75);
        // Front Right Corner
        const FRC = VectorLib._getRelativeRay(this.position, carHypot, this.direction, angle);
        // Front Left Corner
        const FLC = VectorLib._getRelativeRay(this.position, carHypot, this.direction, tau - angle);
        const carVertices = [
            new Point(Math.round(FLC.end.x), Math.round(FLC.end.y)),
            new Point(Math.round(FRC.end.x), Math.round(FRC.end.y)),
            new Point(Math.round(RRC.end.x), Math.round(RRC.end.y)),
            new Point(Math.round(RLC.end.x), Math.round(RLC.end.y)), // back left
        ];
        const carSides = [
            new Vector(new Point(RRC.end.x, RRC.end.y), new Point(FRC.end.x, FRC.end.y)),
            new Vector(new Point(RRC.end.x, RRC.end.y), new Point(RLC.end.x, RLC.end.y)),
            new Vector(new Point(FRC.end.x, FRC.end.y), new Point(FLC.end.x, FLC.end.y)),
            new Vector(new Point(RLC.end.x, RLC.end.y), new Point(FLC.end.x, FLC.end.y)), // left side
        ];
        return { vertices: carVertices, sides: carSides };
    }
}
//# sourceMappingURL=Vehicle.js.map