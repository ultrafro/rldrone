"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, RenderCallback } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";
import { DefaultSettings, DroneObstacle, DroneSettings } from "./Drone.model";
import DroneTrainerControlPanel from "./DroneTrainerControlPanel";
import { Looper, SceneSetter } from "./FiberUtils";
import { UpdatingWeightsOverlay } from "./UpdatingWeightsOverlay";
import { useDroneTrainer } from "./useDroneTrainer";
import useGizmos from "./useGizmos";

function DronePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [droneSettings, setDroneSettings] =
    useState<DroneSettings>(DefaultSettings);

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

  const [displayData, setDisplayData] = useState<
    { x?: number; y: Record<string, number> }[]
  >([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("total_reward");
  const onLossDataUpdate = useCallback(
    (lossData: { x?: number; y: Record<string, number> }) => {
      setDisplayData((prevData) => [...prevData, lossData]);
    },
    []
  );
  const [stepsPerUpdate, setStepsPerUpdate] = useState(30);
  const [droneSize, setDroneSize] = useState(1);

  const [scene, setScene] = useState<Scene | null>(null);

  const [updatingDisplay, setUpdatingDisplay] = useState(false);
  const [trainingHappening, setTrainingHappening] = useState(false);

  const [rewardGraph, setRewardGraph] = useState<
    { x?: number; y: Record<string, number> }[] | null
  >(null);
  const onRewardGraphUpdate = useCallback(
    (rewardGraph: { x?: number; y: Record<string, number> } | null) => {
      if (rewardGraph) {
        setRewardGraph((prevData) => {
          if (prevData) {
            const newData = [...prevData, rewardGraph];
            //console.log('newData', newData);
            return newData;
          } else {
            return [{ x: rewardGraph.x, y: rewardGraph.y }];
          }
        });
      } else {
        setRewardGraph(null);
      }
    },
    []
  );

  const { gizmos, onGizmoLoop } = useGizmos(scene);

  const setDroneSensorValues = useCallback(
    (sensorValues: {
      left: number;
      right: number;
      front: number;
      back: number;
      below: number;
      above: number;
    }) => {
      const minOpacity = 0.0;
      // Directly update material opacity for each sensor block
      if (leftSensorMesh.current) {
        (leftSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.left);
      }
      if (rightSensorMesh.current) {
        (rightSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.right);
      }
      if (frontSensorMesh.current) {
        (frontSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.front);
      }
      if (backSensorMesh.current) {
        (backSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.back);
      }
      if (belowSensorMesh.current) {
        (belowSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.below);
      }
      if (aboveSensorMesh.current) {
        (aboveSensorMesh.current.material as MeshStandardMaterial).opacity =
          Math.max(minOpacity, sensorValues.above);
      }
    },
    []
  );

  const droneTrainer = useDroneTrainer(
    droneGroup,
    goalMesh,
    droneSize,
    setObstacles,
    onLossDataUpdate,
    stepsPerUpdate,
    setDroneSensorValues,
    onRewardGraphUpdate,
    gizmos.current,
    droneSettings,
    setUpdatingDisplay,
    trainingHappening
  );

  useEffect(() => {
    setRewardGraph(null);
    setDisplayData([]);
  }, [droneSettings]);

  const onLoop: RenderCallback = useCallback(
    (state, delta) => {
      const now = performance.now();

      // Rotate camera around the simulation space
      if (orbitControlsRef.current) {
        const rotationSpeed = 0.05 * delta; // Adjust this value to control rotation speed
        orbitControlsRef.current.autoRotate = true;
        orbitControlsRef.current.autoRotateSpeed = rotationSpeed * 1000; // OrbitControls expects degrees per second
      }

      if (droneTrainer) {
        droneTrainer.update(now);
      }
      onGizmoLoop();
    },
    [droneTrainer, onGizmoLoop]
  );

  // Constants for sensor block positioning
  const sensorThickness = 0.2 * droneSize; // Increased thickness for more protrusion
  const droneHeight = 0.1 * droneSize; // Height of the drone

  return (
    <div className="h-screen w-screen relative">
      {/* Updating weights overlay */}
      {updatingDisplay && <UpdatingWeightsOverlay />}

      <Canvas
        camera={{
          fov: 45,
          position: isMobile ? [48, 40, -30] : [32, 26, -20],
          near: 0.1,
        }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.autoClear = true; // Change to true for proper transparency
          gl.setClearColor(0x000000, 0);
        }}
        className="w-full h-full absolute top-0 left-0 "
      >
        {/* ambient light */}
        <ambientLight intensity={0.1} />

        {/* directional light */}
        <pointLight intensity={100} position={[10, 10, 0]} />

        {/* Orbit controls */}
        <OrbitControls
          ref={orbitControlsRef}
          enablePan={true}
          enableRotate={true}
        />

        {/* Group containing drone and sensors */}
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

        {/* add a green sphere for the goal */}
        <mesh position={[0, 0, -5]} ref={goalMesh}>
          <sphereGeometry args={[0.2, 100, 100]} />
          <meshStandardMaterial color="green" />
        </mesh>

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

        {/* <Background /> */}
        <Looper onLoop={onLoop} />

        <SceneSetter setScene={setScene} />
      </Canvas>

      <DroneTrainerControlPanel
        stepsPerUpdate={stepsPerUpdate}
        handleStepsChange={setStepsPerUpdate}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        displayData={displayData}
        rewardGraph={rewardGraph}
        droneSettings={droneSettings}
        setDroneSettings={setDroneSettings}
        beginTraining={() => {
          //clear charts
          setRewardGraph(null);
          setDisplayData([]);
          setTrainingHappening(true);
        }}
        trainingHappening={trainingHappening}
      />
    </div>
  );
}

function EdgesOnlyBox({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  const [width, height, depth] = size;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  // Create vertices for all 12 edges of a box
  const vertices = new Float32Array([
    // Bottom face edges
    -halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    -halfHeight,
    -halfDepth, // front edge
    -halfWidth,
    -halfHeight,
    -halfDepth,
    -halfWidth,
    -halfHeight,
    halfDepth, // left edge
    halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    -halfHeight,
    halfDepth, // right edge
    -halfWidth,
    -halfHeight,
    halfDepth,
    halfWidth,
    -halfHeight,
    halfDepth, // back edge

    // Top face edges
    -halfWidth,
    halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    -halfDepth, // front edge
    -halfWidth,
    halfHeight,
    -halfDepth,
    -halfWidth,
    halfHeight,
    halfDepth, // left edge
    halfWidth,
    halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // right edge
    -halfWidth,
    halfHeight,
    halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // back edge

    // Vertical edges
    -halfWidth,
    -halfHeight,
    -halfDepth,
    -halfWidth,
    halfHeight,
    -halfDepth, // front-left
    halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    -halfDepth, // front-right
    -halfWidth,
    -halfHeight,
    halfDepth,
    -halfWidth,
    halfHeight,
    halfDepth, // back-left
    halfWidth,
    -halfHeight,
    halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // back-right
  ]);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

  return (
    <lineSegments position={position}>
      <primitive object={geometry} />
      <lineBasicMaterial color={color} transparent={true} opacity={0.8} />
    </lineSegments>
  );
}

export default DronePage;
