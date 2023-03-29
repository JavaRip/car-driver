import { describe, expect, test } from '@jest/globals';
import GameEngine from '../src/classes/gameEngine';
//import GameEngine from 'C:/Users/klsha/OneDrive/Documents/GitHub/car-driver/src/classes/gameEngine.js'

let sensor = [{
    start: {
        x: 543,
        y: 120
    },
    end: {
        x: 543,
        y: -880
    }
}]

let wall = [{
    start: {
        x: 250,
        y: 50
    },
    end: {
        x: 750,
        y: 50
    }
}]
let intersect = GameEngine.findRealIntersect(sensor, wall)
let sensorfp = [{
    "start": {
        "x": 543.1999999999999,
        "y": 119.99999999999991
    },
    "end": {
        "x": 543.1999999999997,
        "y": -880.0000000000001
    }
}]
let fpintersect = GameEngine.findRealIntersect(sensorfp, wall)
let expectedIntersect = [{
    length: 70, 
    point: {
        x: 543, 
        y: 50
    }
}]
let expectedfpIntersect = [{
    length: 70, 
    point: {
        x: 543, 
        y: 50
    }
}]

console.log(intersect)

describe('Intersection with wall', () => {
    test('Tests the top right sensors intersection with the top wall using integers', () => {
      expect(intersect[0].point.x).toBe(543);
      expect(intersect[0].point.y).toBe(50);
      expect(intersect[0].length).toBe(70);
    });
    test('Tests the top right sensors intersection with the top wall using the real sensor', () => {
        expect(fpintersect).toContainEqual(expectedIntersect);
        expect(fpintersect[0].point.x).toBeGreaterThan(543);
        expect(fpintersect[0].point.x).toBeLessThan(543.2);
        expect(fpintersect[0].point.y).toBe(50);
        expect(fpintersect[0].length).toBe(69.99999999999991);
      });

  });
  