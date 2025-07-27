import { useState, useCallback } from "react";
import { Mesh, MeshStandardMaterial } from "three";

export function useGraphs({
  leftSensorMesh,
  rightSensorMesh,
  frontSensorMesh,
  backSensorMesh,
  belowSensorMesh,
  aboveSensorMesh,
}: {
  leftSensorMesh: React.RefObject<Mesh>;
  rightSensorMesh: React.RefObject<Mesh>;
  frontSensorMesh: React.RefObject<Mesh>;
  backSensorMesh: React.RefObject<Mesh>;
  belowSensorMesh: React.RefObject<Mesh>;
  aboveSensorMesh: React.RefObject<Mesh>;
}) {
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

  return {
    displayData,
    selectedMetric,
    onLossDataUpdate,
    rewardGraph,
    onRewardGraphUpdate,
    setDroneSensorValues,
    setRewardGraph,
    setDisplayData,
    setSelectedMetric,
  };
}
