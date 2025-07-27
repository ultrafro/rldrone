import { useCallback, useEffect, useState } from "react";
import { DroneTrainer } from "./DroneTrainer";
import { Group, Mesh } from "three";
import { Gizmo } from "./useGizmos";
import { DroneObstacle, DroneSettings } from "./Drone.model";
import * as tf from "@tensorflow/tfjs";

export function useDroneTrainer(
  droneGroup: React.RefObject<Group>,
  goalMesh: React.RefObject<Mesh>,
  droneSize: number,
  setObstacles: (obstacles: DroneObstacle[]) => void,
  onLossDataUpdate: (lossData: {
    x?: number;
    y: Record<string, number>;
  }) => void,
  stepsPerUpdate: number,
  setDroneSensorValues: (sensorValues: {
    left: number;
    right: number;
    front: number;
    back: number;
    below: number;
    above: number;
  }) => void,
  onRewardGraphUpdate: (
    rewardGraph: { x?: number; y: Record<string, number> } | null
  ) => void,
  gizmos: Record<string, Gizmo>,
  droneSettings: DroneSettings,
  setUpdatingDisplay: (updating: boolean) => void,
  trainingHappening: boolean
) {
  const setDronePosition = useCallback(
    (position: { x: number; y: number; z: number }) => {
      if (droneGroup.current) {
        droneGroup.current.position.set(position.x, position.y, position.z);
      }
    },
    []
  );

  const setGoalPosition = useCallback(
    (position: { x: number; y: number; z: number }) => {
      if (goalMesh.current) {
        goalMesh.current.position.set(position.x, position.y, position.z);
      }
    },
    []
  );

  const [initialWeights, setInitialWeights] = useState<{
    policyWeights: any[] | null;
    valueWeights: any[] | null;
  }>({
    policyWeights: null,
    valueWeights: null,
  });

  //load initial weights from JSON files
  useEffect(() => {
    const loadInitialWeights = async () => {
      const domain = window.location.origin;

      try {
        // Load policy weights
        const policyResponse = await fetch(`${domain}/drone/rl-policy-weights.json`);
        let policyWeights = null;
        if (policyResponse.ok) {
          const policyData = await policyResponse.json();
          policyWeights = policyData.map((weightInfo: any) => ({
            shape: weightInfo.shape,
            data: weightInfo.data,
          }));
          console.log("Loaded policy weights from JSON");
        }

        // Load value weights
        const valueResponse = await fetch(`${domain}/drone/value-policy-weights.json`);
        let valueWeights = null;
        if (valueResponse.ok) {
          const valueData = await valueResponse.json();
          valueWeights = valueData.map((weightInfo: any) => ({
            shape: weightInfo.shape,
            data: weightInfo.data,
          }));
          console.log("Loaded value weights from JSON");
        }

        setInitialWeights({
          policyWeights,
          valueWeights,
        });
      } catch (error) {
        console.log("Failed to load initial weights:", error);
        setInitialWeights({
          policyWeights: null,
          valueWeights: null,
        });
      }
    };

    loadInitialWeights();

    return () => {
      // Cleanup if necessary
    };
  }, []);

  const [droneTrainer, setDroneTrainer] = useState<DroneTrainer | null>(null);
  useEffect(() => {
    const newDroneTrainer = new DroneTrainer(
      droneSettings,
      droneSize,
      setDronePosition,
      setGoalPosition,
      setObstacles,
      onLossDataUpdate,
      setDroneSensorValues,
      onRewardGraphUpdate,
      setUpdatingDisplay,
      trainingHappening ? null : initialWeights?.policyWeights ?? null,
      trainingHappening ? null : initialWeights?.valueWeights ?? null
    );
    setDroneTrainer(newDroneTrainer);

    newDroneTrainer.gizmos = gizmos;

    return () => {
      setDroneTrainer(null);
    };
  }, [
    initialWeights,
    trainingHappening,
    setDronePosition,
    setGoalPosition,
    setObstacles,
    onLossDataUpdate,
    droneSize,
    setDroneSensorValues,
    onRewardGraphUpdate,
    gizmos,
    droneSettings,
    setUpdatingDisplay,
  ]);

  useEffect(() => {
    if (droneTrainer) {
      droneTrainer.speed_up = stepsPerUpdate;
    }
  }, [stepsPerUpdate, droneTrainer]);

  return droneTrainer;
}
