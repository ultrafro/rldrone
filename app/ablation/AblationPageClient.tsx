"use client";

import { useCallback, useEffect, useState } from "react";
import { DefaultSettings, DroneSettings } from "../drone/Drone.model";
import { DroneTrainer } from "../drone/DroneTrainer";

// Parameters to test in ablation study
const ABLATION_PARAMETERS = [
  "learningRate",
  "rewardDiscountGamma",
  "actorNetworkSize",
  "valueNetworkSize",
  "entropyCoefficient",
  "goalReward",
  "hitObstaclePenalty",
  "distancePenalty",
  "directionReward",
  "proximitySensorPenalty",
  "maxSensorDistance",
  "goalThresholdDistance",
  "batchSize",
  "numBatchesPerUpdate",
] as const;

type AblationParameter = (typeof ABLATION_PARAMETERS)[number];

const MAX_EPISODES = 300;

// Parameter value ranges for testing
const PARAMETER_VALUES: Record<AblationParameter, number[]> = {
  learningRate: [5e-4, 1e-3, 5e-3, 1e-2],
  rewardDiscountGamma: [0.7, 0.8, 0.85, 0.9],
  actorNetworkSize: [256, 300, 350, 400, 500],
  valueNetworkSize: [32, 64, 128, 256],
  entropyCoefficient: [0.001, 0.01, 0.1, 0.5],
  goalReward: [5, 10, 20, 50],
  hitObstaclePenalty: [-5, -10, -20, -50],
  distancePenalty: [-0.01, -0.1, -0.5],
  directionReward: [0.5, 1, 2, 5],
  proximitySensorPenalty: [-0.5, -1, -2, -5],
  maxSensorDistance: [1, 2, 3, 5],
  goalThresholdDistance: [0.5, 1, 1.5, 2],
  batchSize: [512, 1024, 2048, 4096],
  numBatchesPerUpdate: [1, 2, 4, 8],
};

interface AblationResult {
  parameter: AblationParameter;
  value: number;
  episodes: number[];
  rewards: number[];
  averageReward: number;
  finalReward: number;
  convergenceEpisode?: number;
}

interface RunState {
  currentParameter: AblationParameter | null;
  currentValueIndex: number;
  currentEpisode: number;
  currentRewards: number[];
  results: AblationResult[];
  isRunning: boolean;
  totalRuns: number;
  completedRuns: number;
}

