"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, RenderCallback } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { Scene } from "three";
import { DefaultSettings, DroneSettings } from "./Drone.model";
import DroneTrainerControlPanel from "./DroneTrainerControlPanel";
import { Looper, SceneSetter } from "./FiberUtils";
import { UpdatingWeightsOverlay } from "./UpdatingWeightsOverlay";
import { useDroneTrainer } from "./useDroneTrainer";
import useGizmos from "./useGizmos";
import { DroneDisplay } from "./Display3D/DroneDisplay";
import { useIsMobile } from "@/app/page.utils";
import { useDroneDisplay } from "./hooks/useDroneDisplay";
import { useGraphs } from "./hooks/useGraphs";
import EnvironmentDisplay from "./Display3D/EnvironmentDisplay";
import { IntroModal } from "./Components/IntroModal";

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
