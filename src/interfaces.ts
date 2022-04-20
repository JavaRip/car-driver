export interface point {
  x: number,
  y: number,
}

export interface vector {
  start: point,
  end: point,
}

export interface controlstate {
  turnLeft: boolean,
  turnRight: boolean,
  accel: boolean,
}

export interface vehiclebody {
  vertices: point[],
  sides: vector[],
}

export interface intersect {
  point: point,
  length: number,
}

export interface trainingrow {
  sensors: number[],
  inputs: controlstate,
}
