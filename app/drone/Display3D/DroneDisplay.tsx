import { Group, Mesh } from "three";

export function DroneDisplay({
  droneSize,
  droneHeight,
  sensorThickness,
  droneGroup,
  droneMesh,
  leftSensorMesh,
  rightSensorMesh,
  frontSensorMesh,
  backSensorMesh,
  belowSensorMesh,
  aboveSensorMesh,
}: {
  droneSize: number;
  droneHeight: number;
  sensorThickness: number;
  droneGroup: React.RefObject<Group>;
  droneMesh: React.RefObject<Mesh>;
  leftSensorMesh: React.RefObject<Mesh>;
  rightSensorMesh: React.RefObject<Mesh>;
  frontSensorMesh: React.RefObject<Mesh>;
  backSensorMesh: React.RefObject<Mesh>;
  belowSensorMesh: React.RefObject<Mesh>;
  aboveSensorMesh: React.RefObject<Mesh>;
}) {
  return (
    <group ref={droneGroup} position={[0, 0, 0]}>
      {/* add a flat box to represent the drone */}
      <mesh ref={droneMesh}>
        <boxGeometry args={[droneSize, droneHeight, droneSize]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Sensor indicator blocks - now as thin rectangles on each face */}
      {/* Left sensor */}
      <group>
        <mesh
          position={[-droneSize / 2 - sensorThickness / 2, 0, 0]}
          ref={leftSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[-droneSize / 2 - sensorThickness / 2, 0, 0]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>

      {/* Right sensor */}
      <group>
        <mesh
          position={[droneSize / 2 + sensorThickness / 2, 0, 0]}
          ref={rightSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[droneSize / 2 + sensorThickness / 2, 0, 0]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>

      {/* Front sensor */}
      <group>
        <mesh
          position={[0, 0, droneSize / 2 + sensorThickness / 2]}
          ref={frontSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0, 0, -droneSize / 2 - sensorThickness / 2]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>

      {/* Back sensor */}
      <group>
        <mesh
          position={[0, 0, -droneSize / 2 - sensorThickness / 2]}
          ref={backSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0, 0, droneSize / 2 + sensorThickness / 2]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>

      {/* Below sensor */}
      <group>
        <mesh
          position={[0, -droneHeight / 2 - sensorThickness / 2, 0]}
          ref={belowSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0, -droneHeight / 2 - sensorThickness / 2, 0]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>

      {/* Above sensor */}
      <group>
        <mesh
          position={[0, droneHeight / 2 + sensorThickness / 2, 0]}
          ref={aboveSensorMesh}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshStandardMaterial
            color="#ff0000"
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0, droneHeight / 2 + sensorThickness / 2, 0]}
          scale={1.01}
        >
          <boxGeometry
            args={[sensorThickness, sensorThickness, sensorThickness]}
          />
          <meshBasicMaterial color="black" wireframe={true} />
        </mesh>
      </group>
    </group>
  );
}
