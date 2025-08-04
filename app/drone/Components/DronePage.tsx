"use client";

import { useIsMobile } from "@/app/page.utils";
import { OrbitControls } from "@react-three/drei";
import { Canvas, RenderCallback } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { Scene } from "three";
import { DroneDisplay } from "../Display3D/DroneDisplay";
import EnvironmentDisplay from "../Display3D/EnvironmentDisplay";
import { DroneSettings, DefaultSettings } from "../Drone.model";
import { useDroneDisplay } from "../hooks/useDroneDisplay";
import { useGraphs } from "../hooks/useGraphs";
import { useDroneTrainer } from "../RL/useDroneTrainer";
import { Looper, SceneSetter } from "../utils/FiberUtils";
import useGizmos from "../utils/useGizmos";
import DroneTrainerControlPanel from "./DroneTrainerControlPanel";
import { IntroModal } from "./IntroModal";
import { UpdatingWeightsOverlay } from "./UpdatingWeightsOverlay";

function DronePage() {
  const droneSize = 1;
  const sensorThickness = 0.2 * droneSize; // Increased thickness for more protrusion
  const droneHeight = 0.1 * droneSize; // Height of the drone

  const isMobile = useIsMobile();
  const [droneSettings, setDroneSettings] =
    useState<DroneSettings>(DefaultSettings);
  const [trainingHappening, setTrainingHappening] = useState(false);
  const [stepsPerUpdate, setStepsPerUpdate] = useState(30);
  const [scene, setScene] = useState<Scene | null>(null);
  const [updatingDisplay, setUpdatingDisplay] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);

  const {
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
  } = useDroneDisplay();

  const {
    displayData,
    selectedMetric,
    onLossDataUpdate,
    rewardGraph,
    onRewardGraphUpdate,
    setDroneSensorValues,
    setRewardGraph,
    setDisplayData,
    setSelectedMetric,
  } = useGraphs({
    leftSensorMesh,
    rightSensorMesh,
    frontSensorMesh,
    backSensorMesh,
    belowSensorMesh,
    aboveSensorMesh,
  });

  const { gizmos, onGizmoLoop } = useGizmos(scene);

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

  return (
    <div className="h-screen w-screen relative">
      {/* GitHub Link */}
      <a
        href="https://github.com/ultrafro/rldrone"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="View on GitHub"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
      />

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
          gl.setClearColor(0xffffff, 1); // White background with full opacity
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
        <DroneDisplay
          droneSize={droneSize}
          droneHeight={droneHeight}
          sensorThickness={sensorThickness}
          droneGroup={droneGroup}
          droneMesh={droneMesh}
          leftSensorMesh={leftSensorMesh}
          rightSensorMesh={rightSensorMesh}
          frontSensorMesh={frontSensorMesh}
          backSensorMesh={backSensorMesh}
          belowSensorMesh={belowSensorMesh}
          aboveSensorMesh={aboveSensorMesh}
        />

        {/* add a green sphere for the goal */}
        <mesh position={[0, 0, -5]} ref={goalMesh}>
          <sphereGeometry args={[0.2, 100, 100]} />
          <meshStandardMaterial color="green" />
        </mesh>

        <EnvironmentDisplay obstacles={obstacles} />

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

export default DronePage;
