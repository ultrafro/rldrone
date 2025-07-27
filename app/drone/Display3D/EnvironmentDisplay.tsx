import { EdgesOnlyBox } from "./EdgesOnlyBox";

import { DroneObstacle } from "../Drone.model";

export default function EnvironmentDisplay({
  obstacles,
}: {
  obstacles: DroneObstacle[];
}) {
  return (
    <>
      {/* obstacles */}
      {obstacles.map((obstacle, index) => (
        <group key={"obstacle_" + index}>
          {/* Solid mesh for non-wall obstacles */}
          {!obstacle.isWall && (
            <mesh position={[obstacle.x, obstacle.y, obstacle.z]}>
              <boxGeometry
                args={[obstacle.width, obstacle.height, obstacle.depth]}
              />
              <meshStandardMaterial
                color="#fafafa"
                side={2}
                transparent={true}
                opacity={0.2}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Edge-only rendering for walls */}
          {obstacle.isWall && (
            <EdgesOnlyBox
              position={[obstacle.x, obstacle.y, obstacle.z]}
              size={[obstacle.width, obstacle.height, obstacle.depth]}
              color="#fafafa"
            />
          )}
        </group>
      ))}
    </>
  );
}
