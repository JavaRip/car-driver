export default class GameEngine {
    static moveVehicle(car, inputs) {
        const tau = Math.PI * 2;
        const rotationSpeed = 0.1;
        const accelRate = 0.3;
        const deccelRate = 1;
        const maxSpeed = 15;
        let updatedDir;
        let updatedSpeed;
        if (inputs.turnLeft === true) {
            updatedDir = (car.direction - rotationSpeed) % tau;
        }
        else if (inputs.turnRight === true) {
            updatedDir = (car.direction + rotationSpeed) % tau;
        }
        else {
            updatedDir = car.direction;
        }
        if (inputs.accel === true) {
            if (car.speed + accelRate <= maxSpeed) {
                updatedSpeed = car.speed + accelRate;
            }
            else {
                updatedSpeed = maxSpeed;
            }
        }
        else {
            if (car.speed - deccelRate > 0) {
                updatedSpeed = car.speed - accelRate;
            }
            else {
                updatedSpeed = 0;
            }
        }
        return {
            position: {
                x: Math.round(car.position.x + Math.cos(car.direction) * car.speed),
                y: Math.round(car.position.y + Math.sin(car.direction) * car.speed),
                // x: car.position.x + Math.cos(car.direction) * car.speed,
                // y: car.position.y + Math.sin(car.direction) * car.speed,
            },
            speed: updatedSpeed,
            direction: updatedDir,
        };
    }
    static getCarSensors(vertices, direction) {
        return [
            this._getRelativeRay(vertices[0], 1000, direction, Math.PI * 1.75),
            this._getRelativeRay(vertices[1], 1000, direction, Math.PI * 0.25),
            this._getRelativeRay(vertices[0], 1000, direction, Math.PI * 2),
            this._getRelativeRay(vertices[1], 1000, direction, Math.PI * 2),
            this._getRelativeRay(vertices[0], 1000, direction, Math.PI * 1.5),
            this._getRelativeRay(vertices[1], 1000, direction, Math.PI * 0.5),
            this._getRelativeRay(vertices[2], 1000, direction, Math.PI * 0.5),
            this._getRelativeRay(vertices[3], 1000, direction, Math.PI * 1.5),
        ];
    }
    // rays1 = sensors, rays2 = map
    static findRealIntersect(rays1, rays2) {
        const intersects = [];
        for (const ray1 of rays1) {
            // isect short for intersect
            let isect = { length: Infinity, point: { x: NaN, y: NaN } };
            for (const ray2 of rays2) {
                const newIsectPoint = this._findTheoreticalIntersectionPoint(ray1, ray2);
                const newIsect = {
                    length: Math.hypot(ray1.start.x - newIsectPoint.x, ray1.start.y - newIsectPoint.y),
                    point: { x: newIsectPoint.x, y: newIsectPoint.y },
                };
                if (newIsect.length < isect.length)
                    isect = newIsect;
            }
            if (isect.point.x >= ray1.start.x &&
                isect.point.x <= ray1.end.x &&
                isect.point.y >= ray1.start.y &&
                isect.point.y <= ray1.end.y) {
                intersects.push(isect);
            }
            else if (isect.point.x <= ray1.start.x &&
                isect.point.x >= ray1.end.x &&
                isect.point.y <= ray1.start.y &&
                isect.point.y >= ray1.end.y) {
                intersects.push(isect);
            }
            else if (isect.point.x <= ray1.start.x &&
                isect.point.x >= ray1.end.x &&
                isect.point.y >= ray1.start.y &&
                isect.point.y <= ray1.end.y) {
                intersects.push(isect);
            }
            else if (isect.point.x >= ray1.start.x &&
                isect.point.x <= ray1.end.x &&
                isect.point.y <= ray1.start.y &&
                isect.point.y >= ray1.end.y) {
                intersects.push(isect);
            }
        }
        return intersects;
    }
    static _findTheoreticalIntersectionPoint(ray1, ray2) {
        const denominator = ((ray2.start.x - ray2.end.x) * (ray1.start.y - ray1.end.y) -
            (ray2.start.y - ray2.end.y) * (ray1.start.x - ray1.end.x));
        const t = ((ray1.end.x - ray1.start.x) * (ray2.start.y - ray1.start.y) -
            (ray1.end.y - ray1.start.y) * (ray2.start.x - ray1.start.x)) /
            denominator;
        const u = ((ray2.end.x - ray2.start.x) * (ray2.start.y - ray1.start.y) -
            (ray2.end.y - ray2.start.y) * (ray2.start.x - ray1.start.x)) / denominator;
        // if points do intersect calculate where
        if (t > 0 && t < 1 && u > 0) {
            const intersectX = ray2.start.x + t * (ray2.end.x - ray2.start.x);
            const intersectY = ray2.start.y + t * (ray2.end.y - ray2.start.y);
            return { x: intersectX, y: intersectY };
        }
        else {
            return { x: Infinity, y: Infinity };
        }
    }
    static getCarBody(car) {
        const tau = Math.PI * 2;
        const carWidth = 30;
        const carLength = 100;
        const carHypot = Math.hypot(carWidth, carLength);
        const angle = Math.acos(carLength / carHypot);
        const RRC = this._getRelativeRay(car.position, carWidth, car.direction, tau * 0.25);
        const RLC = this._getRelativeRay(car.position, carWidth, car.direction, tau * 1.75);
        const FRC = this._getRelativeRay(car.position, carHypot, car.direction, angle);
        const FLC = this._getRelativeRay(car.position, carHypot, car.direction, tau - angle);
        const carVertices = [
            { x: FLC.end.x, y: FLC.end.y },
            { x: FRC.end.x, y: FRC.end.y },
            { x: RRC.end.x, y: RRC.end.y },
            { x: RLC.end.x, y: RLC.end.y }, // back left
        ];
        const carSides = [
            { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: FRC.end.x, y: FRC.end.y } },
            { start: { x: RRC.end.x, y: RRC.end.y }, end: { x: RLC.end.x, y: RLC.end.y } },
            { start: { x: FRC.end.x, y: FRC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } },
            { start: { x: RLC.end.x, y: RLC.end.y }, end: { x: FLC.end.x, y: FLC.end.y } }, // left side
        ];
        return { vertices: carVertices, sides: carSides };
    }
    static _getRelativeRay(pos, rayLength, movVec, angleOffset) {
        // without offset, cast the ray directly down the direction the car is facing
        // use offset to cast ray relative to this position. Offset is in radians
        // const startPoint: point = { x: Math.round(pos.x), y: Math.round(pos.y) };
        const rayOffsetX = Math.cos(movVec + angleOffset);
        const rayOffsetY = Math.sin(movVec + angleOffset);
        const rayExtendedX = rayOffsetX * rayLength;
        const rayExtendedY = rayOffsetY * rayLength;
        // const rayEndpoint: point = { x: Math.round(pos.x + rayExtendedX), y: Math.round(pos.y + rayExtendedY) };
        const rayEndpoint = { x: pos.x + rayExtendedX, y: pos.y + rayExtendedY };
        // console.log('Ray:');
        // console.log(startPoint);
        // console.log(rayEndpoint);
        return { start: pos, end: rayEndpoint };
    }
}
//# sourceMappingURL=gameEngine.js.map