export default function AblationPageClient() {
  const [runState, setRunState] = useState<RunState>({
    currentParameter: null,
    currentValueIndex: 0,
    currentEpisode: 0,
    currentRewards: [],
    results: [],
    isRunning: false,
    totalRuns: 0,
    completedRuns: 0,
  });

  const [droneTrainer, setDroneTrainer] = useState<DroneTrainer | null>(null);
  const [selectedParameters, setSelectedParameters] = useState<
    Set<AblationParameter>
  >(new Set(["learningRate", "rewardDiscountGamma"]));

  // State for detailed experiment view
  const [selectedExperiment, setSelectedExperiment] =
    useState<AblationResult | null>(null);

  // Calculate total runs needed
  const totalRuns = Array.from(selectedParameters).reduce(
    (sum, param) => sum + PARAMETER_VALUES[param].length,
    0
  );

  // Dummy callbacks for headless operation
  const dummySetDronePosition = useCallback(() => {}, []);
  const dummySetGoalPosition = useCallback(() => {}, []);
  const dummySetObstacles = useCallback(() => {}, []);
  const dummySetDroneSensorValues = useCallback(() => {}, []);
  const dummySetUpdatingDisplay = useCallback(() => {}, []);

  // Track reward updates
  const onRewardGraphUpdate = useCallback(
    (rewardGraph: { x?: number; y: Record<string, number> } | null) => {
      if (rewardGraph?.y?.reward !== undefined) {
        setRunState((prev) => ({
          ...prev,
          currentRewards: [...prev.currentRewards, rewardGraph.y.reward],
        }));
      }
    },
    []
  );

  // Track loss updates (not used but required)
  const onLossDataUpdate = useCallback(() => {}, []);

  // Start ablation study
  const startAblation = useCallback(async () => {
    if (selectedParameters.size === 0) return;

    const parameters = Array.from(selectedParameters);
    setRunState({
      currentParameter: null,
      currentValueIndex: 0,
      currentEpisode: 0,
      currentRewards: [],
      results: [],
      isRunning: true,
      totalRuns,
      completedRuns: 0,
    });

    for (const parameter of parameters) {
      const values = PARAMETER_VALUES[parameter];

      for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
        const value = values[valueIndex];

        // Update run state
        setRunState((prev) => ({
          ...prev,
          currentParameter: parameter,
          currentValueIndex: valueIndex,
          currentEpisode: 0,
          currentRewards: [],
        }));

        // Create modified settings
        const testSettings: DroneSettings = {
          ...DefaultSettings,
          [parameter]: value,
          episodesPerUpdate: 1, // Force single episode updates for tracking
          skipHighlights: true, // Skip visual effects for performance
        };

        // Create new trainer with test settings
        const trainer = new DroneTrainer(
          testSettings,
          1, // droneSize
          dummySetDronePosition,
          dummySetGoalPosition,
          dummySetObstacles,
          onLossDataUpdate,
          dummySetDroneSensorValues,
          onRewardGraphUpdate,
          dummySetUpdatingDisplay
        );
        trainer.speed_up = 500;

        setDroneTrainer(trainer);

        // Run MAX_EPISODES episodes
        let episodeRewards: number[] = [];
        let episodeCount = 0;

        await new Promise<void>((resolve) => {
          const runEpisodes = () => {
            if (episodeCount >= MAX_EPISODES) {
              // Calculate results
              const averageReward =
                episodeRewards.reduce((a, b) => a + b, 0) /
                episodeRewards.length;
              const finalReward =
                episodeRewards.slice(-100).reduce((a, b) => a + b, 0) / 100; // Last 100 episodes

              // Find convergence episode (when reward stabilizes)
              let convergenceEpisode: number | undefined;
              if (episodeRewards.length > 100) {
                const windowSize = 50;
                for (
                  let i = windowSize;
                  i < episodeRewards.length - windowSize;
                  i++
                ) {
                  const before =
                    episodeRewards
                      .slice(i - windowSize, i)
                      .reduce((a, b) => a + b, 0) / windowSize;
                  const after =
                    episodeRewards
                      .slice(i, i + windowSize)
                      .reduce((a, b) => a + b, 0) / windowSize;
                  if (Math.abs(after - before) < 0.1) {
                    // Convergence threshold
                    convergenceEpisode = i;
                    break;
                  }
                }
              }

              const result: AblationResult = {
                parameter,
                value,
                episodes: Array.from(
                  { length: episodeRewards.length },
                  (_, i) => i + 1
                ),
                rewards: episodeRewards,
                averageReward,
                finalReward,
                convergenceEpisode,
              };

              setRunState((prev) => ({
                ...prev,
                results: [...prev.results, result],
                completedRuns: prev.completedRuns + 1,
              }));

              resolve();
              return;
            }

            // Update trainer multiple times per frame for speed
            const now = performance.now();
            trainer.update(now, true);
            // for (let i = 0; i < 1; i++) {
            //   trainer.update(now, true);
            // }

            // Check if episode completed (trainer resets environment)
            if (trainer.episode_count > episodeCount) {
              episodeCount = trainer.episode_count;
              const totalReward = trainer.episode_rewards
                .slice(0, trainer.episode_step_counter)
                .reduce((a, b) => a + b, 0);
              episodeRewards.push(totalReward);

              setRunState((prev) => ({
                ...prev,
                currentEpisode: episodeCount,
                currentRewards: episodeRewards,
              }));
            }

            // Continue next frame
            requestAnimationFrame(runEpisodes);
          };

          runEpisodes();
        });

        // Cleanup trainer
        setDroneTrainer(null);
      }
    }

    // Mark as complete
    setRunState((prev) => ({
      ...prev,
      isRunning: false,
      currentParameter: null,
    }));
  }, [
    selectedParameters,
    totalRuns,
    dummySetDronePosition,
    dummySetGoalPosition,
    dummySetObstacles,
    dummySetDroneSensorValues,
    dummySetUpdatingDisplay,
    onRewardGraphUpdate,
    onLossDataUpdate,
  ]);

  // Toggle parameter selection
  const toggleParameter = (parameter: AblationParameter) => {
    setSelectedParameters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parameter)) {
        newSet.delete(parameter);
      } else {
        newSet.add(parameter);
      }
      return newSet;
    });
  };

  // Export results as JSON
  const exportResults = () => {
    const dataStr = JSON.stringify(runState.results, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ablation_results_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Reward Chart Component
  const RewardChart = ({ result }: { result: AblationResult }) => {
    const maxReward = Math.max(...result.rewards);
    const minReward = Math.min(...result.rewards);
    const rewardRange = maxReward - minReward;

    return (
      <div className="w-full h-64 bg-gray-700 rounded p-4">
        <h4 className="text-lg font-semibold mb-2">
          {result.parameter}: {result.value} - Reward per Episode
        </h4>
        <div className="relative w-full h-48">
          <svg viewBox="0 0 800 200" className="w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 20"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="800" height="200" fill="url(#grid)" />

            {/* Y-axis labels */}
            <text x="5" y="15" fill="#9CA3AF" fontSize="10">
              {maxReward.toFixed(1)}
            </text>
            <text x="5" y="105" fill="#9CA3AF" fontSize="10">
              {((maxReward + minReward) / 2).toFixed(1)}
            </text>
            <text x="5" y="195" fill="#9CA3AF" fontSize="10">
              {minReward.toFixed(1)}
            </text>

            {/* X-axis labels */}
            <text x="50" y="195" fill="#9CA3AF" fontSize="10">
              0
            </text>
            <text x="400" y="195" fill="#9CA3AF" fontSize="10">
              {Math.floor(result.episodes.length / 2)}
            </text>
            <text x="750" y="195" fill="#9CA3AF" fontSize="10">
              {result.episodes.length}
            </text>

            {/* Reward line */}
            <polyline
              points={result.rewards
                .map((reward, index) => {
                  const x = 50 + (index / (result.rewards.length - 1)) * 700;
                  const y = 180 - ((reward - minReward) / rewardRange) * 160;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
            />

            {/* Moving average line */}
            <polyline
              points={result.rewards
                .map((_, index) => {
                  const windowSize = Math.min(10, index + 1);
                  const start = Math.max(0, index - windowSize + 1);
                  const window = result.rewards.slice(start, index + 1);
                  const avg = window.reduce((a, b) => a + b, 0) / window.length;
                  const x = 50 + (index / (result.rewards.length - 1)) * 700;
                  const y = 180 - ((avg - minReward) / rewardRange) * 160;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeOpacity="0.8"
            />

            {/* Legend */}
            <line
              x1="600"
              y1="20"
              x2="630"
              y2="20"
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
            <text x="635" y="25" fill="#9CA3AF" fontSize="10">
              Episode Reward
            </text>
            <line
              x1="600"
              y1="35"
              x2="630"
              y2="35"
              stroke="#10B981"
              strokeWidth="2"
            />
            <text x="635" y="40" fill="#9CA3AF" fontSize="10">
              Moving Average
            </text>

            {/* Convergence indicator */}
            {result.convergenceEpisode && (
              <>
                <line
                  x1={
                    50 +
                    (result.convergenceEpisode / result.episodes.length) * 700
                  }
                  y1="10"
                  x2={
                    50 +
                    (result.convergenceEpisode / result.episodes.length) * 700
                  }
                  y2="190"
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <text
                  x={
                    55 +
                    (result.convergenceEpisode / result.episodes.length) * 700
                  }
                  y="25"
                  fill="#EF4444"
                  fontSize="10"
                >
                  Convergence
                </text>
              </>
            )}
          </svg>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-300">
          <div>Episodes: {result.episodes.length}</div>
          <div>Avg Reward: {result.averageReward.toFixed(2)}</div>
          <div>Final Reward: {result.finalReward.toFixed(2)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Drone Parameter Ablation Study
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parameter Selection */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Select Parameters to Test
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ABLATION_PARAMETERS.map((param) => (
                <label
                  key={param}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedParameters.has(param)}
                    onChange={() => toggleParameter(param)}
                    disabled={runState.isRunning}
                    className="rounded"
                  />
                  <span className="text-sm">{param}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-700 rounded">
              <p className="text-sm">
                Total runs: {totalRuns} ({selectedParameters.size} parameters)
              </p>
              <p className="text-xs text-gray-400">
                Each parameter will be tested with multiple values,{" "}
                {MAX_EPISODES} episodes each
              </p>
            </div>

            <button
              onClick={startAblation}
              disabled={runState.isRunning || selectedParameters.size === 0}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded font-semibold"
            >
              {runState.isRunning ? "Running..." : "Start Ablation Study"}
            </button>
          </div>

          {/* Current Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Status</h2>

            {runState.isRunning && (
              <div className="space-y-3">
                <div>
                  <p>
                    <strong>Parameter:</strong> {runState.currentParameter}
                  </p>
                  <p>
                    <strong>Value:</strong>{" "}
                    {runState.currentParameter
                      ? PARAMETER_VALUES[runState.currentParameter][
                          runState.currentValueIndex
                        ]
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Episode:</strong> {runState.currentEpisode} /{" "}
                    {MAX_EPISODES}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(runState.currentEpisode / MAX_EPISODES) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p>
                    <strong>Overall Progress:</strong> {runState.completedRuns}{" "}
                    / {runState.totalRuns}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(runState.completedRuns / runState.totalRuns) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {runState.currentRewards.length > 0 && (
                  <div>
                    <p>
                      <strong>Latest Reward:</strong>{" "}
                      {runState.currentRewards[
                        runState.currentRewards.length - 1
                      ]?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Average Reward:</strong>{" "}
                      {(
                        runState.currentRewards.reduce((a, b) => a + b, 0) /
                        runState.currentRewards.length
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!runState.isRunning && runState.results.length === 0 && (
              <p className="text-gray-400">
                Select parameters and click "Start Ablation Study" to begin
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {runState.results.length > 0 && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Results</h2>
              <button
                onClick={exportResults}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
              >
                Export JSON
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-3">
              Click on any experiment row to view detailed reward progression
              chart
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Parameter</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Avg Reward</th>
                    <th className="text-left p-2">Final Reward</th>
                    <th className="text-left p-2">Convergence Episode</th>
                  </tr>
                </thead>
                <tbody>
                  {runState.results.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => setSelectedExperiment(result)}
                    >
                      <td className="p-2">{result.parameter}</td>
                      <td className="p-2">{result.value}</td>
                      <td className="p-2">{result.averageReward.toFixed(2)}</td>
                      <td className="p-2">{result.finalReward.toFixed(2)}</td>
                      <td className="p-2">
                        {result.convergenceEpisode || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary by parameter */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">
                Best Values by Parameter
              </h3>
              {Array.from(
                new Set(runState.results.map((r) => r.parameter))
              ).map((param) => {
                const paramResults = runState.results.filter(
                  (r) => r.parameter === param
                );
                const bestResult = paramResults.reduce((best, current) =>
                  current.finalReward > best.finalReward ? current : best
                );

                return (
                  <div key={param} className="mb-2 p-3 bg-gray-700 rounded">
                    <p>
                      <strong>{param}:</strong> {bestResult.value} (Final
                      Reward: {bestResult.finalReward.toFixed(2)})
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Experiment View Modal */}
        {selectedExperiment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Experiment Details</h2>
                  <button
                    onClick={() => setSelectedExperiment(null)}
                    className="text-gray-400 hover:text-white text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <RewardChart result={selectedExperiment} />

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Parameter</div>
                    <div className="font-semibold">
                      {selectedExperiment.parameter}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Value</div>
                    <div className="font-semibold">
                      {selectedExperiment.value}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Total Episodes</div>
                    <div className="font-semibold">
                      {selectedExperiment.episodes.length}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Convergence Episode</div>
                    <div className="font-semibold">
                      {selectedExperiment.convergenceEpisode || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Average Reward</div>
                    <div className="font-semibold text-lg">
                      {selectedExperiment.averageReward.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">
                      Final Reward (Last 100 Episodes)
                    </div>
                    <div className="font-semibold text-lg">
                      {selectedExperiment.finalReward.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400">Best Episode Reward</div>
                    <div className="font-semibold text-lg">
                      {Math.max(...selectedExperiment.rewards).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-gray-700 p-3 rounded">
                  <div className="text-gray-400 mb-2">
                    Raw Episode Rewards (First 20)
                  </div>
                  <div className="text-xs font-mono bg-gray-800 p-2 rounded overflow-x-auto">
                    [
                    {selectedExperiment.rewards
                      .slice(0, 20)
                      .map((r) => r.toFixed(2))
                      .join(", ")}
                    {selectedExperiment.rewards.length > 20 ? ", ..." : ""}]
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
