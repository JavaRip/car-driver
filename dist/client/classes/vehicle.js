export default class vehicle {
    position;
    body;
    speed;
    direction;
    constructor(pos, movVec) {
        this.position = pos;
        this.body = this._getCarBody(pos, movVec);
        this.speed = 0;
        this.direction = movVec;
    }
    static updateCarBody(car) {
        car.body = car._getCarBody(car.position, car.direction);
    }
    _getCarBody(pos, movVec) {
        const tau = Math.PI * 2;
        const carWidth = 30;
        const carLength = 100;
        const carHypot = Math.hypot(carWidth, carLength);
        const angle = Math.acos(carLength / carHypot);
        const RRC = this._getRelativeRay(pos, carWidth, movVec, tau * 0.25);
        const RLC = this._getRelativeRay(pos, carWidth, movVec, tau * 1.75);
        const FRC = this._getRelativeRay(pos, carHypot, movVec, angle);
        const FLC = this._getRelativeRay(pos, carHypot, movVec, tau - angle);
        const carVertices = [
            { x: FLC.end.x, y: FLC.end.y },
            { x: FRC.end.x, y: FRC.end.y },
            { x: RLC.end.x, y: RLC.end.y },
            { x: RRC.end.x, y: RRC.end.y },
        ];
        const carSides = [
            { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: FRC.end.x, y: FRC.end.y } },
            { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: RLC.end.x, y: RLC.end.y } },
            { start: { x: FRC.end.x, y: FRC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } },
            { start: { x: RLC.end.x, y: RLC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } },
        ];
        return { vertices: carVertices, sides: carSides };
    }
    _getRelativeRay(pos, rayLength, movVec, angleOffset) {
        // without offset, cast the ray directly down the direction the car is facing
        // use offset to cast ray relative to this position. Offset is in radians
        const rayOffsetX = Math.cos(movVec + angleOffset);
        const rayOffsetY = Math.sin(movVec + angleOffset);
        const rayExtendedX = rayOffsetX * rayLength;
        const rayExtendedY = rayOffsetY * rayLength;
        const rayEndpoint = { x: pos.x + rayExtendedX, y: pos.y + rayExtendedY };
        return { start: pos, end: rayEndpoint };
    }
}
//# sourceMappingURL=vehicle.js.map