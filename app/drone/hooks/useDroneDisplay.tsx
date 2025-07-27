import { useState, useRef } from "react";
import { DroneObstacle } from "../Drone.model";
import { Group, Mesh } from "three";

export function useDroneDisplay() {
  const [obstacles, setObstacles] = useState<DroneObstacle[]>([]);
  const droneGroup = useRef<Group>(null!);
  const droneMesh = useRef<Mesh>(null!);
  const goalMesh = useRef<Mesh>(null!);
  const orbitControlsRef = useRef<any>(null);

  // Refs for sensor indicator blocks
  const leftSensorMesh = useRef<Mesh>(null!);
  const rightSensorMesh = useRef<Mesh>(null!);
  const frontSensorMesh = useRef<Mesh>(null!);
  const backSensorMesh = useRef<Mesh>(null!);
  const belowSensorMesh = useRef<Mesh>(null!);
  const aboveSensorMesh = useRef<Mesh>(null!);

  return {
    obstacles,
    setObstacles,
    droneGroup,
    droneMesh,
    goalMesh,
    orbitControlsRef,
    leftSensorMesh,
    rightSensorMesh,
    frontSensorMesh,
    backSensorMesh,
    belowSensorMesh,
    aboveSensorMesh,
  };
}
