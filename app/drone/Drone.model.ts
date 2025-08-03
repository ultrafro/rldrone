export type DroneObstacle = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  isWall: boolean;
};

export type directions = "front" | "back" | "left" | "right" | "top" | "bottom";

export type DroneSettings = {
  algorithm: "REINFORCE" | "A2C" | "PPO";
  actorNetworkSize: number;
  valueNetworkSize: number;
  episodesPerUpdate: number;
  batchSize: number;
  numBatchesPerUpdate: number;
  learningRate: number;
  rewardDiscountGamma: number;
  skipHighlights: boolean;
  numberOfBlocks: number;
  policyCoefficient: number;
  valueCoefficient: number;
  entropyCoefficient: number;
  maxSensorDistance: number;
  goalThresholdDistance: number;
  goalReward: number;
  hitObstaclePenalty: number;
  distancePenalty: number;
  directionReward: number;
  proximitySensorPenalty: number;
  ppoEpsilon: number;
};

export const DefaultSettings: DroneSettings = {
  algorithm: "A2C",
  actorNetworkSize: 400,
  valueNetworkSize: 128,
  episodesPerUpdate: 1, //5
  batchSize: 1024, //2048
  numBatchesPerUpdate: 2,
  learningRate: 5e-4,
  rewardDiscountGamma: 0.7,
  skipHighlights: false,
  numberOfBlocks: 60,
  policyCoefficient: 1,
  valueCoefficient: 1,
  entropyCoefficient: 0.005,
  maxSensorDistance: 2,
  goalThresholdDistance: 1,
  goalReward: 10, //10,
  hitObstaclePenalty: -10, //-10,
  distancePenalty: -0.1,
  directionReward: 1, //1,
  proximitySensorPenalty: -1,
  ppoEpsilon: 0.2,
};
